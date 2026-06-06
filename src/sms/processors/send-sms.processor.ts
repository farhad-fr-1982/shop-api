import { Process, Processor } from "@nestjs/bull";
import type { Job } from "bull";
@Processor('sms-queue')
export class SmsProcessors {

    @Process('send-sms')
    async handleSend(job: Job<{ mobile: string, message: string }>) {
        const { mobile, message } = job.data;

        // console.log(`📱 Sending SMS to: ${mobile}`);
        // console.log(`📝 Message: ${message}`);

        // if (Math.random() < 0.5) {
        //     console.log('Sending Failed!')
        //     throw new Error('SMS NOT SEND')
        // }

        console.log('SMS SENDING...')

        return { success: true, mobile, message };
    }
}