import {Injectable} from "@nestjs/common";

@Injectable()
export class UserDto {
    id: string;
    nickname: string;
    email: string;
    name: string;
}
