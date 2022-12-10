import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { FitbitService } from '@src/services';
import { ConfigModule } from '@nestjs/config';

@Module({
    imports: [HttpModule, ConfigModule],
    providers: [FitbitService],
    exports: [FitbitService]
})
export class FitbitModule {}
