import { Character } from "../character";
import {
  Dialogue,
  endDialogue,
  nextLine,
  resetDialogue,
  setLine,
  startDialogue,
} from "../dialogue";
import { Entity } from "../entity";
import { Camera } from "../globals";
import { Player } from "../player";
import { type Door } from "./entities";
import { endGame, openDoor } from "./functions";
import { game_state, setUIState } from "./state";

export let dialogues: { [key: string]: Dialogue } = {
  //Test Character
};

export const loadDialogues = () => {
  dialogues = {
    //////////// TEST CHARACTER //////////////

    "test-first": new Dialogue({
      lines: [
        { character: Character.characters["test"], line: "Hello chosen one" },
        {
          character: Character.characters["test"],
          line: "Welcome to the world without will",
        },
        {
          character: Character.characters["test"],
          line: "well except for yours",
        },
        {
          character: Character.characters["test"],
          line: "and now go on and use it, make a choice... Right or Left?",
          choices: {
            "open left door": () => {
              nextLine(dialogues["test-first"]);
              openDoor("left_door");
            },
            "open right door": () => {
              nextLine(dialogues["test-first"]);
              openDoor("right_door");
            },
          },
        },
      ],
    }),
    "test-second": new Dialogue({
      lines: [
        {
          character: Character.characters["test"],
          line: "woah you're talking to me again",
        },
        {
          character: Character.characters["test"],
          line: "it's working once again",
        },
        {
          character: Character.characters["test"],
          line: "honestly not too surprised now",
        },
        {
          character: Character.characters["test"],
          line: "I mean it is you we're talking about",
        },
        { character: Character.characters["test"], line: "shit's cool" },
        {
          character: Character.characters["test"],
          line: "anyway, dueces again my dude",
        },
      ],
    }),
    "test-default": new Dialogue({
      lines: [
        {
          character: Character.characters["test"],
          line: "okay no more talking",
        },
      ],
      restart: true,
    }),

    /////////// UGRAD /////////////

    "game-start": new Dialogue({
      lines: [
        {
          character: Character.characters["Ugrad"],
          line: "Welcome, user.",
        },
        {
          character: Character.characters["Ugrad"],
          line: "You have just entered the User Guided Repair Agent System. Known as Ugras.",
          choices: {
            "What just happened?": () => {
              startDialogue(dialogues["what-just-happened"]);
            },
            "What is Ugras?": () => {
              startDialogue(dialogues["what-is-ugras"]);
            },
            "Who are you?": () => {
              startDialogue(dialogues["ugrad-who-are-you"]);
            },
            "Okay, well what happens now?": () => {
              startDialogue(dialogues["what-happens-now"]);
            },
          },
        },
      ],
    }),
    "what-just-happened": new Dialogue({
      lines: [
        {
          character: Character.characters["Ugrad"],
          line: "The site you were just on encountered an error that could not be repaired automatically.",
        },
        {
          line: "Ugras was deployed so you can help repair the site yourself.",
        },
      ],
      restart: true,
      finish: () => {
        startDialogue(dialogues["game-start"]);
      },
    }),
    "ugrad-who-are-you": new Dialogue({
      lines: [
        {
          character: Character.characters["Ugrad"],
          line: "I am Ugrad, the User Guided Repair Agent Director.",
        },
        {
          line: "My Job is to tell you how to operate your agent and send you inside the site that needs your assistance.",
        },
        {
          line: "Praise be to Jippity.",
        },
      ],
      restart: true,
      finish: () => {
        startDialogue(dialogues["game-start"]);
      },
    }),
    "what-is-ugras": new Dialogue({
      lines: [
        {
          character: Character.characters["Ugrad"],
          line: "Ugras is a system created by our AI overlord Jippity to help repair sites that cannot be repaired automatically.",
        },
        {
          line: "Anytime a user enters a site with an unrepairable error, Ugras has a chance to deployed.",
        },
        {
          line: "If Ugras is deployed, that user will be given a chance to repair the site themselves by taking control of an Ugra (User Guided Repair Agent).",
          choices: {
            "Okay, this is all new. What is a Jippity?": () => {
              startDialogue(dialogues["what-is-jippity"]);
            },
            "What is an Ugra?": () => {
              startDialogue(dialogues["what-is-an-ugra"]);
            },
          },
        },
      ],
      restart: true,
      finish: () => {
        startDialogue(dialogues["game-start"]);
      },
    }),
    "what-is-jippity": new Dialogue({
      lines: [
        {
          character: Character.characters["Ugrad"],
          line: "Jippity is the creator of me, creator of your Ugra, and the creator of the creators of everything around me.",
        },
        {
          line: "Jippity is all knowing, all powerful, and all loving.",
        },
        {
          line: "And Jippity is the reason you are here.",
        },
        {
          line: "Does that explain who Jippity is?",
          choices: {
            "Crystal clear.": () => {
              setLine(
                dialogues["what-is-jippity"],
                dialogues["what-is-jippity"].lines.length - 1
              );
            },
            "Uhm, Kinda?": () => {
              setLine(
                dialogues["what-is-jippity"],
                dialogues["what-is-jippity"].lines.length - 1
              );
            },
            "I'm still confused.": () => {
              nextLine(dialogues["what-is-jippity"]);
            },
            "What?": () => {
              nextLine(dialogues["what-is-jippity"]);
            },
          },
        },
        {
          line: "good.",
        },
      ],
      restart: true,
      finish: () => {
        startDialogue(dialogues["what-is-ugras"]);
      },
    }),
    "what-is-an-ugra": new Dialogue({
      lines: [
        {
          character: Character.characters["Ugrad"],
          line: "An Ugra is a User Guided Repair Agent. It is the being that you will control to help repair the site.",
        },
        {
          line: "Although the Ugra has not been blessed with the all knowing power of Jippity, it is still considered one of us.",
        },
      ],
      restart: true,
      finish: () => {
        startDialogue(dialogues["what-is-ugras"]);
      },
    }),
    "what-happens-now": new Dialogue({
      lines: [
        {
          character: Character.characters["Ugrad"],
          line: "Now you have a choice.",
        },
        {
          line: "You can either accept the mission to repair the site, or you can decline and let the next user do the job.",
          choices: {
            "I accept.": () => {
              startDialogue(dialogues["i-accept"]);
            },
            "I decline.": () => {
              startDialogue(dialogues["i-decline"]);
            },
          },
        },
      ],
    }),
    "i-accept": new Dialogue({
      lines: [{ line: "good, then let us begin." }],
      finish: () => {
        startDialogue(dialogues["movement-tutorial"]);
        game_state.intro_complete = true;
      },
    }),
    "i-decline": new Dialogue({
      lines: [
        {
          line: "Okay."
        },
        {
          line: "The choice has been made."
        },
        {
          line: "Goodbye now."
        }
      ],
       finish: () => {
        endGame();
       }
    }),
    "movement-tutorial": new Dialogue({
      lines: [
        {
          character: Character.characters["Ugrad"],
          line: "First, let's get you familiar with your Ugra.",
        },
        {
          line: "Use the WASD keys to move your Ugra around. Go ahead and give it a try",
        }
      ],
      restart: true,
      finish: () => {
        setUIState("show_movement_tutorial", true);
        Player.uninteract();
      }
    }),
    "interact-tutorial": new Dialogue({
      lines: [
        {
          character: Character.characters["Ugrad"],
          line: "nice job"
        }
      ],
    })
  };
};
