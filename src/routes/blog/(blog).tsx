import {
  type VoidComponent,
  Show,
  For,
  createEffect,
  createSignal,
  createMemo,
} from "solid-js";
import { A, useRouteData } from "solid-start";
import { createServerData$ } from "solid-start/server";
import { usePageState } from "~/Context/page-state";
import { prisma } from "~/server/db/client";

export function routeData() {
  return createServerData$(() => {
    return prisma.blogPost.findMany({
      take: 10,
      where: {
        posted: true,
      },
      orderBy: {
        created_at: "desc",
      },
      select: {
        title: true,
        sub_heading: true,
        authors: true,
        blogId: true,
        posted_at: true,
        updated_at: true,
        tags: true,
      },
    });
  });
}

const BlogHome: VoidComponent = () => {
  const [pageState] = usePageState();
  const postedPosts = useRouteData<typeof routeData>();
  const unpostedPosts = createServerData$(
    async ([admin]) => {
      if (!admin) return undefined;
      return await prisma.blogPost.findMany({
        take: 10,
        where: {
          posted: false,
        },
        orderBy: {
          created_at: "desc",
        },
        select: {
          title: true,
          sub_heading: true,
          authors: true,
          blogId: true,
          posted_at: true,
          updated_at: true,
          tags: true,
        },
      });
    },
    { key: () => [pageState.admin] }
  );
  const [filter, setFilter] = createSignal<
    "Most Recent" | "Software" | "Games" | "Unposted"
  >("Most Recent");
  const filteredPosts = createMemo(() => {
    console.log("filtering");
    console.log(unpostedPosts());
    if (filter() === "Most Recent") {
      return postedPosts();
    } else if (filter() === "Unposted") {
      console.log("unposted");
      return unpostedPosts();
    } else {
        return postedPosts()?.filter((post) => {
          return post.tags ? post.tags.includes(filter().toLowerCase()) : undefined;
        });
    }
  });
  createEffect(() => {
    console.log(filteredPosts());
  });

  return (
    <div class="mt-14">
      <h1 class="inline-block p-2 text-4xl">Blog</h1>
      <Show when={pageState.admin}>
        <A
          class="my-2 ml-4 inline rounded-md bg-stone-300 px-4 py-2 text-lg font-semibold shadow-md transition-colors duration-300 ease-in-out hover:bg-stone-400 lg:px-6 lg:text-xl"
          href="/blog/create"
        >
          Create Post
        </A>
      </Show>
      <div class="ml-2 mt-6 -mb-4 flex gap-1">
        <button
          onClick={(e) => setFilter("Most Recent")}
          class={`rounded-t-md py-1 px-4 pb-5 text-lg shadow-[0_0px_6px_0px_rgba(28,25,23,0.1)] transition-all duration-300 ease-in-out hover:-translate-y-2 hover:bg-stone-300 ${
            filter() === "Most Recent" ? "-translate-y-2 bg-stone-300" : ""
          }`}
        >
          Most Recent
        </button>
        <button
          onClick={(e) => setFilter("Software")}
          class={`rounded-t-md py-1 px-4 pb-5 text-lg shadow-[0_0px_6px_0px_rgba(28,25,23,0.1)] transition-all duration-300 ease-in-out hover:-translate-y-2 hover:bg-stone-300 ${
            filter() === "Software" ? "-translate-y-2 bg-stone-300" : ""
          }`}
        >
          Software
        </button>
        <button
          onClick={(e) => setFilter("Games")}
          class={`rounded-t-md py-1 px-4 pb-5 text-lg shadow-[0_0px_6px_0px_rgba(28,25,23,0.1)] transition-all duration-300 ease-in-out hover:-translate-y-2 hover:bg-stone-300 ${
            filter() === "Games" ? "-translate-y-2 bg-stone-300" : ""
          }`}
        >
          Games
        </button>
        <Show when={pageState.admin}>
          <button
            onClick={(e) => setFilter("Unposted")}
            class={`rounded-t-md py-1 px-4 pb-5 text-lg shadow-[0_0px_6px_0px_rgba(28,25,23,0.1)] transition-all duration-300 ease-in-out hover:-translate-y-2 hover:bg-stone-300 ${
              filter() === "Unposted" ? "-translate-y-2 bg-stone-300" : ""
            }`}
          >
            Unposted
          </button>
        </Show>
      </div>
      <div class="relative flex flex-col gap-2 rounded-md bg-stone-300 bg-opacity-100 py-2 shadow-lg p-2">
        <Show
          when={filteredPosts() !== undefined && filteredPosts()?.length}
          fallback={<h2 class="text-center text-2xl">No Posts Here</h2>}
        >
          <For each={filteredPosts()}>
            {(post) => {
              return (
                <A
                  class="z-10 flex items-center rounded-md bg-stone-200 px-4 py-2 shadow-lg"
                  href={`/blog/${post.blogId}`}
                >
                  <div class="flex flex-col gap-1">
                    <span class="w-full text-2xl font-semibold">
                      {post.title}
                    </span>{" "}
                    <span class="text-lg">{post.sub_heading}</span>{" "}
                  </div>
                  <Show when={pageState.admin}>
                    <A
                      class="ml-auto rounded-md bg-stone-300 px-3 py-1 text-lg transition-colors duration-300 ease-in-out hover:bg-stone-400"
                      href={`/blog/create/${post.blogId}`}
                    >
                      Edit
                    </A>
                  </Show>
                </A>
              );
            }}
          </For>
        </Show>
      </div>
    </div>
  );
};

export default BlogHome;
