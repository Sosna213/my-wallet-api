import {IsEmail, IsNotEmpty} from "class-validator";

export class UserDto {
    @IsNotEmpty()
    nickname: string;
    @IsNotEmpty()
    @IsEmail()
    email: string;
    @IsNotEmpty()
    name: string;
}
