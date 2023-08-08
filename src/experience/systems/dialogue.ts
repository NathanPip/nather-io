import { createSignal } from "solid-js";
import { type Character } from "../entities-base/character";
import { Camera } from "./globals";
import { Player } from "../player";

export type DialogueLine = {
  character?: Character;
  line: string;
  choices?: { [key: string]: () => void };
  finish?: () => void;
};

type DialogueProps = {
  lines: DialogueLine[];
  restart?: boolean;
  is_ending?: boolean;
  finish?: () => void;
  start?: () => void;
  returning_line?: DialogueLine;
};

export const [currentDialogue, setCurrentDialogue] = createSignal<Dialogue>();
export const [currentDialogueLine, setCurrentDialogueLine] =
  createSignal<DialogueLine>();
export const [canSkipDialogue, setCanSkipDialogue] = createSignal(false);
export const [displayDialogue, setDisplayDialogue] = createSignal(false);

export class Dialogue {
  index = 0;
  returning_line?: DialogueLine;
  lines: DialogueLine[];
  finish?: () => void;
  start?: () => void;
  restart = false;
  move = true;
  constructor(properties: DialogueProps) {
    this.lines = properties.lines;
    this.restart = properties.restart || false;
    this.returning_line = properties.returning_line;
    this.finish = properties.finish;
    this.start = properties.start;
  }
}

export function nextLine(dialogue: Dialogue) {
  setCanSkipDialogue(() => true);
  if(dialogue.lines[dialogue.index].finish){
    (dialogue.lines[dialogue.index] as any).finish();
  }
  if (dialogue.index + 1 >= dialogue.lines.length) {
    endDialogue();
    dialogue.index++;
    if (dialogue.finish) {
      dialogue.finish();
    }
    if (dialogue.restart) {
      resetDialogue(dialogue);
    }
    return;
  }
  if (currentDialogueLine() !== dialogue.returning_line) {
    dialogue.index++;
  }
  if (dialogue.lines[dialogue.index].choices) setCanSkipDialogue(() => false);
  if (dialogue.lines[dialogue.index].character !== undefined) {
    const character = dialogue.lines[dialogue.index].character;
    Camera.moveTo({
      x: character!.world_position.x + character!.width / 2,
      y: character!.world_position.y + character!.height / 2,
    });
  }
  setCurrentDialogueLine(dialogue.lines[dialogue.index]);
}

export function jumpLine(dialogue: Dialogue, num: number) {
  dialogue.index += num - 1;
  nextLine(dialogue);
}

export function setLine(dialogue: Dialogue, index: number) {
  dialogue.index = index - 1;
  nextLine(dialogue);
}

export function resetDialogue(dialogue: Dialogue) {
  dialogue.index = 0;
}

export function startDialogue(dialogue: Dialogue) {
  if(dialogue === undefined) {
    console.error("Dialogue is undefined");
    return;
  }
  Player.can_move = false;
  if(dialogue.start !== undefined) {dialogue.start();}
  if(dialogue.move && dialogue.lines[dialogue.index].character !== undefined) {
    const character = dialogue.lines[dialogue.index].character;
    Camera.moveTo({
      x: character!.world_position.x + character!.width / 2,
      y: character!.world_position.y + character!.height / 2,
    });
  }
  setDisplayDialogue(() => true);
  setCanSkipDialogue(() => true);
  setCurrentDialogue(() => dialogue);
  if (dialogue.index == 0) {
    setCurrentDialogueLine(() => dialogue.lines[dialogue.index]);
  } else if (dialogue.returning_line) {
    setCurrentDialogueLine(() => dialogue.returning_line);
  } else {
    if (dialogue.lines[dialogue.index].choices) setCanSkipDialogue(() => false);
    setCurrentDialogueLine(() => dialogue.lines[dialogue.index]);
  }
}

export function endDialogue() {
  Player.can_move = true;
  setDisplayDialogue(() => false);
  setCanSkipDialogue(() => false);
  setCurrentDialogue(() => undefined);
  setCurrentDialogueLine(() => undefined);
}

export function showDialogue() {
  setDisplayDialogue(() => true);
}

export function hideDialogue() {
  setDisplayDialogue(() => false);
}
