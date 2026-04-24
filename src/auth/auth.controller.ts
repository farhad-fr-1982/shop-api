import { Body, Controller, HttpStatus, Post, Res } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import type { Response } from 'express';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('register')
    async register(@Body() registerDto: RegisterDto, @Res() res: Response) {
        const register = await this.authService.register(registerDto.mobile, registerDto.password, registerDto.display_name)

        return res.status(HttpStatus.OK).json({
            statusCode: HttpStatus.OK,
            data: register,
            message: 'ثبت نام با موفقیت انجام شد'
        })
    }

    @Post('login')
    async login(@Body() loginDto: LoginDto, @Res() res: Response) {
        const login = await this.authService.login(loginDto.mobile, loginDto.password)

        return res.status(HttpStatus.OK).json({
            statusCode: HttpStatus.OK,
            data: login,
            message: 'شما با موفقیت وارد سیستم شدید'
        })
    }
}