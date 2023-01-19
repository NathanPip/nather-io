import { t } from "../utils";
import exampleRouter from "./example";
import githubRouter from "./github";
import emailRouter from "./node-mailer"

export const appRouter = t.mergeRouters(exampleRouter, githubRouter, emailRouter);

export type IAppRouter = typeof appRouter;
