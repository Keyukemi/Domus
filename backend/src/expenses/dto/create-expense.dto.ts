import {
  IsString,
  IsNumber,
  IsDateString,
  IsArray,
  IsUUID,
  IsOptional,
  MinLength,
  MaxLength,
  Min,
  IsEnum,
} from 'class-validator';
import { ExpenseStatus } from '../../generated/prisma/enums';

export class CreateExpenseDto {
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  description: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  amount: number;

  @IsString()
  @MinLength(1)
  @MaxLength(50)
  category: string;

  @IsDateString()
  date: string;

  @IsOptional()
  @IsEnum(ExpenseStatus)
  status?: ExpenseStatus;

  @IsArray()
  @IsUUID('4', { each: true })
  splitAmongIds: string[];
}
