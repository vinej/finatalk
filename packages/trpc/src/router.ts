import { createTRPCRouter } from "./trcp";
import { userRouter } from "./routers/user";
import { marketRouter } from "./routers/market";

export const appRouter = createTRPCRouter({
  user: userRouter,
  market: marketRouter,
});

export type AppRouter = typeof appRouter;
