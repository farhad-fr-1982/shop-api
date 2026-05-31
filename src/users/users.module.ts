import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Ticket } from 'src/tickets/entities/ticket.entity';
import { Role } from 'src/auth/entities/role.entity';
import { Permission } from 'src/auth/entities/permission.entity';


@Module({
    imports: [TypeOrmModule.forFeature([User,Ticket,Role,Permission])],
    controllers: [UsersController],
    providers: [UsersService],
    exports:[UsersService]
})
export class UsersModule {}