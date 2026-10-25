import { MigrationInterface, QueryRunner } from 'typeorm';

export class MakeUserAccountsEmailUniqueAmongActive1792960691202 implements MigrationInterface {
  name = 'MakeUserAccountsEmailUniqueAmongActive1792960691202';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_accounts" DROP CONSTRAINT "UQ_df3802ec9c31dd9491e3589378d"`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_user_accounts_email_active" ON "user_accounts"  ("email") WHERE "deleted_at" IS NULL`,
    );
    await queryRunner.query(
      `COMMENT ON INDEX "IDX_user_accounts_email_active" IS 'Unique among active users: soft-deleted accounts free their email';`,
    );
  }

  // * Fails if active and soft-deleted users share an email — clean up duplicates first.
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_user_accounts_email_active"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_accounts" ADD CONSTRAINT "UQ_df3802ec9c31dd9491e3589378d" UNIQUE ("email")`,
    );
  }
}
