import {
  createSignal,
  Show,
  createContext,
  type VoidComponent,
  useContext,
} from "solid-js";
import { createStore, type SetStoreFunction } from "solid-js/store";
import { Title } from "solid-start";
import Contact from "~/components/Contact";
import HomePage from "~/components/Homepage";
import About from "~/components/About";

const defaultPageState = {
  introFinished: false,
  introStart: false,
  actions: {
    scrollUp: false,
    scrollDown: false,
    click: false,
    keypress: "",
  }
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
  
  return (
    <>
      <Title>nather.io</Title>
      <homePageContext.Provider value={[homePageState, setHomePageState]}>
        <Show when={!homePageState.introStart || homePageState.introFinished}>
          <HomePage />
        </Show>
        <About />
        <Show when={homePageState.introFinished}>
          <Contact />
        </Show>
      </homePageContext.Provider>
    </>
  );
};

export const useHomePageContext = () => useContext(homePageContext);

export default Home;
