import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CleanJob } from './jobs/cleanup.job';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
    imports: [ScheduleModule.forRoot()], 
  providers: [TasksService,CleanJob]
})
export class TasksModule {}
