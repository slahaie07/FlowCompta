import { describe, expect, it } from 'vitest';
import { runInternalCronJob, INTERNAL_CRON_JOBS } from '../../api/internal-jobs';

describe('internal cron jobs', () => {
  it('lists expected jobs', () => {
    expect(INTERNAL_CRON_JOBS).toContain('agent-health');
    expect(INTERNAL_CRON_JOBS).toContain('reconciliation');
    expect(INTERNAL_CRON_JOBS).toContain('elite-hunter');
  });

  it('runs agent-health successfully', () => {
    const result = runInternalCronJob('agent-health', { geminiConfigured: true });
    expect(result.success).toBe(true);
    expect(result.job).toBe('agent-health');
    expect(result.details?.routedCount).toBeGreaterThan(0);
  });

  it('runs reconciliation stub', () => {
    const result = runInternalCronJob('reconciliation');
    expect(result.success).toBe(true);
    expect(result.details?.mode).toBe('stub');
  });

  it('rejects unknown job', () => {
    const result = runInternalCronJob('unknown-job');
    expect(result.success).toBe(false);
  });
});
