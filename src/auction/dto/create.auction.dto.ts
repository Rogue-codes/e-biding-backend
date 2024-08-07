import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsString,
  Length,
} from 'class-validator';

export class CreateAuctionDto {
  @Length(7)
  @IsString()
  @IsNotEmpty()
  bidId: string;

  @Length(0,1000)
  @IsString()
  @IsNotEmpty()
  bidDescription: string;

  @Length(0, 1000)
  @IsString()
  @IsNotEmpty()
  itemDescription: string;

  // @IsNumber()
  @IsString()
  @IsNotEmpty()
  startingAmount: number;

  @IsArray()
  @IsNotEmpty()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  bidRequirements: string[];

  @ArrayMaxSize(3)
  @ArrayMinSize(1)
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  categories: string[];

  itemImg: any;

  @IsDateString()
  @IsNotEmpty()
  endDate: string;
}
