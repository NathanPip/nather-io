import { type Project } from "@prisma/client";
import { createMemo } from "solid-js";
import { json } from "solid-start";

const ProjectCard = (props: { project: Project }) => {

  const createTags = createMemo(() => {
    const tags = JSON.parse(props.project.tags);
    return tags.map((tag: string) => {
      return (
        <li class="mr-2 bg-stone-300 shadow-md px-2 md:text-lg rounded-md">
          {tag}
        </li>
      );
    });
  })

  return (
    <div class="mb-6 bg-stone-300 shadow-lg relative p-4">
      <h3 class="font-semibold text-lg mb-2 md:text-2xl">{props.project.name}</h3>
      <p class="mb-4 md:text-lg">{props.project.description}</p>
      {props.project.stars > 0 ? (
        <div class="absolute top-0 right-0 m-4">
          Stars {props.project.stars}
        </div>
      ) : (
        ""
      )}{" "}
      <a
        class="mr-2 bg-stone-300 shadow-md p-2 md:text-lg rounded-md border-[1px] border-stone-900" 
        href={`https://github.com/${props.project.full_name}`}
      >
        Github
      </a>
      {props.project.website.length ? (
        <a
          class="mr-2 bg-stone-300 shadow-md p-2 md:text-lg rounded-md border-[1px] border-stone-900"
          href={props.project.website}
        >
          Live Site
        </a>
      ) : (
        ""
      )}
      <ul class="hidden lg:flex absolute bottom-0 right-0 m-2">
        {createTags()}
      </ul>
    </div>
  );
};

export default ProjectCard;
