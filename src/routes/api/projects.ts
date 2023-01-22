import { json } from "solid-start";
import { getProjectData } from "~/server/utils/githubUtils";

export const GET = async () => {
    try {
        await getProjectData();
        return json({message: "success"})
    } catch (e) {
        console.log(e);
    }
}