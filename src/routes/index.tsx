import { type VoidComponent } from "solid-js";
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
      </main>
    </>
  );
};

export default Home;
