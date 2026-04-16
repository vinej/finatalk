import { createTRPCRouter } from "./trcp";
import { userRouter } from "./routers/user";
import { marketRouter } from "./routers/market";
import { analysisRouter } from "./routers/analysis";
import { aiRouter } from "./routers/ai";
import { portfolioRouter } from "./routers/portfolio";
import { researchRouter } from "./routers/research";

export const appRouter = createTRPCRouter({
  user: userRouter,
  market: marketRouter,
  analysis: analysisRouter,
  ai: aiRouter,
  portfolio: portfolioRouter,
  research: researchRouter,
});

export type AppRouter = typeof appRouter;
