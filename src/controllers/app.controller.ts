import { Controller, Get } from '@nestjs/common';
import { AppService } from '@src/services';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}
  
  @Get()
  async hello(): Promise<string> {
    return "gm";
  }
}
