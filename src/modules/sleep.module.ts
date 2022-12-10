import { Module } from '@nestjs/common';
import { SleepService } from '@src/services';
import { FitbitModule } from './fitbit.module';
import { UsersModule } from './users.module';
import { RewardsModule } from './rewards.module';
import { SleepController } from '@src/controllers';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ContractsModule } from './contracts.module';

@Module({
    imports: [UsersModule, FitbitModule, RewardsModule, ConfigModule, ContractsModule, ScheduleModule.forRoot()],
    controllers: [SleepController],
    providers: [SleepService],
    exports: [SleepService]
})
export class SleepModule { }
