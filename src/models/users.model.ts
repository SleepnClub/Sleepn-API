import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Role } from '@src/enums';

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop({unique: true, type: String, required: true})
  issuer: string;

  @Prop({unique: true, type: String, required: false})
  wallet: string;

  @Prop({required: true, type: String})
  role: Role;

  @Prop({required: false, type: Boolean})
  isConnected: boolean;

  @Prop({required: false, type: String})
  fitbitAccessToken: string;

  @Prop({required: false, type: String})
  fitbitRefreshToken: string;

  @Prop({required: false, type: Date})
  fitbitConfigDate: Date;

  @Prop({required: false, type: Boolean})
  sleepInProgress: boolean;

  @Prop({required: false, type: Date})
  lastSleepCycleStart: Date;

  @Prop({required: false, type: Date})
  lastSleepCycleEnd: Date;

  @Prop({required: false, type: Number})
  bedroomNftID: number;

  @Prop({required: true, type: Date})
  lastConnection: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);