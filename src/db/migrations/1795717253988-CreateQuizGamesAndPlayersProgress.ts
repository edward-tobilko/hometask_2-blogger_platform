import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateQuizGamesAndPlayersProgress1795717253988 implements MigrationInterface {
  name = 'CreateQuizGamesAndPlayersProgress1795717253988';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."quiz_games_status_enum" AS ENUM('PendingSecondPlayer', 'Active', 'Finished')`,
    );
    await queryRunner.query(
      `CREATE TABLE "quiz_games" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "status" "public"."quiz_games_status_enum" NOT NULL, "pair_created_date" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "start_game_date" TIMESTAMP WITH TIME ZONE, "finish_game_date" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_662adf6950bee0fca58585a52a4" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "players_progress" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "game_id" uuid NOT NULL, "user_id" uuid NOT NULL, "score" integer NOT NULL DEFAULT '0', CONSTRAINT "UQ_players_progress_game_id_user_id" UNIQUE ("game_id", "user_id"), CONSTRAINT "PK_98d36d56713bb79844e87327906" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "players_progress" ADD CONSTRAINT "FK_players_progress_game_id" FOREIGN KEY ("game_id") REFERENCES "quiz_games"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `COMMENT ON INDEX "UQ_players_progress_game_id_user_id" IS 'one progress per user per game: user cannot take both seats of a pair';`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "players_progress" DROP CONSTRAINT "FK_players_progress_game_id"`,
    );
    await queryRunner.query(`DROP TABLE "players_progress"`);
    await queryRunner.query(`DROP TABLE "quiz_games"`);
    await queryRunner.query(`DROP TYPE "public"."quiz_games_status_enum"`);
  }
}
