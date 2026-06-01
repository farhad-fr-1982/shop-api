import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CleanJob } from './jobs/cleanup.job';

@Injectable()
export class TasksService implements OnModuleInit {
  private readonly logger = new Logger(TasksService.name);

  constructor(private readonly cleanUp: CleanJob) { }

  onModuleInit() {
    this.logger.log('✅ TasksService initialized!');
  }

  @Cron(CronExpression.EVERY_30_MINUTES_BETWEEN_10AM_AND_7PM)
  cleanOtpData() {
    this.logger.log('⏰ Cron job executed!');
    this.cleanUp.cleanOtp();
  }
}