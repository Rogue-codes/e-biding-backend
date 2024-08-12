import { IsNotEmpty, IsNumber, Min } from 'class-validator';

export class UpdateBidDto {
  @IsNumber()
  @IsNotEmpty()
  @Min(1000)
  bidAmount: number;
}
