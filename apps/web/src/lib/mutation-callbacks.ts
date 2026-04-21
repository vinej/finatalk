import { toast } from "sonner";

type InvalidateTarget = { invalidate: () => Promise<void> };

export type MutationCallbackOptions<TData, TVariables> = {
  invalidate?: InvalidateTarget[];
  successMessage?: string | ((data: TData, variables: TVariables) => string);
  errorMessage?: string | ((err: unknown) => string);
  onSuccess?: (data: TData, variables: TVariables) => void | Promise<void>;
  onError?: (err: unknown, variables: TVariables) => void;
};

export function buildMutationCallbacks<TData, TVariables>(
  opts: MutationCallbackOptions<TData, TVariables>,
): {
  onSuccess: (data: TData, variables: TVariables) => Promise<void>;
  onError: (err: unknown, variables: TVariables) => void;
} {
  return {
    async onSuccess(data, variables) {
      if (opts.invalidate?.length) {
        await Promise.all(opts.invalidate.map((u) => u.invalidate()));
      }
      if (opts.successMessage) {
        const msg =
          typeof opts.successMessage === "function"
            ? opts.successMessage(data, variables)
            : opts.successMessage;
        toast.success(msg);
      }
      await opts.onSuccess?.(data, variables);
    },
    onError(err, variables) {
      if (opts.errorMessage) {
        const msg =
          typeof opts.errorMessage === "function"
            ? opts.errorMessage(err)
            : opts.errorMessage;
        toast.error(msg);
      } else {
        const fallback = err instanceof Error ? err.message : String(err);
        toast.error(fallback);
      }
      opts.onError?.(err, variables);
    },
  };
}
