import { getSession } from "@auth/solid-start";
import {
  type Component,
  createContext,
  createEffect,
  createSignal,
  type ParentProps,
  useContext,
  onMount,
} from "solid-js";
import { createStore, type SetStoreFunction } from "solid-js/store";
import { isServer } from "solid-js/web";
import { parseCookie, ServerContext } from "solid-start";
import { createServerData$ } from "solid-start/server";
import { authOpts } from "~/routes/api/auth/[...solid-auth]";

export type PageState = {
  scrollDown: boolean;
  scrollY: number;
  darkMode: "light" | "dark" | "none";
  signedIn: boolean;
};

const defaultPageState: PageState = {
  scrollDown: false,
  scrollY: 0,
  darkMode: "none",
  signedIn: false,
};

export const useCookies = () => {
  const context = useContext(ServerContext);
  const cookies = isServer
    ? context?.request.headers.get("Cookie")
    : document.cookie;

  return parseCookie(cookies ?? "");
};

const useSession = () => {
  return createServerData$(
    async (_, { request }) => {
      return await getSession(request, authOpts);
    },
    { key: () => ["auth_user"] }
  );
};

export const useDarkModeCookie = (): PageState["darkMode"] => {
  const cookies = useCookies();
  return (cookies["dark_mode"] as PageState["darkMode"]) || "none";
};

export const PageStateContext =
  createContext<
    [pageState: PageState, setPageState: SetStoreFunction<PageState>]
  >();

export const PageStateProvider: Component<
  ParentProps<{ darkMode: PageState["darkMode"] }>
> = (props) => {
  const [prevScrollY, setPrevScrollY] = createSignal(0);
  // const [darkMode, setDarkMode] = createSignal(props.darkMode);
  const [pageState, setPageState] = createStore<PageState>({
    ...defaultPageState,
    darkMode: useDarkModeCookie(),
  });

  const session = useSession();

  onMount(() => {
    setPageState("scrollY", window.scrollY);
    window.addEventListener("scroll", () => {
      setPrevScrollY(pageState.scrollY);
      setPageState("scrollY", window.scrollY);
    });
  });

  createEffect(() => {
    if (session()?.user?.email === "nathan.piper.sd@gmail.com") {
      setPageState("signedIn", true);
    } else {
      setPageState("signedIn", false);
    }
  })

  createEffect(() => {
    if (pageState.scrollY > prevScrollY()) {
      setPageState("scrollDown", true);
    } else {
      setPageState("scrollDown", false);
    }
  });

  // createEffect(() => {
  //   document.cookie = `dark_mode=${pageState.darkMode}; path=/; max-age=31536000;`;
  //   if (pageState.darkMode !== "none") {
  //     document.documentElement.classList.remove(
  //       pageState.darkMode === "light" ? "dark" : "light"
  //     );
  //     document.documentElement.classList.add(pageState.darkMode);
  //   } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
  //     setPageState("darkMode", "dark");
  //     document.documentElement.classList.add("dark");
  //   } else {
  //     setPageState("darkMode", "light");
  //     document.documentElement.classList.add("light");
  //   }
  // });

  return (
    <PageStateContext.Provider value={[pageState, setPageState]}>
      {props.children}
    </PageStateContext.Provider>
  );
};

export const usePageState = () => useContext(PageStateContext);
