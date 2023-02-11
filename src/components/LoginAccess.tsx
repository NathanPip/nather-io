import { createEffect, createSignal, Show, type Component } from "solid-js";
import { Navigate } from "solid-start";
const LoginAccess: Component = () => {
    
    const [is_n_pressed, set_is_n_pressed] = createSignal(false);
    const [is_d_pressed, set_is_d_pressed] = createSignal(false);
    const [redirecting, setRedirecting] = createSignal(false)

    createEffect(() => {
        window.addEventListener('keydown', (e) => {
            console.log("pressed")
            if (e.key === "n") set_is_n_pressed(true)
            if (e.key === "d") set_is_d_pressed(true);
            if (e.key === "p" && is_n_pressed() && is_d_pressed()) {
                console.log("going to page")
                setRedirecting(true);
            }
        })
        window.addEventListener('keyup', (e) => {
            if (e.key === "n") set_is_n_pressed(false);
            if (e.key === "d") set_is_d_pressed(false);
        })
    })

    return (
    <Show when={redirecting()}>
        <Navigate href="/login" />
    </Show>
    )
}

export default LoginAccess;