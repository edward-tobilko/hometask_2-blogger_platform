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
import { UsersService } from 'src/modules/user-accounts/application/services/users.service';
import { UserViewDto } from '../dto/view/user-view.dto';
import { UsersQueryDto } from '../dto/users-query.dto';
import { UsersQueryService } from 'src/modules/user-accounts/application/services/users.query-service';
import { IdParamDto } from 'src/core/dto/param.dto';
import { UsersPaginatedViewDto } from '../dto/view/users-paginated-view.dto';

@Controller(API_ROUTES.users)
export class UsersController {
  constructor(
    private usersService: UsersService,
    private readonly usersQueryService: UsersQueryService,
  ) {}

  // * GET: Returns all users
  @Get()
  getUsersList(
    @Query() queries: UsersQueryDto,
  ): Promise<UsersPaginatedViewDto> {
    return this.usersQueryService.getUsersList(queries);
  }

  // * POST: Add new user to the system
  @Post()
  async createUser(@Body() dto: CreateUserDto): Promise<UserViewDto> {
    const userInstanceDoc = await this.usersService.createUser(dto);

    const userOutput = UserViewDto.mapToViewModel(userInstanceDoc);

    return userOutput;
  }

  // * DELETE: Delete user specified by id
  @Delete(':id')
  @HttpCode(204)
  deleteUser(@Param() params: IdParamDto): Promise<void> {
    const { id } = params;

    return this.usersService.softDeleteUser(id);
  }
}
