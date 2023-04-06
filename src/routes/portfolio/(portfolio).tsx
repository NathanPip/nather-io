import {
  createEffect,
  createSignal,
  For,
  type VoidComponent,
} from "solid-js";
import { useSearchParams } from "solid-start";

const ProjectsPage: VoidComponent = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [slideNum, setSlideNum] = createSignal(searchParams.page ? parseInt(searchParams.page) : 0);
  const [slideCount, setSlideCount] = createSignal(0);
  const [slideWidth, setSlideWidth] = createSignal(0);
  let mainContainer: HTMLDivElement | undefined;
  let slideContainer: HTMLDivElement | undefined;

  createEffect(() => {
    if (mainContainer) {
      setSlideWidth(mainContainer.clientWidth);
      console.log(mainContainer.clientWidth);
    }
  });

  createEffect(() => {
    if (slideContainer) {
      setSlideCount(slideContainer.children.length);
      console.log(slideContainer.children.length);
    }
  });

  const slideNumHandler = (num: number) => {
    setSlideNum(num)
    setSearchParams({page: num.toString()})
  }

  return (
    <div class="flex min-h-[90vh] flex-col">
      <h1 class="mt-16 text-4xl font-semibold">Portfolio</h1>
      <div
        ref={mainContainer}
        class="flex w-full flex-1 flex-col items-start justify-center overflow-x-hidden"
      >
        <div
          ref={slideContainer}
          style={{
            transform: `translate(-${(slideNum() / slideCount()) * 100}%)`,
          }}
          class={`flex flex-1 transition-all duration-300 ${
            slideWidth() ? "opacity-100" : "opacity-0"
          }`}
        >
          {/* Slide One */}
          <div
            style={{ width: `${slideWidth()}px` }}
            class="inline-flex flex-col justify-center"
          >
            <h2 class="my-6 text-center text-5xl">
              Welcome to my Portfolio of things
            </h2>
            <button
              onClick={() => setSlideNum((prev) => prev + 1)}
              class="animate-pulse text-2xl"
            >
              Click To Take a look
            </button>
          </div>
          {/* Slide Two */}
          <div
            style={{ width: `${slideWidth()}px` }}
            class="inline-flex flex-col justify-center"
          >
            <h2 class="my-6 text-center text-5xl">
              Welcome to my Portfolio of things
            </h2>
            <button class="animate-pulse text-2xl">s</button>
          </div>
        </div>
        <div class="my-6 mx-auto flex gap-8">
            <button
              onClick={() => slideNumHandler(slideNum() - 1)}
              class={`text-3xl ${slideNum() === 0 ? "opacity-0" : ""}`}
              disabled={slideNum() === 0}
            >
              {"<"}
            </button>
            <button
              onClick={() => slideNumHandler(slideNum() + 1)}
              class={`text-3xl ${slideNum() === slideCount() - 1 ? "opacity-0" : ""}`}
              disabled={slideNum() === slideCount() - 1}
            >
              {">"}
            </button>
        </div>
        <div class="flex mx-auto gap-2">
          <For
            each={(() => {
              const nums = [];
              for (let i = 1; i <= slideCount(); i++) {
                nums.push(i);
              }
              return nums;
            })()}
          >
            {(num) => (
            <button
              onClick={() => slideNumHandler(num-1)}
              class={`text-xl rounded-md px-2 ${slideNum() === num-1 ? "bg-stone-300" : ""}`}
            >{num}</button>)}
          </For>
        </div>
      </div>
    </div>
  );
};

export default ProjectsPage;
