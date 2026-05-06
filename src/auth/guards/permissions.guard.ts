import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthService } from "../auth.service";
import { ROLE_KEY } from "../decorators/role.decorator";
import { Permission } from "../entities/permission.entity";
import { PERMISSION_KEY } from "../decorators/permission.decorator";

@Injectable()
export class PermissionGuard implements CanActivate {
    constructor(private reflector: Reflector, private authService: AuthService) { }

    async canActivate(context: ExecutionContext) {
        const requiredPermission = this.reflector.getAllAndOverride<string[]>(PERMISSION_KEY, [
            context.getClass(),
            context.getHandler()
        ]);

        if (!requiredPermission) return true;

        const {user} = context.switchToHttp().getRequest()
        const userId = user.id

        const userPermission = await this.authService.getUserPermission(userId)

        const hasPermission = requiredPermission.every(permission => userPermission.includes(permission))
        if(!hasPermission) throw new ForbiddenException('شما مجوز لازم را ندارید')
        return true
    }
}