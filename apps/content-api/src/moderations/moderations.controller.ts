import {
  Controller, Post, UploadedFile, UseInterceptors, BadRequestException, Inject,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { uploadBuffer } from '../common/minio';
import { JobStatus } from '../jobs/entities/job.entity';
import { randomUUID } from 'crypto';
import { JobsService } from 'src/jobs/jobs.service';

@Controller('moderations')
export class ModerationsController {
  constructor(
    @Inject('REDIS') private readonly redis,
    private readonly jobsService: JobsService,
  ) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async create(@UploadedFile() file: any) {
    if (!file) throw new BadRequestException('file missing');

    // 1) upload MinIO
    const objectKey = await uploadBuffer(file.buffer, file.originalname);

    // 2) insert PG row
    const job = await this.jobsService.create({
      id: randomUUID(),
      objectKey,
      status: JobStatus.PENDING,
    });

    // 3) push Redis Stream
    await this.redis.xadd(
      'moderation-raw',
      '*',
      'jobId',
      job.id,
      'objectKey',
      objectKey,
    );

    return { id: job.id };
  }
}