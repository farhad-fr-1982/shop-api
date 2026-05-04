import { Controller, Get, Post, Body, Patch, Param, Delete, Res, HttpStatus, Query, Put, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import type { Response } from 'express';
import Role from './enums/Role';
import { ApiBearerAuth, ApiExcludeController, ApiExcludeEndpoint, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Roles } from 'src/auth/decorators/role.decorator';
import { RoleGuard } from 'src/auth/guards/role..guard';

// @ApiExcludeController()
// @Roles(Role.Admin, Role.Modarator)
@UseGuards(RoleGuard)
@ApiBearerAuth()
@ApiTags('Users - مدیریت کاربران')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post()
  async create(@Body() createUserDto: CreateUserDto, @Res() res: Response) {
    const createUser = await this.usersService.create(createUserDto)

    return res.status(HttpStatus.CREATED).json({
      statusCode: HttpStatus.CREATED,
      data: createUser,
      message: 'کاربر جدید با موفقیت ثبت شد'
    })
  }

  @ApiQuery({ name: "role", type: String, required: false })
  @ApiQuery({ name: "limit", type: Number, required: false })
  @ApiQuery({ name: "page", type: Number, required: false })
  @Get()
  async findAll(
    @Res() res: Response,
    @Query('role') role?: Role,
    @Query('limit') limit: number = 5,
    @Query('page') page: number = 1
  ) {
    const users = await this.usersService.findAll(role, +limit, +page);
    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      data: users,
      message: "با موفقیت دریافت شد"
    });
  }

  // @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string, @Res() res: Response) {
    const user = await this.usersService.findOne(+id);

    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      data: user,
      message: "با موفقیت دریافت شد"
    });
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto, @Res() res: Response) {
    const user = await this.usersService.update(+id, updateUserDto);

    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      data: user,
      message: 'کاربر ویرایش شد'
    })
  }

  // @ApiExcludeEndpoint()
  @Delete(':id')
  async remove(@Param('id') id: string, @Res() res: Response) {
    const result = await this.usersService.remove(+id);

    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      data: result,
      message: 'کاربر با موفقیت حذف شد'
    })
  }
}