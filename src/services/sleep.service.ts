import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { UsersService } from './users.service';
import { FitbitService } from './fitbit.service';
import { RewardsService } from './rewards.service';
import { REWARDS } from '@src/constants';
import { getSpreadSheetDocument, getSheetByName } from '@src/utils/gsheet.utils';
import { ConfigService } from '@nestjs/config';
import { EEnvKeys } from '@src/enums/env.enum';
import { ContractsService } from './contracts.service';


@Injectable()
export class SleepService {
    private readonly logger = new Logger(SleepService.name);

    constructor(
        private readonly usersService: UsersService,
        private readonly fitBitService: FitbitService,
        private readonly rewardsService: RewardsService,
        private readonly configService: ConfigService,
        private readonly contractsService: ContractsService
    ) {}

    public async isSleeping(issuer: string): Promise<Boolean> {
        const user = await this.usersService.getUser({ issuer });
        if (user) {
            return user.sleepInProgress;
        }
        return false;
    }

    public async sleepMonitoring(issuer: string, bedroomNftID: number, state: boolean): Promise<Boolean> {
        if (state) {
            return await this.startSleepCycle(issuer, bedroomNftID);
        }
        return await this.stopSleepCycle(issuer);
    }

    public async setAccessTokenFitbit(issuer: string, code: string): Promise<Boolean> {
        const user = await this.usersService.getUser({ issuer: issuer });
        if (user) {
            const accessToken = await this.fitBitService.getFitbitCredentials(code);
            if (accessToken) {
                await this.usersService.updateUser(
                    { 
                        issuer: issuer 
                    }, 
                    { 
                        fitbitAccessToken: accessToken.access_token,
                        fitbitRefreshToken: accessToken.refresh_token,
                        fitbitConfigDate: Date.now()
                    }
                );
                return true;
            }
        }
        return false;
    }

    private async isValid(issuer: string, bedroomNftID: number): Promise<Boolean> {
        // Checks that someone has not transferred his Nft to another wallet after sleep mode has been activated.
        const users = await this.usersService.getUsers({ bedroomNftID: bedroomNftID });
        if (users.length > 0) {
            for (let i=0; i<users.length; i++) {
                if (users[i].bedroomNftID == bedroomNftID && users[i].sleepInProgress == true) {
                    return false;
                }
            }
        }
        const user = await this.usersService.getUser({ issuer: issuer });
        if (user) {
            const now = new Date();
            const expiredDate = new Date(user.fitbitConfigDate);
            expiredDate.setDate(expiredDate.getFullYear() + 1);
            // User is not sleeping and has a valid fitbit access token 
            if (!user.sleepInProgress && user.fitbitAccessToken && now < expiredDate) {
                const msBetweenDates = now.getTime() - user.lastSleepCycleEnd.getTime();
                let secBetweenDates = Math.floor(msBetweenDates / 1000);
                let minBetweenDates = Math.floor(secBetweenDates / 60);
                const hoursBetweenDates = Math.floor(minBetweenDates / 60);
                // At least 8 hours between each sleep - TO VERIFY
                if (hoursBetweenDates >= 8) {
                    return true;
                }
            }
        }
        return false;
    }

    private async startSleepCycle(issuer: string, bedroomNftID: number): Promise<Boolean> {
        if (!this.isValid(issuer, bedroomNftID)) {
            return false;
        }
        const user = await this.usersService.updateUser(
            { 
                issuer: issuer 
            }, 
            { 
                sleepInProgress: true, 
                sleepCycleStartDate: Date.now(),
                bedroomNftID: bedroomNftID
            }
        );
        return user ? true : false;
    }

    private async stopSleepCycle(issuer: string): Promise<Boolean> {
        if (!this.isSleeping(issuer)) {
            return false;
        }
        const user = await this.usersService.updateUser(
            { 
                issuer: issuer 
            }, 
            { 
                sleepInProgress: false, 
                lastSleepCycleEndDate: Date.now()
            }
        );
        if (user) {
            const [rewardAmount, deep, light, rem] = await this.computeRewardAmount(issuer);
            if (rewardAmount > 0) {
                // Writes in the BBD 
                await this.rewardsService.createReward(
                    user.wallet,
                    rewardAmount,
                    user.lastSleepCycleEnd,
                    deep,
                    light,
                    rem
                );
                // Connects to the Google Spreadsheet 
                const doc = await getSpreadSheetDocument(
                    String(this.configService.get<string>(EEnvKeys.GOOGLE_SHEET_ID)),
                    String(this.configService.get<string>(EEnvKeys.GOOGLE_ACCOUNT_EMAIL)),
                    String(this.configService.get<string>(EEnvKeys.GOOGLE_ACCOUNT_PRIVATE_KEY)),
                );
                // Opens the Sheet
                const sheet = getSheetByName(doc, "Monitoring");
                // Adds the row in the document
                await sheet.addRow({ wallet: user.wallet, tokenID: user.bedroomNftID, amount: rewardAmount});
            }
            return true;
        }
        return user ? true : false;
    }

    private async getLastSleepDataFitbit(issuer: string): Promise<any | undefined | null> {
        const user = await this.usersService.getUser({ issuer: issuer });
        if (user) {
            const date =  user.lastSleepCycleEnd;
            const day = date.getDate();
            const month = date.getMonth();
            const year = date.getFullYear();
            const sleepData = await this.fitBitService.getSleepLogByDate(user.fitbitAccessToken, `${year}-${month}-${day}`);
            return sleepData;
        }
        return null;
    }

    private async computeRewardAmount(issuer: string): Promise<number[]> {
        const sleepData = await this.getLastSleepDataFitbit(issuer);
        if (sleepData) {
            const deep: number = sleepData["summary"]["stages"]["deep"];
            const light: number = sleepData["summary"]["stages"]["light"];
            const rem: number = sleepData["summary"]["stages"]["rem"];
            const rewardAmount: number = deep * REWARDS.deepCycle + light * REWARDS.lightCycle + rem * REWARDS.remCycle;
            return [rewardAmount, deep, light, rem];
        }
        return [0, 0, 0, 0];
    }

    @Cron(CronExpression.EVERY_30_MINUTES)
    async rewardUsers(): Promise<void> {
        try {
            this.logger.log(`Rewarding users job started...`);
            // Connects to the Google Spreadsheet 
            const doc = await getSpreadSheetDocument(
                String(this.configService.get<string>(EEnvKeys.GOOGLE_SHEET_ID)),
                String(this.configService.get<string>(EEnvKeys.GOOGLE_ACCOUNT_EMAIL)),
                String(this.configService.get<string>(EEnvKeys.GOOGLE_ACCOUNT_PRIVATE_KEY)),
            );
            // Opens the Sheet
            const sheet = getSheetByName(doc, "Monitoring");
            // Gets the rows
            const rows = await sheet.getRows();
            this.logger.debug(`Number of users to reward: ${rows.length}`);
            if (rows.length > 0) {
                let groups: {addresses: string[], ids: number[], amounts: number[], startIndex: number, endIndex: number}[] = [{
                    addresses: [], 
                    ids: [],
                    amounts: [],
                    startIndex: 2,
                    endIndex: 0
                }];
                let counter = 0; // Counter to create groups of transactions
                let a = 0; // Group index
                for (let i = 0; i < rows.length; i++) {
                    if (i == rows.length-1 || counter == 49) {
                        groups[a].endIndex = i+2;
                    }
                    if (counter == 50) {
                        a += 1; // Increases the group index 
                        counter = 0; // Counter reset to 0
                        groups[a] = {
                            addresses: [], 
                            ids: [],
                            amounts: [],
                            startIndex: groups[a-1].startIndex + 50,
                            endIndex: 0
                        }
                    }
                    // Wallet address
                    groups[a].addresses[counter] = rows[i].wallet;
                    // Bedroom NFT ID
                    groups[a].ids[counter] = rows[i].tokenID;
                    // Amount to mint
                    groups[a].amounts[counter] = rows[i].amount;
                    counter += 1; // Increased the tx counter
                }
                this.logger.debug(`Number of groups: ${groups.length}`);
                // Mints Batch By Group 
                for (let i = 0; i < groups.length; i++) {
                    let addresses: String[] = [];
                    let amounts: number[] = [];
                    // Call RPC - Getter
                    const dataFromContract = await this.contractsService.getDataBedroomNfts(groups[i].ids);
                    // Ownership Verification 
                    for (let indexAddress = 0; indexAddress < groups[i].addresses.length; indexAddress) {
                        if (groups[i].addresses[indexAddress].toUpperCase() == dataFromContract.owners[indexAddress].toUpperCase()) {
                            addresses[indexAddress] = dataFromContract.owners[indexAddress];
                            amounts[indexAddress] = groups[i].amounts[indexAddress];
                        }
                    }
                    if (addresses.length > 0) {
                        // Call RPC - Sleep Rewards Batch Tx
                        const tx = await this.contractsService.sleepRewardBatch(addresses, amounts);   
                        if (tx) {
                            // Updates the sheet
                            await sheet.clearRows({start: groups[i].startIndex, end: groups[i].endIndex});
                            // Updates the BDD
                            for (let indexAddress = 0; indexAddress < addresses.length; indexAddress) {
                                const user = await this.usersService.getUser({wallet: addresses[indexAddress]});
                                if (user) {
                                    await this.rewardsService.updateReward(
                                    addresses[indexAddress],
                                    user.lastSleepCycleEnd,   
                                    {
                                        isRewarded: true,
                                        rewardTxHash: tx
                                    })
                                }
                                this.logger.error(`User not found ! Address: ${addresses[indexAddress]}`);
                            }
                        }
                    } 
                }
            }
            this.logger.log(`Rewarding users job finished...`); 
        } catch (error) {
            this.logger.error(error);
        }
        
    }
}