import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropPostsBlogName1793994079727 implements MigrationInterface {
  name = 'DropPostsBlogName1793994079727';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "posts" DROP COLUMN "blog_name"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "posts" ADD "blog_name" character varying`,
    );

    await queryRunner.query(
      `UPDATE posts p SET blog_name = b.name FROM blogs b WHERE b.id = p.blog_id`, // backfill from blogs table
    );
  }
}
