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

export type PageState = {
  scrollDown: boolean;
  scrollY: number;
  darkMode: "light" | "dark" | "none";
  admin: boolean;
};

const defaultPageState: PageState = {
  scrollDown: false,
  scrollY: 0,
  darkMode: "none",
  admin: false,
};

export const useCookies = () => {
  const context = useContext(ServerContext);
  const cookies = isServer
    ? context?.request.headers.get("Cookie")
    : document.cookie;

  return parseCookie(cookies ?? "");
};

export const useDarkModeCookie = (): PageState["darkMode"] => {
  const cookies = useCookies();
  return (cookies["dark_mode"] as PageState["darkMode"]) || "none";
};

const useExpireCookie = (): Date | undefined => {
  const cookies = useCookies();
  const expire = cookies["session_expire"];
  return expire ? new Date(cookies["session_expire"]) : undefined;
}

export const useAdminCookie = (): PageState["admin"] => {
  const cookies = useCookies();
  return cookies["admin"] === "true"
}

const [pageState, setPageState] = createStore({...defaultPageState})
export const PageStateContext =
  createContext<
    [pageState: PageState, setPageState: SetStoreFunction<PageState>]
  >([pageState, setPageState]);


export const PageStateProvider: Component<
  ParentProps<{ darkMode: PageState["darkMode"] }>
> = (props) => {
  const [prevScrollY, setPrevScrollY] = createSignal(0);
  // const [darkMode, setDarkMode] = createSignal(props.darkMode);
  const [pageState, setPageState] = createStore<PageState>({
    ...defaultPageState,
    darkMode: useDarkModeCookie(),
    admin: useAdminCookie(),
  });

  onMount(() => {
    const expired = useExpireCookie();
    if(expired !== undefined) {
      if(expired.getTime() - new Date().getTime() < 0) {
        setPageState(prev => ({...prev, admin: false}));
      }
    }
    setPageState("scrollY", window.scrollY);
    window.addEventListener("scroll", () => {
      setPrevScrollY(pageState.scrollY);
      setPageState("scrollY", window.scrollY);
    });
  });

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
