"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function valueForVariable(variable) {
    if (variable.vartype === "VT_NUMBER") {
        return variable.dNumType;
    } else if (variable.vartype === "VT_STRING") {
        return variable.sString;
    } else if (variable.vartype === "VT_NUMBERARRAY") {
        return JSON.stringify(variable.VarArray);
    } else if (variable.vartype === "VT_STRINGARRAY") {
        return JSON.stringify(variable.VarArray);
    }
}

function textForVariable(variable) {
    if (variable.vartype === "VT_NUMBER") {
        return { value: "" + variable.dNumType, valid: true };
    } else if (variable.vartype === "VT_STRING") {
        return { value: variable.sString, valid: true };
    } else if (variable.vartype === "VT_NUMBERARRAY" || variable.vartype === "VT_STRINGARRAY") {
        var text = [];
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
            for (var _iterator = variable.VarArray[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var item = _step.value;

                text.push({ value: JSON.stringify(item), valid: true });
            }
        } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion && _iterator.return) {
                    _iterator.return();
                }
            } finally {
                if (_didIteratorError) {
                    throw _iteratorError;
                }
            }
        }

        return text;
    }
}

function setValueForVariable(variable, value, index) {
    if (value.trim().length == 0) return false;

    try {
        if (variable.vartype === "VT_NUMBER") {
            var result = parseFloat(value);
            if (isNaN(result)) return false;
            variable.dNumType = result;
        } else if (variable.vartype === "VT_STRING") {
            variable.sString = value;
        } else if (variable.vartype === "VT_NUMBERARRAY") {
            if (Array.isArray(variable.VarArray[index])) {
                var _result = JSON.parse(value);
                // Make sure this is an array of numbers
                if (!Array.isArray(_result)) return false;
                if (_result.find(function (v) {
                    return typeof v !== "number";
                }) !== undefined) {
                    return false;
                }
                variable.VarArray[index] = _result;
            } else {
                variable.VarArray[index] = parseFloat(value);
            }
        } else if (variable.vartype === "VT_STRINGARRAY") {
            if (Array.isArray(variable.VarArray[index])) {
                var _result2 = JSON.parse(value);
                // Make sure this is an array of strings
                if (!Array.isArray(_result2)) return false;
                if (_result2.find(function (v) {
                    return typeof v !== "string";
                }) !== undefined) {
                    return false;
                }
                variable.VarArray[index] = _result2;
            } else {
                variable.VarArray[index] = value;
            }
        } else {
            return false;
        }
    } catch (err) {
        console.warn(err);
        return false;
    }

    return true;
}

function variableScalar(variable) {
    if (variable.vartype === "VT_NUMBER") {
        return true;
    } else if (variable.vartype === "VT_STRING") {
        return true;
    }
    return false;
}

function variableArray(variable) {
    if (variable.vartype === "VT_NUMBERARRAY") {
        return true;
    } else if (variable.vartype === "VT_STRINGARRAY") {
        return true;
    }
    return false;
}

var GameVariables = function (_React$Component) {
    _inherits(GameVariables, _React$Component);

    function GameVariables(props) {
        _classCallCheck(this, GameVariables);

        return _possibleConstructorReturn(this, (GameVariables.__proto__ || Object.getPrototypeOf(GameVariables)).call(this, props));
    }

    _createClass(GameVariables, [{
        key: "render",
        value: function render() {
            var _this2 = this;

            var tableRows = this.props.variables.filter(function (variable) {
                if (_this2.props.filter) {
                    return variable.varname.toLowerCase().includes(_this2.props.filter.toLowerCase());
                } else {
                    return true;
                }
            }).map(function (variable, index) {
                return React.createElement(GameVariable, { variable: variable, key: variable.varname });
            });

            if (tableRows.length === 0) {
                return React.createElement(
                    "div",
                    { style: { 'margin': '30px 0' } },
                    "No Game Variables match filter conditions."
                );
            }

            return React.createElement(
                "div",
                { className: "cheat-menu-variables" },
                React.createElement(
                    "h2",
                    { className: "cheat-menu-subtitle" },
                    "Game Variables"
                ),
                React.createElement(
                    "table",
                    null,
                    React.createElement(
                        "thead",
                        null,
                        React.createElement(
                            "tr",
                            null,
                            React.createElement(
                                "th",
                                null,
                                "Name"
                            ),
                            React.createElement(
                                "th",
                                null,
                                "Value"
                            ),
                            React.createElement(
                                "th",
                                null,
                                "Desc"
                            ),
                            React.createElement(
                                "th",
                                null,
                                "Freeze"
                            )
                        )
                    ),
                    React.createElement(
                        "tbody",
                        { "class": "cheat-menu-variables-body" },
                        tableRows
                    )
                )
            );
        }
    }]);

    return GameVariables;
}(React.Component);

var GameVariable = function (_React$Component2) {
    _inherits(GameVariable, _React$Component2);

    function GameVariable(props) {
        _classCallCheck(this, GameVariable);

        var _this3 = _possibleConstructorReturn(this, (GameVariable.__proto__ || Object.getPrototypeOf(GameVariable)).call(this, props));

        _this3.state = {
            value: valueForVariable(_this3.props.variable),
            text: textForVariable(_this3.props.variable),
            frozen: isFrozenVariable(_this3.props.variable)
        };

        _this3.freezeClicked = _this3.freezeClicked.bind(_this3);
        _this3.inputChanged = _this3.inputChanged.bind(_this3);
        return _this3;
    }

    _createClass(GameVariable, [{
        key: "freezeClicked",
        value: function freezeClicked() {
            var variable = this.props.variable;
            if (isFrozenVariable(variable)) {
                delete cheatFreezes.variables[variable.varname];
            } else {
                cheatFreezes.variables[variable.varname] = true;
            }
            this.setState({ frozen: isFrozenVariable(variable) });
        }
    }, {
        key: "inputChanged",
        value: function inputChanged(index) {
            var _this4 = this;

            return function (e) {
                var variable = _this4.props.variable;
                if (setValueForVariable(variable, e.target.value, index)) {
                    _this4.setState({
                        value: valueForVariable(variable),
                        text: textForVariable(variable)
                    });
                } else {
                    // Do not erase whatever the user is writing
                    if (index !== undefined) {
                        var text = textForVariable(variable);
                        text[index] = { value: e.target.value, valid: false };
                        _this4.setState({ text: text });
                    } else {
                        _this4.setState({ text: { value: e.target.value, valid: false } });
                    }
                }
            };
        }
    }, {
        key: "render",
        value: function render() {
            var _this5 = this;

            var variable = this.props.variable;
            var value = void 0;
            if (variableScalar(variable)) {
                value = React.createElement("input", { onChange: this.inputChanged(),
                    value: this.state.text.value,
                    "class": this.state.text.valid ? '' : 'invalid-value' });
            } else if (variableArray(variable)) {
                value = variable.VarArray.map(function (arrayItem, index) {
                    return React.createElement(
                        "div",
                        null,
                        index,
                        ": ",
                        React.createElement("input", { onChange: _this5.inputChanged(index),
                            value: _this5.state.text[index].value,
                            "class": _this5.state.text[index].valid ? '' : 'invalid-value' })
                    );
                });
            } else {
                value = "Uneditable type: " + variable.vartype;
            }

            return React.createElement(
                "tr",
                null,
                React.createElement(
                    "td",
                    null,
                    variable.varname
                ),
                React.createElement(
                    "td",
                    null,
                    value
                ),
                React.createElement("td", { "class": "desc-cell", dangerouslySetInnerHTML: { __html: variable.VarComment } }),
                React.createElement(
                    "td",
                    null,
                    React.createElement(
                        "button",
                        {
                            onClick: this.freezeClicked,
                            className: this.state.frozen ? 'freeze-button frozen' : 'freeze-button' },
                        "Freeze"
                    )
                )
            );
        }
    }], [{
        key: "getDerivedStateFromProps",
        value: function getDerivedStateFromProps(props, state) {
            // Update state if variable value has changed in game
            var value = valueForVariable(props.variable);
            if (value !== state.value) {
                return {
                    value: value
                };
            }
            return null;
        }
    }]);

    return GameVariable;
}(React.Component);

var GameCustomProperties = function (_React$Component3) {
    _inherits(GameCustomProperties, _React$Component3);

    function GameCustomProperties(props) {
        _classCallCheck(this, GameCustomProperties);

        return _possibleConstructorReturn(this, (GameCustomProperties.__proto__ || Object.getPrototypeOf(GameCustomProperties)).call(this, props));
    }

    _createClass(GameCustomProperties, [{
        key: "render",
        value: function render() {
            var _this7 = this;

            var totalCount = 0;
            var tableRows = this.props.properties.filter(function (property) {
                ++totalCount;
                if (_this7.props.filter) {
                    return property.Name.toLowerCase().includes(_this7.props.filter.toLowerCase());
                } else {
                    return true;
                }
            }).map(function (property, index) {
                return React.createElement(GameCustomProperty, { property: property, key: property.Name });
            });

            if (tableRows.length === 0) {
                if (totalCount === 0) {
                    return null;
                } else {
                    return React.createElement(
                        "div",
                        { style: { 'margin': '30px 0' } },
                        "No Player Properties match filter conditions."
                    );
                }
            }

            return React.createElement(
                "div",
                { className: "cheat-menu-player-properties" },
                React.createElement(
                    "h2",
                    { className: "cheat-menu-subtitle" },
                    "Player Properties"
                ),
                React.createElement(
                    "table",
                    null,
                    React.createElement(
                        "thead",
                        null,
                        React.createElement(
                            "tr",
                            null,
                            React.createElement(
                                "th",
                                null,
                                "Name"
                            ),
                            React.createElement(
                                "th",
                                null,
                                "Value"
                            ),
                            React.createElement(
                                "th",
                                null,
                                "Freeze"
                            )
                        )
                    ),
                    React.createElement(
                        "tbody",
                        { "class": "cheat-menu-player-properties-body" },
                        tableRows
                    )
                )
            );
        }
    }]);

    return GameCustomProperties;
}(React.Component);

var GameCustomProperty = function (_React$Component4) {
    _inherits(GameCustomProperty, _React$Component4);

    function GameCustomProperty(props) {
        _classCallCheck(this, GameCustomProperty);

        var _this8 = _possibleConstructorReturn(this, (GameCustomProperty.__proto__ || Object.getPrototypeOf(GameCustomProperty)).call(this, props));

        _this8.state = {
            value: _this8.props.property.Value,
            frozen: isFrozenPlayerProperty(_this8.props.property)
        };

        _this8.freezeClicked = _this8.freezeClicked.bind(_this8);
        _this8.inputChanged = _this8.inputChanged.bind(_this8);
        return _this8;
    }

    _createClass(GameCustomProperty, [{
        key: "freezeClicked",
        value: function freezeClicked() {
            var property = this.props.property;
            if (isFrozenPlayerProperty(property)) {
                delete cheatFreezes.playerProperties[property.Name];
            } else {
                cheatFreezes.playerProperties[property.Name] = true;
            }
            this.setState({ frozen: isFrozenPlayerProperty(property) });
        }
    }, {
        key: "inputChanged",
        value: function inputChanged(index) {
            var _this9 = this;

            return function (e) {
                _this9.props.property.Value = e.target.value;
                _this9.setState({ value: e.target.Value });
            };
        }
    }, {
        key: "render",
        value: function render() {
            var property = this.props.property;
            return React.createElement(
                "tr",
                null,
                React.createElement(
                    "td",
                    null,
                    property.Name
                ),
                React.createElement(
                    "td",
                    null,
                    React.createElement("input", { onChange: this.inputChanged(), value: this.state.value })
                ),
                React.createElement(
                    "td",
                    null,
                    React.createElement(
                        "button",
                        {
                            onClick: this.freezeClicked,
                            className: this.state.frozen ? 'freeze-button frozen' : 'freeze-button' },
                        "Freeze"
                    )
                )
            );
        }
    }], [{
        key: "getDerivedStateFromProps",
        value: function getDerivedStateFromProps(props, state) {
            // Update state if property value has changed in game
            if (props.property.Value !== state.value) {
                return {
                    value: props.property.Value
                };
            }
            return null;
        }
    }]);

    return GameCustomProperty;
}(React.Component);

var CheatMenuContent = function (_React$Component5) {
    _inherits(CheatMenuContent, _React$Component5);

    function CheatMenuContent(props) {
        _classCallCheck(this, CheatMenuContent);

        var _this10 = _possibleConstructorReturn(this, (CheatMenuContent.__proto__ || Object.getPrototypeOf(CheatMenuContent)).call(this, props));

        _this10.state = {
            filter: ''
        };

        _this10.filterChanged = _this10.filterChanged.bind(_this10);
        return _this10;
    }

    _createClass(CheatMenuContent, [{
        key: "filterChanged",
        value: function filterChanged(e) {
            this.setState({ filter: e.target.value });
        }
    }, {
        key: "finishClicked",
        value: function finishClicked() {
            $('.cheat-menu').addClass('hidden');
        }
    }, {
        key: "render",
        value: function render() {
            return React.createElement(
                "div",
                { "class": "cheat-menu-content" },
                React.createElement(
                    "div",
                    { className: "cheat-menu-title" },
                    React.createElement(
                        "h1",
                        null,
                        "Cheat Menu"
                    ),
                    React.createElement("input", { placeholder: "Filter", value: this.state.filter, onChange: this.filterChanged })
                ),
                React.createElement(
                    "div",
                    { className: "cheat-menu-scrollable" },
                    React.createElement(GameCustomProperties, { properties: TheGame.Player.CustomProperties, filter: this.state.filter }),
                    React.createElement(GameVariables, { variables: TheGame.Variables, filter: this.state.filter })
                ),
                React.createElement(
                    "div",
                    { className: "cheat-menu-actions" },
                    React.createElement(
                        "button",
                        { onClick: this.finishClicked },
                        "Finish"
                    )
                )
            );
        }
    }]);

    return CheatMenuContent;
}(React.Component);
