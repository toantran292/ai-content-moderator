import { Controller, Inject, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import Redis from 'ioredis';

@Controller('moderations')
export class ModerationsController {
  constructor(@Inject('REDIS') private readonly redis: Redis) {}

  @Post()
  async create(@UploadedFile() file: any) {

    const jobId = randomUUID();
    await this.redis.xadd('moderation-raw', '*', 'job', jobId);
    return { jobId };
  }
}
