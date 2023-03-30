import { type BlogPost } from "@prisma/client";
import {
  createEffect,
  createRenderEffect,
  createSignal,
  onMount,
  type VoidComponent,
} from "solid-js";
import { Match, Switch } from "solid-js";
import {
  A,
  type RouteDataArgs,
  useParams,
  useRouteData,
  useServerContext,
} from "solid-start";
import {
  createServerAction$,
  createServerData$,
  redirect,
} from "solid-start/server";
import { prisma } from "~/server/db/client";
import { generateId } from "~/utils/generation_tools";
import { MarkdownParser } from "~/utils/markdown";

export function routeData({ params }: RouteDataArgs) {
  return createServerData$(
    async ([id]) => {
      if (!id) return undefined;
      try {
        const post = await prisma.blogPost.findUnique({
          where: { blogId: id },
        });
        console.log(post);
        if (!post) return redirect("/blog/create");
        return post;
      } catch (e) {
        console.log(e);
        throw Error("Error retrieving blog post");
      }
    },
    { key: () => [params.blogId] }
  );
}

const CreatePost: VoidComponent = () => {
  const blogResponse = useRouteData<typeof routeData>();
  const [blogId, setBlogId] = createSignal("");
  const [previewMode, setPreviewMode] = createSignal(false);
  const [postTitle, setPostTitle] = createSignal("");
  const [subtitle, setSubtitle] = createSignal("");
  const [contentText, setContentText] = createSignal("");
  const [errorMessage, setErrorMessage] = createSignal("");

  const [saving, saveBlog] = createServerAction$(
    async (blogData: {
      blogId: string;
      title: string;
      subtitle: string;
      content: string;
    }) => {
      try {
        await prisma.blogPost.upsert({
          where: { blogId: blogData.blogId },
          update: {
            title: blogData.title,
            sub_heading: blogData.subtitle,
            content: blogData.content,
          },
          create: {
            blogId: blogData.blogId,
            title: blogData.title,
            sub_heading: blogData.subtitle,
            content: blogData.content,
            posted: false,
            authors: ["Nathan Piper"],
          },
        });
      } catch (e: any) {
        console.log(e);
        throw Error("Error saving blog post");
      }
    }
  );

  const markdownParser = new MarkdownParser({
    baseExpression: { tag: "p", attributes: { class: "text-lg" } },
    heading1: {
      tag: "h2",
      attributes: { class: "text-3xl font-semibold mb-4" },
    },
    heading2: {
      tag: "h3",
      attributes: { class: "text-2xl font-semibold mb-2" },
    },
    heading3: {
      tag: "h4",
      attributes: { class: "text-xl font-semibold mb-2" },
    },
    unordered_list: { tag: "ul", attributes: { class: "my-2 list-disc pl-5" } },
    list_item: { tag: "li", attributes: { class: "text-lg" } },
    link: { tag: "a", attributes: { class: "underline text-sky-500" } },
  });

  onMount(() => {
    const id = useParams().blogId;
    if (!id) {
      setBlogId(generateId());
    } else {
      const storedPost = localStorage.getItem(id);
      if (storedPost) {
        const parsedPost = JSON.parse(storedPost);
        setPostTitle(parsedPost.title);
        setSubtitle(parsedPost.subtitle);
        setContentText(parsedPost.content);
        setBlogId(id);
      }
    }
    setInterval(() => {
      if (!postTitle().length && !subtitle().length && !contentText().length)
        return;
      localStorage.setItem(
        blogId(),
        JSON.stringify({
          title: postTitle(),
          subtitle: subtitle(),
          content: contentText(),
        })
      );
    }, 10000);
  });

  createRenderEffect(() => {
    if (blogResponse() === undefined || blogResponse() === null) return;
    setPostTitle(blogResponse().title);
    setSubtitle(blogResponse().sub_heading);
    setContentText(blogResponse().content);
    setBlogId(blogResponse().blogId);
  });

  createEffect(() => {
    if (!saving.result) return;
    if (saving.error) {
      setErrorMessage("error saving post");
    }
  });

  const saveBlogHandler = () => {
    if (!postTitle().length) {
      setErrorMessage("need to set a title");
      return;
    }
    if (!subtitle().length) {
      setErrorMessage("need to set a subtitle");
      return;
    }
    if (!contentText().length) {
      setErrorMessage("bro write something");
      return;
    }
    if (!blogId().length) setBlogId(generateId());
    saveBlog({
      blogId: blogId(),
      title: postTitle(),
      subtitle: subtitle(),
      content: contentText(),
    });
  };

  return (
    <div class="mt-4 flex min-h-[95vh] flex-col">
      <A href="/blog" class="absolute border-b-2 border-stone-900 text-2xl">
        Back
      </A>
      <div class="ml-auto mt-8 flex flex-row justify-end gap-2">
        <button
          onClick={saveBlogHandler}
          class="my-2 rounded-md bg-stone-300 px-4 font-semibold shadow-md transition-colors duration-300 ease-in-out hover:bg-stone-400 lg:px-6 lg:py-2 lg:text-xl"
          disabled={saving.pending}
        >
          {saving.pending ? "Saving..." : "Save"}
        </button>
        <button class="my-2 rounded-md bg-stone-300 px-4 font-semibold shadow-md transition-colors duration-300 ease-in-out hover:bg-stone-400 lg:px-6 lg:py-2 lg:text-xl">
          Post
        </button>
      </div>
      <div class="flex flex-1 flex-col">
        <div class="ml-4 flex gap-2">
          <button
            onClick={() => (previewMode() ? setPreviewMode(false) : null)}
            class={`relative -mb-2 rounded-t-md py-1 px-4 pb-3 text-lg shadow-[0_0px_6px_0px_rgba(28,25,23,0.1)] transition-all duration-300 ease-in-out hover:-translate-y-2 hover:bg-stone-300 ${
              !previewMode() && "-translate-y-2 bg-stone-300"
            }`}
          >
            Edit
          </button>
          <button
            onClick={() => {
              console.log("called");
              !previewMode() ? setPreviewMode(true) : null;
            }}
            class={`relative -mb-2 rounded-t-md py-1 px-4 pb-3 text-lg shadow-[0_0px_6px_0px_rgba(28,25,23,0.1)] transition-all duration-300 ease-in-out hover:-translate-y-2 hover:bg-stone-300 ${
              previewMode() && "-translate-y-2 bg-stone-300"
            }`}
          >
            Preview
          </button>
        </div>
        <Switch>
          <Match when={!previewMode()}>
            <input
              class=" z-10 mb-2 flex h-14 items-center overflow-visible rounded-md bg-stone-200 px-4 text-3xl text-stone-900 shadow-md placeholder:text-stone-400 focus:outline-0"
              placeholder="Title"
              onChange={(e) => setPostTitle(e.currentTarget.value)}
              value={postTitle()}
            />
            <input
              class=" z-10 mb-4 flex h-8 items-center overflow-visible rounded-md bg-stone-200 px-4 text-xl text-stone-900 shadow-md placeholder:text-stone-400 focus:outline-0"
              placeholder="And don't forget the subtitle"
              onChange={(e) => setSubtitle(e.currentTarget.value)}
              value={subtitle()}
            />
            <textarea
              onChange={(e) => {
                setContentText(e.currentTarget.value);
              }}
              value={contentText()}
              class="mb-4 h-3/4 flex-1 resize-none rounded-md bg-stone-200 px-4 py-4 shadow-lg placeholder:text-stone-400 focus:outline-0"
              placeholder="type something"
            />
          </Match>
          <Match when={previewMode()}>
            <h1
              class={`z-10 mb-2 flex h-14 items-center rounded-md bg-stone-200 px-4 text-3xl text-stone-900 shadow-md ${
                postTitle() ? "text-stone-900" : "text-stone-400"
              }`}
            >
              {postTitle().length ? postTitle() : "Waiting on a Title Buddy"}
            </h1>
            <h2
              class={`z-10 mb-4 flex h-8 items-center rounded-md bg-stone-200 px-4 text-xl text-stone-900 shadow-md ${
                subtitle() ? "text-stone-900" : "text-stone-400"
              }`}
            >
              {subtitle().length
                ? subtitle()
                : "Waiting on a Subtitle Title Pal"}
            </h2>
            <div innerHTML={markdownParser.parse(contentText())} />
          </Match>
        </Switch>
      </div>
    </div>
  );
};

export default CreatePost;
