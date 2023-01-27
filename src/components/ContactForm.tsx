import { type Component, createEffect, createSignal } from "solid-js";
import { trpc } from "~/utils/trpc";

const ContactForm: Component = () => {
  const sendMail = trpc.sendEmail.useMutation();
  const [nameValue, setNameValue] = createSignal<string>("");
  const [emailValue, setEmailValue] = createSignal<string>("");
  const [messageValue, setMessageValue] = createSignal<string>("");
  const [error, setError] = createSignal<
    ["name" | "email" | "message" | "server" | "", string]
  >(["", ""]);

  const handleSubmit = (e: SubmitEvent) => {
    e.preventDefault();

    if (!nameValue().length) return setError(["name", "Please enter a name"]);
    if (!emailValue().length || !emailValue()?.includes("@"))
      return setError(["email", "Please enter a valid email"]);
    if (!messageValue().length)
      return setError(["message", "Please enter a message"]);

    if (error()[0].length) setError(["", ""]);

    sendMail.mutate({
      name: nameValue() as string,
      email: emailValue() as string,
      message: messageValue() as string,
    });
  };

  createEffect(() => {
    if (sendMail.error)
      setError(["server", "Something went wrong, please try again."]);

    if (sendMail.isSuccess) {
      setNameValue("");
      setEmailValue("");
      setMessageValue("");
    }
  });

  return (
      <form class="flex flex-col lg:flex-1 lg:px-4" onSubmit={handleSubmit}>
        <div class="flex justify-between pr-4">
          <label
            class={`font-semibold lg:text-xl mb-1 ${
              error()[0] === "name" ? "text-rose-500" : ""
            }`}
            for="name"
          >
            Name
          </label>
          {error()[0] === "name" ? (
            <label class="text-rose-500" for="name">
              {error()[1]}
            </label>
          ) : null}
        </div>
        <input
          onChange={(e) => setNameValue(e.currentTarget.value)}
          value={nameValue()}
          class={`bg-stone-50 rounded-md p-2 mb-2 focus:outline-none border-2 shadow-lg ${
            error()[0] === "name" ? "border-rose-500 border-2" : ""
          }`}
          id="name"
          type="text"
        />
        <div class="flex justify-between pr-4">
          <label
            class={`font-semibold lg:text-xl mb-1 ${
              error()[0] === "email" ? "text-rose-500" : ""
            }`}
            for="email"
          >
            Email
          </label>
          {error()[0] === "email" ? (
            <label class="text-rose-500" for="email">
              {error()[1]}
            </label>
          ) : null}
        </div>
        <input
          onChange={(e) => setEmailValue(e.currentTarget.value)}
          value={emailValue()}
          class={`bg-stone-50 rounded-md p-2 mb-2 focus:outline-none shadow-lg ${
            error()[0] === "email" ? "border-rose-500 border-2" : ""
          }`}
          id="email"
          type="email"
        />
        <div class="flex justify-between pr-4">
          <label
            class={`font-semibold lg:text-xl mb-1 ${
              error()[0] === "message" ? "text-rose-500" : ""
            }`}
            for="message"
          >
            Message
          </label>
          {error()[0] === "message" ? (
            <label class="text-rose-500" for="message">
              {error()[1]}
            </label>
          ) : null}
        </div>
        <textarea
          onChange={(e) => setMessageValue(e.currentTarget.value)}
          value={messageValue()}
          class={`bg-stone-50 rounded-md px-2 py-1 mb-2 focus:outline-0 h-40 shadow-lg ${
            error()[0] === "message" ? "border-rose-500 border-2" : ""
          }`}
          id="message"
        />
        <button
          class=" font-semibold bg-stone-300 shadow-md px-2 py-2 rounded-md mb-4 mt-2 lg:text-xl hover:bg-stone-400 transition-colors duration-300"
          type="submit"
        >
          {!sendMail.isSuccess
            ? sendMail.isLoading
              ? "Sending..."
              : sendMail.isError
              ? "Something went wront"
              : "Send Message"
            : "Message Sent"}
        </button>
      </form>
  );
};

export default ContactForm;
