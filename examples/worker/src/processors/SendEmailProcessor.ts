import { Logger } from '@stratix/abstractions';
import { SendEmailJob } from '../jobs/SendEmailJob.js';

export class SendEmailProcessor {
  constructor(private readonly logger: Logger) {}

  async process(job: SendEmailJob): Promise<void> {
    const { to, subject, body } = job.data;

    this.logger.info('Processing SendEmail job', {
      jobId: job.id,
      to,
      subject,
    });

    // Simulate email sending
    await new Promise((resolve) => setTimeout(resolve, 1000));

    this.logger.info('Email sent successfully', {
      jobId: job.id,
      to,
      subject,
    });
  }
}
