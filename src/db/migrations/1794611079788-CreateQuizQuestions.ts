import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateQuizQuestions1794611079788 implements MigrationInterface {
  name = 'CreateQuizQuestions1794611079788';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "quiz_questions" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "body" character varying(500) NOT NULL, "correct_answers" jsonb NOT NULL, "published" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), CONSTRAINT "PK_ec0447fd30d9f5c182e7653bfd3" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "quiz_questions"`);
  }
}
