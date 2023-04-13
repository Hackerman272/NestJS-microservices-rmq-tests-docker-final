import {IsNumber, IsOptional} from "class-validator";

export class BanUserDto {
    readonly userId: number;
    readonly banReason: string;

    @IsNumber()
    @IsOptional()
    profileId: number;
}
