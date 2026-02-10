import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { TokenType } from '../../../common/enums/token-type.enum';
import { UsersService } from '../../users/services/users.service';
import { TokenService } from '../services/token.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    configService: ConfigService,
    private usersService: UsersService,
    private tokenService: TokenService,
  ) {
    const secret = configService.get<string>('jwt.secret');
    if (!secret) throw new Error('JWT secret is not configured');
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: { sub: string; email: string; role: string; jti?: string }) {
    if (payload.jti) {
      const isBlacklisted = await this.tokenService.isTokenBlacklisted(payload.jti, TokenType.ACCESS);
      if (isBlacklisted) throw new UnauthorizedException('Token has been revoked');
    }
    const user = await this.usersService.findUserById(payload.sub);
    if (!user) throw new UnauthorizedException('User not found');
    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}
