import { type Component } from "solid-js";

const ContactSocialLinks: Component = () => {

  const listItemStyles = "lg:shadow-lg py-2 lg:w-1/2 lg:py-4 rounded-md hover:translate-x-1 hover:z-10 transition-transform duration-200";
  const linkStyles = "flex justify-between lg:flex-row lg:justify-around lg:gap-4 text-lg font-semibold";
  const labelStyles = "hidden lg:block text-xl";
  const iconStyles = "ml-2 inline h-8 w-8";

  return (
    <div class="my-2 flex justify-around lg:flex-col lg:justify-evenly lg:items-center lg:w-1/3 lg:h-full rounded-md">
      <div class={`${listItemStyles}`}>
        <a class={`${linkStyles}`} aria-label="phone" href="tel:17075099345">
          <span class={`${labelStyles}`}>phone</span>
          <img class={`${iconStyles}`} alt="phone icon" src="/phone-icon.svg" />
        </a>
      </div>
      <div class={`${listItemStyles}`}>
        <a class={`${linkStyles}`} aria-label="email" href="mailto:nathan.piper.sd@gmail.com">
          <span class={`${labelStyles}`}>email</span>
          <img class={`${iconStyles}`} alt="email icon" src="/email-icon.svg" />
        </a>
      </div>
      <div class={`${listItemStyles}`}>
        <a class={`${linkStyles}`} aria-label="Github" href="https://github.com/NathanPip">
          <span class={`${labelStyles}`}>github</span>
          <img class={`${iconStyles}`} alt="github icon" src="/github-icon.svg" />
        </a>
      </div>
      <div class={`${listItemStyles}`}>
        <a class={`${linkStyles}`} aria-label="Linkedin" href="https://www.linkedin.com/in/nathanpiperr/">
          <span class={`${labelStyles}`}>linkedin</span>
          <img class={`${iconStyles}`} alt="linkedin icon" src="/linkedin-icon.svg" />
        </a>
      </div>
      <div class={`${listItemStyles}`}>
        <a class={`${linkStyles}`} aria-label="Twitter" href="https://twitter.com/NathanPiperr">
          <span class={`${labelStyles}`}>twitter</span>
          <img class={`${iconStyles}`} alt="twitter icon" src="/twitter-icon.svg" />
        </a>
      </div>
    </div>
  );
};

export default ContactSocialLinks;
