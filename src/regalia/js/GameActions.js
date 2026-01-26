var GameActions = {
    executeAction: function (act, runNext) {
        Logger.logExecutingAction(act);

        if(act.Conditions.length === 0) {
            // No condition
            GameCommands.addCommands(runNext, act.PassCommands);
        } else {
            const actionCondition = new ActionCondition(act);
            GameCommands.addCommands(runNext, [actionCondition.getNext()]);
        }
    },

    processAction: function(action, bTimer, objectBeingActedUpon, callback) {
        var act = null;
        Globals.bMasterTimer = bTimer;

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

        var commandList = CommandLists.startNestedCommandList({obj: objectBeingActedUpon, act: act});

        if (act.InputType === "None") {
            this.executeAction(act, bTimer);
            afterActionsProcessed();
            return;
        }

        if (act.InputType == "Text") {
            Globals.inputDataObject = act;
            $("#textactionMenuTitle").text(act.CustomChoiceTitle);
            $("#textactionchoice").css("visibility", "visible");
            $("#textactionchoice input").focus();
            GameController.startAwaitingInput();
            afterActionsProcessed();
            return;
        }

        GameUI.clearInputChoices();

        function afterActionsProcessed() {
            SetBorders();
            runAfterPause(function () {
                CommandLists.finishNestedCommandList(commandList);
                SetBorders();
                if(callback !== undefined) callback();
            }, commandList);
        }

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
        GameController.startAwaitingInput();

        afterActionsProcessed();
    },

    runEvents: function (EventType, done) {
        var startingroomid = TheGame.Player.CurrentRoom;
        var curroom = Finder.room(startingroomid);
        var tempact = Finder.action(curroom.Actions, EventType);
        if (tempact != null) {
            runAfterPause(function () {
                GameActions.processAction(tempact, false);
            });
        }
        tempact = Finder.action(TheGame.Player.Actions, EventType);
        if (tempact != null) {
            runAfterPause(function () {
                GameActions.processAction(tempact, false);
            });
        }
        Interactables.roomObjects().forEach(function (obj) {
            runAfterPause(function () {
                if (EventType.indexOf("Player Enter") > -1) {
                    if (!obj.bEnterFirstTime) {
                        tempact = Finder.action(obj.Actions, "<<On Player Enter First Time>>");
                        obj.bEnterFirstTime = true;
                        if (tempact != null) {
                            GameActions.processAction(tempact, false, obj);
                        }
                    }
                } else if (EventType.indexOf("Player Leave") > -1) {
                    if (!obj.bLeaveFirstTime) {
                        tempact = Finder.action(obj.Actions, "<<On Player Leave First Time>>");
                        obj.bLeaveFirstTime = true;
                        if (tempact != null) {
                            GameActions.processAction(tempact, false, obj);
                        }
                    }
                }
                tempact = Finder.action(obj.Actions, EventType);
                if (tempact != null) {
                    if (EventType == "<<On Player Enter>>" || EventType == "<<On Player Leave>>") {
                        if (EventType == "<<On Player Enter>>") {
                            if (startingroomid == TheGame.Player.CurrentRoom) {
                                GameActions.processAction(tempact, false, obj);
                            }
                        } else {
                            GameActions.processAction(tempact, false, obj);
                        }
                    }
                }
                if (obj.bContainer && (!obj.bOpenable || obj.bOpen)) {
                    TheGame.Objects.forEach(function (tempobj2) {
                        runAfterPause(function () {
                            if ((tempobj2.locationtype == "LT_IN_OBJECT") && (tempobj2.locationname == obj.UniqueIdentifier)) {
                                if (EventType.indexOf("Player Enter") > -1) {
                                    if (!tempobj2.bEnterFirstTime) {
                                        tempact = Finder.action(tempobj2.Actions, "<<On Player Enter First Time>>");
                                        tempobj2.bEnterFirstTime = true;
                                        if (tempact != null)
                                            GameActions.processAction(tempact, false, tempobj2);
                                    }
                                } else if (EventType.indexOf("Player Leave") > -1) {
                                    if (!tempobj2.bLeaveFirstTime) {
                                        tempact = Finder.action(tempobj2.Actions, "<<On Player Leave First Time>>");
                                        tempobj2.bLeaveFirstTime = true;
                                        if (tempact != null) {
                                            GameActions.processAction(tempact, false, tempobj2);
                                        }
                                    }
                                }
                                tempact = Finder.action(tempobj2.Actions, EventType);
                                if (tempact != null) {
                                    if (EventType == "<<On Player Enter>>" || EventType == "<<On Player Leave>>") {
                                        if (EventType == "<<On Player Enter>>") {
                                            if (startingroomid == TheGame.Player.CurrentRoom) {
                                                GameActions.processAction(tempact, false, tempobj2);
                                            }
                                        } else {
                                            GameActions.processAction(tempact, false, tempobj2);
                                        }
                                    }
                                }
                            }
                        });
                    });
                }
            });
        });
        Interactables.characters().forEach(function (character) {
            runAfterPause(function () {
                if (EventType.indexOf("Player Enter") > -1) {
                    if (!character.bEnterFirstTime) {
                        tempact = Finder.action(character.Actions, "<<On Player Enter First Time>>");
                        character.bEnterFirstTime = true;
                        if (tempact != null)
                            GameActions.processAction(tempact, false);
                    }
                } else if (EventType.indexOf("Player Leave") > -1) {
                    if (!character.bLeaveFirstTime) {
                        tempact = Finder.action(character.Actions, "<<On Player Leave First Time>>");
                        character.bLeaveFirstTime = true;
                        if (tempact != null)
                            GameActions.processAction(tempact, false);
                    }
                }
                tempact = Finder.action(character.Actions, EventType);
                if (tempact != null) {
                    if (EventType == "<<On Player Enter>>" || EventType == "<<On Player Leave>>") {
                        if (EventType == "<<On Player Enter>>") {
                            if (startingroomid == TheGame.Player.CurrentRoom) {
                                GameActions.processAction(tempact, null);
                            }
                        } else
                            GameActions.processAction(tempact, false);
                    }
                }
            });
        });

        runAfterPause(done);
    }
};

function ActionCondition(Action) {
    this.Action = Action;
    this.Conditions = Action.Conditions;
    this.bPassed = this.Conditions.length === 0;
    this.AdditionalData = CommandLists.lastAdditionalData();
    this.Index = 0;

    this.getNext = function() {
        // Clone the condition, setting the ActionCondition property
        const originalCond = this.Conditions[this.Index];
        const actionCond = new ragscondition();

        actionCond.conditionname = originalCond.conditionname;
        actionCond.PassCommands = originalCond.PassCommands;
        actionCond.FailCommands = originalCond.FailCommands;
        actionCond.Checks = originalCond.Checks;
        actionCond.ActionCondition = this;

        return actionCond;
    };

    this.executeCondition = function() {
        const tempcond = this.Conditions[this.Index];
        const bPassed = GameConditions.testCondition(tempcond, this.Action, null);
        const commands = bPassed ? tempcond.PassCommands : tempcond.FailCommands;

        this.Index++;

        if(this.Action.bConditionFailOnFirst) {
            if(!bPassed) {
                return commands.concat(this.Action.FailCommands);
            } else if(this.Index >= this.Conditions.length) {
                return commands.concat(this.Action.PassCommands);
            } else {
                return commands.concat(this.getNext());
            }
        } else {
            this.bPassed |= bPassed;
            if(this.Index >= this.Conditions.length) {
                if(this.bPassed) {
                    return commands.concat(this.Action.PassCommands);
                } else {
                    return commands.concat(this.Action.FailCommands);
                }
            } else {
                return commands.concat(this.getNext());
            }
        }
    };
}
