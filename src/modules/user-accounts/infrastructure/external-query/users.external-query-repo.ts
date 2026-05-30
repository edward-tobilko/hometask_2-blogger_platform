import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import {
  UserAccount,
  UserAccountModel,
} from '../../domain/entities/user.entity';
import { UserExternalViewDto } from './external-dto/users.external-view-dto';
import { DomainException } from 'src/core/exceptions/domain.exception';
import { DomainExceptionCode } from 'src/core/exceptions/domain.exception-codes';

@Injectable()
export class UsersExternalQueryRepository {
  constructor(
    @InjectModel(UserAccount.name)
    private UserModel: UserAccountModel,
  ) {}

  async getByIdOrNotFoundFail(id: string): Promise<UserExternalViewDto> {
    const userDoc = await this.UserModel.findOne({
      _id: id,
      deletedAt: null,
    });

    if (!userDoc) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: `This user with ID:${id} was not authorized`,
      });
    }

    return UserExternalViewDto.mapToView(userDoc);
  }
}

// ? External - то что мы хотим переиспользовать снаруже (за пределами UserAccountModule), что бы не шарить все данные с репо.
