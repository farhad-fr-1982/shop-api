import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UsersModule } from '../users/users.module'; // اگر نیاز دارید
import { APP_GUARD } from '@nestjs/core';
import { PermissionGuard } from './guards/permissions.guard';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET_KEY'),
        signOptions: { expiresIn: '7d' },
      }),
      inject: [ConfigService],
    }),
    UsersModule, // اگر در AuthService به UsersService نیاز دارید
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy,{provide:APP_GUARD,useClass:PermissionGuard}],
  exports: [JwtStrategy, PassportModule, JwtModule],
})
export class AuthModule {}