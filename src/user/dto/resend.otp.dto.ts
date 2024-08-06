import { IsNotEmpty, IsNumber } from 'class-validator';

export class resendOtpDto {
  @IsNotEmpty()
  @IsNumber()
  userId: number;
}
