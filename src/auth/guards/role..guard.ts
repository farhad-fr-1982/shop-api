import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ROLE_KEY } from "../decorators/role.decorator";

@Injectable()
export class RoleGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride(ROLE_KEY, [
            context.getClass(),
            context.getHandler()
        ]);

        if (!requiredRoles) return true;

        const request = context.switchToHttp().getRequest();
        const user = request.user;

        if (!user) throw new ForbiddenException('شما وارد نشده‌اید');

        const hasRole = requiredRoles.some((role) => user.roles?.includes(role));

        if (!hasRole) {
            throw new ForbiddenException('شما دسترسی به این مسیر را ندارید');
        }

        return true;
    }
}