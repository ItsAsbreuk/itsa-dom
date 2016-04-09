/*global describe, it, before, after, beforeEach, afterEach */

"use strict";

var chai = require("chai"),
    expect = chai.expect,
    elementLib = require("../lib/element"),
    isNode = (typeof global!=="undefined") && ({}.toString.call(global)==="[object global]") && (!global.document || ({}.toString.call(global.document)!=="[object HTMLDocument]")),
    jsdom, node, nodeSub1, nodeSub2, nodeSub3, nodeSub3Sub, nodeSub3SubText;

before(function () {
    if (isNode) {
        jsdom = require("jsdom-global")();
        elementLib(global.window);
    }
    else {
        require("../lib/polyfill")(window);
        elementLib(window);
    }
});

after(function () {
    jsdom && jsdom();
});

describe("Element properties", function () {

    // Code to execute before every test.
    beforeEach(function() {
        node = window.document.createElement("div");
        node.id = "ITSA";
        node.setAttribute("style", "position: absolute; z-index: -1; left: 10px; top: 30px; height: 75px; width: 150px; border: solid 2px #000;");
        window.document.body.appendChild(node);
    });

    // Code to execute after every test.
    afterEach(function() {
        window.document.body.removeChild(node);
    });

    if (!isNode) {
        it("itsa_top", function () {
            expect(node.itsa_top).to.be.eql(30);
        });

        it("itsa_left", function() {
            expect(node.itsa_left).to.be.eql(10);
        });

        it("itsa_right", function() {
            expect(node.itsa_right).to.be.eql(164);
        });

        it("itsa_bottom", function () {
            expect(node.itsa_bottom).to.be.eql(109);
        });

        it("itsa_innerWidth", function() {
            expect(node.offsetWidth).to.be.eql(154);
            expect(node.itsa_innerWidth).to.be.eql(150);
        });

        it("itsa_innerHeight", function () {
            expect(node.offsetHeight).to.be.eql(79);
            expect(node.itsa_innerHeight).to.be.eql(75);
        });
    }

    it("itsa_id", function () {
        expect(node.itsa_id).to.be.eql("ITSA");
    });

});

describe("Methods", function () {
    this.timeout(5000);

    // bodyNode looks like this:
    /*
    <div id="ITSA" class="red blue" style="position: absolute; z-index: -1; left: 10px; top: 30px; height: 75px; width: 150px;">
        <div id="sub1" class="green yellow"></div>
        <div id="sub2" class="green yellow"></div>
        <div id="sub3">
            <div id="sub3sub" class="green yellow"></div>
            extra text
        </div>
    </div>
    */

    // Code to execute before every test.
    beforeEach(function() {
        node = window.document.createElement("div");
        node.id = "ITSA";
        node.className = "red blue";
        node.setAttribute("style", "position: absolute; z-index: -1; left: 10px; top: 30px; height: 75px; width: 150px;");
            nodeSub1 = window.document.createElement("div");
            nodeSub1.id = "sub1";
            nodeSub1.className = "green yellow";
            node.appendChild(nodeSub1);

            nodeSub2 = window.document.createElement("div");
            nodeSub2.className = "green yellow";
            nodeSub2.id = "sub2";
            node.appendChild(nodeSub2);

            nodeSub3 = window.document.createElement("div");
            nodeSub3.id = "sub3";
            node.appendChild(nodeSub3);

                nodeSub3Sub = window.document.createElement("div");
                nodeSub3Sub.className = "green yellow";
                nodeSub3Sub.id = "sub3sub";
                nodeSub3.appendChild(nodeSub3Sub);

                nodeSub3SubText = window.document.createTextNode("extra text");
                nodeSub3.appendChild(nodeSub3SubText);

        window.document.body.appendChild(node);
    });

    // Code to execute after every test.
    afterEach(function() {
        window.document.body.removeChild(node);
    });

    it("itsa_isEmpty", function () {
        expect(nodeSub1.itsa_isEmpty()).to.be.true;
        expect(nodeSub3.itsa_isEmpty()).to.be.false;
    });

    it("itsa_first", function () {
        expect(nodeSub1.itsa_first()).to.be.eql(nodeSub1);
        expect(nodeSub2.itsa_first()).to.be.eql(nodeSub1);
        expect(nodeSub3.itsa_first()).to.be.eql(nodeSub1);
    });

    it("itsa_first with container", function () {
        expect(nodeSub1.itsa_first(null, node)).to.be.eql(nodeSub1);
        expect(nodeSub3.itsa_first(null, node)).to.be.eql(nodeSub1);
        expect(nodeSub3Sub.itsa_first(null, node)).to.be.eql(nodeSub1);
    });

    it("itsa_firstChild", function () {
        expect(node.itsa_firstChild()).to.be.eql(nodeSub1);
        expect(nodeSub1.itsa_firstChild()===undefined).to.be.true;
        expect(nodeSub3.itsa_firstChild()).to.be.eql(nodeSub3Sub);
    });

    if (!isNode) {
        it("itsa_forceIntoNodeView with overflow", function (done) {
            var scrollTop;
            nodeSub3Sub.setAttribute("style", "top: 0px; position: relative; height: 50px;");
            nodeSub3.setAttribute("style", "height: 100px; overflow: scroll;");
            scrollTop = nodeSub3.scrollTop;
            nodeSub3Sub.setAttribute("style", "top: 9999px; position: relative; height: 50px;");
            expect(nodeSub3.scrollTop===scrollTop).to.be.true;
            nodeSub3Sub.itsa_forceIntoNodeView();
            setTimeout(function() {
                expect(nodeSub3.scrollTop>scrollTop).to.be.true;
                done();
            }, 100);
        });

        it("itsa_forceIntoNodeView with overflow-y", function (done) {
            var scrollTop;
            nodeSub3Sub.setAttribute("style", "top: 0px; position: relative; height: 50px;");
            nodeSub3.setAttribute("style", "height: 100px; overflow-y: scroll");
            scrollTop = nodeSub3.scrollTop;
            nodeSub3Sub.setAttribute("style", "top: 9999px; position: relative; height: 50px;");
            expect(nodeSub3.scrollTop===scrollTop).to.be.true;
            nodeSub3Sub.itsa_forceIntoNodeView();
            setTimeout(function() {
                expect(nodeSub3.scrollTop>scrollTop).to.be.true;
                done();
            }, 100);
        });

        it("itsa_scrollIntoView", function (done) {
            var scrollTop;
            node.setAttribute("style", "position: absolute; z-index: -1; left: 10px; top: 9999px; height: 75px; width: 150px;");
            scrollTop = window.itsa_getScrollTop();
            expect(window.itsa_getScrollTop()===scrollTop).to.be.true;
            node.itsa_scrollIntoView();
            setTimeout(function() {
                expect(window.itsa_getScrollTop()>scrollTop).to.be.true;
                done();
            }, 100);
        });
    }

    it("itsa_getInlineStyle", function () {
        var node2;

        expect(node.itsa_getInlineStyle("dummy")===undefined).to.be.true;
        expect(node.itsa_getInlineStyle("position")).to.be.eql("absolute");
        expect(node.itsa_getInlineStyle("z-index")).to.be.eql("-1");
        expect(node.itsa_getInlineStyle("zIndex")).to.be.eql("-1");
        expect(node.itsa_getInlineStyle("left")).to.be.eql("10px");
        expect(node.itsa_getInlineStyle("top")).to.be.eql("30px");
        expect(node.itsa_getInlineStyle("height")).to.be.eql("75px");
        expect(node.itsa_getInlineStyle("width")).to.be.eql("150px");

        node2 = window.document.createElement("div");
        node2.setAttribute("style", "color: #F00; position: absolute; z-index: -1; left: 10px; top: 30px; height: 75px; width: 150px");
        window.document.body.appendChild(node2);

        expect(node2.itsa_getInlineStyle("dummy")===undefined).to.be.true;
        expect(node2.itsa_getInlineStyle("color")).to.be.eql("#f00");
        expect(node2.itsa_getInlineStyle("position")).to.be.eql("absolute");
        expect(node2.itsa_getInlineStyle("z-index")).to.be.eql("-1");
        expect(node2.itsa_getInlineStyle("zIndex")).to.be.eql("-1");
        expect(node2.itsa_getInlineStyle("left")).to.be.eql("10px");
        expect(node2.itsa_getInlineStyle("top")).to.be.eql("30px");
        expect(node2.itsa_getInlineStyle("height")).to.be.eql("75px");
        expect(node2.itsa_getInlineStyle("width")).to.be.eql("150px");
        expect(node2.itsa_getInlineStyle("font-weight")===undefined).to.be.true;
        expect(node2.itsa_getInlineStyle("fontWeight")===undefined).to.be.true;

        window.document.body.removeChild(node2);
    });

    it("itsa_getStyle", function () {
        expect(node.itsa_getStyle("left")).to.be.eql("10px");
        expect(node.itsa_getStyle("display")).to.be.eql("block");
        expect(node.itsa_getStyle("dummy")===undefined).to.be.true;
    });

    it("itsa_hasFocus", function () {
        var inputNode = window.document.createElement("input");
        node.appendChild(inputNode);
        expect(node.itsa_hasFocus()).to.be.false;
        expect(nodeSub1.itsa_hasFocus()).to.be.false;
        expect(nodeSub2.itsa_hasFocus()).to.be.false;
        expect(nodeSub3.itsa_hasFocus()).to.be.false;
        expect(nodeSub3Sub.itsa_hasFocus()).to.be.false;
        expect(inputNode.itsa_hasFocus()).to.be.false;

        inputNode.focus();
        expect(node.itsa_hasFocus()).to.be.false;
        expect(nodeSub1.itsa_hasFocus()).to.be.false;
        expect(nodeSub2.itsa_hasFocus()).to.be.false;
        expect(nodeSub3.itsa_hasFocus()).to.be.false;
        expect(nodeSub3Sub.itsa_hasFocus()).to.be.false;
        expect(inputNode.itsa_hasFocus()).to.be.true;
    });

    it("itsa_hasFocusInside", function () {
        var inputNode = window.document.createElement("input");
        nodeSub3.appendChild(inputNode);
        expect(node.itsa_hasFocusInside()).to.be.false;
        expect(nodeSub1.itsa_hasFocusInside()).to.be.false;
        expect(nodeSub2.itsa_hasFocusInside()).to.be.false;
        expect(nodeSub3.itsa_hasFocusInside()).to.be.false;
        expect(nodeSub3Sub.itsa_hasFocusInside()).to.be.false;
        expect(inputNode.itsa_hasFocusInside()).to.be.false;

        inputNode.focus();
        expect(node.itsa_hasFocusInside()).to.be.true;
        expect(nodeSub1.itsa_hasFocusInside()).to.be.false;
        expect(nodeSub2.itsa_hasFocusInside()).to.be.false;
        expect(nodeSub3.itsa_hasFocusInside()).to.be.true;
        expect(nodeSub3Sub.itsa_hasFocusInside()).to.be.false;
        expect(inputNode.itsa_hasFocusInside()).to.be.false;
    });

    it("itsa_hasInlineStyle", function () {
        expect(node.itsa_hasInlineStyle("position")).to.be.true;
        expect(node.itsa_hasInlineStyle("border")).to.be.false;
    });

    if (!isNode) {
        it("itsa_inside", function () {
            expect(node.itsa_inside(node)).to.be.false;
            expect(nodeSub1.itsa_inside(node)).to.be.eql(node);
            expect(nodeSub2.itsa_inside(node)).to.be.eql(node);
            expect(nodeSub3.itsa_inside(node)).to.be.eql(node);
            expect(nodeSub3Sub.itsa_inside(node)).to.be.eql(node);

            expect(nodeSub3Sub.itsa_inside(nodeSub1)).to.be.false;

            expect(nodeSub3Sub.itsa_inside("div")).to.be.eql(nodeSub3);
            expect(nodeSub3Sub.itsa_inside(".green")).to.be.false;
            expect(nodeSub3Sub.itsa_inside(".red")).to.be.eql(node);
            expect(nodeSub3Sub.itsa_inside("#ITSA")).to.be.eql(node);
        });

        it("itsa_insidePos", function () {
            expect(node.itsa_insidePos(10, 30)).to.be.true;
            expect(node.itsa_insidePos(160, 30)).to.be.true;
            expect(node.itsa_insidePos(160, 105)).to.be.true;
            expect(node.itsa_insidePos(10, 105)).to.be.true;

            expect(node.itsa_insidePos(9, 30)).to.be.false;
            expect(node.itsa_insidePos(9, 29)).to.be.false;
            expect(node.itsa_insidePos(10, 29)).to.be.false;

            expect(node.itsa_insidePos(160, 29)).to.be.false;
            expect(node.itsa_insidePos(161, 29)).to.be.false;
            expect(node.itsa_insidePos(161, 30)).to.be.false;

            expect(node.itsa_insidePos(161, 105)).to.be.false;
            expect(node.itsa_insidePos(161, 106)).to.be.false;
            expect(node.itsa_insidePos(160, 106)).to.be.false;

            expect(node.itsa_insidePos(10, 106)).to.be.false;
            expect(node.itsa_insidePos(9, 106)).to.be.false;
            expect(node.itsa_insidePos(9, 105)).to.be.false;
        });
    }

    it("itsa_last", function () {
        expect(nodeSub1.itsa_last()).to.be.eql(nodeSub3);
        expect(nodeSub2.itsa_last()).to.be.eql(nodeSub3);
        expect(nodeSub3.itsa_last()).to.be.eql(nodeSub3);
        expect(nodeSub3Sub.itsa_last()).to.be.eql(nodeSub3Sub);
    });

    it("itsa_last with container", function () {
        expect(nodeSub1.itsa_last(null, node)).to.be.eql(nodeSub3);
        expect(nodeSub3.itsa_last(null, node)).to.be.eql(nodeSub3);
        expect(nodeSub3Sub.itsa_last(null, node)).to.be.eql(nodeSub3);
    });
    it("itsa_lastChild", function () {
        expect(node.itsa_lastChild()).to.be.eql(nodeSub3);
        expect(nodeSub1.itsa_lastChild()===undefined).to.be.true;
        expect(nodeSub3.itsa_lastChild()).to.be.eql(nodeSub3Sub);
    });

    if (!isNode) {
        it("itsa_rectangleInside", function () {
            var cont = window.document.createElement("div");
            cont.setAttribute("style", "position:absolute; left:10px; top: 30px;  height: 75px; width: 150px;");
            window.document.body.appendChild(cont);

            expect(node.itsa_rectangleInside(cont)).to.be.true;

            cont.setAttribute("style", "position:absolute; left:9px; top: 30px;  height: 75px; width: 150px;");
            expect(node.itsa_rectangleInside(cont)).to.be.false;

            cont.setAttribute("style", "position:absolute; left:11px; top: 30px;  height: 75px; width: 150px;");
            expect(node.itsa_rectangleInside(cont)).to.be.false;

            cont.setAttribute("style", "position:absolute; left:10px; top: 29px;  height: 75px; width: 150px;");
            expect(node.itsa_rectangleInside(cont)).to.be.false;

            cont.setAttribute("style", "position:absolute; left:10px; top: 31px;  height: 75px; width: 150px;");
            expect(node.itsa_rectangleInside(cont)).to.be.false;

            window.document.body.removeChild(cont);
        });
    }

    it("itsa_scrollTo", function () {
        node.setAttribute("style", "position: absolute; z-index: -1; left: 10px; top: 30px; height: 10px; width: 10px; overflow: scroll;");
        node.innerHTML = "data data data data data data data data data data data data data data data data data data data data data data "+
                         "data data data data data data data data data data data data data data data data data data data data data data "+
                         "data data data data data data data data data data data data data data data data data data data data data data "+
                         "data data data data data data data data data data data data data data data data data data data data data data "+
                         "data data data data data data data data data data data data data data data data data data data data data data "+
                         "data data data data data data data data data data data data data data data data data data data data data data ";
        expect(node.scrollLeft).to.be.eql(0);
        expect(node.scrollTop).to.be.eql(0);
        node.itsa_scrollTo(10, 15);
        expect(node.scrollLeft).to.be.eql(10);
        expect(node.scrollTop).to.be.eql(15);
    });

});