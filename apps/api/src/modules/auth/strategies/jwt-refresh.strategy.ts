import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { TokenType } from '../../../common/enums/token-type.enum';
import { UsersService } from '../../users/services/users.service';
import { TokenService } from '../services/token.service';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(
    configService: ConfigService,
    private usersService: UsersService,
    private tokenService: TokenService,
  ) {
    const secret = configService.get<string>('jwt.refreshSecret');
    if (!secret) throw new Error('JWT refresh secret is not configured');
    super({
      jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
      ignoreExpiration: false,
      secretOrKey: secret,
      passReqToCallback: true,
    });
  }

  async validate(
    req: { body?: { refreshToken?: string } },
    payload: { sub: string; email: string; role: string; jti?: string },
  ) {
    if (!req.body?.refreshToken) throw new UnauthorizedException('Refresh token not found');
    if (payload.jti) {
      const isBlacklisted = await this.tokenService.isTokenBlacklisted(payload.jti, TokenType.REFRESH);
      if (isBlacklisted) throw new UnauthorizedException('Refresh token has been revoked');
    }
    const user = await this.usersService.findUserById(payload.sub);
    if (!user) throw new UnauthorizedException('User not found');
    return { userId: payload.sub, email: payload.email, role: payload.role };
  }
}
