import { Column, CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';

@Entity('comments')
export class CommentOrmEntity {
  @PrimaryColumn({ type: 'uuid', default: () => 'gen_random_uuid()' })
  id!: string;

  @Column({ name: 'post_id', type: 'uuid' })
  postId!: string;

  @Column({ type: 'varchar' })
  content!: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  // * Вложеный обьект (сплющенные поля) "commentatorInfo"
  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @Column({ name: 'user_login', type: 'varchar' })
  userLogin!: string;

  // * Вложеный обьект (сплющенные поля) "likesInfo"
  @Column({ name: 'likes_count', type: 'int', default: 0 })
  likesCount!: number;

  @Column({ name: 'dislikes_count', type: 'int', default: 0 })
  dislikesCount!: number;

  // * Extra fields over the basic API logic
  @Column({ name: 'is_banned', type: 'boolean', default: false })
  isBanned!: boolean;

  static create(
    postId: string,
    content: string,
    userId: string,
    userLogin: string,
  ) {
    const commentInstance = new CommentOrmEntity();

    commentInstance.content = content;
    commentInstance.postId = postId;
    commentInstance.userId = userId;
    commentInstance.userLogin = userLogin;
    commentInstance.likesCount = 0;
    commentInstance.dislikesCount = 0;

    return commentInstance;
  }

  update(content: string) {
    this.content = content;
  }
}

// ? default: false - гарантирует, что новые документы всегда создаются с isBanned: false без явной передачи.
