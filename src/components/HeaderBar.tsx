import { Motion } from "@motionone/solid";
import { Show, type Component } from "solid-js";
import { usePageState } from "../Context/page-state";

const HeaderBar: Component = () => {
  const pageState = usePageState();

  return (
    <Motion.div
      class={`fixed z-10 flex w-full justify-end top-0 bg-stone-300 dark:bg-stone-900 px-4 py-2 shadow-md transition-transform duration-75 ${
        pageState && pageState[0].scrollDown ? "animate-none -translate-y-16" : ""
      }`}
    >
      {/* <button
        onClick={() =>
          pageState ? pageState[0].darkMode == "none" || pageState[0].darkMode == "light"
            ? pageState[1]("darkMode", "dark")
            : pageState[1]("darkMode", "light") : console.log(pageState)
        }
        class="mr-auto"
      >
        {pageState && (pageState[0].darkMode == "none" || pageState[0].darkMode == "light" ? <img class="fill-stone-50" src="/dark-mode.svg"/> : <img class="fill-stone-50" src="/light-mode.svg"/> )}
      </button> */}
      <Show when={pageState && pageState[0].admin}>
        <div>signed in</div>
      </Show>
      <a class="mx-2" aria-label="Github" href="https://github.com/NathanPip">
        <img
          class="h-8 w-8 lg:h-10 lg:w-10"
          src={"/github-icon.svg"}
          alt={`github logo`}
        />
      </a>
      <a class="mx-2" aria-label="Twitter" href="https://twitter.com/NathanPiperr">
        <img
          class="h-8 w-8 lg:h-10 lg:w-10"
          src={"/twitter-icon.svg"}
          alt={`twitter logo`}
        />
      </a>
      <a class="mx-2" aria-label="Linkedin" href="https://linkedin.com/in/nathanpiperr">
        <img
          class="h-8 w-8 lg:h-10 lg:w-10"
          src={"/linkedin-icon.svg"}
          alt={`github logo`}
        />
      </a>
    </Motion.div>
  );
};

export default HeaderBar;
