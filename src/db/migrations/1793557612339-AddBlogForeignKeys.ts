import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBlogForeignKeys1793557612339 implements MigrationInterface {
  name = 'AddBlogForeignKeys1793557612339';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // * Clean the orphans on db
    await queryRunner.query(
      `DELETE FROM posts WHERE blog_id NOT IN (SELECT id FROM blogs)`,
    );

    await queryRunner.query(
      `DELETE FROM blog_subscriptions WHERE blog_id NOT IN (SELECT id FROM blogs)`,
    );

    // * Add constraints in posts and blog_subscriptions for blog_id
    await queryRunner.query(
      `ALTER TABLE posts ADD constraint "FK_posts_blog_id" FOREIGN KEY (blog_id) REFERENCES blogs(id) on delete CASCADE`,
    );

    await queryRunner.query(
      `ALTER TABLE blog_subscriptions ADD constraint "FK_blog_subscriptions_blog_id" FOREIGN KEY (blog_id) REFERENCES blogs(id) on delete CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // * Delete constraints
    await queryRunner.query(
      `ALTER TABLE posts DROP constraint "FK_posts_blog_id"`,
    );

    await queryRunner.query(
      `ALTER TABLE blog_subscriptions DROP constraint "FK_blog_subscriptions_blog_id"`,
    );
  }
}
