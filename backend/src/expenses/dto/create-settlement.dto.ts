import { IsNumber, IsUUID, Min } from 'class-validator';

export class CreateSettlementDto {
  @IsUUID()
  fromUserId: string;

  @IsUUID()
  toUserId: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  amount: number;
}
