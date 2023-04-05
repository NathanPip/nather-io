import { createEffect, createSignal, Show, type VoidComponent } from "solid-js";

const ProjectsPage: VoidComponent = () => {
  const [slideNum, setSlideNum] = createSignal(0);
  const [slideCount, setSlideCount] = createSignal(0);
  const [slideWidth, setSlideWidth] = createSignal(0);
  let slideContainer: HTMLDivElement | undefined;
  let mainContainer: HTMLDivElement | undefined;

  createEffect(() => {
    if (mainContainer) {
      setSlideWidth(mainContainer.clientWidth);
      console.log(mainContainer.clientWidth)
    }
  })

  createEffect(() => {
    if (slideContainer) {
      setSlideCount(slideContainer.children.length);
      console.log(slideContainer.children.length)
    }
  })

  return (
    <div class="min-h-[90vh] flex flex-col">
      <h1 class="mt-16 text-4xl font-semibold">Portfolio</h1>
      <div ref={mainContainer} class="overflow-x-hidden flex flex-col flex-1 justify-center items-start w-full">
        <div ref={slideContainer} style={{transform: `translate(-${((slideNum())/slideCount())*100}%)`}} class="transition-transform flex">
          {/* Slide One */}
          <div style={{width: `${slideWidth()}px`}} class="inline-flex flex-col">
            <h2 class="text-5xl my-6 text-center">Welcome to my Portfolio of things</h2>
            <button onClick={() => setSlideNum(prev => prev+1)} class="animate-pulse text-2xl">Click To Take a look</button>
          </div>
          {/* Slide Two */}
          <div style={{width: `${slideWidth()}px`}} class="inline-flex flex-col">
            <h2 class="text-5xl my-6 text-center">Welcome to my Portfolio of things</h2>
            <button class="animate-pulse text-2xl">s</button>
          </div>
        </div>
        <div class="flex my-6">
          <Show when={slideNum() > 0}>
            <button onClick={() => setSlideNum(prev => prev-1)} class="text-2xl">Left</button>
          </Show>
          <Show when={slideNum() < slideCount()-1}>
            <button onClick={() => setSlideNum(prev => prev+1)} class="text-2xl">Right</button>
          </Show>
        </div>
      </div>
    </div>
  );
};

export default ProjectsPage;
