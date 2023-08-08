import { Motion } from "@motionone/solid";
import { A } from "@solidjs/router";
import { type Component } from "solid-js";
import { usePageState } from "~/Context/page-state";

const HomePage: Component = () => {
  const [pageState] = usePageState();

  return (
    <div class="flex h-screen flex-col py-12 max-w-7xl mx-auto">
      <div class="mt-4 flex flex-col lg:mt-12 lg:flex-row">
        <Motion.h1
          animate={{ y: ["-150%", 0] }}
          transition={{ duration: 1, easing: "ease-in-out" }}
          class="h-fit w-fit -translate-y-[150%] rounded-tr-md border-r-2 border-t-2 border-black p-2 text-6xl lg:text-9xl"
        >
          <Motion.div
            animate={{ opacity: [0, 1] }}
            transition={{ duration: 1, delay: 2, easing: "ease-in-out" }}
            class="opacity-0"
          >
            <span>Nathan Piper </span>
            <span class="mt-6 block text-3xl lg:ml-3 lg:text-4xl">
              Web Wizard and Software Generalist
            </span>
            <span class="mt-2 block text-sm lg:ml-4 lg:text-2xl">
              Oh and I make video games too
            </span>
          </Motion.div>
        </Motion.h1>
        <Motion.ul class="mx-6 mt-4 flex flex-1 flex-col gap-4 text-2xl">
          <Motion.li
            animate={{ x: ["-500%", 0] }}
            transition={{
              duration: 1.75,
              delay: 0,
              easing: [0.25, 0.4, 0.54, 1.15],
            }}
            class="translate-x-[-500%] border-b-2 border-stone-900 pb-2"
          >
            <Motion.div animate={{opacity: [0,1]}} transition={{duration: 1, delay: 2, easing: "ease-in-out"}}>
              <A href="/blog" class="w-full block hover:translate-x-3 transition-transform">Blog</A>
            </Motion.div>
          </Motion.li>
          <Motion.li
            animate={{ x: ["-500%", 0] }}
            transition={{
              duration: 1.75,
              delay: 0.05,
              easing: [0.25, 0.4, 0.54, 1.15],
            }}
            class="translate-x-[-500%] border-b-2 border-stone-900 pb-2"
          >
            <Motion.div animate={{opacity: [0,1]}} transition={{duration: 1, delay: 2.05, easing: "ease-in-out"}}>
              <A href="/portfolio" class="w-full block hover:translate-x-3 transition-transform">Portfolio</A>
            </Motion.div>
          </Motion.li>
          <Motion.li
            animate={{ x: ["-500%", 0] }}
            transition={{
              duration: 1.75,
              delay: 0.15,
              easing: [0.25, 0.4, 0.54, 1.15],
            }}
            class="translate-x-[-500%] border-b-2 border-stone-900 pb-2"
          >
            <Motion.div animate={{opacity: [0,1]}} transition={{duration: 1, delay: 2.15, easing: "ease-in-out"}}>
              <A href="/games" class="w-full block hover:translate-x-3 transition-transform">Games</A>
            </Motion.div>
          </Motion.li>
          <Motion.li
            animate={{ x: ["-500%", 0] }}
            transition={{
              duration: 1.75,
              delay: 0.1,
              easing: [0.25, 0.4, 0.54, 1.15],
            }}
            class="translate-x-[-500%] border-b-2 border-stone-900 pb-2"
          >
            <Motion.div animate={{opacity: [0,1]}} transition={{duration: 1, delay: 2.1, easing: "ease-in-out"}}>
              <A href="/github" class="w-full block hover:translate-x-3 transition-transform">Github</A>
            </Motion.div>
          </Motion.li>
        </Motion.ul>
      </div>
      <Motion.p
        animate={{ opacity: [0, 1] }}
        transition={{ duration: 1, delay: 1, easing: "ease-in-out" }}
        class={`mt-auto text-center text-xl font-semibold transition-opacity lg:text-3xl opacity-0 ${
          pageState.scrollY > 20
            ? "animate-out fade-out fill-mode-forwards"
            : "animate-pulse"
        } `}
      >
        scroll down
      </Motion.p>
    </div>
  );
};

export default HomePage;
