import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';

import { UserAccountOrmEntity } from '../schemas/user-orm.entity';
import { CreateUserDomainDto } from '../../../domain/dto/create-user.dto';
import { isUUID } from 'class-validator';

@Injectable()
export class UsersSqlRepository {
  constructor(
    @InjectRepository(UserAccountOrmEntity)
    private readonly usersRepo: Repository<UserAccountOrmEntity>,
  ) {}

  async findById(id: string): Promise<UserAccountOrmEntity | null> {
    const existingUser = await this.usersRepo.findOne({
      where: {
        id,
        deletedAt: IsNull(), // для того, что бы не находить лишний раз удаленного пользователя
      },
    });

    return existingUser;
  }

  async findByIdWithBanInfo(id: string): Promise<UserAccountOrmEntity | null> {
    return this.usersRepo.findOne({
      where: { id, deletedAt: IsNull() },
      relations: { userBanInfo: true },
    });
  }

  async findByEmail(email: string): Promise<UserAccountOrmEntity | null> {
    return this.usersRepo.findOne({ where: { email, deletedAt: IsNull() } });
  }

  async findByLogin(login: string): Promise<UserAccountOrmEntity | null> {
    return this.usersRepo.findOne({ where: { login, deletedAt: IsNull() } });
  }

  async findUserByLoginOrEmail(
    login: string,
    email: string,
  ): Promise<UserAccountOrmEntity | null> {
    return this.usersRepo.findOne({
      where: [
        { login, deletedAt: IsNull() },
        // * SQL -> OR
        { email, deletedAt: IsNull() },
      ],

      relations: { userBanInfo: true },
    });
  }

  async findByConfirmationCode(
    confirmCode: string,
  ): Promise<UserAccountOrmEntity | null> {
    if (!isUUID(confirmCode)) return null; // проверка на UUID так как в БД тип uuid

    return await this.usersRepo.findOne({
      where: { confirmationCode: confirmCode, deletedAt: IsNull() },
    });
  }

  async findByRecoveryCode(
    recoveryCode: string,
  ): Promise<UserAccountOrmEntity | null> {
    if (!isUUID(recoveryCode)) return null;

    return await this.usersRepo.findOne({
      where: { recoveryCode, deletedAt: IsNull() },
    });
  }

  async save(user: UserAccountOrmEntity): Promise<void> {
    await this.usersRepo.save(user);
  }

  async createByAdmin(
    dto: CreateUserDomainDto,
    isUserConfirmed: boolean,
  ): Promise<UserAccountOrmEntity> {
    const user = UserAccountOrmEntity.create(dto, isUserConfirmed);

    return this.usersRepo.save(user);
  }

  async create(dto: CreateUserDomainDto): Promise<UserAccountOrmEntity> {
    const user = UserAccountOrmEntity.createForRegistration(dto);

    return this.usersRepo.save(user);
  }

  // * Hard delete
  async hardDelete(id: string): Promise<void> {
    await this.usersRepo.delete({ id });
  }

  // * Soft delete (если есть @DeleteDateColumn() decorator)
  async softDelete(id: string): Promise<void> {
    await this.usersRepo.softDelete({ id }); // UPDATE wallet SET "deletedAt" = NOW() WHERE id = 12

    // await this.usersRepo.restore({ id }); // восстановить soft-удалённое: UPDATE wallet SET "deletedAt" = NULL WHERE id = 12
  }
}
