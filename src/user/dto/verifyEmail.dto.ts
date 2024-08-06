import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class verifyEmailDto {
    @IsString()
    @IsNotEmpty()
    token: string;

    @IsNotEmpty()
    @IsNumber()
    userId: number;
}