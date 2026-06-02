import { Injectable } from '@nestjs/common';
import { CreateSmDto } from './dto/create-sm.dto';
import { UpdateSmDto } from './dto/update-sm.dto';
import { InjectQueue } from '@nestjs/bull'
import type { Queue } from 'bull';

@Injectable()
export class SmsService {

  constructor(@InjectQueue('sms-queue') private smsQueue: Queue) { }

  async smsMultiSms(numbers: string, text: string) {
    this.smsQueue.add('send-sms',
      { numbers, text },
      { attempts: 3, backoff: 5000, delay: 2000, removeOnComplete: true, removeOnFail: false })
  }



  create(createSmDto: CreateSmDto) {
    return 'This action adds a new sm';
  }

  findAll() {
    return `This action returns all sms`;
  }

  findOne(id: number) {
    return `This action returns a #${id} sm`;
  }

  update(id: number, updateSmDto: UpdateSmDto) {
    return `This action updates a #${id} sm`;
  }

  remove(id: number) {
    return `This action removes a #${id} sm`;
  }
}
