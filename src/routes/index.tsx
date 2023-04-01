import { onMount, type VoidComponent } from "solid-js";
import { Title } from "solid-start";
import Contact from "~/components/Contact";
import HomePage from "~/components/Homepage";
import Projects from "~/components/Projects";
import About from "~/components/About"

const Home: VoidComponent = () => {
  
  return (
    <>
      <Title>nather.io</Title>
      <HomePage />
      <About />
      {/* <Projects /> */}
      <Contact />
    </>
  );
};

export default Home;
