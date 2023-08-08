import { Component, createSignal, createEffect } from "solid-js";
import { usePageState } from "~/Context/page-state";
import { useHomePageContext } from "~/routes";

const About: Component = () => {
  const [text, setText] = createSignal("Hello");
  let containerEl: HTMLDivElement | undefined;
  const [pageState] = usePageState();
  const [homePageState, setHomePageState] = useHomePageContext();
  createEffect(() => {
    if(!containerEl) return;
    console.log(pageState.scrollY)
    console.log(containerEl?.offsetTop)
    if(pageState.scrollY >= containerEl?.offsetTop - 50) {
        setHomePageState("introStart", true);
    }
  });
  return (
    <div
      ref={containerEl}
      class={`flex h-screen items-center justify-center transition-opacity ${
        homePageState.introStart
          ? "opacity-100"
          : "opacity-0"
      }`}
    >
      <h2 class="text-center text-5xl">{text()}</h2>
    </div>
  );
};

export default About;
