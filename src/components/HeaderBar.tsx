import { Motion } from "@motionone/solid";
import {
  createEffect,
  createRenderEffect,
  createSignal,
  Show,
  type Component,
} from "solid-js";
import { A, useLocation } from "solid-start";
import { usePageState } from "../Context/page-state";

const HeaderBar: Component = () => {
  const [pageState] = usePageState();
  const location = useLocation();
  const noShowPaths = ["/blog/create", "/"];
  const [noShow, setNoShow] = createSignal(true);

  createRenderEffect(() => {
    for (const i of noShowPaths) {
      console.log(location.pathname)
      if (location.pathname === i) {
        setNoShow(true);
        return;
      }
    }
    setNoShow(false);
  });

  return (
    <Show when={!noShow()}>
      <Motion.div
        class={`fixed top-0 z-10 flex w-full justify-end bg-stone-300 px-4 py-2 shadow-md transition-transform duration-200 ease-linear dark:bg-stone-900 ${
          pageState.scrollDown ? "-translate-y-16" : ""
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
        <A class="mx-2 text-xl font-semibold" aria-label="Home" href="/">
          Home
        </A>
        <A
          class="mx-2 text-xl font-semibold"
          aria-label="Blog"
          href="/blog"
        >
          Blog
        </A>
        <A
          class="mx-2 text-xl font-semibold"
          aria-label="Games"
          href="/games"
        >
          Games
        </A>
      </Motion.div>
    </Show>
  );
};

export default HeaderBar;
