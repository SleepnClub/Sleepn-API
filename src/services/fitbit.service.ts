import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { REWARDS } from '@src/constants';
import { lastValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { EEnvKeys } from '@src/enums/env.enum';

@Injectable()
export class FitbitService {
    constructor(
        private readonly httpService: HttpService,
        private readonly configService: HttpService
    ) {};
    
    public async getFitbitCredentials(code: string) : Promise<
    {    
        "access_token": string,
        "expires_in": number,
        "refresh_token": string,
        "scope": string,
        "token_type": string,
        "user_id": string
    } | undefined> {
        const response = await lastValueFrom(this.httpService.post(
            'https://api.fitbit.com/oauth2/token',
            `client_id=${String(this.configService.get<string>(EEnvKeys.FITBIT_CLIENT_ID))}&code=${code}&code_verifier=${String(this.configService.get<string>(EEnvKeys.FITBIT_CODE_VERIFIER))}&grant_type=authorization_code`,
            {
                headers: {
                    'Authorization': `Basic ${Buffer.from(String(this.configService.get<string>(EEnvKeys.FITBIT_CLIENT_ID))+":"+String(this.configService.get<string>(EEnvKeys.FITBIT_CLIENT_SECRET))).toString('base64')}`,
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        ));
        return response.data;
    }

    async getSleepLogByDate(accessToken: string, date: string) : Promise <any | undefined> { 
        const response = await lastValueFrom(this.httpService.get(
            `https://api.fitbit.com/1.2/user/-/sleep/date/${date}.json`,
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Accept': 'application/json',

                }
            }
        ));
        return response.data;
    }

    async getSleepLogByDateRange(accessToken: string, startDate: string, endDate: string) : Promise <object | undefined> { 
        const response = await lastValueFrom(this.httpService.get(
            `https://api.fitbit.com/1.2/user/-/sleep/date/${startDate}/${endDate}.json`,
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Accept': 'application/json',

                }
            }
        ));
        return response.data;
    }
}
