const Settings = {
    _get: function(name, defValue) {
        const value = localStorage['regalia' + name];
        return value === undefined ? defValue : JSON.parse(value);
    },

    _set: function(name, value) {
        localStorage['regalia' + name] = JSON.stringify(value);
    },

    _init: function() {
        this._historyEnabled = this._get('_historyEnabled', this._historyEnabled);
        this._historySize = this._get('_historySize', this._historySize);
        this._sfxMuted = this._get('_sfxMuted', this._sfxMuted);
        this._musicMuted = this._get('_musicMuted', this._musicMuted);
        this._debugEnabled = this._get('_debugEnabled', this._debugEnabled);
    },

    _historyEnabled: false,
    get historyEnabled() {
        return this._historyEnabled;
    },
    set historyEnabled(value) {
        return this._set('_historyEnabled', this._historyEnabled = !!value);
    },

    _historySize: 100,
    get historySize() {
        return this._historySize;
    },
    set historySize(value) {
        return this._set('_historySize', this._historySize = parseInt(value));
    },

    _sfxMuted: false,
    get sfxMuted() {
        return this._sfxMuted;
    },
    set sfxMuted(value) {
        return this._set('_sfxMuted', this._sfxMuted = !!value);
    },

    _musicMuted: false,
    get musicMuted() {
        return this._musicMuted;
    },
    set musicMuted(value) {
        return this._set('_musicMuted', this._musicMuted =  !!value);
    },

    _debugEnabled: false,
    get debugEnabled() {
        return this._debugEnabled;
    },
    set debugEnabled(value) {
        return this._set('_debugEnabled', this._debugEnabled = !!value);
    },
};

Settings._init();
