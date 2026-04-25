import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Ticket } from 'src/tickets/entities/ticket.entity';


@Module({
    imports: [TypeOrmModule.forFeature([User,Ticket])],
    controllers: [UsersController],
    providers: [UsersService],
    exports:[UsersService]
})
export class UsersModule {}