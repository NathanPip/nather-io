const ContactSocialLinks = () => {
  return (
    <ul class="my-2 flex justify-around">
      <li class="">
        <a class="flex justify-between text-lg font-semibold" href="tel:17075099345">
          <span class="hidden">phone</span>
          <img class="ml-2 inline h-8 w-8" src="/phone-icon.svg" />
        </a>
      </li>
      <li class="">
        <a class="flex justify-between text-lg font-semibold" href="mailto:nathan.piper.sd@gmail.com">
          <span class="hidden">email</span>
          <img class="ml-2 inline h-8 w-8" src="/email-icon.svg" />
        </a>
      </li>
      <li class="">
        <a class="flex justify-between text-lg font-semibold" href="https://github.com/NathanPip">
          <span class="hidden">github</span>
          <img class="ml-2 inline h-8 w-8" src="/github-icon.svg" />
        </a>
      </li>
      <li class="">
        <a class="flex justify-between text-lg font-semibold" href="https://www.linkedin.com/in/nathanpiperr/">
          <span class="hidden">linkedin</span>
          <img class="ml-2 inline h-8 w-8" src="/linkedin-icon.svg" />
        </a>
      </li>
      <li class="">
        <a class="flex justify-between text-lg font-semibold" href="https://twitter.com/NathanPiperr">
          <span class="hidden">twitter</span>
          <img class="ml-2 inline h-8 w-8" src="/twitter-icon.svg" />
        </a>
      </li>
    </ul>
  );
};

export default ContactSocialLinks;
