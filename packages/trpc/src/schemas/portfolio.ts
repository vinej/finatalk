import { z } from "zod";
import { SymbolSchema } from "./indicator";

export const CurrencySchema = z.enum(["USD", "CAD"]);
export type Currency = z.infer<typeof CurrencySchema>;

export const PortfolioTitleSchema = z.string().trim().min(1).max(120);

export const HoldingInputSchema = z.object({
  symbol: SymbolSchema,
  quantity: z.number().positive(),
  costBasis: z.number().nonnegative(),
  purchaseDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Expected YYYY-MM-DD"),
});
export type HoldingInput = z.infer<typeof HoldingInputSchema>;
