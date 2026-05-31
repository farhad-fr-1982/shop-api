import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UsersModule } from '../users/users.module';
import { APP_GUARD } from '@nestjs/core';
import { PermissionGuard } from './guards/permissions.guard';
import { Role } from './entities/role.entity';
import { User } from '../users/entities/user.entity';  // ← اضافه کن
import { Permission } from './entities/permission.entity';
import { Address } from 'src/address/entities/address.entity';

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
    TypeOrmModule.forFeature([Role, User,Permission,Address]), 
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, { provide: APP_GUARD, useClass: PermissionGuard }],
  exports: [JwtStrategy, PassportModule, JwtModule, TypeOrmModule],
})
export class AuthModule {}