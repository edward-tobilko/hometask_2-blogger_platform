import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { randomUUID } from 'crypto';

import { UserAccountOrmEntity } from '../schemas/user-orm.entity';
import { CreateUserDomainDto } from '../../../domain/dto/create-user.dto';

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
    try {
      return await this.usersRepo.findOne({
        where: { confirmationCode: confirmCode, deletedAt: IsNull() },
      });
    } catch {
      return null;
    }
  }

  async findByRecoveryCode(
    recoveryCode: string,
  ): Promise<UserAccountOrmEntity | null> {
    try {
      return await this.usersRepo.findOne({
        where: { recoveryCode, deletedAt: IsNull() },
      });
    } catch {
      return null;
    }
  }

  async save(user: UserAccountOrmEntity): Promise<void> {
    await this.usersRepo.save(user);
  }

  async createByAdmin(
    dto: CreateUserDomainDto,
    isUserConfirmed: boolean,
  ): Promise<UserAccountOrmEntity> {
    // * В TypeORM мы сами собираем объект: создаём объект в памяти (без SQL) и сохраняем через this.usersRepo.save() - выполняет INSERT в базу.
    const user = this.usersRepo.create({
      login: dto.login,
      email: dto.email,
      passwordHash: dto.password,
      confirmationCode: null,
      emailConfirmationCodeExpiry: null,
      isConfirmed: isUserConfirmed,
    });

    return this.usersRepo.save(user);
  }

  async create(dto: CreateUserDomainDto): Promise<UserAccountOrmEntity> {
    const expirationDate = new Date();

    expirationDate.setHours(expirationDate.getHours() + 1);

    const user = this.usersRepo.create({
      login: dto.login,
      email: dto.email,
      passwordHash: dto.password,
      confirmationCode: randomUUID(),
      emailConfirmationCodeExpiry: expirationDate,
      isConfirmed: false,
    });

    return this.usersRepo.save(user);
  }

  // * Hard delete
  async hardDelete(id: string): Promise<void> {
    await this.usersRepo.delete({ id });
  }

  // * Soft delete (если есть @DeleteDateColumn)
  async softDelete(id: string): Promise<void> {
    await this.usersRepo.softDelete({ id }); // UPDATE wallet SET "deletedAt" = NOW() WHERE id = 12

    // await this.usersRepo.restore({ id }); // восстановить soft-удалённое: UPDATE wallet SET "deletedAt" = NULL WHERE id = 12
  }
}
