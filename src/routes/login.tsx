import { signIn } from "@auth/solid-start/client";
import { createEffect, createSignal, Show, type VoidComponent } from "solid-js";
import { Navigate, redirect } from "solid-start";
import { createServerAction$ } from "solid-start/server";
import { usePageState } from "~/Context/page-state";
import { prisma } from "~/server/db/client";


const Login: VoidComponent = () => {
  const [error, setError] = createSignal("");
  let input: HTMLInputElement | undefined;

  const pageState = usePageState();

  const [signingIn, { Form }] = createServerAction$(
    async (form: FormData) => {
      const ps = form.get("password") as string;
      console.log(ps);
      if (!ps) return "Enter a password";
      const query = await prisma.password.findFirst();
      const data = query?.password === ps;
      if (data) {
        await signIn("github");
        return redirect("/");
      } else {
        return "You're wrong on that one"
      }
    }
  );

  createEffect(() => {
    if (signingIn.error) setError(signingIn.error.message);
    if (typeof signingIn.result === "string") {
        setError(signingIn.result)
    }
  })

  console.log(pageState)

  return (
    <Show when={pageState && !pageState[0].signedIn} fallback={<Navigate href="/" />}>
    <div class="flex justify-center">
      <Form class="mt-20 flex w-fit flex-col items-center gap-2 text-2xl font-semibold">
        <label class="mb-2" for="password">
          What's the code
        </label>
        <Show when={error().length}>
          <label class="text-rose-500" for="input">
            {error()}
          </label>
        </Show>
        <input
          ref={input}
          class={`rounded-md px-2 py-1 text-center outline-none ${
            error().length ? "outline-2 outline-rose-500" : ""
          }`}
          type="password"
          name="password"
        />
        <button
          type="submit"
          class="rounded-lg bg-stone-300 p-2 px-4 transition-colors hover:bg-stone-400"
          disabled={signingIn.pending}
        >
          Check
        </button>
      </Form>
    </div>
    </Show>
  );
};

export default Login;
