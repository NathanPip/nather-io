import { createEffect, createSignal } from "solid-js";
import { scrollDown } from "~/utils/scroll-state";

const Nav = () => {

  return (
    <nav class={`fixed flex justify-end w-full bg-stone-300 shadow-md px-4 py-2 z-10 transition-transform ${scrollDown() ? "-translate-y-16" : ""}`}>
      <a class="mx-2" href="https://github.com/NathanPip"><img class="h-8 w-8" src={"/github-icon.svg"} alt={`github logo`} /></a>
      <a class="mx-2" href="https://twitter.com/NathanPiperr"><img class="h-8 w-8" src={"/twitter-icon.svg"} alt={`twitter logo`} /></a>
      <a class="mx-2" href="https://linkedin.com/in/nathanpiperr"><img class="h-8 w-8" src={"/linkedin-icon.svg"} alt={`github logo`} /></a>
    </nav>
  );
};

export default Nav;
