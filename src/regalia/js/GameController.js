var GameController = {
    gamePaused: false,
    gameAwaitingInput: false,
    inputPromises: [],
    liveTimersToRun: [],

    title: function () {
        if (TheGame.Title) {
            return TheGame.Title;
        }

        var urlParts = window.location.href.split("/");
        var penultimateUrlPart = urlParts[urlParts.length - 2];
        return decodeURIComponent(penultimateUrlPart);
    },

    startAwaitingInputAsync: async function () {
        this.gameAwaitingInput = true;

        // Somewhat of a hack: normally if commands executed as the result of a live timer
        // the are allowed to succeed even if the game is paused. In the desktop RAGS client,
        // live timer events seem to keep happening even if input is requested from the user.

        // That's hard to implement well, so this just makes it so if the player is asked for
        // input it doesn't try to clear out the rest of the event queue until execution
        // resumes normally
        Globals.runningLiveTimerCommands = false;

        GameUI.onInteractionResume();
        GameUI.disableSaveAndLoad();
        GameUI.hideGameElements();

        await this.userActionAsync();
    },

    stopAwaitingInputAsync: async function (resume) {
        if (resume === undefined) resume = true;

        this.gameAwaitingInput = false;
        GameUI.enableSaveAndLoad();
        GameUI.showGameElements();

        // Execute pending live timers if any
        const liveTimersToRun = this.liveTimersToRun;
        this.liveTimersToRun = [];
        for(const timer of liveTimersToRun) {
            await GameTimers.runTimerAsync(timer, true);
        }

        if(resume) return this.resumeExecution();
    },

    /** Queue a pending live timer to be executed after the current user input */
    queueLiveTimer: function(timer) {
        if(!this.gameAwaitingInput) {
            console.warn('queueLiveTimer() should only be called while waiting for input');
        }

        this.liveTimersToRun.push(timer);
    },

    executeAndRunTimersAsync: async function (fn) {
        var wasRunningTimers = Globals.bRunningTimers;

        await fn();

        if (!wasRunningTimers) {  // TOCHECK
            await GameTimers.runTimerEventsAsync();
            UpdateStatusBars();
        }
    },

    pauseAsync: async function (noWait) {
        this.gamePaused = true;
        GameUI.disableSaveAndLoad();
        GameUI.hideGameElements();
        GameUI.onInteractionResume();

        if(noWait) return;
        await this.userActionAsync();
    },

    continue: function (noResume) {
        this.gamePaused = false;
        GameUI.enableSaveAndLoad();
        GameUI.showGameElements();

        if(noResume) return false;
        return this.resumeExecution();
    },

    shouldRunCommands: function () {  // TODO Rename
        return !(this.gamePaused || this.gameAwaitingInput);
    },

    userActionAsync: async function() {
        const inputPromise = new SimplePromise();
        this.inputPromises.push(inputPromise);
        return inputPromise;
    },

    resumeExecution: function() {
        // Notify the end of the wait
        const inputPromise = this.inputPromises.pop();
        if(inputPromise !== undefined) {
            inputPromise.resolve();
            return true;
        }

        // Return false if there was no waiter
        return false;
    },

    reset: function() {
        this.gamePaused = false;
        this.gameAwaitingInput = false;
        this.inputPromises = [];
        this.liveTimersToRun = [];
        GameUI.enableSaveAndLoad();
    },
};
