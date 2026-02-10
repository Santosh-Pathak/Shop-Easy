import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { TokenType } from '../../../common/enums/token-type.enum';
import { UsersService } from '../../users/services/users.service';
import { TokenService } from './token.service';
import { OtpService } from './otp.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private tokenService: TokenService,
    private otpService: OtpService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email, true) as { passwordHash?: string | null; id: string; email: string; role: string; profile: unknown } | null;
    if (!user || !user.passwordHash) return null;
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return null;
    const { passwordHash: _, ...rest } = user;
    return rest;
  }

  async loginUserWithEmailAndPassword(email: string, password: string) {
    const user = await this.validateUser(email, password);
    if (!user) throw new UnauthorizedException('Invalid credentials');
    return user;
  }

  async signup(signupData: { email: string; password: string; name?: string; firstName?: string; lastName?: string; role?: string }) {
    const existing = await this.usersService.findByEmail(signupData.email);
    if (existing) throw new ConflictException('Email already registered');
    const [first, ...lastParts] = (signupData.name ?? signupData.email).split(' ');
    const user = await this.usersService.createUser({
      email: signupData.email,
      password: signupData.password,
      role: signupData.role,
      firstName: signupData.firstName ?? first,
      lastName: (signupData.lastName ?? lastParts.join(' ')) || undefined,
    });
    const { passwordHash: _, ...rest } = user!;
    return rest;
  }

  async registerUser(registerData: { name: string; email: string; role?: string }) {
    const existing = await this.usersService.findByEmail(registerData.email);
    if (existing) throw new ConflictException('Email already registered');
    const systemPassword = this.generateRandomPassword();
    const [first, ...lastParts] = registerData.name.split(' ');
    const user = await this.usersService.createUser({
      email: registerData.email,
      passwordHash: await bcrypt.hash(systemPassword, 10),
      role: registerData.role,
      firstName: first,
      lastName: lastParts.join(' ') || undefined,
    } as { email: string; passwordHash: string; role?: string; firstName: string; lastName?: string });
    const { passwordHash: _, ...rest } = user!;
    return { user: rest, systemPassword };
  }

  async logout(refreshToken: string): Promise<void> {
    const payload = this.tokenService.decodeRefreshToken(refreshToken);
    if (!payload?.jti) throw new UnauthorizedException('Invalid refresh token');
    await this.tokenService.blacklistToken(payload.jti, TokenType.REFRESH);
  }

  private generateRandomPassword(length = 12): string {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
  }

  async updatePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.usersService.findUserById(userId);
    const withPass = await this.usersService.findByEmail(user.email, true) as { passwordHash?: string | null } | null;
    if (!withPass?.passwordHash) throw new BadRequestException('User not found');
    const valid = await bcrypt.compare(currentPassword, withPass.passwordHash);
    if (!valid) throw new UnauthorizedException('Current password is incorrect');
    await this.usersService.updatePasswordHash(userId, await bcrypt.hash(newPassword, 10));
  }

  async resetPassword(email: string, newPassword: string) {
    const user = await this.usersService.findByEmail(email, true);
    if (!user) throw new BadRequestException('User not found');
    const hashed = await bcrypt.hash(newPassword, 10);
    await this.usersService.updatePasswordHash(user.id, hashed);
    await this.tokenService.revokeAllUserTokens(user.id);
  }
}
