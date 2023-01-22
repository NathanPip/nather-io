import { createEffect, createSignal } from "solid-js";

export const [scrollDown, setScrollDown] = createSignal(false);
export const [scrollY, setScrollY] = createSignal(0);
const [prevScrollY, setPrevScrollY] = createSignal(0);
createEffect(() => {
  window.addEventListener(("scroll"), () => {
    setPrevScrollY(scrollY());
    setScrollY(window.scrollY);
  })
})

createEffect(() => {
  if (scrollY() > prevScrollY()) {
    setScrollDown(true);
  } else {
    setScrollDown(false);
  }
})
