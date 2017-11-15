var GameActions = {
    executeAction: function (act, runNext, AdditionalInputData) {
        Logger.logExecutingAction(act);
        var bPassed = true;
        if (act.bConditionFailOnFirst) {
            for (var i = 0; i < act.Conditions.length; i++) {
                var tempcond = act.Conditions[i];
                if (GameConditions.testCondition(tempcond, act, Globals.timerInvocation, null)) {
                    if (tempcond.Checks.length == 1 && isLoopCheck(tempcond.Checks[0])) {
                        // Do nothing?
                    } else {
                        GameCommands.addCommands(runNext, tempcond.PassCommands, AdditionalInputData, act);
                    }
                } else {
                    bPassed = false;
                    GameCommands.addCommands(runNext, tempcond.FailCommands, AdditionalInputData, act);
                }
            }
        } else {
            bPassed = (act.Conditions.length === 0);
            for (var i = 0; i < act.Conditions.length; i++) {
                var tempcond = act.Conditions[i];
                var btestresult = GameConditions.testCondition(tempcond, act, Globals.timerInvocation, null);
                if (btestresult) {
                    bPassed = btestresult;
                    GameCommands.addCommands(runNext, tempcond.PassCommands, AdditionalInputData, act);
                } else {
                    GameCommands.addCommands(runNext, tempcond.FailCommands, AdditionalInputData, act);
                }
            }
        }
        GameCommands.addCommands(runNext, bPassed ? act.PassCommands : act.FailCommands, AdditionalInputData, act);
    },

    processAction: function(Action, bTimer, objectBeingActedActedUpon) {
        var act = null;
        Globals.bMasterTimer = bTimer;

        if (getObjectClass(Action) == "action" || Action.actionparent != null) //"actionparent" in Action)
            act = Action;
        else {
            for (var i = 0; i < Globals.curActions.length; i++) {
                if (Globals.curActions[i].name == Action) {
                    act = Globals.curActions[i];
                    break;
                }
            }
        }
        var curclass = getObjectClass(Globals.selectedObj);

        if (objectBeingActedActedUpon) {
            CommandLists.startNestedCommandList({obj: objectBeingActedActedUpon, act: act});
        }

        if (act.InputType === "None") {
            this.executeAction(act, bTimer);
            afterActionsProcessed();
            return;
        }

        Globals.additionalDataContext = {
            action: act,
            timerInvocation: Globals.timerInvocation
        };

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
            if (objectBeingActedActedUpon) {
                runAfterPause(function () {
                    CommandLists.finishNestedCommandList();
                });
            }
        }

        function addObjectChoices() {
            Interactables.roomAndInventoryObjects().forEach(function (obj) {
                GameUI.addInputChoice(act, objecttostring(obj), obj);
            });
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

        function addCharacterChoices() {
            Interactables.characters().forEach(function (character) {
                GameUI.addInputChoice(act, CharToString(character), character.Charname);
            });
        }

        if (act.InputType == "Custom") {
            act.CustomChoices.forEach(function (customChoice) {
                var replacedChoiceText = PerformTextReplacements(customChoice);
                GameUI.addInputChoice(act, replacedChoiceText, replacedChoiceText);
            });
        } else if (act.InputType == "Character") {
            addCharacterChoices();
        } else if (act.InputType == "Object") {
            addObjectChoices();
        } else if (act.InputType == "Inventory") {
            Interactables.inventoryObjects().forEach(function (obj) {
                GameUI.addInputChoice(act, objecttostring(obj), obj);
            });
        } else if (act.InputType == "ObjectOrCharacter") {
            addObjectChoices();
            addCharacterChoices();
        }

        GameUI.setInputMenuTitle(act);
        GameController.startAwaitingInput();

        afterActionsProcessed();
    },

    runEvents: function (EventType, done) {
        try {
            var startingroomid = TheGame.Player.CurrentRoom;
            var curroom = Finder.room(startingroomid);
            var tempact = Finder.action(curroom.Actions, EventType);
            if (tempact != null) {
                GameActions.processAction(tempact, false);
            }
            tempact = Finder.action(TheGame.Player.Actions, EventType);
            if (tempact != null) {
                GameActions.processAction(tempact, false);
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
        } catch (err) {
            var themsg = err.message;
        }
    }
};
