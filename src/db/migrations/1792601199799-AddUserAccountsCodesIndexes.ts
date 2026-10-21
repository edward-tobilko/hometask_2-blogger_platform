import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserAccountsCodesIndexes1792601199799 implements MigrationInterface {
  name = 'AddUserAccountsCodesIndexes1792601199799';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX "IDX_user_accounts_confirmation_code" ON "user_accounts"  ("confirmation_code") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_user_accounts_recovery_code" ON "user_accounts"  ("recovery_code") WHERE "recovery_code" IS NOT NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_user_accounts_telegram_confirmation_code" ON "user_accounts"  ("telegram_confirmation_code") WHERE "telegram_confirmation_code" IS NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_user_accounts_telegram_confirmation_code"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_user_accounts_recovery_code"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_user_accounts_confirmation_code"`,
    );
  }
}
