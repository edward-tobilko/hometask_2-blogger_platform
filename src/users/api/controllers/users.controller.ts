import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
} from '@nestjs/common';

import { API_ROUTES } from 'src/core/constants/api-routes';
import { CreateUserDto } from '../dto/create-user.dto';
import { UsersService } from 'src/users/application/services/users.service';
import { UserViewDto } from '../dto/view-models/user-view-model.dto';
import { UsersQueryDto } from '../dto/users-query.dto';
import { UsersQueryService } from 'src/users/application/services/users.query-service';
import { UserIdParamDto } from '../dto/users-param.dto';

@Controller(API_ROUTES.users)
export class UsersController {
  constructor(
    private usersService: UsersService,
    private readonly usersQueryService: UsersQueryService,
  ) {}

  // * POST: Add new user to the system
  @Post()
  async createUser(@Body() dto: CreateUserDto) {
    const userInstanceDoc = await this.usersService.createUser(dto);

    const userOutput = UserViewDto.mapToViewModel(userInstanceDoc);

    return userOutput;
  }

  // * GET: Returns all users
  @Get()
  getUsersList(@Query() queries: UsersQueryDto) {
    return this.usersQueryService.getUsersList(queries);
  }

  // * DELETE: Delete user specified by id
  @Delete(':id')
  @HttpCode(204)
  deleteUser(@Param() params: UserIdParamDto) {
    const { id } = params;

    return this.usersService.softDeleteUser(id);
  }
}
