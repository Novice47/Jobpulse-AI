import { Worker } from 'bullmq';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config();

let connectionConfig: any = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  maxRetriesPerRequest: null,
};

if (process.env.REDIS_URL) {
  try {
    const url = new URL(process.env.REDIS_URL);
    connectionConfig = {
      host: url.hostname,
      port: parseInt(url.port || '6379', 10),
      username: url.username || undefined,
      password: url.password || undefined,
      tls: url.protocol === 'rediss:' ? {} : undefined,
      maxRetriesPerRequest: null,
    };
  } catch (e) {
    // fallback to default
  }
}

console.log('[Worker] Starting BullMQ background workers...');

let lastIngestionNotice = 0;
let lastMarketNotice = 0;

// 1. Ingestion Queue Worker
const ingestionWorker = new Worker(
  'job-ingestion',
  async (job) => {
    console.log(`[Worker: Ingestion] Processing job batch ${job.id}`);
    // Simulate background deduplication & normalization
    return { processed: 10, status: 'success' };
  },
  { connection: connectionConfig }
);

ingestionWorker.on('completed', (job) => {
  console.log(`[Worker: Ingestion] Completed job ${job.id}`);
});

ingestionWorker.on('failed', (job, err) => {
  console.error(`[Worker: Ingestion] Failed job ${job?.id}:`, err);
});

// 2. Market Aggregation Queue Worker
const marketWorker = new Worker(
  'market-aggregation',
  async (job) => {
    console.log(`[Worker: Market] Recomputing daily/weekly market snapshots...`);
    return { snapshotId: `snap-${Date.now()}`, status: 'success' };
  },
  { connection: connectionConfig }
);

// Handle connection errors gracefully in standalone environment
ingestionWorker.on('error', (err) => {
  const now = Date.now();
  if (now - lastIngestionNotice > 30000) {
    lastIngestionNotice = now;
    console.warn('[Worker: Ingestion Redis Notice] Redis status:', err.message);
  }
});

marketWorker.on('error', (err) => {
  const now = Date.now();
  if (now - lastMarketNotice > 30000) {
    lastMarketNotice = now;
    console.warn('[Worker: Market Redis Notice] Redis status:', err.message);
  }
});

console.log('[Worker] Background workers initialized.');
