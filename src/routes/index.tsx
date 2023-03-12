import { onMount, type VoidComponent } from "solid-js";
import { Title } from "solid-start";
import Contact from "~/components/Contact";
import HomePage from "~/components/Homepage";
import Projects from "~/components/Projects";

const Home: VoidComponent = () => {
  
  return (
    <>
      <Title>nather.io</Title>
      <HomePage />
      {/* <Projects /> */}
      <Contact />
    </>
  );
};

export default Home;
