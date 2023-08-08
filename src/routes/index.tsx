import {
  createSignal,
  Show,
  createEffect,
  onMount,
  createContext,
  type VoidComponent,
  useContext,
} from "solid-js";
import { createStore, type SetStoreFunction } from "solid-js/store";
import { Title } from "solid-start";
import Contact from "~/components/Contact";
import HomePage from "~/components/Homepage";
import About from "~/components/About";
import Experience from "~/experience/dom/Experience";

const defaultPageState = {
  scrollUp: false,
  scrollDown: false,
  click: false,
  keypress: "",
};

const [homePageState, setHomePageState] = createStore({
  ...defaultPageState,
});

const homePageContext = createContext<
  [
    homePageState: typeof defaultPageState,
    setHomePageState: SetStoreFunction<typeof defaultPageState>
  ]
>([homePageState, setHomePageState]);

const Home: VoidComponent = () => {


  onMount(() => {
    addEventListener("wheel", (e) => {
      if(e.deltaY > 0) {
        setHomePageState("scrollDown", true);
      }
    })
  })

  return (
    <>
      <Title>nather.io</Title>
      <homePageContext.Provider value={[homePageState, setHomePageState]}>
        <div class="h-screen w-screen overflow-hidden">
          <div class={`${homePageState.scrollDown ? "translate-y-[-100vh]" : ""} transition-transform duration-500`}>
            <HomePage />
            {/* <Experience /> */}
          </div>
        </div>
      </homePageContext.Provider>
    </>
  );
};

export const useHomePageContext = () => useContext(homePageContext);

export default Home;
