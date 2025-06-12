import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
} from 'typeorm';

export enum JobStatus {
  PENDING   = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED    = 'FAILED',
}

@Entity({ name: 'jobs' })
export class Job {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()               // URL trong MinIO
  objectKey: string;

  @Column({ type: 'enum', enum: JobStatus, default: JobStatus.PENDING })
  status: JobStatus;

  @Column({ type: 'jsonb', nullable: true })
  labels: Record<string, number>;

  @Column({ type: 'float', nullable: true })
  score: number | null;

  @CreateDateColumn()
  createdAt: Date;
}