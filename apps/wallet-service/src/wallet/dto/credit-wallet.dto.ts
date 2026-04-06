import { IsNotEmpty, IsNumber, IsPositive, IsString } from 'class-validator';

export class CreditWalletDto {
  @IsNotEmpty()
  @IsString()
  id: string;

  @IsNumber()
  @IsPositive({ message: 'amount must be a positive number' })
  amount: number;
}
