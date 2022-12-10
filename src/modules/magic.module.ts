import { Module } from '@nestjs/common';
import { MagicService } from '@src/services';
import { ConfigModule } from '@nestjs/config';

@Module({
    imports: [ConfigModule],
    providers:[MagicService],
    exports:[MagicService]
})
export class MagicModule {}
