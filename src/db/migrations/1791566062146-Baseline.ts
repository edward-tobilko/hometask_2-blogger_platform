import { MigrationInterface, QueryRunner } from 'typeorm';

export class Baseline1791566062146 implements MigrationInterface {
  name = 'Baseline1791566062146';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "user_accounts" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "login" character varying NOT NULL, "email" character varying NOT NULL, "password_hash" character varying NOT NULL, "confirmation_code" uuid, "email_confirmation_code_expiry" TIMESTAMP WITH TIME ZONE, "is_confirmed" boolean NOT NULL DEFAULT false, "recovery_code" uuid, "recovery_code_expiry" TIMESTAMP WITH TIME ZONE, "telegram_chat_id" character varying, "telegram_confirmation_code" character varying, CONSTRAINT "UQ_f72e62eca488328e3fe991f1474" UNIQUE ("login"), CONSTRAINT "UQ_df3802ec9c31dd9491e3589378d" UNIQUE ("email"), CONSTRAINT "PK_125e915cf23ad1cfb43815ce59b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "users_ban_info" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "is_banned" boolean NOT NULL DEFAULT false, "ban_reason" character varying, "banned_at" TIMESTAMP WITH TIME ZONE, "ban_expires_at" TIMESTAMP WITH TIME ZONE, "user_account_id" uuid, CONSTRAINT "REL_72c695460cf9e0dbad63429f57" UNIQUE ("user_account_id"), CONSTRAINT "PK_8e98cde5d735710f0651c446641" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "security_devices_session" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "ip" character varying NOT NULL, "title" character varying NOT NULL, "last_active_date" TIMESTAMP WITH TIME ZONE NOT NULL, "device_id" uuid NOT NULL, "user_id" uuid NOT NULL, "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "UQ_a10dc40c3062c1017dd30e58698" UNIQUE ("device_id"), CONSTRAINT "PK_ed04f1bbcb6e126058bb493be75" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "blogs" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "name" character varying NOT NULL, "description" character varying NOT NULL, "website_url" character varying NOT NULL, "is_membership" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_e113335f11c926da929a625f118" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "blog_subscriptions" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "user_id" uuid NOT NULL, "blog_id" uuid NOT NULL, "subscribe_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_blog_subscriptions_user_id_blog_id" UNIQUE ("user_id", "blog_id"), CONSTRAINT "PK_1250b110f58fee0305d9e5e90c1" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."comment_likes_status_enum" AS ENUM('Like', 'Dislike', 'None')`,
    );
    await queryRunner.query(
      `CREATE TABLE "comment_likes" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "comment_id" uuid NOT NULL, "user_id" uuid NOT NULL, "status" "public"."comment_likes_status_enum" NOT NULL DEFAULT 'None', "user_name" character varying, CONSTRAINT "UQ_comment_likes_comment_id_user_id" UNIQUE ("comment_id", "user_id"), CONSTRAINT "PK_2c299aaf1f903c45ee7e6c7b419" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "comments" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "post_id" uuid NOT NULL, "content" character varying NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "user_id" uuid NOT NULL, "user_login" character varying NOT NULL, "likes_count" integer NOT NULL DEFAULT '0', "dislikes_count" integer NOT NULL DEFAULT '0', "is_banned" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_8bf68bc960f2b69e818bdb90dcb" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."post_likes_status_enum" AS ENUM('Like', 'Dislike', 'None')`,
    );
    await queryRunner.query(
      `CREATE TABLE "post_likes" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "post_id" uuid NOT NULL, "status" "public"."post_likes_status_enum" NOT NULL DEFAULT 'None', "user_id" uuid NOT NULL, "added_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_post_likes_post_id_user_id" UNIQUE ("post_id", "user_id"), CONSTRAINT "PK_e4ac7cb9daf243939c6eabb2e0d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "posts" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "title" character varying NOT NULL, "short_description" character varying NOT NULL, "content" character varying NOT NULL, "blog_id" uuid NOT NULL, "blog_name" character varying, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "likes_count" integer NOT NULL DEFAULT '0', "dislikes_count" integer NOT NULL DEFAULT '0', CONSTRAINT "PK_2829ac61eff60fcec60d7274b9e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "users_ban_info" ADD CONSTRAINT "FK_72c695460cf9e0dbad63429f579" FOREIGN KEY ("user_account_id") REFERENCES "user_accounts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users_ban_info" DROP CONSTRAINT "FK_72c695460cf9e0dbad63429f579"`,
    );
    await queryRunner.query(`DROP TABLE "posts"`);
    await queryRunner.query(`DROP TABLE "post_likes"`);
    await queryRunner.query(`DROP TYPE "public"."post_likes_status_enum"`);
    await queryRunner.query(`DROP TABLE "comments"`);
    await queryRunner.query(`DROP TABLE "comment_likes"`);
    await queryRunner.query(`DROP TYPE "public"."comment_likes_status_enum"`);
    await queryRunner.query(`DROP TABLE "blog_subscriptions"`);
    await queryRunner.query(`DROP TABLE "blogs"`);
    await queryRunner.query(`DROP TABLE "security_devices_session"`);
    await queryRunner.query(`DROP TABLE "users_ban_info"`);
    await queryRunner.query(`DROP TABLE "user_accounts"`);
  }
}
