import { Module } from '@nestjs/common';
import { ContractsService } from '@src/services';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule, 
  ],
  providers: [ContractsService],
  exports: [ContractsService],
})
export class ContractsModule {}
