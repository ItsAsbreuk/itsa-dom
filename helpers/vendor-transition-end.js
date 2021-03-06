"use strict";

var TransitionEnd;

module.exports = function (window) {

    if (TransitionEnd) {
        return TransitionEnd; // TransitionEnd was already determined
    }

    var DOCUMENT_STYLE = window.document.documentElement.style,
        transitions = {},
        ransition = "ransition",
        transition = "t"+ransition,
        end = "end",
        transitionEnd, t;

    transitions[transition] = transition+end;
    transitions["WebkitT"+ransition] = "webkitT"+ransition+"End";
    transitions["MozT"+ransition] = transition+end;
    transitions["OT"+ransition] = "o"+transition+end;

    for (t in transitions) {
        if (typeof DOCUMENT_STYLE[t] !== "undefined") {
            transitionEnd = transitions[t];
            break;
        }
    }

    TransitionEnd = transitionEnd;

    return transitionEnd;
};