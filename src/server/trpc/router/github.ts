import { procedure, router } from "../utils";
import { prisma } from "~/server/db/client";

export default router({
    projects: procedure.query(async () => {
        const projects = await prisma.project.findMany();
        return projects;
    }),
})