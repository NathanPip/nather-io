import { Show, type VoidComponent } from "solid-js";
import { useRouteData } from "solid-start";
import { createServerData$ } from "solid-start/server";
import { prisma } from "~/server/db/client";
import Projects from "~/components/Projects";

export function routeData() {
    return createServerData$(async () => {
        const projects = await prisma.project.findMany();
        return projects;
    })
}

const GithubPage: VoidComponent = () => {
    const projects = useRouteData<typeof routeData>();
    return (
        <div class="mt-16 min-h-[85vh]">
            <Show when={projects() !== undefined}>
                <Projects projects={projects()} />
            </Show>
        </div>
    )
}

export default GithubPage;