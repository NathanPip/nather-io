import { type Project } from "@prisma/client";

const ProjectCard = (props: { project: Project }) => {
  return (
    <div class="mb-6 bg-stone-300 shadow-lg relative p-4">
      <h3 class="font-semibold text-lg mb-2">{props.project.name}</h3>
      <p class="mb-4">{props.project.description}</p>
      {props.project.stars > 0 ? (
        <div class="absolute top-0 right-0 m-4">
          Stars {props.project.stars}
        </div>
      ) : (
        ""
      )}{" "}
      <a
        class="mr-2 bg-stone-300 shadow-md p-2 rounded-md"
        href={`https://github.com/${props.project.full_name}`}
      >
        Github
      </a>
      {props.project.website.length ? (
        <a
          class="mr-2 bg-stone-300 shadow-md p-2 rounded-md"
          href={props.project.website}
        >
          Live Site
        </a>
      ) : (
        ""
      )}
    </div>
  );
};

export default ProjectCard;
