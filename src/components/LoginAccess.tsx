import { createEffect, createSignal, type Component } from "solid-js";
import { signIn } from "@auth/solid-start/client"
const LoginAccess: Component = () => {
    
    const [is_n_pressed, set_is_n_pressed] = createSignal(false);
    const [is_d_pressed, set_is_d_pressed] = createSignal(false);

    createEffect(() => {
        window.addEventListener('keydown', (e) => {
            console.log("pressed")
            if (e.key === "n") set_is_n_pressed(true)
            if (e.key === "d") set_is_d_pressed(true);
            if (e.key === "p" && is_n_pressed() && is_d_pressed()) signIn("github");
        })
        window.addEventListener('keyup', (e) => {
            if (e.key === "n") set_is_n_pressed(false);
            if (e.key === "d") set_is_d_pressed(false);
        })
    })

    return <></>
}

export default LoginAccess;