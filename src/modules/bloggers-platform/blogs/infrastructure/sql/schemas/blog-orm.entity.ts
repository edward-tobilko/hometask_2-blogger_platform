import { Column, CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';

@Entity('blogs')
export class BlogOrmEntity {
  @PrimaryColumn({ type: 'uuid', default: () => 'gen_random_uuid()' })
  id!: string;

  @Column({ type: 'varchar' })
  name!: string;

  @Column({ type: 'varchar' })
  description!: string;

  @Column({ name: 'website_url', type: 'varchar' })
  websiteUrl!: string;

  @Column({ name: 'is_membership', type: Boolean, default: false })
  isMembership!: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
