import { Controller, Get, Post, Body, Patch, Param, Delete, HttpStatus, Res, NotFoundException } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import type { Response } from 'express';

@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) { }

  @Post()
  async create(@Body() createTicketDto: CreateTicketDto, @Res() res: Response) {
    const newTicket = await this.ticketsService.create(createTicketDto)

    return res.status(HttpStatus.CREATED).json({
      statusCode: HttpStatus.CREATED,
      data: newTicket,
      message: 'تیکت جدید با موفقیت ثبت شد'
    });
  }

  @Get()
  async findAll(@Res() res: Response) {
    const tickets = await this.ticketsService.findAll();

    return res.status(HttpStatus.CREATED).json({
      statusCode: HttpStatus.OK,
      data: tickets,
      message: 'لیست همه تیکت ها'
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Res() res: Response) {
    const ticket = await this.ticketsService.findOne(+id);

    if (!ticket) {
      throw new NotFoundException('تیکتی با این مشخصات یافت نشد');
    }

    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      data: ticket,
      message: 'تیکت با موفقیت دریافت شد'
    });
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateTicketDto: UpdateTicketDto) {
  //   return this.ticketsService.update(+id, updateTicketDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.ticketsService.remove(+id);
  // }
}
