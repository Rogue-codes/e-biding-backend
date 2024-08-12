import { IsDateString, IsNotEmpty, IsNumber, Min } from "class-validator";

export class CreateBidDto {
  @IsNumber()
  @IsNotEmpty()
  auction: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(1000)
  bidAmount: number;
}