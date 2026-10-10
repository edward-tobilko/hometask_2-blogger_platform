import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBlogsUpdatedAtDeletedAt1791652410008 implements MigrationInterface {
  name = 'AddBlogsUpdatedAtDeletedAt1791652410008';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "blogs" ADD "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "blogs" ADD "deleted_at" TIMESTAMP WITH TIME ZONE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "blogs" DROP COLUMN "deleted_at"`);
    await queryRunner.query(`ALTER TABLE "blogs" DROP COLUMN "updated_at"`);
  }
}
