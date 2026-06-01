import { Injectable } from '@nestjs/common';
import { CleanJob } from './jobs/cleanup.job';

@Injectable()
export class TasksService {
    constructor(private readonly cleanUp:CleanJob){ }

    cleanOtpData(){
        this.cleanUp.cleanOtp()
    }
}
