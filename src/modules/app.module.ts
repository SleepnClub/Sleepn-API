import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EEnvKeys } from '@src/enums/env.enum';
import { MongooseModule } from '@nestjs/mongoose';
import { ContractsModule } from './contracts.module';
import { AppController } from '../controllers/app.controller';
import { AppService } from '../services/app.service';
import { AuthModule } from './auth.module';
import { UsersModule } from './users.module';
import { SleepModule } from './sleep.module';
import { MagicModule } from './magic.module';
import { FitbitModule } from './fitbit.module';



@Module({
  imports: [
    AuthModule,
    ConfigModule.forRoot({
      isGlobal: true
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>(EEnvKeys.DATABASE_URL),
      }),
      inject: [ConfigService]
    }),
    ContractsModule,
    UsersModule,
    SleepModule,
    MagicModule,
    FitbitModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
  ],
})
export class AppModule {}
