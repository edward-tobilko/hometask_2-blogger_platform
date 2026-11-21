import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropQuizQuestionsUpdatedAtDefault1795292300380 implements MigrationInterface {
  name = 'DropQuizQuestionsUpdatedAtDefault1795292300380';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "quiz_questions" ALTER COLUMN "updated_at" DROP DEFAULT`,
    );

    await queryRunner.query(
      `UPDATE "quiz_questions" SET "updated_at" = NULL WHERE "updated_at" = "created_at"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "quiz_questions" ALTER COLUMN "updated_at" SET DEFAULT now()`,
    );
  }
}
