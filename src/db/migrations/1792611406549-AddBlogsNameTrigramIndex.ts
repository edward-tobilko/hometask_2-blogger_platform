import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBlogsNameTrigramIndex1792611406549 implements MigrationInterface {
  name = 'AddBlogsNameTrigramIndex1792611406549';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS pg_trgm`);

    await queryRunner.query(
      `CREATE INDEX "IDX_blogs_name_trgm" ON "blogs" USING gin ("name" gin_trgm_ops)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_blogs_name_trgm"`);
  }
}
