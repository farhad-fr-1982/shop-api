import { Injectable } from "@nestjs/common";

@Injectable()
export class CleanJob{
    cleanOtp(){
        console.log('cleaning...')
    }
}