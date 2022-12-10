import { Magic, MagicUserMetadata } from '@magic-sdk/admin';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EEnvKeys } from '@src/enums/env.enum';

@Injectable()
export class MagicService {
    private magic: Magic;

    constructor(private readonly configService: ConfigService) {
        this.magic = new Magic(String(this.configService.get<string>(EEnvKeys.MAGIC_LINK_SECRET_KEY)));
    }

    async parseAuthorizationHeader(authorization: string): Promise<string> {
        return this.magic.utils.parseAuthorizationHeader(authorization);
    }

    async getIssuer(didToken: string): Promise<string> {
        return this.magic.token.getIssuer(didToken);
    }

    async getMetadataByToken(didToken: string): Promise<MagicUserMetadata> {
        return await this.magic.users.getMetadataByToken(didToken);
    }

    async getMetadataByIssuer(issuer: string): Promise<MagicUserMetadata> {
        return await this.magic.users.getMetadataByIssuer(issuer);
    }

    async decode(didToken: string): Promise<any> {
        return this.magic.token.decode(didToken);
    }

    async validate(token: string): Promise<boolean> {
        try {
            this.magic.token.validate(token);
            return true;
        }
        catch (err) {
            return false;
        }
    }

    async logoutByIssuer(issuer: string): Promise<void> {
        this.magic.users.logoutByIssuer(issuer);
    }

    async logoutByToken(didToken: string): Promise<void> {
        this.magic.users.logoutByToken(didToken);
    }

}