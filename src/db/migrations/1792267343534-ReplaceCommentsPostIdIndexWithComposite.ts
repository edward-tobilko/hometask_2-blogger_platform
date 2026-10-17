import { MigrationInterface, QueryRunner } from 'typeorm';

export class ReplaceCommentsPostIdIndexWithComposite1792267343534 implements MigrationInterface {
  name = 'ReplaceCommentsPostIdIndexWithComposite1792267343534';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_259bf9825d9d198608d1b46b0b"`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_06a1038b5b8f236c9ddb068af5" ON "comments"  ("post_id", "created_at") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_06a1038b5b8f236c9ddb068af5"`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_259bf9825d9d198608d1b46b0b" ON "comments" USING btree ("post_id") `,
    );
  }
}
