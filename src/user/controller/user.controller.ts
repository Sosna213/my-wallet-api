import {Body, Controller, Get, Post, Req, UseGuards} from '@nestjs/common';
import {UserService} from "../service/user.service";
import {UserDto} from "../DTOs/user.dto";
import {Request} from 'express';
import {AuthorizationGuard} from "../../authorization/authorization.guard";

@Controller('user')
export class UserController {

    constructor(private readonly userService: UserService) {
    }

    @Post()
    createUser(@Body() user: UserDto) {
        return this.userService.createUser(user);
    }

    @UseGuards(AuthorizationGuard)
    @Get()
    getAllUsers(@Req() request: Request) {
        return this.userService.getAllUsers();
    }

    @UseGuards(AuthorizationGuard)
    @Get('/isRegistered')
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
        user.id = request.auth.payload.sub;
        return this.userService.createUser(user);
    }
}
