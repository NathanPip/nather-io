import { createSignal, type Component, onMount, createEffect } from "solid-js";

type Vector = {x: number, y: number};

class Entity {
    position: Vector;
    width: number;
    height: number;
    static entities: Entity[] = [];
    
    constructor(x: number, y: number, width: number, height: number,) {
        this.position = {x, y};
        this.width = width;
        this.height = height
        Entity.entities.push(this);
    }

    static updateAll() {
        for(const entity of Entity.entities) {
            entity.update();
        }
    }

    static renderAll() {
        for(const entity of Entity.entities) {
            entity.render();
        }
    }

    update() {}
    render() {}
}

const Experience: Component = () => {
    let canvas: HTMLCanvasElement | undefined;
    const FPS = 60;
    const [context, setContext] = createSignal<CanvasRenderingContext2D | null>();
    const [screenWidth, setScreenWidth] = createSignal(0);
    const [screenHeight, setScreenHeight] = createSignal(0);

    onMount(() => {
        window.addEventListener("resize", () => {
            if(canvas) {
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
            }
            setScreenWidth(window.innerWidth);
            setScreenHeight(window.innerHeight);
        });
    });

    createEffect(() => {
        if(canvas) {
            setContext(canvas.getContext("2d"));
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
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
            Entity.renderAll();
    }
    const update = () => {
        Entity.updateAll();
    }
    return (
        <canvas class="" ref={canvas} />);
}

export default Experience;