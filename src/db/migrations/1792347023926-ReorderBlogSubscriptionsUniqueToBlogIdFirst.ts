import { MigrationInterface, QueryRunner } from 'typeorm';

export class ReorderBlogSubscriptionsUniqueToBlogIdFirst1792347023926 implements MigrationInterface {
  name = 'ReorderBlogSubscriptionsUniqueToBlogIdFirst1792347023926';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "blog_subscriptions" DROP CONSTRAINT "UQ_blog_subscriptions_user_id_blog_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "blog_subscriptions" ADD CONSTRAINT "UQ_blog_subscriptions_blog_id_user_id" UNIQUE ("blog_id", "user_id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "blog_subscriptions" DROP CONSTRAINT "UQ_blog_subscriptions_blog_id_user_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "blog_subscriptions" ADD CONSTRAINT "UQ_blog_subscriptions_user_id_blog_id" UNIQUE ("user_id", "blog_id")`,
    );
  }
}
