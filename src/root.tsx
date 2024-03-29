// @refresh reload
import "./root.css";
import { Suspense } from "solid-js";
import {
  Body,
  ErrorBoundary,
  FileRoutes,
  Head,
  Html,
  Link,
  Meta,
  Routes,
  Scripts,
  Title,
} from "solid-start";
import HeaderBar from "./components/HeaderBar";
import { PageStateProvider, useDarkModeCookie } from "./Context/page-state";
import LoginAccess from "./components/LoginAccess";

export default function Root() {
  const darkMode = useDarkModeCookie();

  return (
    <Html lang="en">
      <Head>
        <Title>nather.io</Title>
        <Meta charset="utf-8" />
        <Meta
          name="description"
          content="The Nather Hub of all things Nather, but mostly just software"
        />
        <Meta name="viewport" content="width=device-width, initial-scale=1" />
        <Link rel="preconnect" href="https://fonts.googleapis.com" />
        <Link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
        <Link href="https://fonts.googleapis.com/css2?family=Space+Grotesk&display=swap" rel="stylesheet" />
      </Head>
      <Body>
        <Suspense>
          <PageStateProvider darkMode={darkMode}>
            <HeaderBar />
            <LoginAccess />
            <ErrorBoundary>
              {/* <main class="mx-auto max-w-7xl px-4"> */}
                <Routes>
                  <FileRoutes />
                </Routes>
              {/* </main> */}
            </ErrorBoundary>
          </PageStateProvider>
        </Suspense>
        <Scripts />
      </Body>
    </Html>
  );
}
