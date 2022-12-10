
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Reward, RewardDocument } from '../models/rewards.model';

@Injectable()
export class RewardsService {
    constructor(
        @InjectModel('reward') 
        private readonly rewardModel: Model<RewardDocument>
    ) {}

    // Creates a new user
    async createReward(
        wallet: string, 
        rewardAmount: number, 
        sleepCycleEndDate: Date,
        deepSleep: number,
        lightSleep: number,
        remSleep: number,
    ): Promise<Reward> {
        return await this.rewardModel.create({
            wallet: wallet,
            sleepCycleEndDate: sleepCycleEndDate,
            rewardAmount: rewardAmount,
            deepSleep: deepSleep,
            lightSleep: lightSleep,
            remSleep: remSleep,
            isRewarded: false,
        });
    }

    // Returns a reward 
    async getReward(wallet: string, sleepCycleEndDate: Date): Promise<Reward|null> {
        return await this.rewardModel.findOne({
            filter: {
                wallet: wallet,
                sleepCycleEndDate: sleepCycleEndDate
            }
        });
    }

    // Returns all rewards of an user
    async getRewards(wallet: string): Promise<Reward[]|null> {
        return await this.rewardModel.find({
            filter: {
                wallet: wallet
            }
        });
    }

    // Returns last reward of an user
    async getLastReward(wallet: string): Promise<Reward|undefined> {
        const rewards: Reward[] = await this.rewardModel.find({
            filter: {
                wallet: wallet
            }
        }); 
        if (rewards) {
            return rewards[rewards.length - 1];
        }
        return undefined;
    }

    // Updates an user
    async updateReward(wallet: String, sleepCycleEndDate: Date, update: object): Promise<Reward|null> {
        return await this.rewardModel.findOneAndUpdate({
            filter: {
                wallet: wallet,
                sleepCycleEndDate: sleepCycleEndDate
            }, 
            update: update, 
            options: { new: true }
        });
    }


}
