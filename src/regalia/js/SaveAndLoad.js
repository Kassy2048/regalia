var SavedGames = {
    titleForSave: function () {
        return GameController.title();
    },
    keyForIndex: function () {
        return this.titleForSave() + '-Saves';
    },
    keyForSave: function (n) {
        return this.titleForSave() + '-Save' + n;
    },
    getIndex: function () {
        var rawIndex = localStorage.getItem(this.keyForIndex());
        if (rawIndex) {
            return JSON.parse(rawIndex)
        } else {
            this.reset();
            return {};
        }
    },
    getSortedSaves: function () {
        var parsedIndex = this.getIndex();
        return Object.keys(parsedIndex).sort(function (a, b) {
            return parseInt(b, 10) - parseInt(a, 10);
        }).map(function (id) {
            return parsedIndex[id];
        });
    },
    getSave: function (id) {
        return JSON.parse(localStorage.getItem(this.keyForSave(id)));
    },
    nextSaveId: function () {
        var lastSave = this.getSortedSaves()[0];
        return (lastSave ? lastSave.id : 0) + 1;
    },
    createSave: function (id, name, date, gameData) {
        var savedGames = this.getIndex();
        savedGames[id] = {
            id: id,
            name: name,
            date: date
        };

        let mainText = $("#MainText").html();
        if(mainText.length > 100000) {
            // Do not store more than 100K characters (~10KB after compression)
            const pos = mainText.indexOf('<hr>', mainText.length - 100000);
            const oldLength = mainText.length;
            if(pos == -1) {
                // TODO Try to store something that does not break the DOM tree
                mainText = '';
            } else {
                mainText = mainText.slice(pos + 4);
            }
            console.log("Text history truncated to " + mainText.length + " (from " + oldLength + ")");
        }

        // Compress the main text
        let zData = LZMA.compress(mainText, 1);
        if(zData.length & 1) zData.push(0);  // Pad with 0 to get a multiple of 2 bytes
        zData = new Int8Array(zData);
        // Convert the result to an UTF-16 string (2 bytes per characters)
        const zText = String.fromCharCode.apply(null, new Uint16Array(zData.buffer));

        persistKeyValue(this.keyForSave(id), JSON.stringify({
            id: id,
            name: name,
            date: date,
            gameData: gameData,
            cheatFreezes: window.cheatFreezes,
            zMainText: zText,
            currentImage: Globals.currentImage,
        }));

        persistKeyValue(this.keyForIndex(), JSON.stringify(savedGames));
    },
    destroySave: function (id) {
        var savedGames = this.getIndex();
        delete savedGames[id];
        localStorage.removeItem(this.keyForSave(id));
        persistKeyValue(this.keyForIndex(), JSON.stringify(savedGames));
    },
    reset: function () {
        var rawIndex = localStorage.getItem(this.keyForIndex());
        if (rawIndex) {
            var saveKeys = Object.keys(JSON.parse(rawIndex));
            for (var i = 0; i < saveKeys.length; i++) {
                localStorage.removeItem(this.keyForSave(saveKeys[i]));
            }
        }
        persistKeyValue(this.keyForIndex(), JSON.stringify({}));
    },
    import: function (newSaves) {
        var savedGames = this.getIndex();
        for (var i = 0; i < newSaves.length; i++) {
            var newSave = newSaves[i];
            savedGames[newSave.id] = {
                id: newSave.id,
                name: newSave.name,
                date: newSave.date
            };
            persistKeyValue(this.keyForSave(newSave.id), JSON.stringify(newSave));
        }
        persistKeyValue(this.keyForIndex(), JSON.stringify(savedGames));
    },

    saveDataFor: function (game) {
      return DeepDiff.diff(OriginalGame, game);
    },

    applySaveToGame: function (game, savedGame) {
        let changes = savedGame.gameData;
        // Check for old save where changes were stringified for no good reason
        if(typeof changes == 'string') changes = JSON.parse(savedGame.gameData);
        var orderedChanges = orderChanges(changes);

        for (var i = 0; i < orderedChanges.length; i++) {
            DeepDiff.applyChange(TheGame, true, orderedChanges[i]);
        }

        if(savedGame.zMainText !== undefined) {
            let zData = new Uint16Array(savedGame.zMainText.length)
            for(let i = 0 ; i < zData.length ; ++i) {
                zData[i] = savedGame.zMainText.charCodeAt(i);
            }
            const mainText = LZMA.decompress(new Int8Array(zData.buffer));
            $("#MainText").html(mainText);
        }
    }
};

function persistKeyValue(key, value) {
    try {
        localStorage.setItem(key, value);
    } catch (e) {
        if (e instanceof DOMException && e.message.match(/exceeded the quota/)) {
            alert("Save operation failed: localStorage quota exceeded.\n\nDelete some saves and try again.");
        }
        throw e;
    }
}

function pathsEqual(p1,p2) {
    return JSON.stringify(p1) == JSON.stringify(p2);
}

function orderChanges(changes) {
    var result = [];
    // Reverse the order of array deletions generated by deep-diff to get the correct result
    // See https://github.com/flitbit/diff/issues/35 and https://github.com/flitbit/diff/issues/47

    function addReversedChanges(changesToReverse) {
        changesToReverse.reverse();
        for (var i = 0; i < changesToReverse.length; i++) {
            result.push(changesToReverse[i]);
        }
    }

    var currentArrayDeletionChanges = null;
    for (var i = 0; i < changes.length; i++) {
        var change = changes[i];
        if (change.kind == "A" && change.item.kind == "D") {
            if (currentArrayDeletionChanges) {
                if (pathsEqual(currentArrayDeletionChanges[0].path, change.path)) {
                    currentArrayDeletionChanges.push(change);
                    continue;
                } else {
                    addReversedChanges(currentArrayDeletionChanges);
                    currentArrayDeletionChanges = [change];
                    continue;
                }
            } else {
                currentArrayDeletionChanges = [change];
                continue;
            }
        }

        if (currentArrayDeletionChanges) {
            addReversedChanges(currentArrayDeletionChanges);
            currentArrayDeletionChanges = null;
        }
        result.push(change);
    }

    // In case the last change was itself a delete
    if (currentArrayDeletionChanges) {
        addReversedChanges(currentArrayDeletionChanges);
        currentArrayDeletionChanges = null;
    }

    return result;
}