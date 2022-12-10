import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../models/users.model';
import { Role } from '@src/enums';

@Injectable()
export class UsersService {
    constructor(
        @InjectModel('user') 
        private readonly userModel: Model<UserDocument>
    ) {}
    // Creates a new user
    async createUser(issuer: string): Promise<User> {
        const role = Role.User;
        return await this.userModel.create({
            issuer: issuer,
            lastConnection: Date.now(),
            role: role,
            sleepInProgress: false,
            sleepCycleStartDate: Date.now(),
            sleepCycleEndDate: Date.now()
        });
    }

    // Returns an user
    async getUser(query: object ): Promise<User|null> {
        return await this.userModel.findOne(query);
    }

    // Returns all users with a filter
    async getUsers(query: object ): Promise<User[]|[]> {
        return await this.userModel.find(query);
    }

    // Updates an user
    async updateUser(query: object, update: object): Promise<User|null> {
        return await this.userModel.findOneAndUpdate(query, update, { new: true });
    }


}
