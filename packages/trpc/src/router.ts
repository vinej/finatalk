import { createTRPCRouter } from "./trcp";
import { userRouter } from "./routers/user";
import { marketRouter } from "./routers/market";
import { analysisRouter } from "./routers/analysis";
import { aiRouter } from "./routers/ai";

export const appRouter = createTRPCRouter({
  user: userRouter,
  market: marketRouter,
  analysis: analysisRouter,
  ai: aiRouter,
});

export type AppRouter = typeof appRouter;
