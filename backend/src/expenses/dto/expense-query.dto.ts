import { IsOptional, IsString } from 'class-validator';

export class ExpenseQueryDto {
  @IsOptional()
  @IsString()
  category?: string;
}
