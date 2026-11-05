import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPostAndCommentForeignKeys1793911418625 implements MigrationInterface {
  name = 'AddPostAndCommentForeignKeys1793911418625';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // * Clean the orphans on db
    await queryRunner.query(
      `DELETE FROM comments WHERE post_id NOT IN (SELECT id FROM posts);`,
    );

    await queryRunner.query(
      `DELETE FROM post_likes WHERE post_id NOT IN (SELECT id FROM posts);`,
    );

    await queryRunner.query(
      `DELETE FROM comment_likes WHERE comment_id NOT IN (SELECT id FROM comments);`,
    );

    // * Add constraints in comments, post_likes, comment_likes for post_id
    await queryRunner.query(
      `ALTER TABLE comments ADD constraint "FK_comments_post_id" FOREIGN KEY (post_id) REFERENCES posts(id) on delete CASCADE`,
    );

    await queryRunner.query(
      `ALTER TABLE post_likes ADD constraint "FK_post_likes_post_id" FOREIGN KEY (post_id) REFERENCES posts(id) on delete CASCADE`,
    );

    await queryRunner.query(
      `ALTER TABLE comment_likes ADD constraint "FK_comment_likes_comment_id" FOREIGN KEY (comment_id) REFERENCES comments(id) on delete CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // * Delete constraints
    await queryRunner.query(
      `ALTER TABLE comments DROP constraint "FK_comments_post_id"`,
    );

    await queryRunner.query(
      `ALTER TABLE post_likes DROP constraint "FK_post_likes_post_id"`,
    );

    await queryRunner.query(
      `ALTER TABLE comment_likes DROP constraint "FK_comment_likes_comment_id"`,
    );
  }
}
