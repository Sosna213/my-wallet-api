import {Body, Controller, Post} from '@nestjs/common';
import {UserService} from "../service/user.service";
import {UserDto} from "../DTOs/user.dto";

@Controller('user')
export class UserController {

    constructor(private readonly userService: UserService) {}

    @Post()
    createUser(@Body() user: UserDto) {
        return this.userService.createUser(user);
    }
}
