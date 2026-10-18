import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSecurityDevicesSessionUserIdIndex1792350759439 implements MigrationInterface {
  name = 'AddSecurityDevicesSessionUserIdIndex1792350759439';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX "IDX_security_devices_session_user_id" ON "security_devices_session"  ("user_id") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_security_devices_session_user_id"`,
    );
  }
}
