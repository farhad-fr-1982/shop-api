// logger.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { IpTrackerService } from 'src/ip-tracker/ip-tracker.service';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  constructor(private readonly ipTrackerService: IpTrackerService) {}

  use(req: Request, res: Response, next: NextFunction) {
    // دریافت IP
    const ip = req.ip || req.connection?.remoteAddress || 'unknown';
    
    // فراخوانی سرویس
    this.ipTrackerService.track(ip);
    
    next();
  }
}