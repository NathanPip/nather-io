import { t } from "../utils";
import githubRouter from "./github";
import emailRouter from "./node-mailer"
import passwordRouter from "./password";

export const appRouter = t.mergeRouters(githubRouter, emailRouter, passwordRouter);

export type IAppRouter = typeof appRouter;
