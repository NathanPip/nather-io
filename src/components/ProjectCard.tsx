import { Motion } from "@motionone/solid";
import { type Project } from "@prisma/client";
import { type Component, createMemo, For } from "solid-js";

const ProjectCard: Component<{ project: Project }> = (props) => {
  const tags = createMemo(() => JSON.parse(props.project.tags) as string[]);

  return (
    <Motion.div
      class="relative mb-6 bg-stone-300 p-4 shadow-lg"
      animate={{ opacity: [0, 1] }}
      initial={{ opacity: 0 }}
      exit={{ opacity: [1, 0] }}
    >
      <a
        class="text-lg font-semibold hover:underline lg:text-2xl"
        href={`https://github.com/${props.project.full_name}`}
      >
        {props.project.name}
      </a>
      <p class="mb-4 mt-2 lg:text-lg">{props.project.description}</p>
      {props.project.stars > 0 ? (
        <div class="absolute top-0 right-0 m-4 flex items-center lg:text-xl font-semibold">
          <img class="w-4 h-4 lg:h-6 lg:w-6 mr-1" src="/star-icon.svg"/> {props.project.stars}
        </div>
      ) : (
        ""
      )}{" "}
      <a
        class="mr-2 rounded-md border-[1px] border-stone-900 bg-stone-300 p-2 font-semibold shadow-md transition-colors hover:bg-stone-400 lg:text-lg"
        href={`https://github.com/${props.project.full_name}`}
      >
        Github
      </a>
      {props.project.website.length ? (
        <a
          class="mr-2 rounded-md border-[1px] border-stone-900 bg-stone-300 p-2 font-semibold shadow-md transition-colors hover:bg-stone-400 lg:text-lg"
          href={props.project.website}
        >
          Live Site
        </a>
      ) : (
        ""
      )}
      <ul class="absolute bottom-0 right-0 m-2 hidden lg:flex">
        <For each={tags()}>
          {(tag) => (
            <li class="mr-2 rounded-md bg-stone-300 px-2 shadow-md lg:text-lg">
              {tag}
            </li>
          )}
        </For>
      </ul>
    </Motion.div>
  );
};

export default ProjectCard;
