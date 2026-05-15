import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBasicAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';
import { CommandBus, QueryBus } from '@nestjs/cqrs';

import { API_ROUTES } from 'src/core/constants/api-routes.constants';
import { CreateUserInputDto } from '../input-dto/create-user.input-dto';
import { UserViewDto } from '../view-dto/user.view-dto';
import { UsersQueryInputDto } from '../input-dto/users-query.input-dto';
import { UsersPaginatedViewDto } from '../view-dto/users-paginated.view-dto';
import { BasicAuthGuard } from '../../guards/basic/basic-auth.guard';
import { IdValidationPipe } from 'src/core/pipes/object-id-validation-transformation.pipe';
import { CreateUserCommand } from '../../application/use-cases/admins/create-user.use-case';
import { DeleteUserCommand } from '../../application/use-cases/admins/delete-user.use-case';
import { UserAccountDocument } from '../../domain/entities/user.entity';
import { GetUsersListQuery } from '../../application/queries/get-users-list.query';

@Controller(API_ROUTES.users)
@UseGuards(BasicAuthGuard)
@ApiBasicAuth('basicAuth')
export class UsersController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus, // шина команд - сам находит нужный @CommandHandler и вызывает его execute
  ) {
    console.log('UsersController created');
  }

  // * GET: Returns all users
  @Get()
  @ApiOperation({ summary: 'Returns all users' }) // for swagger doc
  @ApiResponse({
    status: 200,
    description: 'Success',
    type: UsersPaginatedViewDto,
  }) // for swagger doc
  getUsersList(
    @Query() queries: UsersQueryInputDto,
  ): Promise<UsersPaginatedViewDto> {
    return this.queryBus.execute(new GetUsersListQuery(queries));
  }

  // * POST: Add new user to the system
  @Post()
  @ApiOperation({ summary: 'Add new user to the system' })
  @ApiResponse({
    status: 201,
    description: 'Returns the newly created user',
    type: UserViewDto,
  })
  async createUser(@Body() dto: CreateUserInputDto): Promise<UserViewDto> {
    const userInstanceDoc = await this.commandBus.execute<
      CreateUserCommand,
      UserAccountDocument
    >(new CreateUserCommand(dto));

    const userOutput = UserViewDto.mapToViewModel(userInstanceDoc);

    return userOutput;
  }

  // * DELETE: Delete user specified by id
  @Delete(':id')
  @ApiParam({ name: 'id', description: 'User id', type: String })
  @ApiOperation({ summary: 'Delete user specified by id' })
  @ApiResponse({
    status: 204,
    description: 'No content',
  })
  @ApiResponse({ status: 404, description: 'If specified user is not exists' }) // if error
  @HttpCode(204)
  deleteUser(@Param('id', IdValidationPipe) id: string): Promise<void> {
    return this.commandBus.execute<DeleteUserCommand>(
      new DeleteUserCommand(id),
    );
  }
}
