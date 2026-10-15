import { MigrationInterface, QueryRunner } from 'typeorm';

export class RecalculatePostsLikesCounters1792091015767 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
                    UPDATE posts p
                    SET likes_count    = COALESCE(agg.likes, 0),
                        dislikes_count = COALESCE(agg.dislikes, 0)
                    FROM posts p2
                    LEFT JOIN (
                        SELECT post_id,
                            COUNT(*) FILTER (WHERE status = 'Like')    AS likes,
                            COUNT(*) FILTER (WHERE status = 'Dislike') AS dislikes
                        FROM post_likes
                        GROUP BY post_id
                    ) agg ON agg.post_id = p2.id
                    WHERE p.id = p2.id
            `);
  }

  public async down(): Promise<void> {
    // Irreversible data migration: previous (incorrect) counter values were not stored.
  }
}
