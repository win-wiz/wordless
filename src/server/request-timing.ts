type TimingStep = {
  durationMs: number;
  name: string;
};

export function createRequestTimingLogger(
  label: string,
  requestMetadata: Record<string, unknown> = {},
) {
  const startedAt = Date.now();
  const steps: TimingStep[] = [];

  function getTotalDurationMs() {
    return Date.now() - startedAt;
  }

  function buildServerTimingHeader() {
    const metrics = steps.map((step, index) =>
      `step${index};desc="${step.name}";dur=${step.durationMs}`
    );
    metrics.push(`total;desc="total";dur=${getTotalDurationMs()}`);
    return metrics.join(", ");
  }

  return {
    async timeStep<T>(name: string, fn: () => Promise<T> | T): Promise<T> {
      const stepStartedAt = Date.now();

      try {
        return await fn();
      } finally {
        steps.push({
          name,
          durationMs: Date.now() - stepStartedAt,
        });
      }
    },
    applyResponseHeaders<T extends Response>(response: T) {
      response.headers.set("Server-Timing", buildServerTimingHeader());
      response.headers.set("X-Wordless-Total-Ms", String(getTotalDurationMs()));
      return response;
    },

    log(responseMetadata: Record<string, unknown> = {}) {
      console.info(`[timing] ${label}`, {
        ...requestMetadata,
        ...responseMetadata,
        totalMs: getTotalDurationMs(),
        steps,
      });
    },
  };
}
