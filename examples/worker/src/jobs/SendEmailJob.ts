export interface SendEmailJobData {
  to: string;
  subject: string;
  body: string;
}

export interface SendEmailJob {
  id: string;
  type: 'SendEmail';
  data: SendEmailJobData;
  attempts?: number;
  maxRetries?: number;
}

export function createSendEmailJob(
  data: SendEmailJobData,
  id?: string
): SendEmailJob {
  return {
    id: id || `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type: 'SendEmail',
    data,
    attempts: 0,
    maxRetries: 3,
  };
}
