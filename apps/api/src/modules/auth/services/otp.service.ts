import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { generateOTP } from '../../../shared/utils/string.utils';

@Injectable()
export class OtpService {
  constructor(private prisma: PrismaService) {}

  async generateEmailOtp(email: string, expirationMinutes = 10): Promise<string> {
    const otp = generateOTP(6);
    const expiresIn = new Date(Date.now() + expirationMinutes * 60 * 1000);

    await this.prisma.otp.deleteMany({ where: { email: email.toLowerCase() } });
    await this.prisma.otp.create({
      data: {
        email: email.toLowerCase(),
        otp,
        expiresIn,
      },
    });
    return otp;
  }

  async verifyEmailOtp(email: string, otp: string): Promise<boolean> {
    const otpDoc = await this.prisma.otp.findFirst({
      where: {
        email: email.toLowerCase(),
        otp,
        expiresIn: { gt: new Date() },
      },
    });
    if (!otpDoc) return false;
    await this.prisma.otp.delete({ where: { id: otpDoc.id } });
    return true;
  }
}
