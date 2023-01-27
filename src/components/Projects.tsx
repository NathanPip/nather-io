import { type Component, createSignal, For, Switch, Match, createEffect } from "solid-js";
import ProjectCard from "./ProjectCard";
import { trpc } from "~/utils/trpc";

const Projects: Component = () => {
  const projects = trpc.projects.useQuery();

  //signals
  const [selectedFilter, setSelectedFilter] = createSignal<
    "featured" | "github" | "oss"
  >("featured");

  const featuredClickHandler = (e: MouseEvent) => {
    const element = e.target as HTMLButtonElement;
    const name = element.innerText.toLowerCase();
    setSelectedFilter(name as "featured" | "github" | "oss");
  };

  // tailwind styles
  const projectFilterButtonStyles =
    "mx-2 font-semibold mb-2 bg-stone-300 shadow-md px-2 rounded-md lg:text-xl lg:px-4 lg:py-2 hover:bg-stone-400 transition-colors duration-300 ease-in-out";
  const projectFilterButtonSelectedStyles = "bg-stone-400";

  return (
    <div class="mb-10 projects">
      <div class="flex">
        <h1 class="mb-2 text-2xl font-semibold lg:text-4xl">Projects</h1>
        <div class="ml-auto mt-auto flex justify-around">
          <button
            class={`${projectFilterButtonStyles} ${
              selectedFilter() === "featured"
                ? projectFilterButtonSelectedStyles
                : ""
            }`}
            onClick={featuredClickHandler}
          >
            Featured
          </button>
          <button
            class={`${projectFilterButtonStyles} ${
              selectedFilter() === "github"
                ? projectFilterButtonSelectedStyles
                : ""
            }`}
            onClick={featuredClickHandler}
          >
            Github
          </button>
          <button
            class={`${projectFilterButtonStyles} ${
              selectedFilter() === "oss"
                ? projectFilterButtonSelectedStyles
                : ""
            }`}
            onClick={featuredClickHandler}
          >
            OSS
          </button>
        </div>
      </div>
      <div class="scrollbar-rounded-lg max-h-screen md:max-h-[75vh] overflow-y-scroll p-2 px-4 shadow-inner scrollbar-thin scrollbar-thumb-stone-900">
        <Switch>
          <Match when={projects.isLoading}>
            <h3 class="font-semibold text-xl">loading...</h3>
          </Match>
          <Match when={projects.isError}>
            <p class="font-semibold text-xl">An error has occured while retrieving projects</p>
          </Match>
          <Match when={projects.isSuccess && projects.data}>
            <Switch>
              <Match when={selectedFilter() === "featured"}>
                <For
                  each={projects
                    .data!.filter((project) => project.featured)
                    .sort((a, b) => {
                      const dateA = new Date(a.updated_at).valueOf();
                      const dateB = new Date(b.updated_at).valueOf();
                      return dateA - dateB;
                    })}
                >
                  {(project) => <ProjectCard project={project} />}
                </For>
              </Match>
              <Match when={selectedFilter() === "github"}>
                <For
                  each={projects
                    .data!.filter((project) => !project.fork)
                    .sort((a, b) => {
                      const dateA = new Date(a.updated_at).valueOf();
                      const dateB = new Date(b.updated_at).valueOf();
                      const value1 = dateA * 0.000000006 + a.commit_count * 0.5;
                      const value2 = dateB * 0.000000006 + b.commit_count * 0.5;
                      return value2 - value1;
                    })}
                >
                  {(project) => <ProjectCard project={project} />}
                </For>
              </Match>
              <Match when={selectedFilter() === "oss"}>
                <For each={projects.data!.filter((project) => project.fork)}>
                  {(project) => <ProjectCard project={project} />}
                </For>
              </Match>
            </Switch>
          </Match>
        </Switch>
      </div>
    </div>
  );
};

export default Projects;
