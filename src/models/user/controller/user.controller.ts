import {Body, Controller, Get, Post, Req, UseGuards} from '@nestjs/common';
import {UserService} from "../service/user.service";
import {Request} from 'express';
import {AuthorizationGuard} from "../../../authorization/authorization.guard";
import {UserDto} from "../DTO/user.dto";

@Controller('user')
export class UserController {

    constructor(private readonly userService: UserService) {
    }

    @UseGuards(AuthorizationGuard)
    @Get()
    getAllUsers(@Req() request: Request) {
        return this.userService.getAllUsers();
    }

    @UseGuards(AuthorizationGuard)
    @Get('/is-registered')
    checkUserIsInDatabase(@Req() request: Request): Promise<Boolean> {
        const allUsers = this.userService.getAllUsers();
        const userId = request.auth.payload.sub;
        return allUsers.then(result => {
            return !!result.find(user => user.id === userId)
        });
    }

    @UseGuards(AuthorizationGuard)
    @Post('register')
    register(@Body() user: UserDto, @Req() request: Request) {
        const userId = request.auth.payload.sub;
        return this.userService.createUser(user, userId);
    }
}
