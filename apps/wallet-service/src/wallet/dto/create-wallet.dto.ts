import { IsNotEmpty, IsString } from 'class-validator';

export class CreateWalletDto {
  @IsNotEmpty({ message: 'userId must not be empty' })
  @IsString()
  userId: string;
}
