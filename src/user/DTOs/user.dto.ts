import {Injectable} from "@nestjs/common";

@Injectable()
export class UserDto {
    id: string;
    name: string;
}
