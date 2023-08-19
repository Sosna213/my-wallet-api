import {IsNotEmpty} from "class-validator";

export class CreateAccountDTO {
    @IsNotEmpty()
    name: string;
    @IsNotEmpty()
    currency: string;
}
