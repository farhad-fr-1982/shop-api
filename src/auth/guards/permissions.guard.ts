import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { PERMISSION_KEY } from "../decorators/permission.decorator";
import { AuthService } from '../auth.service';

@Injectable()
export class PermissionGuard implements CanActivate {
    constructor(private reflector: Reflector, private authService: AuthService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSION_KEY, [
            context.getClass(),
            context.getHandler()
        ]);

        if (!requiredPermissions || requiredPermissions.length === 0) return true;

        const request = context.switchToHttp().getRequest();
        const user = request.user;

        if (!user) throw new ForbiddenException('شما وارد نشده‌اید');

        const userPermissions = await this.authService.getUserPermission(user.id);

        const hasPermission = requiredPermissions.every(permission =>
            userPermissions.includes(this.cleanOwn(permission))
        );

        if (!hasPermission) {
            throw new ForbiddenException('شما مجوز لازم را ندارید');
        }

        // بررسی مجوزهای :own
        for (const permission of requiredPermissions) {
            if (permission.endsWith(':own')) {
                const paramId = request.params['id'];
                if (!paramId) {
                    throw new ForbiddenException('شناسه رکورد یافت نشد');
                }
                const isOwner = await this.authService.isOwner(user.id, paramId, permission);
                if (!isOwner) {
                    throw new ForbiddenException('شما فقط می‌توانید روی رکوردهای خودتان عملیات انجام دهید');
                }
            }
        }

        return true;
    }

    private cleanOwn(str: string): string {
        if (str.endsWith(':own')) {
            return str.slice(0, -4);
        }
        return str;
    }
}