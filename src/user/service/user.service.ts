import { Injectable } from '@nestjs/common';
import {UserDto} from "../DTOs/user.dto";
import {User} from "../entity/user.entity";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";

@Injectable()
export class UserService {

    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>) {
    }

    async createUser(user: UserDto) {
        const userEntity = new User();
        userEntity.name = user.name;
        userEntity.email = user.email;
        userEntity.nickname = user.nickname;
        userEntity.id = user.id;
        await this.userRepository.save(userEntity);
        return userEntity;
    }

    async getAllUsers(){
        return await this.userRepository.find();
    }

}
