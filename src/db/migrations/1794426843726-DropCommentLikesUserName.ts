import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropCommentLikesUserName1794426843726 implements MigrationInterface {
  name = 'DropCommentLikesUserName1794426843726';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "comment_likes" DROP COLUMN "user_name"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "comment_likes" ADD "user_name" character varying`,
    );

    await queryRunner.query(
      `UPDATE comment_likes cl SET user_name = ua.login FROM user_accounts ua WHERE ua.id = cl.user_id`, // backfill from user_accounts table;
    );
  }
}
