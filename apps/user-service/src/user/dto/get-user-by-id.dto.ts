import { IsNotEmpty, IsString } from 'class-validator';

export class GetUserByIdDto {
  @IsNotEmpty({ message: 'id must not be empty' })
  @IsString()
  id: string;
}
