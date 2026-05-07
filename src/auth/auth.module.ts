import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm'; // ✅ این را اضافه کنید
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UsersModule } from '../users/users.module';
import { APP_GUARD } from '@nestjs/core';
import { PermissionGuard } from './guards/permissions.guard';
import { Role } from './entities/role.entity'; // ✅ مسیر فایل role.entity.ts را اصلاح کنید

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
    UsersModule,
    TypeOrmModule.forFeature([Role]), // ✅ این خط حیاتی است
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, { provide: APP_GUARD, useClass: PermissionGuard }],
  exports: [JwtStrategy, PassportModule, JwtModule, TypeOrmModule], // ✅ TypeOrmModule را هم export کنید (اختیاری)
})
export class AuthModule {}