import { Controller, Request, UseGuards, Post } from '@nestjs/common';
import { AuthService } from '../services';
import { LocalAuthGuard } from '../guards/local-auth.guard';

@Controller()
export class AuthController {
    constructor(private authService: AuthService) { }

    @UseGuards(LocalAuthGuard)
    @Post('auth/login')
    async login(@Request() req: {issuer: string}) {
        return this.authService.login(req.issuer);
    }
}