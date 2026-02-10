import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  Patch,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from '../services/auth.service';
import { TokenService } from '../services/token.service';
import { OtpService } from '../services/otp.service';
import { UsersService } from '../../users/services/users.service';
import { SignupDto } from '../dtos/signup.dto';
import { LoginDto } from '../dtos/login.dto';
import { RegisterUserDto } from '../dtos/register-user.dto';
import { RefreshTokenDto } from '../dtos/refresh-token.dto';
import { VerifyEmailDto } from '../dtos/verify-email.dto';
import { SendVerificationEmailDto } from '../dtos/send-verification-email.dto';
import { ForgetPasswordDto } from '../dtos/forget-password.dto';
import { ResetPasswordDto } from '../dtos/reset-password.dto';
import { UpdatePasswordDto } from '../dtos/update-password.dto';
import { LogoutDto } from '../dtos/logout.dto';
import { GetUser } from '../decorators/get-user.decorator';
import { Public, AdminOnly } from '../../../common/decorators/authorization.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly tokenService: TokenService,
    private readonly otpService: OtpService,
    private readonly usersService: UsersService,
  ) {}

  @Public()
  @Post('signup')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User signup' })
  async signup(@Body() signupDto: SignupDto) {
    const user = await this.authService.signup({
      ...signupDto,
      name: signupDto.name ?? signupDto.email,
    });
    const tokens = await this.tokenService.generateAuthTokens({
      id: (user as { id: string }).id,
      email: (user as { email: string }).email,
      role: (user as { role: string }).role,
    });
    return { message: 'User created successfully', data: { user, tokens } };
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User login' })
  async login(@Body() loginDto: LoginDto) {
    const user = await this.authService.loginUserWithEmailAndPassword(
      loginDto.email,
      loginDto.password,
    );
    const tokens = await this.tokenService.generateAuthTokens({
      id: (user as { id: string }).id,
      email: (user as { email: string }).email,
      role: (user as { role: string }).role,
    });
    return {
      message: 'User logged in successfully',
      data: {
        user: {
          id: (user as { id: string }).id,
          email: (user as { email: string }).email,
          role: (user as { role: string }).role,
          profile: (user as { profile?: unknown }).profile,
        },
        tokens,
      },
    };
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh tokens' })
  async refreshTokens(@Body() refreshTokenDto: RefreshTokenDto) {
    const tokens = await this.tokenService.refreshAuthTokens(refreshTokenDto.refreshToken);
    return { message: 'Tokens refreshed successfully', data: tokens };
  }

  @Public()
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'User logout' })
  async logout(@Body() logoutDto: LogoutDto) {
    await this.authService.logout(logoutDto.refreshToken);
  }

  @Post('register-user')
  @AdminOnly()
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Register new user (Admin only)' })
  async registerUser(@Body() dto: RegisterUserDto) {
    const { user } = await this.authService.registerUser(dto);
    return { message: 'User created successfully', data: { user } };
  }

  @Public()
  @Post('send-verification-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send verification email (OTP generated)' })
  async sendVerificationEmail(@Body() dto: SendVerificationEmailDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) throw new BadRequestException('User not found');
    const otp = await this.otpService.generateEmailOtp(dto.email);
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEV] Verification OTP for ${dto.email}: ${otp}`);
    }
    return { message: 'Verification email sent successfully' };
  }

  @Public()
  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify email with OTP' })
  async verifyEmail(@Body() dto: VerifyEmailDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) throw new BadRequestException('User not found');
    const valid = await this.otpService.verifyEmailOtp(dto.email, dto.otp);
    if (!valid) throw new BadRequestException('Invalid or expired OTP');
    await this.usersService.updateUser(user.id, { emailVerified: true });
    return { message: 'Email verified successfully' };
  }

  @Public()
  @Post('forget-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request password reset' })
  async forgetPassword(@Body() dto: ForgetPasswordDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) throw new BadRequestException('User not found');
    const otp = await this.otpService.generateEmailOtp(dto.email);
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEV] Password reset OTP for ${dto.email}: ${otp}`);
    }
    return { message: 'Password reset email sent successfully' };
  }

  @Public()
  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify OTP for password reset' })
  async verifyOTP(@Body() dto: VerifyEmailDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) throw new BadRequestException('User not found');
    const valid = await this.otpService.verifyEmailOtp(dto.email, dto.otp);
    if (!valid) throw new BadRequestException('Invalid or expired OTP');
    return { message: 'OTP verified successfully' };
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password' })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) throw new BadRequestException('User not found');
    await this.authService.resetPassword(dto.email, dto.password);
    return { message: 'Password reset successfully' };
  }

  @Patch('update-password')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update password (logged in)' })
  async updatePassword(
    @Body() updatePasswordDto: UpdatePasswordDto,
    @GetUser('userId') userId: string,
  ) {
    if (updatePasswordDto.password !== updatePasswordDto.confirmPassword) {
      throw new BadRequestException('Password and confirm password do not match');
    }
    await this.authService.updatePassword(
      userId,
      updatePasswordDto.currentPassword,
      updatePasswordDto.password,
    );
    return { message: 'Password updated successfully' };
  }

  @Get('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  async getProfile(@GetUser('userId') userId: string) {
    const user = await this.usersService.findUserById(userId);
    const { passwordHash: _, ...rest } = user;
    return { message: 'Profile fetched successfully', data: rest };
  }

  @Patch('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user profile' })
  async updateProfile(
    @Body() updateData: { firstName?: string; lastName?: string; phone?: string; avatar?: string },
    @GetUser('userId') userId: string,
  ) {
    const user = await this.usersService.updateUser(userId, updateData);
    const { passwordHash: _, ...rest } = user;
    return { message: 'Profile updated successfully', data: rest };
  }
}
