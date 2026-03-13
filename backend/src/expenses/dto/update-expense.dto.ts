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
} from 'class-validator';

export class UpdateExpenseDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  description?: string;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  amount?: number;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  category?: string;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  splitAmongIds?: string[];
}
