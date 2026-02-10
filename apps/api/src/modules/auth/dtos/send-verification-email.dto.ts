import { IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendVerificationEmailDto {
  @ApiProperty()
  @IsEmail()
  email: string;
}
