import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserAccountsLoginEmailTrigramIndexes1793389374666 implements MigrationInterface {
  name = 'AddUserAccountsLoginEmailTrigramIndexes1793389374666';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX "IDX_user_accounts_login_trgm" ON "user_accounts" USING gin ("login" gin_trgm_ops)`,
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_user_accounts_email_trgm" ON "user_accounts" USING gin ("email" gin_trgm_ops)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_user_accounts_email_trgm"`,
    );

    await queryRunner.query(
      `DROP INDEX "public"."IDX_user_accounts_login_trgm"`,
    );
  }
}
