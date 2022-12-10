import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '@src/services';

@Injectable()
export class AdminStrategy extends PassportStrategy(Strategy, 'admin-jwt') {
  constructor(
    private authService: AuthService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.SECRETS_JWT,
    });
  }

  async validate(payload: { issuer: string}) {
    const isAdmin = await this.authService.isAdmin(payload.issuer);
    if (!isAdmin) {
      throw new UnauthorizedException();
    } 
    return { issuer: payload.issuer };
  }
}