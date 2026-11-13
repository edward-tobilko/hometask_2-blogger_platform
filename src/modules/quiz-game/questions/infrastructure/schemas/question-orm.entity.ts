import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('quiz_questions')
export class QuestionOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 500 })
  body!: string;

  @Column({ name: 'correct_answers', type: 'jsonb' })
  correctAnswers!: string[];

  @Column({ default: false, type: 'boolean' })
  published!: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz', nullable: true })
  updatedAt!: Date | null;
}

// ? jsonb - принимает любой валидный JSON, будь то {"a": 1} / 42 или "текст".
