import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CleanJob } from './jobs/cleanup.job';

@Module({
  providers: [TasksService,CleanJob]
})
export class TasksModule {}
