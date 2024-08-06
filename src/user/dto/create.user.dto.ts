import { Transform } from 'class-transformer';
import {
  Equals,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsString,
  Length,
  Matches,
} from 'class-validator';
import { IsFile } from 'src/decorators/file.decorator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsString()
  @IsNotEmpty()
  companyName: string;

  @IsString()
  @IsNotEmpty()
  companyAddress: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsNotEmpty()
  alternatePhone: string;

  @IsNotEmpty()
  @IsString()
  RCNumber: string;

  CACDoc: any;

  @IsNumber()
  @Transform(({ value }) => parseInt(value, 10), { toClassOnly: true })
  postalCode: number;

  @Length(6, 20)
  @Matches(/[a-z]/, {
    message: 'Password must contain at least one lowercase character',
  })
  //   string must contain at least one uppercase character
  @Matches(/[A-Z]/, {
    message: 'Password must contain at least one uppercase character',
  })
  //   string must contain at least one number
  @Matches(/[0-9]/, { message: 'Password must contain at least one number' })
  //   string must contain at least one special character
  @Matches(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, {
    message: 'Password must contain at least one special character',
  })
  @IsString()
  password: string;
}
