import { createSignal } from "solid-js";
import { type Character } from "./character";
import { Camera } from "./globals";
import { Player } from "./player";

export type DialogueLine = {
    character?: Character;
    line: string;
    choices?: { [key: string]: () => void };
  };

export const [currentDialogue, setCurrentDialogue] = createSignal<Dialogue>();
export const [currentDialogueLine, setCurrentDialogueLine] = createSignal<DialogueLine>();
export const [canSkipDialogue, setCanSkipDialogue] = createSignal(false);
export const [displayDialogue, setDisplayDialogue] = createSignal(false);

export class Dialogue {
    index = 0;
    returning_line?: DialogueLine;
    lines: DialogueLine[];
    restart = false;
    constructor(lines: DialogueLine[], restart?: boolean, returning_line?: DialogueLine) {
        this.lines = lines;
        this.restart = restart || false;
        this.returning_line = returning_line;
    }

    static endDialogue() {
        setDisplayDialogue(() => false);
        setCanSkipDialogue(() => false);
        setCurrentDialogue(() => undefined);
        setCurrentDialogueLine(() => undefined);
        Player.uninteract();
    }

    startDialogue() {
        setDisplayDialogue(() => true);
        setCanSkipDialogue(() => true);
        setCurrentDialogue(() => this);
        if(this.index == 0){
            setCurrentDialogueLine(() => this.lines[this.index]);
        } else if(this.returning_line) {
            setCurrentDialogueLine(() => this.returning_line);
        } else {
            if(this.lines[this.index].choices) setCanSkipDialogue(() => false);
            setCurrentDialogueLine(() => this.lines[this.index]);
        }
    }

    resetDialogue() {
        this.index = 0;
    }

    nextLine() {
        setCanSkipDialogue(() => true);
        if(this.index + 1 >= this.lines.length) {
            Dialogue.endDialogue();
            this.index++;
            if(this.restart) {
                this.resetDialogue();
            }
            return;
        }
        if(currentDialogueLine() !== this.returning_line) {
            this.index++;
        }
        if(this.lines[this.index].choices) setCanSkipDialogue(() => false);
        setCurrentDialogueLine(this.lines[this.index]);
    }
}