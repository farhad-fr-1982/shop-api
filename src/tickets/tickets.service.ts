import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Ticket } from './entities/ticket.entity';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class TicketsService {

  constructor(
    @InjectRepository(Ticket) private readonly ticketRepository: Repository<Ticket>,
    private readonly userService: UsersService
  ) { }

  async create(createTicketDto: CreateTicketDto): Promise<Ticket> {
    const { userId, replyTo, ...TicketDto } = createTicketDto;

    const user: User = await this.userService.findOne(userId);

    let replyToTicket: any = null

    if (replyTo) {
      replyToTicket = await this.ticketRepository.findOneByOrFail({ id: replyTo });
    }

    const ticket: Ticket = this.ticketRepository.create({ ...TicketDto, user, replyTo: replyToTicket });

    return this.ticketRepository.save(ticket);
  }


  async findAll() {
    return await this.ticketRepository.find({
      where: { replyTo: null as any },
      relations: ['replyTo']
    });
  }

  async findOne(id: number) {
    const ticket = await this.ticketRepository.findOneOrFail({ where: { id }, relations: ['replies','replyTo'] })
    return ticket
  }

  // update(id: number, updateTicketDto: UpdateTicketDto) {
  //   return `This action updates a #${id} ticket`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} ticket`;
  // }
}
