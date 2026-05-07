import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt'
import { Role } from './entities/role.entity';
import { UsersService } from 'src/users/users.service';
import { Repository } from 'typeorm';

@Injectable()
export class AuthService {
    constructor(private readonly userService: UsersService, private readonly jwtService: JwtService,
        @InjectRepository(Role) private readonly roleRepository: Repository<Role>
    ) { }

    async register(mobile: string, password: string, display_name: string) {
        const hashedPassword: string = await bcrypt.hash(password, 10)
        return this.userService.create({
            mobile,
            password: hashedPassword,
            display_name,
            // role: Role.NormalUser
        })
    }


    async login(mobile: string, password: string) {
        const user = await this.userService.findOneByMobile(mobile)

        if (!(await bcrypt.compare(password, user.password))) throw new UnauthorizedException('اطلاعات ورود صحیح نیست')

        //* sub (subject) استاندارد JWT - معمولاً ID کاربر
        const payload = { mobile: user.mobile, sub: user.id, display_name: user.display_name, role: user.role }

        const token = this.jwtService.sign(payload)
        return {
            accessToken: token
        }
    }

    async getUserPermission(userId: number): Promise<string[]> {
        const user = await this.userService.findUserByPermission(userId);

        const permissions = new Set<string>();

        user.roles?.forEach(role => {
            role.permissions?.forEach(p => permissions.add(p.name));
        });

        user.permissions?.forEach(p => permissions.add(p.name));

        return Array.from(permissions)
    }

    async createRole(name: string) {
        const role = this.roleRepository.create({ name })
        return this.roleRepository.save(role)
    }
}
