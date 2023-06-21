import { Character } from "../character";
import { Dialogue } from "../dialogue";

export let dialogues: { [key: string]: Dialogue } = {
  //Test Character
};

export const loadDialogues = () => {
  dialogues = {
    "test-first": new Dialogue([
      { character: Character.characters["test"], line: "testing 1,2,3" },
      {
        character: Character.characters["test"],
        line: "oh wow wtf it's working",
      },
      { character: Character.characters["test"], line: "no fucking way dude" },
      {
        character: Character.characters["test"],
        line: "you're just clicking and I'm talking",
        choices: {
          "continue this convo": () => {dialogues["test-first"].nextLine()},
          "continute to next convo": () => {dialogues["test-second"].startDialogue()}
        }
      },
      {
        character: Character.characters["test"],
        line: "shit's kinda cool ngl",
      },
      {
        character: Character.characters["test"],
        line: "anyway, dueces my dude",
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
