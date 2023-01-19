import { createMemo, createSignal } from "solid-js";
import { trpc } from "~/utils/trpc";
import ProjectCard from "./ProjectCard";

const Projects = () => {
  const projectsRes = trpc.projects.useQuery();

  //signals
  const [selectedFilter, setSelectedFilter] = createSignal<"featured" | "github" | "oss">("featured");
  const featuredClickHandler = (e:MouseEvent) => {
    const element = e.target as HTMLButtonElement;
    const name = element.innerText.toLowerCase();
    setSelectedFilter(name as "featured" | "github" | "oss");
  }

  // memos
  const displayedProjects = createMemo(() => {
    if(selectedFilter() === "featured") {
    }
  })

  // tailwind styles
  const projectFilterButtonStyles = "mx-2 font-semibold mb-2 bg-stone-300 shadow-md px-2 rounded-md"
  const projectFilterButtonSelectedStyles = "bg-stone-400"

  return (
    <div>
      <div class="flex">
        <h1 class="text-2xl font-semibold mb-2">Projects</h1>
        <div class="ml-auto mt-auto flex justify-around">
          <button class={`${projectFilterButtonStyles} ${selectedFilter() === "featured" ? projectFilterButtonSelectedStyles : ""}`}
            onClick={featuredClickHandler}
          >
            Featured
          </button>
          <button class={`${projectFilterButtonStyles} ${selectedFilter() === "github" ? projectFilterButtonSelectedStyles : ""}`}
            onClick={featuredClickHandler}
          >
            Github
          </button>
          <button class={`${projectFilterButtonStyles} ${selectedFilter() === "oss" ? projectFilterButtonSelectedStyles : ""}`}
            onClick={featuredClickHandler}
          >
            OSS
          </button>
        </div>
      </div>
      <div class="overflow-y-scroll h-screen shadow-inner p-2">
        {projectsRes.isLoading ? (
          <p>loading...</p>
        ) : (
          <>
            {projectsRes.data
              ?.filter((project) => !project.fork)
              ?.sort((a, b) => {
                const dateA = new Date(a.updated_at).valueOf();
                const dateB = new Date(b.updated_at).valueOf();
                const value1 = dateA * 0.000000006 + a.commit_count * 0.5;
                const value2 = dateB * 0.000000006 + b.commit_count * 0.5;
                return value2 - value1;
              })
              .map((project) => (
                <ProjectCard project={project} />
              ))}
          </>
        )}
      </div>
    </div>
  );
};

export default Projects;
