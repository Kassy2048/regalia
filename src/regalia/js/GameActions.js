var GameActions = {
    executeActionAsync: async function (act, runNext) {
        Logger.logExecutingAction(act);

        if(act.Conditions.length === 0) {
            // No condition
            await GameCommands.runCommandsAsync(act.PassCommands);
        } else {
            let bResult = act.bConditionFailOnFirst;

            for(const tempcond of act.Conditions) {
                const bPassed = await GameConditions.testConditionAsync(tempcond, act, null);
                const commands = bPassed ? tempcond.PassCommands : tempcond.FailCommands;

                // TODO Check the result and break if true?
                await GameCommands.runCommandsAsync(commands);
                if(Globals.endGame) return;

                if(act.bConditionFailOnFirst) {
                    bResult = bPassed;
                    if(!bResult) break;
                } else {
                    bResult |= bPassed;
                }
            }

            const commands = bResult ? act.PassCommands : act.FailCommands;
            await GameCommands.runCommandsAsync(commands);
        }
    },

    processActionAsync: async function(action, bTimer, objectBeingActedUpon) {
        var act = null;

        if (getObjectClass(action) == "action" || action.actionparent != null) //"actionparent" in action)
            act = action;
        else {
            for (var i = 0; i < Globals.curActions.length; i++) {
                if (Globals.curActions[i].name == action) {
                    act = Globals.curActions[i];
                    break;
                }
            }
        }

        if(Settings.debugEnabled) console.debug(objectBeingActedUpon, act);

        Globals.store({
            objectBeingActedUpon: objectBeingActedUpon,
            actionBeingTaken: act,
        });

        if (act.InputType === "None") {
            // No input to wait for

        } else if (act.InputType == "Text") {
            $("#textactionMenuTitle").text(act.CustomChoiceTitle);
            $("#textactionchoice").css("visibility", "visible");
            $("#textactionchoice input").focus();
            await GameController.startAwaitingInputAsync();

        } else {
            GameUI.clearInputChoices();

            function addPortalObjectChoices() {
                // Real talk: I don't know what this is supposed to do or whether it still works
                if (TheGame.Player.CurrentRoom != null) {
                    var currentroom = Finder.room(TheGame.Player.CurrentRoom);
                    if (!currentroom) {
                        return;
                    }

                    currentroom.Exits.forEach(function (roomExit) {
                        if (roomExit.PortalObjectName != "<None>") {
                            var tempobj = Finder.object(roomExit.PortalObjectName);
                            if (tempobj && tempobj.bVisible) {
                                GameUI.addInputChoice(act, objecttostring(tempobj), tempobj);

                                if (tempobj.bContainer) {
                                    if (!tempobj.bOpenable || tempobj.bOpen) {
                                        GameUI.addOpenedObjects(tempobj, $("#inputchoices"), "inputchoices");
                                    }
                                }
                            }
                        }
                    })
                }
            }

            if (act.InputType == "Custom") {
                act.CustomChoices.forEach(function (customChoice) {
                    var replacedChoiceText = PerformTextReplacements(customChoice);
                    GameUI.addInputChoice(act, replacedChoiceText, replacedChoiceText);
                });
            } else if (act.InputType == "Character") {
                GameUI.addCharacterOptions(act);
            } else if (act.InputType == "Object") {
                GameUI.addObjectOptions(act);
                addPortalObjectChoices();
            } else if (act.InputType == "Inventory") {
                Interactables.inventoryObjects().forEach(function (obj) {
                    GameUI.addInputChoice(act, objecttostring(obj), obj);
                });
            } else if (act.InputType == "ObjectOrCharacter") {
                addPortalObjectChoices();
                GameUI.addObjectOptions(act);
                GameUI.addCharacterOptions(act);
            }

            GameUI.setInputMenuTitle(act);
            await GameController.startAwaitingInputAsync();
        }

        await this.executeActionAsync(act, bTimer);

        SetBorders();

        Globals.restore();
    },

    runEventsAsync: async function (EventType) {
        var startingroomid = TheGame.Player.CurrentRoom;
        var curroom = Finder.room(startingroomid);
        var tempact = Finder.action(curroom.Actions, EventType);
        if (tempact != null) {
            await GameActions.processActionAsync(tempact, false);
        }
        tempact = Finder.action(TheGame.Player.Actions, EventType);
        if (tempact != null) {
            await GameActions.processActionAsync(tempact, false);
        }
        const isPlayerEnter = EventType.indexOf("Player Enter") != -1;
        const isPlayerLeave = EventType.indexOf("Player Leave") != -1;
        for(const obj of Interactables.roomObjects()) {
            if (isPlayerEnter) {
                if (!obj.bEnterFirstTime) {
                    tempact = Finder.action(obj.Actions, "<<On Player Enter First Time>>");
                    obj.bEnterFirstTime = true;
                    if (tempact != null) {
                        await GameActions.processActionAsync(tempact, false, obj);
                    }
                }
            } else if (isPlayerLeave) {
                if (!obj.bLeaveFirstTime) {
                    tempact = Finder.action(obj.Actions, "<<On Player Leave First Time>>");
                    obj.bLeaveFirstTime = true;
                    if (tempact != null) {
                        await GameActions.processActionAsync(tempact, false, obj);
                    }
                }
            }
            tempact = Finder.action(obj.Actions, EventType);
            if (tempact != null) {
                if (EventType == "<<On Player Enter>>" || EventType == "<<On Player Leave>>") {
                    if (EventType == "<<On Player Enter>>") {
                        if (startingroomid == TheGame.Player.CurrentRoom) {
                            await GameActions.processActionAsync(tempact, false, obj);
                        }
                    } else {
                        await GameActions.processActionAsync(tempact, false, obj);
                    }
                }
            }
            if (obj.bContainer && (!obj.bOpenable || obj.bOpen)) {
                for(const tempobj2 of TheGame.Objects) {
                    if ((tempobj2.locationtype == "LT_IN_OBJECT") && (tempobj2.locationname == obj.UniqueIdentifier)) {
                        if (isPlayerEnter) {
                            if (!tempobj2.bEnterFirstTime) {
                                tempact = Finder.action(tempobj2.Actions, "<<On Player Enter First Time>>");
                                tempobj2.bEnterFirstTime = true;
                                if (tempact != null)
                                    await GameActions.processActionAsync(tempact, false, tempobj2);
                            }
                        } else if (isPlayerLeave) {
                            if (!tempobj2.bLeaveFirstTime) {
                                tempact = Finder.action(tempobj2.Actions, "<<On Player Leave First Time>>");
                                tempobj2.bLeaveFirstTime = true;
                                if (tempact != null) {
                                    await GameActions.processActionAsync(tempact, false, tempobj2);
                                }
                            }
                        }
                        tempact = Finder.action(tempobj2.Actions, EventType);
                        if (tempact != null) {
                            if (EventType == "<<On Player Enter>>" || EventType == "<<On Player Leave>>") {
                                if (EventType == "<<On Player Enter>>") {
                                    if (startingroomid == TheGame.Player.CurrentRoom) {
                                        await GameActions.processActionAsync(tempact, false, tempobj2);
                                    }
                                } else {
                                    await GameActions.processActionAsync(tempact, false, tempobj2);
                                }
                            }
                        }
                    }
                }
            }
        }
        for(const character of Interactables.characters()) {
            if (isPlayerEnter) {
                if (!character.bEnterFirstTime) {
                    tempact = Finder.action(character.Actions, "<<On Player Enter First Time>>");
                    character.bEnterFirstTime = true;
                    if (tempact != null)
                        await GameActions.processActionAsync(tempact, false);
                }
            } else if (isPlayerLeave) {
                if (!character.bLeaveFirstTime) {
                    tempact = Finder.action(character.Actions, "<<On Player Leave First Time>>");
                    character.bLeaveFirstTime = true;
                    if (tempact != null)
                        await GameActions.processActionAsync(tempact, false);
                }
            }
            tempact = Finder.action(character.Actions, EventType);
            if (tempact != null) {
                if (EventType == "<<On Player Enter>>" || EventType == "<<On Player Leave>>") {
                    if (EventType == "<<On Player Enter>>") {
                        if (startingroomid == TheGame.Player.CurrentRoom) {
                            await GameActions.processActionAsync(tempact, null);
                        }
                    } else
                        await GameActions.processActionAsync(tempact, false);
                }
            }
        }
    }
};
