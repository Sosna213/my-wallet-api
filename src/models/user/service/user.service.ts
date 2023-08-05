import {Injectable} from '@nestjs/common';
import {User} from "../entity/user.entity";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import {UserDto} from "../DTO/user.dto";

@Injectable()
export class UserService {

    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>) {
    }

    async createUser(user: UserDto, userId: string) {
        const {name, email, nickname} = user;
        return await this.userRepository.save({
            name,
            email,
            nickname,
            id: userId
        });
    }

    async getAllUsers() {
        return await this.userRepository.find();
    }

    async getUserById(userId: string): Promise<User> {
        return await this.userRepository.findOneBy({id: userId});
    }

    async updateUser(user: User) {
        await this.userRepository.save(user);
    }

}
