// sms.module.ts
import { Module } from '@nestjs/common';
import { SmsService } from './sms.service';
import { SmsController } from './sms.controller';
import { BullModule } from '@nestjs/bull';

@Module({
  imports:[
    BullModule.registerQueue({
      name:'sms-queue'
    })
  ],
  controllers: [SmsController],
  providers: [SmsService],
  exports: [SmsService] // اضافه کنید - سرویس را برای استفاده در ماژول‌های دیگر صادر کنید
})
export class SmsModule {} 