import { parseCookie, redirect } from "solid-start";
import {
  StartServer,
  createHandler,
  renderAsync,
} from "solid-start/entry-server";
import {prisma} from "~/server/db/client"

const protectedRoutes = new Set(["/blog/admin"]);

export default createHandler(
  ({ forward }) => {
    return async (event) => {
      const parsedCookie = parseCookie(event.request.headers.get("Cookie") || "")
      if (protectedRoutes.has(new URL(event.request.url).pathname)) {
        const currentSessionToken = parsedCookie["session_token"];
        const session = await prisma.session.findUnique({
          where: {
            session_token: currentSessionToken || ""
        }})
        if(!session || !session?.expires) return redirect("/")
        if(session.expires.getTime() - new Date().getTime() < 0) {
          return redirect("/login")
        }
      }
      return forward(event);
    };
  },
  renderAsync((event) => <StartServer event={event} />)
);
