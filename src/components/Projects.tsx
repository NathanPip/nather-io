import { trpc } from "~/utils/trpc";
import ProjectCard from "./ProjectCard";

const Projects = () => {
  const projectsRes = trpc.projects.useQuery();

  return (
    <div>
      <h1>Projects</h1>
      <div class="overflow-y-scroll h-screen">
        {projectsRes.isLoading ? (
          <p>loading...</p>
        ) : (
          <>
            {projectsRes.data?.filter((project) => !project.fork)
              ?.sort((a, b) => {
                const dateA = new Date(a.updated_at).valueOf();
                const dateB = new Date(b.updated_at).valueOf();
                return (dateB - dateA);
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
