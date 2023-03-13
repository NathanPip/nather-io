import { procedure, router } from "../utils";
import { prisma } from "~/server/db/client";
import { z } from "zod";

export default router({
    password: procedure.input(z.string()).query(async ({ input }) => {
        const password = await prisma.password.findFirst();
        return { success: password?.password === input};
    }),
})