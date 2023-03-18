import { type VoidComponent, Show, For, createEffect } from "solid-js";
import { A, useRouteData } from "solid-start";
import { createServerData$ } from "solid-start/server";
import { usePageState } from "~/Context/page-state";
import {prisma} from "~/server/db/client"

export function routeData() {
    return createServerData$(() => {
        return prisma.blogPost.findMany({
            take: 10,
            orderBy: {
                created_at: "desc"
            },
            select: {
                title: true,
                sub_heading: true,
                authors: true,
                posted_at:  true,
                updated_at: true,
            }
        })
    })
}


const BlogHome: VoidComponent = () => {
    const posts = useRouteData<typeof routeData>();
    const [pageState] = usePageState();

    createEffect(() => {
        console.log(posts());
    })

    return (
        <div class="mt-14">
            <h1 class="text-4xl p-2 inline-block">Blog</h1>
            <Show when={pageState.admin}>
                <A class="inline my-2 ml-4 rounded-md bg-stone-300 px-4 font-semibold shadow-md transition-colors duration-300 ease-in-out hover:bg-stone-400 lg:px-6 lg:py-2 lg:text-lg" href="/blog/create">Create Post</A>
            </Show>
            <Show when={posts() !== undefined && posts()!.length} fallback={
                <p>No Posts Here</p>
            }>
                <For each={posts()}>
                    {(post) => {
                        return <p>{post.title}</p>
                    }}
                </For>
            </Show>
        </div>
    )
}

export default BlogHome;