import { Module } from '@nestjs/common';
import { RewardsService} from '@src/services';
import { MongooseModule } from '@nestjs/mongoose';
import { RewardSchema } from '@src/models';
import { ConfigModule } from '@nestjs/config';

@Module({
    imports: [ConfigModule, MongooseModule.forFeature([{ name: "reward", schema: RewardSchema }])],
    providers: [RewardsService],
    exports: [RewardsService]
})
export class RewardsModule {}
