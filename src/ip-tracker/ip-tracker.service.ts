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
    ) { }

    async track(ip: string) {
        const nowTime = new Date();
        const cleanIp = ip.replace('::ffff:', '');

        // ابتدا بررسی کن IP بلاک شده؟
        const blockedRecord = await this.ipRepository.findOne({
            where: {
                ip: cleanIp,
                isBlocked: true,
                blockUnit: MoreThan(nowTime)
            }
        });

        if (blockedRecord) {
            if (blockedRecord.blockUnit) {  // اضافه کنید
                console.log(`[${nowTime.toLocaleTimeString()}] 🚫 ${cleanIp} is BLOCKED until ${blockedRecord.blockUnit.toLocaleTimeString()}`);
                return { isBlocked: true, blockUntil: blockedRecord.blockUnit };
            }
        }

        // پنجره زمانی دقیقه جاری
        const currentMinute = new Date(nowTime);
        currentMinute.setSeconds(0, 0);

        let record = await this.ipRepository.findOne({
            where: {
                ip: cleanIp,
                WindowStart: currentMinute
            }
        });

        if (!record) {
            record = this.ipRepository.create({
                ip: cleanIp,
                WindowStart: currentMinute,
                requestCount: 1,
                isBlocked: false,
                blockUnit: null
            });

            await this.ipRepository.save(record);
            console.log(`[${nowTime.toLocaleTimeString()}] ✅ ${cleanIp} - Request: 1/${this.MAX_REQUESTS}`);
            return { isBlocked: false, requestCount: 1, remainingRequests: this.MAX_REQUESTS - 1 };
        }

        record.requestCount += 1;

        if (record.requestCount > this.MAX_REQUESTS) {
            record.isBlocked = true;
            record.blockUnit = new Date(nowTime.getTime() + this.BLOCK_MINUTES * 60000);
            console.log(`[${nowTime.toLocaleTimeString()}] 🔴 ${cleanIp} has been BLOCKED for ${this.BLOCK_MINUTES} minute(s)`);
        } else {
            console.log(`[${nowTime.toLocaleTimeString()}] ✅ ${cleanIp} - Request: ${record.requestCount}/${this.MAX_REQUESTS}`);
        }

        await this.ipRepository.save(record);

        return {
            isBlocked: record.isBlocked,
            requestCount: record.requestCount,
            remainingRequests: Math.max(0, this.MAX_REQUESTS - record.requestCount),
            blockUntil: record.blockUnit
        };
    }
}