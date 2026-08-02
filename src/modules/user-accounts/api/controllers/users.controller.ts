import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBasicAuth } from '@nestjs/swagger';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';

import { API_ROUTES } from 'src/core/constants/api-routes.constants';
import { CreateUserInputDto } from '../input-dto/create-user.input-dto';
import { UserViewDto } from '../view-dto/user.view-dto';
import { UsersQueryInputDto } from '../input-dto/users-query.input-dto';
import { UsersPaginatedViewDto } from '../view-dto/users-paginated.view-dto';
import { BasicAuthGuard } from '../../guards/basic/basic-auth.guard';
import { IdValidationPipe } from 'src/core/pipes/object-id-validation-transformation.pipe';
import { CreateUserCommand } from '../../application/use-cases/admins/create-user.use-case';
import { DeleteUserCommand } from '../../application/use-cases/admins/delete-user.use-case';
import { GetUsersListQuery } from '../../application/queries/get-users-list.query';
import { ApiGetUsersSwagger } from '../decorators/users/swagger/get-users-swagger.decorator';
import { ApiCreateUserSwagger } from '../decorators/users/swagger/create-swagger.decorator';
import { ApiDeleteUserSwagger } from '../decorators/users/swagger/delete-swagger.decorator';
import { BanUserInputDto } from '../input-dto/ban-user.input-dto';
import { BanUserCommand } from '../../application/use-cases/admins/ban-user.use-case';

@ApiTags('Users')
@SkipThrottle()
@Controller(API_ROUTES.users)
@UseGuards(BasicAuthGuard)
@ApiBasicAuth('basicAuth')
export class UsersController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus, // шина команд - сам находит нужный @CommandHandler и вызывает его execute
  ) {}

  @ApiGetUsersSwagger('Returns all users')
  @Get()
  getUsersList(
    @Query() queries: UsersQueryInputDto,
  ): Promise<UsersPaginatedViewDto> {
    const query = new GetUsersListQuery(queries);

    return this.queryBus.execute(query);
  }

  @ApiCreateUserSwagger('Add new user to the system')
  @Post()
  async createUser(@Body() dto: CreateUserInputDto): Promise<UserViewDto> {
    const command = new CreateUserCommand(dto);

    const userInstanceDoc = await this.commandBus.execute(command);

    const userOutput = UserViewDto.mapToViewModel(userInstanceDoc);

    return userOutput;
  }

  @ApiDeleteUserSwagger('Delete user specified by id')
  @Delete(':id')
  @HttpCode(204)
  deleteUser(@Param('id', IdValidationPipe) id: string): Promise<void> {
    const command = new DeleteUserCommand(id);

    return this.commandBus.execute(command);
  }

  // * Extra end-points over the basic API logic
  @Put(':id/ban') // ban user
  @HttpCode(204)
  async banUser(
    @Param('id', IdValidationPipe) id: string,
    @Body() dto: BanUserInputDto,
  ) {
    const command = new BanUserCommand({ userId: id, ...dto });

    await this.commandBus.execute(command);
  }
}
