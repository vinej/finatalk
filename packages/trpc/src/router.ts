import { createTRPCRouter } from "./trcp";
import { userRouter } from "./routers/user";
import { marketRouter } from "./routers/market";
import { analysisRouter } from "./routers/analysis";
import { aiRouter } from "./routers/ai";
import { portfolioRouter } from "./routers/portfolio";
import { researchRouter } from "./routers/research";
import { notificationRouter } from "./routers/notification";
import { watchlistRouter } from "./routers/watchlist";
import { screenerRouter } from "./routers/screener";
import { templateRouter } from "./routers/template";

export const appRouter = createTRPCRouter({
  user: userRouter,
  market: marketRouter,
  analysis: analysisRouter,
  ai: aiRouter,
  portfolio: portfolioRouter,
  research: researchRouter,
  notification: notificationRouter,
  watchlist: watchlistRouter,
  screener: screenerRouter,
  template: templateRouter,
});

export type AppRouter = typeof appRouter;
