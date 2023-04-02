import { Motion, Presence } from "@motionone/solid";
import {
  createEffect,
  createRenderEffect,
  createSignal,
  For,
  onCleanup,
  onMount,
  Show,
  type VoidComponent,
} from "solid-js";
import { Match, Switch } from "solid-js";
import { A, type RouteDataArgs, useParams, useRouteData } from "solid-start";
import {
  createServerAction$,
  createServerData$,
  redirect,
} from "solid-start/server";
import { usePageState } from "~/Context/page-state";
import { prisma } from "~/server/db/client";
import { generateId } from "~/utils/generation_tools";

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
  const [pageState] = usePageState();
  const [showModal, setShowModal] = createSignal(false);
  const [blogId, setBlogId] = createSignal("");
  const [previewMode, setPreviewMode] = createSignal(false);
  const [postTitle, setPostTitle] = createSignal("");
  const [subtitle, setSubtitle] = createSignal("");
  const [contentText, setContentText] = createSignal("");
  const [errorMessage, setErrorMessage] = createSignal("");
  const [tags, setTags] = createSignal(["main"] as string[]);

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
      } catch (e) {
        console.log(e);
        throw Error("Error saving blog post");
      }
    }
  );

  const [posting, postBlog] = createServerAction$(async (params: {blogId: string, tags: string[]}) => {
    try {
      await prisma.blogPost.update({
        where: { blogId: params.blogId },
        data: { posted: true, tags: params.tags },
      });
      return true;
    } catch (e) {
      console.log(e);
      throw new Error("Error posting blog post");
    }
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
    if (!blogResponse()?.blogId) return;
    setPostTitle(blogResponse().title);
    setSubtitle(blogResponse().sub_heading);
    setContentText(blogResponse().content);
    setBlogId(blogResponse().blogId);
  });

  createEffect(() => {
    if(!showModal()) return;
    const tagInput = document.querySelector("#tag-input") as HTMLInputElement;
    if (!tagInput) return;
    const enterEvent = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        if (!tagInput) return;
        setTags(prev => [...prev, tagInput!.value]);
        tagInput.value = "";
      }
    }
    const backspaceEvent = (e: KeyboardEvent) => {
      if (e.key === "Backspace") {
        if (!tagInput) return;
        if (tagInput.value.length) return;
        setTags(tags().slice(0, tags().length - 1));
      }
    }
    tagInput.addEventListener("keydown", enterEvent);
    tagInput.addEventListener("keydown", backspaceEvent);
    onCleanup(() => {
      tagInput?.removeEventListener("keydown", enterEvent);
      tagInput?.removeEventListener("keydown", backspaceEvent);
    })
  });

  createEffect(() => {
    if (!saving.result) return;
    if (saving.error) {
      setErrorMessage("error saving post");
    }
  });

  const saveBlogHandler = async () => {
    try {
      if (!postTitle().length) {
        setErrorMessage("need to set a title");
        throw new Error("need to set a title");
      }
      if (!subtitle().length) {
        setErrorMessage("need to set a subtitle");
        throw new Error("need to set a subtitle");
      }
      if (!contentText().length) {
        setErrorMessage("bro write something");
        throw new Error("need to add content");
      }
      if (!blogId().length) setBlogId(generateId());
      await saveBlog({
        blogId: blogId(),
        title: postTitle(),
        subtitle: subtitle(),
        content: contentText(),
      });
    } catch (e) {
      setErrorMessage((e as Error).message);
      throw new Error((e as Error).message);
    }
  };

  const postBlogHandler = async () => {
    try {
      await saveBlogHandler();
      await postBlog({blogId: blogId(), tags: tags()});
    } catch (e) {
      setErrorMessage((e as Error).message);
    }
  };

  return (
    <div class="mt-4 flex min-h-[95vh] flex-col">
      <A href="/blog" class="absolute border-b-2 border-stone-900 text-2xl">
        Back
      </A>
      <div class="mt-16 flex flex-1 flex-col">
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
            <div
              class="mb-4 h-3/4 flex-1 resize-none rounded-md bg-stone-200 px-4 py-4 shadow-lg placeholder:text-stone-400 focus:outline-0"
              innerHTML={pageState.parser.parse(contentText())}
            />
          </Match>
        </Switch>
        <div class="flex flex-row items-center gap-2">
          <button
            onClick={saveBlogHandler}
            class="my-2 rounded-md bg-stone-300 px-6 py-2 text-2xl font-semibold shadow-md transition-colors duration-300 ease-in-out hover:bg-stone-400"
            disabled={saving.pending}
          >
            {saving.pending ? "Saving..." : "Save"}
          </button>
          <button
            onClick={() => setShowModal(true)}
            class="my-2 rounded-md bg-stone-300 px-6 py-2 text-2xl font-semibold shadow-md transition-colors duration-300 ease-in-out hover:bg-stone-400"
          >
            Post
          </button>
          <Show when={errorMessage().length}>
            <div class="text-center text-xl font-semibold text-rose-500">
              {errorMessage()}
            </div>
          </Show>
        </div>
      </div>
      <Presence>
        <Show when={showModal()}>
          <Motion.div
            animate={{ opacity: [0, 1] }}
            transition={{ duration: 0.75, easing: "ease-in-out" }}
            exit={{ opacity: [1, 0] }}
            class="fixed top-0 left-0 z-10 h-screen w-full overflow-hidden bg-stone-600 bg-opacity-20"
          >
            <div class="absolute top-1/3 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center justify-center rounded-md bg-stone-300 p-4">
              <h3 class="mb-6 text-3xl font-semibold">Post?</h3>
              <p class="mr-auto font-semibold text-xl">tags</p>
              <ul class="bg-stone-100 flex">
                <For each={tags()}>
                  {(tag) => (
                    <li class="flex gap-2 items-center p-1">
                      <span class="text-lg font-semibold bg-stone-300 p-1 rounded-md">{tag}</span>
                    </li>
                  )}
                  </For>
                <input id="tag-input" class="w-fit bg-stone-100 outline-none" />
              </ul>
              <div class="flex gap-6">
                <button
                  onClick={postBlogHandler}
                  class="my-2 rounded-md bg-stone-200 px-4 py-2 text-xl font-semibold shadow-md transition-colors duration-300 ease-in-out hover:bg-stone-300"
                >
                  {posting.pending ? "Posting..." : "Post"}
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  class="my-2 rounded-md bg-rose-300 px-4 py-2 text-xl font-semibold shadow-md transition-colors duration-300 ease-in-out hover:bg-rose-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </Motion.div>
        </Show>
      </Presence>
    </div>
  );
};

export default CreatePost;
