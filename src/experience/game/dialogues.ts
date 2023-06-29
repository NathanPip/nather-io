import { Character } from "../character";
import { Dialogue } from "../dialogue";
import { Entity } from "../entity";
import { Camera } from "../globals";
import { type Door } from "./entities";
import { openDoor } from "./functions";

export let dialogues: { [key: string]: Dialogue } = {
  //Test Character
};

export const loadDialogues = () => {
  dialogues = {
    "test-first": new Dialogue([
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
            dialogues["test-first"].nextLine();
            openDoor("left_door");
          },
          "open right door": () => {
            dialogues["test-first"].nextLine();
            openDoor("right_door");
          },
        },
      },
    ]),
    "test-second": new Dialogue([
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
    ]),
    "test-default": new Dialogue(
      [
        {
          character: Character.characters["test"],
          line: "okay no more talking",
        },
      ],
      true
    ),
  };
};
