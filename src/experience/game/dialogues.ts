import { Pickup } from "../entities-base/pickup";
import { Character } from "../entities-base/character";
import {
  Dialogue,
  endDialogue,
  hideDialogue,
  nextLine,
  resetDialogue,
  setLine,
  showDialogue,
  startDialogue,
} from "../systems/dialogue";
import { Entity } from "../entity";
import { DataPacket, TutorialDataPacket } from "../entities-game/data-packet";
import { Camera } from "../systems/globals";
import { Player } from "../player";
import { Sprite } from "../sprite";
import { type Door } from "./entities";
import { endGame, openDoor } from "./functions";
import { game_state, setUIState } from "./state";

export let dialogues: { [key: string]: Dialogue } = {
  //Test Character
};

export function loadDialogues () {
  dialogues = {
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
            "Okay, got it.": () => {
              nextLine(dialogues["what-is-ugras"]);
            }
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
        game_state.movement_tutorial_complete = true;
        Player.uninteract();
      }
    }),
    "interact-tutorial-start": new Dialogue({
      lines: [
        {
          character: Character.characters["Ugrad"],
          line: "nice job"
        },
        {
          line: "now let's learn about interacting with things in this digital world"
        },
        {
          line: "to interact with something, you must first approach it and then press the E key"
        },
        {
          line: "go ahead and try it on me now"
        }
      ],
      finish: () => {
        setUIState("show_interact_tutorial", true);
        Player.uninteract();
        Camera.clearMove();
      }
    }),
    "interact-tutorial-talk": new Dialogue({
      lines: [
        {
          character: Character.characters["Ugrad"],
          line: "you learn quick"
        },
        {
          line: "now let's learn about picking objects up",
          finish: () => {
            Character.characters["Ugrad"].is_interactable = false;
            hideDialogue();
            const pickup = new TutorialDataPacket();
            pickup.throw({x: -2, y: 0});
            Camera.moveTo(pickup.world_position, 15, "ease-in-out")
            setTimeout(() => {
              showDialogue();
              Camera.moveTo(Character.characters["Ugrad"].world_position.add({x:1, y:1}), 45, "ease-in-out")
            }, 1500);
          }
        },
        {
          line: "Approach the packet I just threw out and pick it up by pressing the E key"
        },
      ],
      start: () => {
        setUIState("show_interact_tutorial", false);
      },
      finish: () => {
        Player.uninteract();
      }
    }),
    "interact-tutorial-pickup": new Dialogue({
      lines: [
        {
          character: Character.characters["Ugrad"],
          line: "The packet is now attached to your Ugra."
        }, 
        {
          line: "While an object like a packet is attached to your Ugra you can use it on other objects in the world by approaching them and pressing the E key"
        },
        {
          line: "Go ahead and try it on that terminal to the right of me"
        }
      ],
      restart: true,
      finish: () => {
        Camera.clearMove();
      }
    }),
    "interact-tutorial-receiver-fail": new Dialogue({
      lines: [
        {
          character: Character.characters["Ugrad"],
          line: "Whoops... I think I gave you the wrong one. My bad... one sec here."
        }, 
        {
          line: "Okay, here's the right one. Go ahead and take that other one out of the terminal.",
          finish: () => {
            const pickup = new DataPacket();
            pickup.setWorldPosition(Character.characters["Ugrad"].world_position);
            pickup.throw({x: -2, y: 0});
            pickup.data_type = "enter";
          }
        },
      ],
      finish: () => {
        Camera.clearMove();
      }
    })
  };
}
