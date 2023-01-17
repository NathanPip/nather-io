import { getProjectData } from "~/utils/githubUtils";
import { procedure, router } from "../utils";


export default router({
    projects: procedure.query(async () => {
        // const projects = await getProjectData();
        return "hello";
    }),
})