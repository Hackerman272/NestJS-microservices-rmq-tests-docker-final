import {ApiProperty} from "@nestjs/swagger";
import {IsEmail, IsNumber, IsOptional, IsString, Length} from "class-validator";
import {IsNull} from "sequelize-typescript";

export class CreateUserDto {

    @ApiProperty({example: 'test@test.com', description: "Уникальный адрес почты"})
    @IsString({message: "Должна быть строка"})
    @IsEmail({}, {message: "не email"})
    readonly email: string;

    @ApiProperty({example: '654321', description: "Пароль пользователя"})
    @IsString({message: "Должна быть строка"})
    @Length(4, 16, {message: 'От 4 по 16 символов'})
    readonly password: string;

    @ApiProperty({example: 123, description: "id связанного профиля"})
    @IsOptional()
    @IsNumber()
    readonly profileId: number;
}
