import {
  StartServer,
  createHandler,
  renderAsync,
} from "solid-start/entry-server";

const protectedRoutes = new Set(["/admin"]);

export default createHandler(
  ({ forward }) => {
    return (event) => {
      console.log(event.request)
      if (protectedRoutes.has(new URL(event.request.url).pathname)) {
           
      }
      return forward(event);
    };
  },
  renderAsync((event) => <StartServer event={event} />)
);
