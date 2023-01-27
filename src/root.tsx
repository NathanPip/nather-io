// @refresh reload
import "./root.css";
import { Suspense } from "solid-js";
import {
  Body,
  ErrorBoundary,
  FileRoutes,
  Head,
  Html,
  Meta,
  Routes,
  Scripts,
  Title,
} from "solid-start";
import { trpc, client, queryClient } from "~/utils/trpc";
import HeaderBar from "./components/HeaderBar";
import { PageStateProvider, useDarkModeCookie } from "./Context/page-state";

export default function Root() {
  const darkMode = useDarkModeCookie();

  return (
    <Html lang="en">
      <Head>
        <Title>nather.io</Title>
        <Meta charset="utf-8" />
        <Meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Body>
        <trpc.Provider client={client} queryClient={queryClient}>
          {/* <Suspense> */}
            <PageStateProvider darkMode={darkMode}>
              <HeaderBar />
              <ErrorBoundary>
                <Routes>
                  <FileRoutes />
                </Routes>
              </ErrorBoundary>
            </PageStateProvider>
          {/* </Suspense> */}
        </trpc.Provider>
        <Scripts />
      </Body>
    </Html>
  );
}
