var GameTimers = {
    activeLiveTimers: function () {
        if (!TheGame) {
            return [];
        }
        return TheGame.Timers.filter(function (timer) {
           return timer.Active && timer.LiveTimer;
        });
    },
    activeStaticTimers: function () {
        if (!TheGame) {
            return [];
        }
        return TheGame.Timers.filter(function (timer) {
            return timer.Active && !timer.LiveTimer;
        });
    },
    runSingleTimerAsync: async function (timer, checkActive) {
        do {
            await this.runTimerAsync(timer, checkActive);
        } while(timer._wasReset);
    },
    runTimerEventsAsync: async function () {
        if (Globals.bRunningTimers) {
            return;
        }

        Globals.bRunningTimers = true;
        for(const timer of this.activeStaticTimers()) {
            if (timer != null) {
                Logger.logExecutingTimer(timer);
                await GameTimers.runSingleTimerAsync(timer, true);
            }
        }
        Globals.bRunningTimers = false;
        GameUI.refreshPanelItems();
    },
    runTimerAsync: async function (timer, checkActive) {
        let didRun = false;
        timer._wasReset = false;

        if (checkActive) {
            if (!timer.Active) {
                return false;
            }

            timer.TurnNumber++;
            if (timer.TurnNumber > timer.Length && timer.TType == "TT_LENGTH") {
                if (!timer.Restart)
                    timer.Active = false;
                timer.TurnNumber = 0;
                return false;
            }
        }

        let tempact = Finder.action(timer.Actions, "<<On Each Turn>>");
        if (tempact != null) {
            if (timer.LiveTimer) {
                Globals.runningLiveTimerCommands = true;
                await GameActions.processActionAsync(tempact, true);
                Globals.runningLiveTimerCommands = false;
                return true;
            } else {
                await GameActions.processActionAsync(tempact, false);
                didRun = true;
            }
        }
        UpdateStatusBars();

        if (timer._wasReset) {
            return didRun;
        }
        if (!timer.Active) {
            return didRun;
        }

        tempact = Finder.action(timer.Actions, "<<On Turn " + timer.TurnNumber.toString() + ">>");
        if (tempact != null) {
            await GameActions.processActionAsync(tempact, false);
            didRun = true;
        }
        UpdateStatusBars();

        if (timer._wasReset) {
            return didRun;
        }
        if (!timer.Active) {
            return didRun;
        }

        if (timer.TurnNumber == timer.Length) {
            tempact = Finder.action(timer.Actions, "<<On Last Turn>>");
            if (tempact != null) {
                await GameActions.processActionAsync(tempact, false);
                didRun = true;
            }
        }
        UpdateStatusBars();
        return didRun;
    },

    tickLiveTimersAsync: async function (skipRefresh) {
        if(!TheGame || Globals.endGame) {
            return;
        }

        // XXX Live timers are designed to run in parallel (each timer runs in its own thread
        //     in RAGS). That's not really something we can do in Web and that's a bad practice
        //     anyway as multiple threads could change the game state without locking in RAGS.

        let resumePause = false;
        let didRun = false;
        for(const timer of this.activeLiveTimers()) {
            if(Globals.endGame) return;

            timer.curtickcount += 1000;
            if (timer.curtickcount >= timer.TimerSeconds * 1000) {
                timer.curtickcount = 0;

                if(GameController.gamePaused) {
                    // Cancel the pause, run the timer(s) and resume the pause
                    resumePause = true;
                    GameController.continue(true);
                    await GameTimers.runTimerAsync(timer, true);

                } else if(GameController.gameAwaitingInput) {
                    // Defer timer execution until input has been given
                    GameController.queueLiveTime(timer);

                } else {
                    didRun |= await GameTimers.runTimerAsync(timer, true);
                }

                if (!skipRefresh) {
                    GameUI.refreshPanelItems();
                }
            }
        }

        if(resumePause) {
            // Put the game back in pause
            await GameController.pauseAsync(true);
        } else if(didRun) {
            // FIXME Do we really need that?
            GameUI.onInteractionResume();
        }
    },

    scheduleLiveTimersAsync: async function (oneSecond) {
        await GameTimers.tickLiveTimersAsync();
        GameUI.displayLiveTimers();
        setTimeout(async function () {
            await GameTimers.scheduleLiveTimersAsync(oneSecond);
        }, oneSecond);
    }
};


