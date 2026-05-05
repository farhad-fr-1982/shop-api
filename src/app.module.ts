import { MiddlewareConsumer, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { AddressModule } from './address/address.module';
import { User } from './users/entities/user.entity';
import { Address } from './address/entities/address.entity';
import { TicketsModule } from './tickets/tickets.module';
import { Ticket } from './tickets/entities/ticket.entity';
import { ProductsModule } from './products/products.module';
import { CategoriesModule } from './categories/categories.module';
import { Category } from './categories/entities/category.entity';
import { Product } from './products/entities/product.entity';
import { BookmarkProduct } from './products/entities/product-bookmark.entity';
import { OrdersModule } from './orders/orders.module';
import { Order } from './orders/entities/order.entity';
import { OrderItem } from './orders/entities/order-item.entity';

import { IpTrackerModule } from './ip-tracker/ip-tracker.module';
import { LoggerMiddleware } from './middlewares/logger/logger.middleware';
import { IpRecord } from './ip-tracker/entities/ip-record.entity';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RoleGuard } from './auth/guards/role..guard';
import { Permission } from './auth/entities/permission.entity';
import { Role } from './auth/entities/role.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      connectorPackage: 'mysql2',
      host: process.env.DB_HOST!,
      port: +process.env.DB_PORT!,
      username: process.env.DB_USERNAME!,
      password: process.env.DB_PASSWORD!,
      database: process.env.DB_DATABASE!,
       entities: [User, Address,Ticket,Category,Product,BookmarkProduct,Order,OrderItem,IpRecord,Permission,Role], 
      // autoLoadEntities: true,
      synchronize: true,
    }),
    UsersModule,
    AuthModule,
    AddressModule,
    TicketsModule,
    ProductsModule,
    CategoriesModule,
    OrdersModule,
    IpTrackerModule,
  ],
  controllers: [AppController],
  providers: [AppService,{provide:APP_GUARD,useClass:JwtAuthGuard},{provide:APP_GUARD,useClass:RoleGuard}],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes('*'); // برای همه مسیرها
  }
}