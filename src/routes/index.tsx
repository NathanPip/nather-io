import { type VoidComponent, Switch, Match } from "solid-js";
import { Title } from "solid-start";
import Contact from "~/components/Contact";
import HomePage from "~/components/Homepage";
import Projects from "~/components/Projects";

const Home: VoidComponent = () => {

  return (
    <>
      <Title>nather.io</Title>
      <main class="px-4 max-w-7xl mx-auto">
        <HomePage />
        <Projects />
        <Contact />
        {/* <Switch 
          fallback={
            <pre class="font-bold text-2xl text-gray-500">
              {JSON.stringify(res.data, null, 2)}
            </pre>
          }
        >
          <Match when={res.isLoading}>
            <div class="font-bold text-2xl text-gray-500">Loading...</div>
          </Match>
        </Switch> */}
      </main>
    </>
  );
};

export default Home;
