import { IsNotEmpty, IsString } from 'class-validator';

export class GetWalletDto {
  @IsNotEmpty({ message: 'id must not be empty' })
  @IsString()
  id: string;
}
