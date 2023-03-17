import { type VoidComponent, Show, For, createEffect } from "solid-js";
import { useRouteData } from "solid-start";
import { createServerData$ } from "solid-start/server";
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

    createEffect(() => {
        console.log(posts());
    })

    return (
        <div class="mt-14">
            <h1 class="text-3xl p-2">Blog</h1>
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