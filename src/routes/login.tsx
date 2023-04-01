import { createEffect, createSignal, Show, type VoidComponent } from "solid-js";
import { Navigate } from "solid-start";
import { createServerAction$ } from "solid-start/server";
import { usePageState } from "~/Context/page-state";
import { prisma } from "~/server/db/client";

const createSession = async () => {
  const sessionToken =
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15);
  const expiration = new Date(new Date().getTime() + 60 * 24 * 30 * 60000);
  await prisma.session.create({
    data: {
      session_token: sessionToken,
      expires: expiration,
    },
  });
  return {token: sessionToken, expires: expiration};
};

const Login: VoidComponent = () => {
  const [error, setError] = createSignal("");
  const [navigating, setNavigating] = createSignal(false);
  let input: HTMLInputElement | undefined;

  const [pageState, setPageState] = usePageState();

  const [signingIn, { Form }] = createServerAction$(async (form: FormData) => {
    const ps = form.get("password") as string;
    let result = {
      error: false,
      message: "",
      session: {
        token: "",
        expires: new Date(0)
      }
    }
    if (!ps)
      return result = {
        ...result,
        error: true,
        message: "Enter a password",
      };
    const query = await prisma.password.findFirst();
    if (query?.password && query.password === ps) {
      const session = await createSession();
      return result = {
        ...result,
        session: {
          token: session.token,
          expires: session.expires
        }
      }
    } else {
      return result = {
        ...result,
        error: true,
        message: "You're wrong on that one",
      };
    }
  });

  createEffect(() => {
    if (signingIn.error) setError(signingIn.error.message);
    if (signingIn.result?.error) {
      setError(signingIn.result.message);
    } else if (signingIn.result?.session.token.length) {
      document.cookie = `session_token=${signingIn.result.session.token}; expires=${signingIn.result.session.expires}; path=/`;
      setPageState("admin", true);
      console.log(pageState.admin)
      setNavigating(true);
    }
  });

  return (
    <div class="flex justify-center">
      <Show when={navigating() || pageState.admin}>
        <Navigate href="/"/>
      </Show>
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
  );
};

export default Login;
