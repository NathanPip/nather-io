import { createSignal, createEffect } from "solid-js";
const images = ["data-packet", "data-receiver-sheet", "door", "interact-bubble", "map", "player-sheet", "ugrad-sheet"];

export const image_pool: {[key: string]: HTMLImageElement} = {};

export const [imagesLoaded, setImagesLoaded] = createSignal(false);
export const [loadCount, setLoadCount] = createSignal(0);

createEffect(() => {
    if(loadCount() === images.length) {
        setImagesLoaded(true);
    }
})

export function loadImages () {
    images.forEach((image) => {
        const img = new Image();
        img.src = `./sprites/${image}.png`;
        img.onload = () => {
            setLoadCount((count) => count + 1);
            console.log(loadCount())
        }
        image_pool[image] = img;
    });
    checkComplete();
    return;
}

function checkComplete() {
    let complete = true;
    Object.keys(image_pool).forEach((key) => {
        if(!image_pool[key].complete) {
            complete = false;
        }
    });
    if(!complete) {
        setTimeout(checkComplete, 100);
    }
    return complete;
}