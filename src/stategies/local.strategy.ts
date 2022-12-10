import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '@src/services';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, "local") {
    constructor(private readonly authService: AuthService) {
        super({ usernameField: 'issuer',  passwordField: 'didToken'});
    }

  async validate(issuer: string, didToken: string): Promise<String> {
    const isValid = await this.authService.validate(issuer, didToken);
    if (!isValid) {
      throw new UnauthorizedException();
    }
    return issuer;
  }
}