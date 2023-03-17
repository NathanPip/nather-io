import { Component, createSignal } from "solid-js";

const About: Component = () => {

    const [text, setText] = createSignal("Hello")

    return (
        <div class="h-screen flex justify-center">
            <h2 class="text-center text-5xl mt-48">{text()}</h2>
        </div>
    )
}

export default About;