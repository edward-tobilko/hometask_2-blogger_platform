import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCommentsPostIdIndex1792265416547 implements MigrationInterface {
  name = 'AddCommentsPostIdIndex1792265416547';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX "IDX_259bf9825d9d198608d1b46b0b" ON "comments"  ("post_id") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_259bf9825d9d198608d1b46b0b"`,
    );
  }
}
