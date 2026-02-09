var TheGame = null;
var OriginalGame = null;

class GlobalsStore {
    bRunningTimers              = false;
    curActions                  = undefined;
    loopObject                  = null;
    movingDirection             = "";  // static?
    runningLiveTimerCommands    = false;
    theObj                      = null;
    selectedObj                 = null;
    variableGettingSet          = null;
    additionalData              = null;
    actionBeingTaken            = null;
    objectBeingActedUpon        = null;

    // Static properties (they keep their value on restore)
    _staticProps                = [
        'bCancelMove',
        'currentImage',
        'endGame',
    ];
    bCancelMove                 = false;
    currentImage                = "";
    endGame                     = false;

    // Unique index for debugging
    static _nextIndex           = 0;
    _index                      = -1;

    constructor(other) {
        this._index = GlobalsStore._nextIndex++;

        if(other !== undefined) {
            // Copy the properties value from the other instance
            for(const name of Object.keys(this)) {
                if(name.startsWith('_')) continue;
                this[name] = other[name];
            }
        }
    }
}

class GlobalsStack {
    entries = [new GlobalsStore()];

    constructor() {
        // Return a proxy version to be able to use a generic getter/setter function
        return new Proxy(this, {
            get(target, prop, receiver) {
                // console.debug('GET', prop);
                if(prop in target) {
                    return target[prop];
                } else {
                    // Return the related property of the last entry
                    return target.last[prop];
                }
            },
            set(target, prop, value, receiver) {
                // console.debug('SET', prop, value);
                if(prop in target) {
                    // Unexpected
                    console.warn('SET', prop, value);
                    return target[prop] = value;
                } else {
                    // Set the related property in the last entry
                    target.last[prop] = value;
                }
            }
        });
    }

    /** Last entry in the stack */
    get last() {
        return this.entries[this.entries.length - 1];
    }

    /** Size of the stack */
    get length() {
        return this.entries.length;
    }

    /** Add a new entry in the stack, copying the values from the last entry */
    store(changes) {
        if(changes === undefined) changes = {};

        // console.debug('STORE', noCopy, this.entries.length);
        this.entries.push(new GlobalsStore(this.last));

        // Apply the required changes (if any)
        const lastEntry = this.last;
        for(const prop in changes) {
            if(prop in lastEntry) {
                lastEntry[prop] = changes[prop];
            } else {
                console.warn(`${prop} is not a valid global property`);
            }
        }

        return lastEntry._index;
    }

    /** Remove the current entry from the stack */
    restore(index) {
        // console.debug('RE-STORE', this.entries.length);
        const oldEntry = this.entries.pop();

        if(index !== undefined && oldEntry._index !== index) {
            console.warn(`Unexpected Globals entry poped (expected ${index}, found ${oldEntry._index})`);
        }

        if(this.entries.length == 0) {
            throw new Error('Globals stack is empty');
        }

        // Restore static properties
        const lastEntry = this.last;
        lastEntry._staticProps.forEach(name => {
            lastEntry[name] = oldEntry[name];
        });

        return lastEntry;
    }

    reset() {
        this.entries.splice(0, this.entries.length, new GlobalsStore());
    }
}

var Globals = new GlobalsStack();

function ResetLoopObjects() {  // FIXME Not needed anymore?
    // Debug check to see if this method should be removed
    if(!(Globals.length == 1 && Globals.loopObject === null)) {
        console.warn(`Found ${Globals.length} globals (loopObject=${Globals.loopObject})`);
    }

    return Globals.store({
        loopObject: null,
    });
}

function RestoreLoopObjects(index) {
    Globals.restore(index);
}
