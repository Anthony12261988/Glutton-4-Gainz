/**
 * Retry utility for handling transient failures
 * Implements exponential backoff with jitter
 */

export interface RetryOptions {
  /**
   * Maximum number of retry attempts (default: 3)
   */
  maxAttempts?: number;

  /**
   * Initial delay in milliseconds (default: 1000ms)
   */
  initialDelay?: number;

  /**
   * Maximum delay in milliseconds (default: 10000ms)
   */
  maxDelay?: number;

  /**
   * Backoff multiplier (default: 2)
   */
  backoffMultiplier?: number;

  /**
   * Add random jitter to delay (default: true)
   */
  jitter?: boolean;

  /**
   * Custom function to determine if error is retryable
   */
  shouldRetry?: (error: Error, attempt: number) => boolean;

  /**
   * Callback fired before each retry attempt
   */
  onRetry?: (error: Error, attempt: number, delay: number) => void;
}

/**
 * Default retryable error checker
 * Retries on network errors, 5xx errors, and timeouts
 */
function defaultShouldRetry(error: Error, attempt: number): boolean {
  // Don't retry if max attempts reached
  if (attempt >= 3) return false;

  const message = error.message.toLowerCase();

  // Network errors
  if (
    message.includes("network") ||
    message.includes("fetch") ||
    message.includes("timeout") ||
    message.includes("econnrefused") ||
    message.includes("enotfound")
  ) {
    return true;
  }

  // Supabase specific errors
  if (message.includes("Failed to fetch") || message.includes("504")) {
    return true;
  }

  // Rate limit errors (429) - retry with backoff
  if (message.includes("429") || message.includes("rate limit")) {
    return true;
  }

  // Server errors (5xx)
  if (
    message.includes("500") ||
    message.includes("502") ||
    message.includes("503") ||
    message.includes("504")
  ) {
    return true;
  }

  return false;
}

/**
 * Calculate delay with exponential backoff and optional jitter
 */
function calculateDelay(
  attempt: number,
  initialDelay: number,
  backoffMultiplier: number,
  maxDelay: number,
  jitter: boolean
): number {
  let delay = initialDelay * Math.pow(backoffMultiplier, attempt - 1);

  // Cap at max delay
  delay = Math.min(delay, maxDelay);

  // Add jitter (random ±25%)
  if (jitter) {
    const jitterAmount = delay * 0.25;
    delay = delay + (Math.random() * 2 - 1) * jitterAmount;
  }

  return Math.floor(delay);
}

/**
 * Retry a function with exponential backoff
 *
 * @example
 * ```ts
 * const result = await withRetry(
 *   async () => {
 *     const response = await fetch('/api/data');
 *     if (!response.ok) throw new Error('Failed to fetch');
 *     return response.json();
 *   },
 *   { maxAttempts: 3, initialDelay: 1000 }
 * );
 * ```
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    backoffMultiplier = 2,
    jitter = true,
    shouldRetry = defaultShouldRetry,
    onRetry,
  } = options;

  let lastError: Error;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      // Check if we should retry
      if (!shouldRetry(lastError, attempt) || attempt === maxAttempts) {
        throw lastError;
      }

      // Calculate delay for next attempt
      const delay = calculateDelay(
        attempt,
        initialDelay,
        backoffMultiplier,
        maxDelay,
        jitter
      );

      // Call onRetry callback
      if (onRetry) {
        onRetry(lastError, attempt, delay);
      }

      // Log retry attempt (optional, can be removed in production)
      console.warn(
        `[Retry] Attempt ${attempt}/${maxAttempts} failed. Retrying in ${delay}ms...`,
        lastError.message
      );

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  // This should never be reached due to throw in loop, but TypeScript needs it
  throw lastError!;
}

/**
 * Retry wrapper for Supabase queries
 * Specifically handles Supabase errors
 *
 * @example
 * ```ts
 * const { data, error } = await retrySupabaseQuery(
 *   () => supabase.from('profiles').select('*').single()
 * );
 * ```
 */
export async function retrySupabaseQuery<T>(
  queryFn: () => Promise<{ data: T | null; error: any }>,
  options: RetryOptions = {}
): Promise<{ data: T | null; error: any }> {
  return withRetry(async () => {
    const result = await queryFn();

    // If there's an error, throw it so retry logic kicks in
    if (result.error) {
      throw new Error(result.error.message || "Supabase query failed");
    }

    return result;
  }, options);
}

/**
 * Batch retry - retry multiple operations independently
 * Returns partial results even if some fail
 *
 * @example
 * ```ts
 * const results = await batchRetry([
 *   () => fetch('/api/user'),
 *   () => fetch('/api/posts'),
 *   () => fetch('/api/comments')
 * ]);
 * ```
 */
export async function batchRetry<T>(
  operations: Array<() => Promise<T>>,
  options: RetryOptions = {}
): Promise<Array<{ success: boolean; data?: T; error?: Error }>> {
  const results = await Promise.allSettled(
    operations.map((op) => withRetry(op, options))
  );

  return results.map((result) => {
    if (result.status === "fulfilled") {
      return { success: true, data: result.value };
    } else {
      return { success: false, error: result.reason };
    }
  });
}
