import { Motion } from "@motionone/solid";
import { type Component } from "solid-js";
import { usePageState } from "~/Context/page-state";

const HomePage: Component = () => {
  const pageState = usePageState();

  return (
    <div class="flex h-screen flex-col py-12 ">
      <Motion.h1
        animate={{ y: ["-150%", 0] }}
        transition={{ duration: 1, easing: "ease-in-out"}}
        class="mt-4 h-fit w-fit rounded-tr-md border-r-2 border-t-2 border-black p-2 text-6xl lg:mt-12 lg:text-9xl -translate-y-[150%]"
      >
        Nathan Piper{" "}
        <span class="mt-6 block text-3xl lg:ml-3 lg:text-4xl">
          Web Wizard and Software Generalist
        </span>
        <span class="mt-2 block text-sm lg:ml-4 lg:text-2xl">
          Oh and I make video games too
        </span>
      </Motion.h1>
      <Motion.p
        animate={{opacity: [0, 1]}}
        transition={{ duration: 1, delay: 1, easing: "ease-in-out"}}
        class={`mt-auto text-center text-xl font-semibold lg:text-3xl transition-opacity ${
          pageState && pageState[0].scrollY > 20 ? "animate-out fade-out fill-mode-forwards" : "animate-pulse"
        } `}
      >
        scroll down
      </Motion.p>
    </div>
  );
};

export default HomePage;
