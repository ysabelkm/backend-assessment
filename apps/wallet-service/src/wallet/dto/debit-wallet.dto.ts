import { IsNotEmpty, IsNumber, IsPositive, IsString } from 'class-validator';

export class DebitWalletDto {
  @IsNotEmpty()
  @IsString()
  id: string;

  @IsNumber()
  @IsPositive({ message: 'amount must be a positive number' })
  amount: number;
}
