import { IsEmail, IsString, MinLength, MaxLength, Matches } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  @Matches(/(?=.*[A-Z])/, { message: 'Password must contain at least 1 uppercase letter' })
  @Matches(/(?=.*\d)/, { message: 'Password must contain at least 1 number' })
  password: string;

  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name: string;
}
