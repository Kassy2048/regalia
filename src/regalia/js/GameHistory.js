const GameHistory = {
    MAX_HISTORY_SIZE: 100,  // TODO
    states: [],
    /** Deep copy of TheGame when last state was saved */
    oldGameData: null,
    oldTextChild: null,
    oldImage: null,

    reset: function() {
        this.states = [];
        this.oldGameData = null;
        this.oldTextChild = null;
        this.oldImage = null;

        if(structuredClone !== undefined) {
            console.warn("Old browser detected, rollback is disabled.");
        }
    },

    _saveOldInfo: function() {
        // Clone current game data
        this.oldGameData = structuredClone(TheGame);
        // Save last text history element
        this.oldTextChild = document.getElementById('MainText').lastChild;
        // Save current media
        this.oldImage = Globals.currentImage;
    },

    pushState: function() {
        if(structuredClone === undefined) {
            // Old browser, no fast deep copy available
            return;
        }

        if(this.oldGameData !== null) {
            while(this.states.length >= this.MAX_HISTORY_SIZE) {
                this.states.shift();
            }

            // Save info to revert this state
            const state = {
                // Save the game data changes
                gameChanges: DeepDiff.diff(TheGame, this.oldGameData),
                textChild: this.oldTextChild,
                currentImage: this.oldImage,
            };

            this.states.push(state);
        }

        this._saveOldInfo();
    },

    popState: function() {
        if(!this.canGoBack()) return false;

        const state = this.states.pop();

        // Remove elements after last text history element
        if(state.textChild.parent === null) {
            // Text history has been truncated too much
            $('#MainText').html('');
        } else {
            while(state.textChild.nextSibling) {
                state.textChild.nextSibling.remove();
            }
        }

        // Revert state changed
        if(state.gameChanges !== undefined) {
            // gameChanges can be undefined if only text changed
            orderChanges(state.gameChanges).forEach((change) => {
                DeepDiff.applyChange(TheGame, true, change);
            });
        }

        RoomChange(false, false, true);
        // Restore current media
        if(state.currentImage !== undefined) {
            // This must be done after the call to RoomChange() because it changes the image
            showImage(state.currentImage);
        }
        UpdateStatusBars();
        SetPortrait(TheGame.Player.PlayerPortrait);
        $("#playernamechoice").css("visibility", "hidden");
        $("#textactionchoice").css("visibility", "hidden");
        $("#textchoice").css("visibility", "hidden");
        $("#inputmenu").css("visibility", "hidden");
        $("#selectionmenu").css("visibility", "hidden");
        $("#genderchoice").css("visibility", "hidden");
        $("#cmdinputmenu").css("visibility", "hidden");
        $("#Continue").css("background-color", "rgb(128, 128, 128)");
        $("#Continue").css('visibility', "hidden");
        GameUI.showGameElements();

        this._saveOldInfo();

        return true;
    },

    size: function() {
        return this.states.length;
    },

    canGoBack: function() {
        return this.states.length > 0;
    },
};

GameHistory.reset();
