import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPostsCreatedAtIndex1792342458137 implements MigrationInterface {
  name = 'AddPostsCreatedAtIndex1792342458137';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX "IDX_posts_created_at" ON "posts"  ("created_at") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_posts_created_at"`);
  }
}
