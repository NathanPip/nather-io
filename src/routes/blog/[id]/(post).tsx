import { createEffect, Show, type VoidComponent } from "solid-js";
import { useParams } from "solid-start";
import { createServerData$ } from "solid-start/server";
import { usePageState } from "~/Context/page-state";
import { prisma } from "~/server/db/client";

// export function routeData({ params }: RouteDataArgs) {
//   return createServerData$(
//     async ([id]) => {
//       try {
//         const post = await prisma.blogPost.findUnique({
//           where: {
//             blogId: id,
//           },
//         });
//         console.log("post found")
//         console.log(post);
//         if (!post) return undefined;
//         return post;
//       } catch (e) {
//         console.log(e);
//         return undefined;
//       }
//     },
//     { key: () => [params.id] }
//   );
// }

const BlogPost: VoidComponent = () => {
  // const post = useRouteData<typeof routeData>();
  const [pageState] = usePageState();
  const post = createServerData$(
    async ([id]) => {
      try {
        const post = await prisma.blogPost.findUnique({
          where: {
            blogId: id,
          },
        });
        console.log("post found")
        console.log(post);
        if (!post) return undefined;
        return post;
      } catch (e) {
        console.log(e);
        return undefined;
      }
    },
    { key: () => [useParams().id] }
  );
  createEffect(() => {
    console.log(post());
    console.log(post.loading);
  })
  return (
    <Show when={!post.loading}>
      <Show when={post() == undefined}>
        <div class="mt-16">Post not found</div>
      </Show>
      <Show when={post() != undefined}>
        <div class="mt-16 min-h-[85vh] flex flex-col">
          <h1 class="z-10 mb-2 flex h-14 items-center rounded-md bg-stone-200 px-4 text-3xl text-stone-900 shadow-md">{post()?.title}</h1>
          <h2 class="z-10 mb-4 flex h-8 items-center rounded-md bg-stone-200 px-4 text-xl text-stone-900 shadow-md">{post()?.sub_heading}</h2>
          <div class="mb-4 h-3/4 flex-1 resize-none rounded-md bg-stone-200 px-4 py-4 shadow-lg" innerHTML={pageState.parser.parse(post().content)}/>
        </div>
      </Show>
    </Show>
  );
};

export default BlogPost;
