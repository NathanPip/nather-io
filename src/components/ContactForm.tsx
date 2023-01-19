import { createSignal } from "solid-js";
import { trpc } from "~/utils/trpc";

const ContactForm = () => {
  const sendMail = trpc.sendEmail.useMutation();
  const [nameValue, setNameValue] = createSignal<string>("");
  const [emailValue, setEmailValue] = createSignal<string>("");
  const [messageValue, setMessageValue] = createSignal<string>("");
  const [error, setError] = createSignal<["name" | "email" | "message" | "server" | "", string]>(["", ""]);

  const handleSubmit = (e: SubmitEvent) => {
    e.preventDefault();

    if (!nameValue().length) return setError(["name","Please enter a name"]);
    if (!emailValue().length || !emailValue()?.includes("@"))
      return setError(["email", "Please enter a valid email"]);
    if (!messageValue().length) return setError(["message", "Please enter a message"]);

    if(error()[0].length) setError(["", ""]);

    sendMail.mutate({
      name: nameValue() as string,
      email: emailValue() as string,
      message: messageValue() as string,
    });
  };

  if(sendMail.error) setError(["server", "Something went wrong, please try again."])

  if(sendMail.isSuccess) {
    setNameValue("");
    setEmailValue("");
    setMessageValue("");
  }

  return (
    <div>
      <h2 class="text-2xl font-semibold mb-2">Contact</h2>
      <form class="flex flex-col" onSubmit={handleSubmit}>
        <label class="font-semibold" for="name">
          Name
        </label>
        <input
          onChange={(e) => setNameValue(e.currentTarget.value)}
          value={nameValue()}
          class="bg-stone-50 rounded-md p-2 mb-2 focus:outline-none"
          id="name"
          type="text"
        />
        <label class="font-semibold" for="email">
          Email
        </label>
        <input
          onChange={(e) => setEmailValue(e.currentTarget.value)}
          value={emailValue()}
          class="bg-stone-50 rounded-md p-2 mb-2 focus:outline-none"
          id="email"
          type="email"
        />
        <label class="font-semibold" for="message">
          Message
        </label>
        <textarea
          onChange={(e) => setMessageValue(e.currentTarget.value)}
          value={messageValue()}
          class="bg-stone-50 rounded-md px-2 py-1 mb-2 focus:outline-none h-40"
          id="message"
        />
        <button
          class=" font-semibold mb-2 bg-stone-300 shadow-md px-2 py-2 rounded-md"
          type="submit"
        >
          {sendMail.isLoading ? "Sending..." : "Send Message"}
        </button>
      </form>
    </div>
  );
};

export default ContactForm;
