function Click ($, document, window) {
    var self = this;
    self.$ = $;
    self.document = document;
    self.window = window;
};

Click.prototype.inspect = function (event) {
    var node = event.target,
        $node = this.$(node),
        out = {},
        $a;

    // screen size
    out.screen = {width: this.window.screen.width, height: this.window.screen.height};

    // cursor position
    out.cursor = {x: event.pageX, y: event.pageY};

    // section
    out.section = this.lookup_section($node);
 
    // xpath
    out.node_xpath = this.generate_xpath(node);

    // closest anchor (<a />)
    $a = $node.closest("a");
    out.href = $a.attr('href');

    // call hook that will return some additional node information
    // (make sure no one will mess with output data)
    out.aux = this.aux_node_data($node, this.$.extend(true, {}, out));
    // console.log(out);
    return out;
};

Click.prototype.report = function (data) {
};

Click.prototype.draw = function (data) {
};

Click.prototype.lookup_section = function (node) {
    return $(node).closest('[class^="nnsr"]').get(0);
};

Click.prototype.generate_xpath = function (element) {
    var xpath = '', xpath_nopos = '', id, cls, l, i;
    for ( ; element && element.nodeType == 1; element = element.parentNode) {
        id = '';

        // find href
        if (element.href !== void 0) {
            id = "[@href='" + element.href + "']";
        // find id
        } else if (element.id.length > 0) {
            id = "[@id='" + element.id + "']";
        // find class
        } else {
            for(i=0, cls = element.className.split(' '); i < cls.length; i++) {
                if (cls[i].indexOf('nnsr') === 0) {
                    id = "[contains(@class, '" + cls[i] + "')]";
                    break;
                }
            }
        }
        // find position index
        xpath_nopos = '/' + element.tagName.toLowerCase() + id + xpath_nopos;
        id = '[' + ( $(element.parentNode).children(element.tagName).index(element) + 1 ) + ']';
        xpath = '/' + element.tagName.toLowerCase() + id + xpath;
    }
    console.log({nopos: xpath_nopos, pos: xpath});
    return xpath;
};

Click.prototype.lookup_xpath = function (xpath) {
    var xresult = document.evaluate(xpath, this.document, null, XPathResult.ANY_TYPE, null);
    var xnodes = [];
    var xres;
    while (xres = xresult.iterateNext()) {
        xnodes.push(xres);
    }
    return xnodes;
};

// override to pass some additional data
Click.prototype.aux_node_data = function (node, data) {
    return {};
};

Click.prototype.attach_event = function () {
    var self = this,
        handler = function (event) { self.inspect(event); return false; };
    if (this.window.attachEvent) {
        this.document.attachEvent('onmousedown', handler, true);
    } else {
        this.document.addEventListener('mousedown', handler, true);
    }
};

var clk = new Click(jQuery, document, window);
clk.attach_event();

var _x = clk.lookup_xpath;
