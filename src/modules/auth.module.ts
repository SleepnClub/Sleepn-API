import { Module } from "@nestjs/common";
import { PassportModule } from "@nestjs/passport";
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from '@src/controllers';
import { MagicModule } from "./magic.module";
import { UsersModule } from "./users.module";
import { AuthService } from "@src/services"
import { AdminStrategy, LocalStrategy, UserStrategy } from "@src/stategies";
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EEnvKeys } from "@src/enums/env.enum";


@Module({
  imports: [
    ConfigModule,
    UsersModule, 
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>(EEnvKeys.SECRETS_JWT),
        signOptions: { expiresIn: '7d' },
      }),
      inject: [ConfigService]
    }),
    MagicModule
  ],
  providers: [AuthService, LocalStrategy, AdminStrategy, UserStrategy],
  controllers: [AuthController],
  exports: [AuthService]
})
export class AuthModule { }