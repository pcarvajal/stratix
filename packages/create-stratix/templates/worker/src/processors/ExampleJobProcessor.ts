// @ts-nocheck
import { Logger } from '@stratix/abstractions';

export interface Job {
  id: string;
  type: string;
  data: unknown;
}

export class ExampleJobProcessor {
  constructor(private readonly logger: Logger) {}

  async process(job: Job): Promise<void> {
    this.logger.info('Processing job', { jobId: job.id, jobType: job.type });

    try {
      await this.handleJob(job);
      this.logger.info('Job completed successfully', { jobId: job.id });
    } catch (error) {
      this.logger.error('Job failed', {
        jobId: job.id,
        error: (error as Error).message,
      });
      throw error;
    }
  }

  private async handleJob(job: Job): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    this.logger.info('Job data processed', { data: job.data });
  }
}
