import { IsEmail, IsNotEmpty, IsString, Length, Matches } from 'class-validator';
import { IsMatchingPasswords } from 'src/decorators/ismatch.decorator';

export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty()
  token: string;

  @IsEmail()
  email: string;

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
  newPassword: string;

  @IsMatchingPasswords('newPassword', {
    message: 'Confirm Password must match New Password',
  })
  confirmPassword: string;
}
