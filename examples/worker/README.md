# Worker Example

Background job processing with RabbitMQ and Redis.

## Quick Start

```bash
# Start infrastructure
docker run -d --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:3-management
docker run -d --name redis -p 6379:6379 redis:7-alpine

# Start worker
cd worker
pnpm install && pnpm dev
```

## Features

- Asynchronous job processing
- Job retry with exponential backoff
- Job status tracking with Redis
- Scheduled/delayed jobs
- Job priorities
- Dead letter queue
- Horizontal scaling
- Graceful shutdown

## Job Types

### SendEmailJob

```typescript
{
  type: 'SendEmail',
  data: {
    to: 'user@example.com',
    subject: 'Welcome!',
    body: 'Welcome to our platform...'
  }
}
```

### GenerateReportJob

```typescript
{
  type: 'GenerateReport',
  data: {
    reportType: 'sales',
    startDate: '2025-01-01',
    endDate: '2025-01-31',
    format: 'pdf'
  }
}
```

### ProcessImageJob

```typescript
{
  type: 'ProcessImage',
  data: {
    imageUrl: 'https://example.com/image.jpg',
    operations: ['resize', 'compress', 'watermark']
  }
}
```

## Enqueueing Jobs

**From Code:**
```typescript
import { JobQueue } from './jobs/JobQueue.js';

const queue = new JobQueue(eventBus, redis);

// Immediate execution
await queue.enqueue({
  type: 'SendEmail',
  data: { to: 'user@example.com', subject: 'Welcome!', body: '...' }
});

// Delayed execution
await queue.enqueue(
  { type: 'GenerateReport', data: { reportType: 'sales' } },
  { delay: 60000 } // 1 minute
);

// High priority
await queue.enqueue(
  { type: 'SendEmail', data: { to: 'vip@example.com' } },
  { priority: 'high' }
);
```

**Via API:**
```bash
curl -X POST http://localhost:3000/jobs \
  -H "Content-Type: application/json" \
  -d '{
    "type": "SendEmail",
    "data": {
      "to": "user@example.com",
      "subject": "Welcome!",
      "body": "..."
    }
  }'
```

## Job Processing

```typescript
export class SendEmailProcessor {
  async process(job: SendEmailJob): Promise<void> {
    const { to, subject, body } = job.data;
    await this.emailService.send({ to, subject, body });
    this.logger.info('Email sent', { to, subject });
  }
}
```

## Job Status Tracking

```typescript
const status = await queue.getJobStatus(jobId);
// {
//   id: 'job_abc123',
//   type: 'SendEmail',
//   status: 'completed',
//   attempts: 1,
//   createdAt: '2025-01-04T10:00:00.000Z',
//   completedAt: '2025-01-04T10:00:01.000Z'
// }
```

**Job States:** `pending`, `processing`, `completed`, `failed`, `delayed`

## Scheduled Jobs

```typescript
// Every hour
scheduler.schedule('0 * * * *', async () => {
  await queue.enqueue({ type: 'GenerateReport', data: { reportType: 'hourly' } });
});

// Daily at 2 AM
scheduler.schedule('0 2 * * *', async () => {
  await queue.enqueue({ type: 'CleanupOldData', data: { olderThan: '30d' } });
});
```

## Scaling Workers

```bash
PORT=3001 pnpm worker &
PORT=3002 pnpm worker &
PORT=3003 pnpm worker &
```

RabbitMQ distributes jobs across workers using round-robin.

## Monitoring

**Queue Metrics:**
```typescript
const metrics = await queue.getMetrics();
// { pending: 15, processing: 3, completed: 1254, failed: 12 }
```

**RabbitMQ Management UI:** `http://localhost:15672` (guest/guest)

**Redis:**
```bash
redis-cli INFO stats
redis-cli KEYS job:*
```

## Configuration

```env
RABBITMQ_URL=amqp://localhost:5672
RABBITMQ_QUEUE=jobs
RABBITMQ_DLQ=jobs.dlq
REDIS_URL=redis://localhost:6379
WORKER_CONCURRENCY=5
MAX_RETRIES=3
```

## License

MIT
