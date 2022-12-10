import { Body, Controller, Get, Param, Request, Post, Query, UseGuards } from '@nestjs/common';
import { SleepService } from '@src/services';
import { UserAuthGuard } from '@src/guards';
import { User } from '@src/models';

@Controller('user')
export class SleepController {
  constructor(
    private readonly sleepService: SleepService,
  ) {}

  @UseGuards(UserAuthGuard)
  @Get("sleep/state")
  async getSleepUserState(@Request() req: {user: User}): Promise<Boolean> {
    return (await this.sleepService.isSleeping(req.user.issuer));
  }

  @UseGuards(UserAuthGuard)
  @Get("sleep/monitoring")
  async sleepMonitoringStart(@Query() query: { state: boolean, bedroomNftId: number}, @Request() req: {user: User} ): Promise<Boolean> {
    return (await this.sleepService.sleepMonitoring(req.user.issuer, query.bedroomNftId, query.state));
  }

  @UseGuards(UserAuthGuard)
  @Post("setAccessTokenFitbit")
  async setAccessTokenFitbit(@Body() message: {code: string }, @Request() req: {user: User} ): Promise<Boolean> {
    return (await this.sleepService.setAccessTokenFitbit(req.user.issuer, message.code));
  }
}
