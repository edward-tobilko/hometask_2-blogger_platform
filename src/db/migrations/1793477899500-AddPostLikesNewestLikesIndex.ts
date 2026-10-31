import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPostLikesNewestLikesIndex1793477899500 implements MigrationInterface {
  name = 'AddPostLikesNewestLikesIndex1793477899500';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX "IDX_post_likes_post_id_added_at_like" ON "post_likes"  ("post_id", "added_at") WHERE "status" = 'Like'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_post_likes_post_id_added_at_like"`,
    );
  }
}
