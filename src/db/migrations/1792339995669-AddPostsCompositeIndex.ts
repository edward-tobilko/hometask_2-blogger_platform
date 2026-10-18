import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPostsCompositeIndex1792339995669 implements MigrationInterface {
  name = 'AddPostsCompositeIndex1792339995669';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX "IDX_posts_blog_id_created_at" ON "posts"  ("blog_id", "created_at") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_posts_blog_id_created_at"`,
    );
  }
}
