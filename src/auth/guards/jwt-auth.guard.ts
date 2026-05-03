import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err: any, user: any, info: any, context: ExecutionContext, status?: any) {
    if (err || !user) {
      console.log('JWT Error:', err);
      console.log('JWT Info:', info);
      throw err || new UnauthorizedException('توکن نامعتبر است');
    }
    return user;
  }
}