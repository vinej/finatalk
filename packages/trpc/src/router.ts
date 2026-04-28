/**
 * @fileoverview Root tRPC router.
 *
 * Stitches the 14 sub-routers into `appRouter`. The `AppRouter` type is what
 * the web client imports (type-only) to get end-to-end type safety on every
 * procedure call.
 *
 * To add a router: create it under ./routers/, import it here, register it
 * on the createTRPCRouter call below — the frontend picks it up automatically.
 */
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
import { newsRouter } from "./routers/news";
import { ratesRouter } from "./routers/rates";
import { learningRouter } from "./routers/learning";
import { alertRouter } from "./routers/alert";

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
  news: newsRouter,
  rates: ratesRouter,
  learning: learningRouter,
  alert: alertRouter,
});

export type AppRouter = typeof appRouter;
