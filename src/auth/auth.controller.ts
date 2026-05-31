import { Body, Controller, Get, HttpStatus, Param, ParseIntPipe, Post, Res, Delete, Put } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import type { Response } from 'express';
import { Public } from "./decorators/public.decorator";
import { ApiBearerAuth, ApiTags, ApiOperation } from "@nestjs/swagger";
import { RoleDto } from "./dto/role.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Role } from "./entities/role.entity";
import { Roles } from "./decorators/role.decorator";
import { Permissions } from "./decorators/permission.decorator";

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService,
        @InjectRepository(Role) private readonly roleRepository: Repository<Role>
    ) { }

    // ========================== عمومی ==========================
    @Public()
    @Post('register')
    @ApiOperation({ summary: 'ثبت نام کاربر جدید' })
    async register(@Body() registerDto: RegisterDto, @Res() res: Response) {
        const register = await this.authService.register(
            registerDto.mobile,
            registerDto.password,
            registerDto.display_name
        );

        return res.status(HttpStatus.CREATED).json({
            statusCode: HttpStatus.CREATED,
            data: register,
            message: 'ثبت نام با موفقیت انجام شد'
        });
    }

    @Public()
    @Post('login')
    @ApiOperation({ summary: 'ورود به سیستم' })
    async login(@Body() loginDto: LoginDto, @Res() res: Response) {
        const login = await this.authService.login(loginDto.mobile, loginDto.password);

        return res.status(HttpStatus.OK).json({
            statusCode: HttpStatus.OK,
            data: login,
            message: 'شما با موفقیت وارد سیستم شدید'
        });
    }

    // ========================== مدیریت دسترسی‌ها ==========================
    @ApiBearerAuth()
    @Get('user-permission/:userId')
    @ApiOperation({ summary: 'دریافت مجوزهای کاربر' })
    async getUserPermission(@Param('userId', ParseIntPipe) userId: number) {
        const permissions = await this.authService.getUserPermission(userId);
        return {
            statusCode: HttpStatus.OK,
            data: permissions,
            message: 'مجوزهای کاربر با موفقیت دریافت شد'
        };
    }

    @ApiBearerAuth()
    @Get('user-roles/:userId')
    @ApiOperation({ summary: 'دریافت نقش‌های کاربر' })
    async getUserRoles(@Param('userId', ParseIntPipe) userId: number) {
        const roles = await this.authService.getUserRoles(userId);
        return {
            statusCode: HttpStatus.OK,
            data: roles,
            message: 'نقش‌های کاربر با موفقیت دریافت شد'
        };
    }

    // ========================== مدیریت نقش‌ها ==========================
    @ApiBearerAuth()
    @Roles('admin')
    @Post('role')
    @ApiOperation({ summary: 'ایجاد نقش جدید' })
    async createRole(@Body() roleDto: RoleDto) {
        const role = await this.authService.createRole(roleDto.name);
        return {
            statusCode: HttpStatus.CREATED,
            data: role,
            message: 'نقش با موفقیت ایجاد شد'
        };
    }

    @ApiBearerAuth()
    @Roles('admin')
    @Get('roles')
    @ApiOperation({ summary: 'دریافت همه نقش‌ها' })
    async getAllRoles() {
        const roles = await this.authService.getAllRoles();
        return {
            statusCode: HttpStatus.OK,
            data: roles,
            message: 'نقش‌ها با موفقیت دریافت شدند'
        };
    }

    @ApiBearerAuth()
    @Roles('admin')
    @Get('role/:id')
    @ApiOperation({ summary: 'دریافت نقش با آیدی' })
    async getRoleById(@Param('id', ParseIntPipe) id: number) {
        const role = await this.authService.getRoleById(id);
        return {
            statusCode: HttpStatus.OK,
            data: role,
            message: 'نقش با موفقیت دریافت شد'
        };
    }

    @ApiBearerAuth()
    @Roles('admin')
    @Post('add-role-to-user/:userId/:roleId')
    @ApiOperation({ summary: 'اضافه کردن نقش به کاربر' })
    async addRoleToUser(
        @Param('userId', ParseIntPipe) userId: number,
        @Param('roleId', ParseIntPipe) roleId: number
    ) {
        const result = await this.authService.addRoleToUser(userId, roleId);
        return {
            statusCode: HttpStatus.OK,
            data: result,
            message: 'نقش با موفقیت به کاربر اضافه شد'
        };
    }

    @ApiBearerAuth()
    @Roles('admin')
    @Delete('remove-role-from-user/:userId/:roleId')
    @ApiOperation({ summary: 'حذف نقش از کاربر' })
    async removeRoleFromUser(
        @Param('userId', ParseIntPipe) userId: number,
        @Param('roleId', ParseIntPipe) roleId: number
    ) {
        const result = await this.authService.removeRoleFromUser(userId, roleId);
        return {
            statusCode: HttpStatus.OK,
            data: result,
            message: 'نقش با موفقیت از کاربر حذف شد'
        };
    }

    // ========================== مدیریت دسترسی‌ها ==========================
    @ApiBearerAuth()
    @Roles('admin')
    @Post('permission')
    @ApiOperation({ summary: 'ایجاد دسترسی جدید' })
    async createPermission(@Body() roleDto: RoleDto) {
        const permission = await this.authService.createPermission(roleDto.name);
        return {
            statusCode: HttpStatus.CREATED,
            data: permission,
            message: 'دسترسی با موفقیت ایجاد شد'
        };
    }

    @ApiBearerAuth()
    @Roles('admin')
    @Get('permissions')
    @ApiOperation({ summary: 'دریافت همه دسترسی‌ها' })
    async getAllPermissions() {
        const permissions = await this.authService.getAllPermissions();
        return {
            statusCode: HttpStatus.OK,
            data: permissions,
            message: 'دسترسی‌ها با موفقیت دریافت شدند'
        };
    }

    @ApiBearerAuth()
    @Roles('admin')
    @Post('add-permission-to-role/:roleId/:permissionId')
    @ApiOperation({ summary: 'اضافه کردن دسترسی به نقش' })
    async addPermissionToRole(
        @Param('roleId', ParseIntPipe) roleId: number,
        @Param('permissionId', ParseIntPipe) permissionId: number
    ) {
        const result = await this.authService.addPermissionToRole(roleId, permissionId);
        return {
            statusCode: HttpStatus.OK,
            data: result,
            message: 'دسترسی با موفقیت به نقش اضافه شد'
        };
    }

    @ApiBearerAuth()
    @Roles('admin')
    @Post('add-permission-to-user/:userId/:permissionId')
    @ApiOperation({ summary: 'اضافه کردن دسترسی مستقیم به کاربر' })
    async addPermissionToUser(
        @Param('userId', ParseIntPipe) userId: number,
        @Param('permissionId', ParseIntPipe) permissionId: number
    ) {
        const result = await this.authService.addPermissionToUser(userId, permissionId);
        return {
            statusCode: HttpStatus.OK,
            data: result,
            message: 'دسترسی با موفقیت به کاربر اضافه شد'
        };
    }
}