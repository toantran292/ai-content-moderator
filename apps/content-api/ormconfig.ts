import { DataSource } from 'typeorm';
import { Job } from './src/jobs/entities/job.entity';

export default new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL || 'postgres://postgres:example@localhost:5432/content_moderator',
  entities: [Job],
  migrations: ['src/migrations/*.ts'],
  synchronize: false,
});