
class Action {

    func: () => void;
    nextAction?: Action;
    prevAction?: Action;
    time: number;
    timeout?: number | NodeJS.Timeout;
    _loop = false;

    constructor(func: () => void, time: number) {
        this.func = func;
        this.time = time;
    }

    run() {
        this.func();
        setTimeout(() => {
            this.runNext();
        }, this.time)
        return this;
    }

    runNext() {
        clearTimeout(this.timeout);
        if(this._loop) {
            this.checkLoop();
            return;
        }
        if(this.nextAction){
            this.nextAction.run();
        }
    }

    then(action: Action) {
        this.nextAction = action;
        action.prevAction = this;
        return action;
    }

    checkLoop() {
        if(this.prevAction){
            this.prevAction.checkLoop();
        } else {
            this.run();
        }
    }

    loop() {
        this._loop = true;
    }
}

export function action(func: () => void, time: number) {
    return new Action(func, time);
}