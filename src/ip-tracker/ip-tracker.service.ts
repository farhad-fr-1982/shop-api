import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import { IpRecord } from './entities/ip-record.entity';

@Injectable()
export class IpTrackerService {
    private readonly MAX_REQUESTS = 10;
    private readonly WINDOW_MINUTES = 1;
    private readonly BLOCK_MINUTES = 1;

    constructor(
        @InjectRepository(IpRecord)
        private readonly ipRepository: Repository<IpRecord>
    ) {}

    async track(ip: string) {
        const nowTime = new Date();
        
        // پیدا کردن رکورد IP در پنجره زمانی فعلی
        const windowStart = new Date(nowTime.getTime() - this.WINDOW_MINUTES * 60000);
        
        let record = await this.ipRepository.findOne({ 
            where: { 
                ip: ip,
                WindowStart: MoreThan(windowStart)
            } 
        });

        if (!record) {
            // ایجاد رکورد جدید
            record = this.ipRepository.create({
                ip: ip,
                WindowStart: nowTime,
                requestCount: 1,
                isBlocked: false,
                blockUnit: null
            });
            
            await this.ipRepository.save(record);
            console.log(`IP: ${ip} - Request count: 1 - Time: ${nowTime}`);
            return;
        }

        // بررسی مسدود بودن
        if (record.isBlocked && record.blockUnit && record.blockUnit > nowTime) {
            console.log(`IP: ${ip} is BLOCKED until ${record.blockUnit}`);
            return;
        }

        // افزایش تعداد درخواست‌ها
        record.requestCount += 1;
        
        // بررسی محدودیت
        if (record.requestCount > this.MAX_REQUESTS) {
            record.isBlocked = true;
            record.blockUnit = new Date(nowTime.getTime() + this.BLOCK_MINUTES * 60000);
            console.log(`IP: ${ip} has been BLOCKED for ${this.BLOCK_MINUTES} minute(s)`);
        }
        
        await this.ipRepository.save(record);
        
        console.log(`IP: ${ip} - Request count: ${record.requestCount}/${this.MAX_REQUESTS} - Time: ${nowTime}`);
    }
}