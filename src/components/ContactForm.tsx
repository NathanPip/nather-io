import { type Component, createEffect, createSignal } from "solid-js";
import { createServerAction$ } from "solid-start/server";
import { serverEnv } from "~/env/server";
import nodemailer from "nodemailer";
import { z } from "zod";

type EmailInput = {
  name: string;
  email: string;
  message: string;
};

const inputParser = z.object({
  name: z.string(),
  email: z.string(),
  message: z.string(),
});

const ContactForm: Component = () => {
  const [nameValue, setNameValue] = createSignal<string>("");
  const [emailValue, setEmailValue] = createSignal<string>("");
  const [messageValue, setMessageValue] = createSignal<string>("");
  const [error, setError] = createSignal<
    ["name" | "email" | "message" | "server" | "", string]
  >(["", ""]);

  const [sending, sendEmail] = createServerAction$(
    async (input: EmailInput) => {
      try {
        inputParser.parse(input);
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: serverEnv.EMAIL,
            pass: serverEnv.EMAIL_AUTH,
          },
        });

        const mailOptions = {
          to: serverEnv.EMAIL,
          from: serverEnv.EMAIL,
          name: input.name,
          subject: `New Message from ${input.name} at ${input.email}`,
          text: input.message,
        };

        await (async () =>
          new Promise((resolve, reject) => {
            transporter.sendMail(mailOptions, (error, info) => {
              if (error) {
                reject(error);
              } else {
                resolve(info);
              }
            });
          }))();
        return { success: true };
      } catch (e) {
        console.log(e);
        throw e;
      }
    }
  );

  const handleSubmit = (e: SubmitEvent) => {
    e.preventDefault();

    if (!nameValue().length) return setError(["name", "Please enter a name"]);
    if (!emailValue().length || !emailValue()?.includes("@"))
      return setError(["email", "Please enter a valid email"]);
    if (!messageValue().length)
      return setError(["message", "Please enter a message"]);

    if (error()[0].length) setError(["", ""]);

    sendEmail({
      name: nameValue() as string,
      email: emailValue() as string,
      message: messageValue() as string,
    });
  };

  createEffect(() => {
    if (sending.error)
      setError(["server", "Something went wrong, please try again."]);

    if (sending.result) {
      setNameValue("");
      setEmailValue("");
      setMessageValue("");
    }
  });

  return (
    <form class="flex flex-col lg:flex-1 lg:px-4" onSubmit={handleSubmit}>
      <div class="flex justify-between pr-4">
        <label
          class={`mb-1 font-semibold lg:text-xl ${
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
        class={`mb-2 rounded-md border-2 bg-stone-50 p-2 shadow-lg focus:outline-none ${
          error()[0] === "name" ? "border-2 border-rose-500" : ""
        }`}
        id="name"
        type="text"
      />
      <div class="flex justify-between pr-4">
        <label
          class={`mb-1 font-semibold lg:text-xl ${
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
        class={`mb-2 rounded-md bg-stone-50 p-2 shadow-lg focus:outline-none ${
          error()[0] === "email" ? "border-2 border-rose-500" : ""
        }`}
        id="email"
        type="email"
      />
      <div class="flex justify-between pr-4">
        <label
          class={`mb-1 font-semibold lg:text-xl ${
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
        class={`mb-2 h-40 rounded-md bg-stone-50 px-2 py-1 shadow-lg focus:outline-0 ${
          error()[0] === "message" ? "border-2 border-rose-500" : ""
        }`}
        id="message"
      />
      <button
        class=" mb-4 mt-2 rounded-md bg-stone-300 px-2 py-2 font-semibold shadow-md transition-colors duration-300 hover:bg-stone-400 lg:text-xl"
        type="submit"
      >
        {!sending.result
          ? sending.pending
            ? "Sending..."
            : sending.error
            ? "Something went wront"
            : "Send Message"
          : "Message Sent"}
      </button>
    </form>
  );
};

export default ContactForm;
