import { createSignal, type Component, onMount, createEffect } from "solid-js";

const Experience: Component = () => {
    let canvas: HTMLCanvasElement | undefined;
    const FPS = 60;
    const [context, setContext] = createSignal<CanvasRenderingContext2D | null>();
    const [screenWidth, setScreenWidth] = createSignal(window.innerWidth);
    const [screenHeight, setScreenHeight] = createSignal(window.innerHeight);

    onMount(() => {
        window.addEventListener("resize", () => {
            if(canvas) {
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
            }
            setScreenWidth(window.innerWidth);
            setScreenHeight(window.innerHeight);
        })
    });

    createEffect(() => {
        if(canvas) {
            setContext(canvas.getContext("2d"));
        }
    });

    const start = () => {
        setInterval(() => {
            draw();
            update();
        }, FPS);
    }

    const draw = () => {
        if(!context()) return;
            context()?.clearRect(0, 0, screenWidth(), screenHeight());
    }
    const update = () => {
       console.log("update"); 
    }
    return (
    <canvas ref={canvas} />)
}

export default Experience;