import { IsNotEmpty, IsNumber, IsString, Length } from "class-validator";
import { Transform } from "class-transformer";

export class UpdateUserDto {
  @IsNotEmpty()
  @IsString()
  @Length(0, 10)
  RCNumber: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsNotEmpty()
  alternatePhone: string;

  @IsString()
  @IsNotEmpty()
  companyName: string;

  @IsString()
  @IsNotEmpty()
  companyAddress: string;

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsNumber()
  @Transform(({ value }) => parseInt(value, 10), { toClassOnly: true })
  postalCode: number;
}