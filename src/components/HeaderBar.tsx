import { useContext, type Component } from "solid-js";
import { PageStateContext, usePageState } from "./page-state";

const HeaderBar: Component = () => {
  const pageState = usePageState();

  console.log(pageState)

  return (
    <div
      class={`fixed z-10 flex w-full justify-end bg-stone-300 px-4 py-2 shadow-md transition-transform duration-75 ${
        pageState && pageState[0].scrollDown ? "-translate-y-16" : ""
      }`}
    >
      <button
        onClick={() =>
          pageState ? pageState[0].darkMode == "none" || pageState[0].darkMode == "light"
            ? pageState[1]("darkMode", "dark")
            : pageState[1]("darkMode", "light") : console.log(pageState)
        }
        class="mr-auto"
      >
        {pageState && (pageState[0].darkMode == "none" || pageState[0].darkMode == "light" ? "dark" : "light")}
      </button>
      <a class="mx-2" href="https://github.com/NathanPip">
        <img
          class="h-8 w-8 lg:h-10 lg:w-10"
          src={"/github-icon.svg"}
          alt={`github logo`}
        />
      </a>
      <a class="mx-2" href="https://twitter.com/NathanPiperr">
        <img
          class="h-8 w-8 lg:h-10 lg:w-10"
          src={"/twitter-icon.svg"}
          alt={`twitter logo`}
        />
      </a>
      <a class="mx-2" href="https://linkedin.com/in/nathanpiperr">
        <img
          class="h-8 w-8 lg:h-10 lg:w-10"
          src={"/linkedin-icon.svg"}
          alt={`github logo`}
        />
      </a>
    </div>
  );
};

export default HeaderBar;
