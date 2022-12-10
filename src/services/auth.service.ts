import { Injectable } from '@nestjs/common';
import { UsersService } from './users.service';
import { MagicService } from './magic.service';
import { JwtService } from '@nestjs/jwt';
import { Role } from '@src/enums';

@Injectable()
export class AuthService {
    constructor(private readonly usersService: UsersService, private readonly jwtService: JwtService, private readonly magicService: MagicService) { }

    async validate(_issuer: string, didToken: string): Promise<Boolean> {
        if (await this.magicService.validate(didToken)) {
            const issuer = await this.magicService.getIssuer(didToken);
            let user = await this.usersService.getUser({ issuer });
            if (!user) {
                user = await this.usersService.createUser(issuer);  
            }
            return _issuer == issuer;
        }
        return false;
    }

    async login(issuer: string) {
        const payload = { issuer: issuer };
        return {
            access_token: this.jwtService.sign(payload),
        };
    }

    async isAdmin(issuer: string): Promise<Boolean> {
        const user = await this.usersService.getUser({ issuer });
        return user?.role === Role.Admin;
    }
}

