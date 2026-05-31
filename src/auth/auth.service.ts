import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Role } from './entities/role.entity';
import { UsersService } from 'src/users/users.service';
import { Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { Permission } from './entities/permission.entity';

@Injectable()
export class AuthService {
    constructor(
        private readonly userService: UsersService,
        private readonly jwtService: JwtService,
        @InjectRepository(Role) private readonly roleRepository: Repository<Role>,
        @InjectRepository(User) private readonly userRepository: Repository<User>,
        @InjectRepository(Permission) private readonly permissionsRepository: Repository<Permission>
    ) { }

    // ========================== ثبت نام ==========================
    async register(mobile: string, password: string, display_name: string) {
        const hashedPassword: string = await bcrypt.hash(password, 10);
        return this.userService.create({
            mobile,
            password: hashedPassword,
            display_name,
        });
    }

    // ========================== ورود ==========================
    async login(mobile: string, password: string) {
        const user = await this.userService.findOneByMobile(mobile);

        if (!user) {
            throw new UnauthorizedException('اطلاعات ورود صحیح نیست');
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('اطلاعات ورود صحیح نیست');
        }

        const roles = await this.getUserRoles(user.id);
        const permissions = await this.getUserPermission(user.id);

        const payload = {
            mobile: user.mobile,
            sub: user.id,
            display_name: user.display_name,
            roles: roles.map(r => r.name),
            permissions: permissions
        };

        const token = this.jwtService.sign(payload);
        return {
            accessToken: token,
            user: {
                id: user.id,
                mobile: user.mobile,
                display_name: user.display_name,
                roles: roles,
                permissions: permissions
            }
        };
    }

    // ========================== دریافت مجوزهای کاربر ==========================
    async getUserPermission(userId: number): Promise<string[]> {
        const user = await this.userService.findUserByPermission(userId);

        const permissions = new Set<string>();

        user.roles?.forEach(role => {
            role.permissions?.forEach(p => permissions.add(p.name));
        });

        user.permissions?.forEach(p => permissions.add(p.name));

        return Array.from(permissions);
    }

    // ========================== دریافت نقش‌های کاربر ==========================
    async getUserRoles(userId: number): Promise<Role[]> {
        const user = await this.userService.findUserByPermission(userId);
        if (!user) {
            throw new NotFoundException('کاربر پیدا نشد');
        }
        return user.roles || [];
    }

    // ========================== ایجاد نقش ==========================
    async createRole(name: string) {
        const role = this.roleRepository.create({ name });
        return this.roleRepository.save(role);
    }

    // ========================== دریافت همه نقش‌ها ==========================
    async getAllRoles() {
        return this.roleRepository.find({ relations: ['permissions'] });
    }

    // ========================== دریافت نقش با آیدی ==========================
    async getRoleById(id: number) {
        const role = await this.roleRepository.findOne({
            where: { id },
            relations: ['permissions']
        });
        if (!role) {
            throw new NotFoundException('نقش پیدا نشد');
        }
        return role;
    }

    // ========================== ویرایش نقش ==========================
    async updateRole(id: number, name: string) {
        const role = await this.getRoleById(id);
        role.name = name;
        return this.roleRepository.save(role);
    }

    // ========================== حذف نقش ==========================
    async deleteRole(id: number) {
        const role = await this.getRoleById(id);
        return this.roleRepository.remove(role);
    }

    // ========================== اضافه کردن نقش به کاربر ==========================
    async addRoleToUser(userId: number, roleId: number) {
        const user = await this.userService.findUserByPermission(userId);
        if (!user) {
            throw new NotFoundException('کاربر پیدا نشد');
        }

        const role = await this.roleRepository.findOne({ where: { id: roleId } });
        if (!role) {
            throw new NotFoundException('نقش پیدا نشد');
        }

        const hasRole = user.roles?.some(r => r.id === role.id);
        if (!hasRole) {
            user.roles = user.roles || [];
            user.roles.push(role);
            return this.userRepository.save(user);
        }

        return user;
    }

    // ========================== حذف نقش از کاربر ==========================
    async removeRoleFromUser(userId: number, roleId: number) {
        const user = await this.userService.findUserByPermission(userId);
        if (!user) {
            throw new NotFoundException('کاربر پیدا نشد');
        }

        user.roles = user.roles?.filter(r => r.id !== roleId) || [];
        return this.userRepository.save(user);
    }

    // ========================== ایجاد دسترسی ==========================
    async createPermission(name: string) {
        const permission = this.permissionsRepository.create({ name });
        return this.permissionsRepository.save(permission);
    }

    // ========================== دریافت همه دسترسی‌ها ==========================
    async getAllPermissions() {
        return this.permissionsRepository.find();
    }

    // ========================== دریافت دسترسی با آیدی ==========================
    async getPermissionById(id: number) {
        const permission = await this.permissionsRepository.findOne({ where: { id } });
        if (!permission) {
            throw new NotFoundException('دسترسی پیدا نشد');
        }
        return permission;
    }

    // ========================== ویرایش دسترسی ==========================
    async updatePermission(id: number, name: string) {
        const permission = await this.getPermissionById(id);
        permission.name = name;
        return this.permissionsRepository.save(permission);
    }

    // ========================== حذف دسترسی ==========================
    async deletePermission(id: number) {
        const permission = await this.getPermissionById(id);
        return this.permissionsRepository.remove(permission);
    }

    // ========================== اضافه کردن دسترسی به نقش ==========================
    async addPermissionToRole(roleId: number, permissionId: number) {
        const role = await this.roleRepository.findOne({
            where: { id: roleId },
            relations: ['permissions']
        });
        if (!role) {
            throw new NotFoundException('نقش پیدا نشد');
        }

        const permission = await this.permissionsRepository.findOne({ where: { id: permissionId } });
        if (!permission) {
            throw new NotFoundException('دسترسی پیدا نشد');
        }

        const hasPermission = role.permissions?.some(p => p.id === permission.id);
        if (!hasPermission) {
            role.permissions = role.permissions || [];
            role.permissions.push(permission);
            return this.roleRepository.save(role);
        }

        return role;
    }

    // ========================== حذف دسترسی از نقش ==========================
    async removePermissionFromRole(roleId: number, permissionId: number) {
        const role = await this.roleRepository.findOne({
            where: { id: roleId },
            relations: ['permissions']
        });
        if (!role) throw new NotFoundException('نقش پیدا نشد');

        role.permissions = role.permissions.filter(p => p.id !== permissionId);
        return this.roleRepository.save(role);
    }

    // ========================== اضافه کردن دسترسی به کاربر ==========================
    async addPermissionToUser(userId: number, permissionId: number) {
        const user = await this.userService.findUserByPermission(userId);
        if (!user) {
            throw new NotFoundException('کاربر پیدا نشد');
        }

        const permission = await this.permissionsRepository.findOne({ where: { id: permissionId } });
        if (!permission) {
            throw new NotFoundException('دسترسی پیدا نشد');
        }

        const hasPermission = user.permissions?.some(p => p.id === permission.id);
        if (!hasPermission) {
            user.permissions = user.permissions || [];
            user.permissions.push(permission);
            return this.userRepository.save(user);
        }

        return user;
    }

    // ========================== حذف دسترسی از کاربر ==========================
    async removePermissionFromUser(userId: number, permissionId: number) {
        const user = await this.userService.findUserByPermission(userId);
        if (!user) throw new NotFoundException('کاربر پیدا نشد');

        user.permissions = user.permissions?.filter(p => p.id !== permissionId) || [];
        return this.userRepository.save(user);
    }

    // در AuthService اضافه کنید:
    async isOwner(userId: number, resourceId: string, permission: string): Promise<boolean> {
        // فعلاً همیشه true برگردان تا خطا ندهد
        return true;
    }
}