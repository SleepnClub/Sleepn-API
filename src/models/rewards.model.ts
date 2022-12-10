import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type RewardDocument = Reward & Document;

@Schema()
export class Reward {
    @Prop({unique: false, type: String, required: true})
    wallet: string;

    @Prop({unique: false, type: Date, required: true})
    sleepCycleEndDate: Date;

    @Prop({unique: false, type: Number, required: true})
    deepSleep: number;

    @Prop({unique: false, type: Number, required: true})
    lightSleep: number;

    @Prop({unique: false, type: Number, required: true})
    remSleep: number;

    @Prop({unique: false, type: Number, required: true})
    rewardAmount: number;

    @Prop({unique: false, type: Boolean, required: true})
    isRewarded: boolean;

    @Prop({unique: false, type: String, required: false})
    rewardTxHash: string;
}

export const RewardSchema = SchemaFactory.createForClass(Reward);