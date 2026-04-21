import { z } from "zod";

export const IdInput = z.object({ id: z.string() });
export const UuidIdInput = z.object({ id: z.string().uuid() });
export const IdsInput = z.object({ ids: z.array(z.string()).min(1).max(500) });
export const IdsWithEnabledInput = z.object({
  ids: z.array(z.string()).min(1).max(500),
  enabled: z.boolean(),
});
export const IdWithEnabledInput = z.object({ id: z.string(), enabled: z.boolean() });
