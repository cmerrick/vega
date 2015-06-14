var util = require('datalib/src/util'),
    canvas = require('vega-scenegraph/src/render/canvas'),
    svg = require('vega-scenegraph/src/render/svg-string'),
    View = require('./View'),
    log = require('../util/log');

var HeadlessView = function(width, height, model) {
  View.call(null, width, height, model);
  this._type = "canvas";
  this._renderers = {canvas: canvas, svg: svg};
}

var prototype = (HeadlessView.prototype = new View());

prototype.renderer = function(type) {
  if(type) this._type = type;
  return View.prototype.renderer.apply(this, arguments);
};

prototype.canvas = function() {
  return (this._type === "canvas")
    ? this._renderer.canvas()
    : null;
};

prototype.canvasAsync = function(callback) {
  var r = this._renderer, view = this;
  
  function wait() {
    if (r.pendingImages() === 0) {
      view.render(); // re-render with all images
      callback(view._canvas);
    } else {
      setTimeout(wait, 10);
    }
  }

  // if images loading, poll until ready
  if (this._type !== "canvas") return null;
  (r.pendingImages() > 0) ? wait() : callback(this.canvas());
};

prototype.svg = function() {
  return (this._type === "svg")
    ? this._renderer.svg()
    : null;
};

prototype.initialize = function() {    
  var w = this._width,
      h = this._height,
      pad = this._padding,
      bg = this._bgcolor;

  if (this._viewport) {
    w = this._viewport[0] - (pad ? pad.left + pad.right : 0);
    h = this._viewport[1] - (pad ? pad.top + pad.bottom : 0);
  }

  this._renderer = (this._renderer || new this._io.Renderer())
    .initialize(null, w, h, pad)
    .background(bg);
  
  return this;
};

module.exports = HeadlessView;
