import { Motion } from "@motionone/solid";
import { type Component } from "solid-js";
import { usePageState } from "~/Context/page-state";

const HomePage: Component = () => {

  const pageState = usePageState();

  return (
    <div class="h-screen flex flex-col py-12">
      <Motion.h1 animate={{opacity: [0,1]}} transition={{duration: 1, easing: "ease-in-out"}}  class="text-6xl lg:text-9xl border-r-2 border-t-2 border-black w-fit h-fit p-2 rounded-tr-md mt-4 lg:mt-12">
        Nathan Piper <span class="text-3xl lg:text-4xl block mt-6 lg:ml-3">Web Wizard and Software Generalist</span>
        <span class="text-sm lg:text-2xl mt-2 block lg:ml-4">Oh and I make video games too</span>
      </Motion.h1>
      <p class={`text-center text-xl lg:text-3xl font-semibold animate-pulse mt-auto transition-opacity duration-500 ${pageState && pageState[0].scrollY > 20 ? "opacity-0 animate-none" : ""} `}>scroll down</p>
    </div>
  );
};

export default HomePage;
