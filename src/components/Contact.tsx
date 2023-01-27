import { createSignal, type Component } from "solid-js";
import server$ from "solid-start/server";
import ContactForm from "./ContactForm";
import ContactSocialLinks from "./ContactSocialLinks";

const Contact: Component = () => {
  return (
    <div >
      <h2 class="text-2xl font-semibold mb-2 lg:text-4xl">Contact</h2>
      <div class="my-4 flex flex-col lg:flex-row-reverse lg:items-center lg:justify-center py-2 shadow-inner">
      <ContactForm />
      <ContactSocialLinks />
      </div>
    </div>
  );
};

export default Contact;
