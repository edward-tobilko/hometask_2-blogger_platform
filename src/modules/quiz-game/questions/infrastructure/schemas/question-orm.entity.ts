import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { CreateQuestionDomainDto } from '../../domain/dto/create-question-domain.dto';
import { UpdateQuestionDomainDto } from '../../domain/dto/update-question-domain.dto';
import {
  DomainException,
  Extension,
} from 'src/core/exceptions/domain.exception';
import { DomainExceptionCode } from 'src/core/exceptions/domain.exception-codes';

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

  static createQuestion(dto: CreateQuestionDomainDto): QuestionOrmEntity {
    const instance = new QuestionOrmEntity();

    instance.body = dto.body;
    instance.correctAnswers = dto.correctAnswers;
    instance.published = false;

    return instance;
  }

  update(dto: UpdateQuestionDomainDto): void {
    if (this.published && !dto.correctAnswers?.length) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'published question must keep at least one correct answer',
        extensions: [
          new Extension(
            `this input has incorrect values or property 'correctAnswers' are not passed but property 'published' is true`,
            'correctAnswers',
          ),
        ], // <- error 400 throw extensions message for client;
      });
    }

    this.body = dto.body;
    this.correctAnswers = dto.correctAnswers;
  }

  changePublishStatus(publish: boolean): void {
    if (publish && this.correctAnswers.length === 0) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message:
          'question must have at least one correct answer to be published',
        extensions: [
          new Extension(
            `this input has incorrect values or specified question doesn't have correct answers`,
            'correctAnswers',
          ),
        ],
      });
    }

    this.published = publish;
  }
}

// ? jsonb - принимает любой валидный JSON, будь то {"a": 1} / 42 или "текст".
