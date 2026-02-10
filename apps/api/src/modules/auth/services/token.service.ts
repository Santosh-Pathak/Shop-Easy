import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../prisma/prisma.service';
import { TokenType } from '../../../common/enums/token-type.enum';
import * as crypto from 'crypto';

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  jti?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class TokenService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  private generateTokenId(): string {
    return crypto.randomBytes(16).toString('hex');
  }

  private parseExpiry(expiry: string): number {
    const unit = expiry.slice(-1);
    const value = parseInt(expiry.slice(0, -1), 10);
    switch (unit) {
      case 's':
        return value * 1000;
      case 'm':
        return value * 60 * 1000;
      case 'h':
        return value * 60 * 60 * 1000;
      case 'd':
        return value * 24 * 60 * 60 * 1000;
      default:
        return 60 * 60 * 1000;
    }
  }

  async generateAuthTokens(user: { id: string; email: string; role: string }): Promise<AuthTokens> {
    const accessTokenId = this.generateTokenId();
    const refreshTokenId = this.generateTokenId();
    const accessTokenExpiry = this.configService.get<string>('jwt.expiresIn') || '15m';
    const refreshTokenExpiry = this.configService.get<string>('jwt.refreshExpiresIn') || '7d';

    const payload: JwtPayload = { sub: user.id, email: user.email, role: user.role };

    const accessToken = this.jwtService.sign(
      { ...payload, jti: accessTokenId },
      {
        secret: this.configService.get<string>('jwt.secret'),
        expiresIn: accessTokenExpiry,
      },
    );
    const refreshToken = this.jwtService.sign(
      { ...payload, jti: refreshTokenId },
      {
        secret: this.configService.get<string>('jwt.refreshSecret'),
        expiresIn: refreshTokenExpiry,
      },
    );

    const accessTokenExpiresAt = new Date(Date.now() + this.parseExpiry(accessTokenExpiry));
    const refreshTokenExpiresAt = new Date(Date.now() + this.parseExpiry(refreshTokenExpiry));

    await this.prisma.token.createMany({
      data: [
        {
          token: accessTokenId,
          userId: user.id,
          type: TokenType.ACCESS,
          expires: accessTokenExpiresAt,
        },
        {
          token: refreshTokenId,
          userId: user.id,
          type: TokenType.REFRESH,
          expires: refreshTokenExpiresAt,
        },
      ],
    });

    return { accessToken, refreshToken };
  }

  async refreshAuthTokens(refreshToken: string): Promise<AuthTokens> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('jwt.refreshSecret'),
      }) as JwtPayload;

      if (payload.jti) {
        const isBlacklisted = await this.isTokenBlacklisted(payload.jti, TokenType.REFRESH);
        if (isBlacklisted) throw new UnauthorizedException('Refresh token has been revoked');
      }

      await this.blacklistToken(payload.jti!, TokenType.REFRESH);
      return this.generateAuthTokens({
        id: payload.sub,
        email: payload.email,
        role: payload.role,
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async blacklistToken(tokenId: string, type: TokenType): Promise<void> {
    await this.prisma.token.updateMany({
      where: { token: tokenId, type },
      data: { blacklisted: true },
    });
  }

  async isTokenBlacklisted(tokenId: string, type: TokenType): Promise<boolean> {
    const token = await this.prisma.token.findFirst({
      where: { token: tokenId, type, blacklisted: true },
    });
    return !!token;
  }

  async revokeAllUserTokens(userId: string): Promise<void> {
    await this.prisma.token.updateMany({
      where: { userId },
      data: { blacklisted: true },
    });
  }

  decodeRefreshToken(refreshToken: string): { jti?: string } | null {
    try {
      return this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('jwt.refreshSecret'),
      }) as { jti?: string };
    } catch {
      return null;
    }
  }
}
