(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.lottie_api = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Renderer = require('../renderer/Renderer');
var layer_api = require('../helpers/layerAPIBuilder');

function AnimationItemFactory(animation) {

	var state = {
		animation: animation,
		elements: animation.renderer.elements.map((item) => layer_api(item, animation)),
		boundingRect: null,
		scaleData: null
	}

	function getCurrentFrame() {
		return animation.currentFrame;
	}

	function getCurrentTime() {
		return animation.currentFrame / animation.frameRate;
	}

	function addValueCallback(properties, value) {
		var i, len = properties.length;
		for (i = 0; i < len; i += 1) {
			properties.getPropertyAtIndex(i).setValue(value);
		}
	}

	function toKeypathLayerPoint(properties, point) {
		var i, len = properties.length;
		var points = [];
		for (i = 0; i < len; i += 1) {
			points.push(properties.getPropertyAtIndex(i).toKeypathLayerPoint(point));
		}
		if(points.length === 1) {
			return points[0];
		}
		return points;
	}

	function fromKeypathLayerPoint(properties, point) {
		var i, len = properties.length;
		var points = [];
		for (i = 0; i < len; i += 1) {
			points.push(properties.getPropertyAtIndex(i).fromKeypathLayerPoint(point));
		}
		if(points.length === 1) {
			return points[0];
		}
		return points;
	}

	function calculateScaleData(boundingRect) {
		var compWidth = animation.animationData.w;
        var compHeight = animation.animationData.h;
		var compRel = compWidth / compHeight;
        var elementWidth = boundingRect.width;
        var elementHeight = boundingRect.height;
        var elementRel = elementWidth / elementHeight;
        var scale,scaleXOffset,scaleYOffset;
        var xAlignment, yAlignment, scaleMode;
        var aspectRatio = animation.renderer.renderConfig.preserveAspectRatio.split(' ');
        if(aspectRatio[1] === 'meet') {
        	scale = elementRel > compRel ? elementHeight / compHeight : elementWidth / compWidth;
        } else {
        	scale = elementRel > compRel ? elementWidth / compWidth : elementHeight / compHeight;
        }
        xAlignment = aspectRatio[0].substr(0,4);
        yAlignment = aspectRatio[0].substr(4);
        if(xAlignment === 'xMin') {
        	scaleXOffset = 0;
        } else if(xAlignment === 'xMid') {
        	scaleXOffset = (elementWidth - compWidth * scale) / 2;
        } else {
        	scaleXOffset = (elementWidth - compWidth * scale);
        }

        if(yAlignment === 'YMin') {
	        scaleYOffset = 0;
        } else if(yAlignment === 'YMid') {
	        scaleYOffset = (elementHeight - compHeight * scale) / 2;
        } else {
	        scaleYOffset = (elementHeight - compHeight * scale);
        }
        return {
        	scaleYOffset: scaleYOffset,
        	scaleXOffset: scaleXOffset,
        	scale: scale
        }
	}

	function recalculateSize(container) {
		var container = animation.wrapper;
		state.boundingRect = container.getBoundingClientRect();
		state.scaleData = calculateScaleData(state.boundingRect);
	}

	function toContainerPoint(point) {
		if(!animation.wrapper || !animation.wrapper.getBoundingClientRect) {
			return point;
		}
		if(!state.boundingRect) {
			recalculateSize();
		}

		var boundingRect = state.boundingRect;
		var newPoint = [point[0] - boundingRect.left, point[1] - boundingRect.top];
		var scaleData = state.scaleData;

        newPoint[0] = (newPoint[0] - scaleData.scaleXOffset) / scaleData.scale;
        newPoint[1] = (newPoint[1] - scaleData.scaleYOffset) / scaleData.scale;

		return newPoint;
	}

	function fromContainerPoint(point) {
		if(!animation.wrapper || !animation.wrapper.getBoundingClientRect) {
			return point;
		}
		if(!state.boundingRect) {
			recalculateSize();
		}
		var boundingRect = state.boundingRect;
		var scaleData = state.scaleData;

		var newPoint = [point[0] * scaleData.scale + scaleData.scaleXOffset, point[1] * scaleData.scale + scaleData.scaleYOffset];

		var newPoint = [newPoint[0] + boundingRect.left, newPoint[1] + boundingRect.top];
		return newPoint;
	}

	function getScaleData() {
		return state.scaleData;
	}

	var methods = {
		recalculateSize: recalculateSize,
		getScaleData: getScaleData,
		toContainerPoint: toContainerPoint,
		fromContainerPoint: fromContainerPoint,
		getCurrentFrame: getCurrentFrame,
		getCurrentTime: getCurrentTime,
		addValueCallback: addValueCallback,
		toKeypathLayerPoint: toKeypathLayerPoint,
		fromKeypathLayerPoint: fromKeypathLayerPoint
	}

	return Object.assign({}, Renderer(state), methods);
}

module.exports = AnimationItemFactory;
},{"../helpers/layerAPIBuilder":6,"../renderer/Renderer":42}],2:[function(require,module,exports){
module.exports = ',';
},{}],3:[function(require,module,exports){
module.exports = {
	 0: 0,
	 1: 1,
	 2: 2,
	 3: 3,
	 4: 4,
	 5: 5,
	 13: 13,
	'comp': 0,
	'composition': 0,
	'solid': 1,
	'image': 2,
	'null': 3,
	'shape': 4,
	'text': 5,
	'camera': 13
}
},{}],4:[function(require,module,exports){
module.exports = {
	LAYER_TRANSFORM: 'transform'
}
},{}],5:[function(require,module,exports){
var key_path_separator = require('../enums/key_path_separator');
var sanitizeString = require('./stringSanitizer');

module.exports = function(propertyPath) {
	var keyPathSplit = propertyPath.split(key_path_separator);
	var selector = keyPathSplit.shift();
	return {
		selector: sanitizeString(selector),
		propertyPath: keyPathSplit.join(key_path_separator)
	}
}
},{"../enums/key_path_separator":2,"./stringSanitizer":7}],6:[function(require,module,exports){
var TextElement = require('../layer/text/TextElement');
var ShapeElement = require('../layer/shape/Shape');
var NullElement = require('../layer/null_element/NullElement');
var SolidElement = require('../layer/solid/SolidElement');
var ImageElement = require('../layer/image/ImageElement');
var CameraElement = require('../layer/camera/Camera');
var LayerBase = require('../layer/LayerBase');


module.exports = function getLayerApi(element, parent) {
	var layerType = element.data.ty;
	var Composition = require('../layer/composition/Composition');
	switch(layerType) {
		case 0:
		return Composition(element, parent);
		case 1:
		return SolidElement(element, parent);
		case 2:
		return ImageElement(element, parent);
		case 3:
		return NullElement(element, parent);
		case 4:
		return ShapeElement(element, parent, element.data.shapes, element.itemsData);
		case 5:
		return TextElement(element, parent);
		case 13:
		return CameraElement(element, parent);
		default:
		return LayerBase(element, parent);
	}
}
},{"../layer/LayerBase":13,"../layer/camera/Camera":15,"../layer/composition/Composition":16,"../layer/image/ImageElement":20,"../layer/null_element/NullElement":21,"../layer/shape/Shape":22,"../layer/solid/SolidElement":35,"../layer/text/TextElement":38}],7:[function(require,module,exports){
function sanitizeString(string) {
	return string.trim();
}

module.exports = sanitizeString
},{}],8:[function(require,module,exports){
var createTypedArray = require('./typedArrays')

/*!
 Transformation Matrix v2.0
 (c) Epistemex 2014-2015
 www.epistemex.com
 By Ken Fyrstenberg
 Contributions by leeoniya.
 License: MIT, header required.
 */

/**
 * 2D transformation matrix object initialized with identity matrix.
 *
 * The matrix can synchronize a canvas context by supplying the context
 * as an argument, or later apply current absolute transform to an
 * existing context.
 *
 * All values are handled as floating point values.
 *
 * @param {CanvasRenderingContext2D} [context] - Optional context to sync with Matrix
 * @prop {number} a - scale x
 * @prop {number} b - shear y
 * @prop {number} c - shear x
 * @prop {number} d - scale y
 * @prop {number} e - translate x
 * @prop {number} f - translate y
 * @prop {CanvasRenderingContext2D|null} [context=null] - set or get current canvas context
 * @constructor
 */

var Matrix = (function(){

    var _cos = Math.cos;
    var _sin = Math.sin;
    var _tan = Math.tan;
    var _rnd = Math.round;

    function reset(){
        this.props[0] = 1;
        this.props[1] = 0;
        this.props[2] = 0;
        this.props[3] = 0;
        this.props[4] = 0;
        this.props[5] = 1;
        this.props[6] = 0;
        this.props[7] = 0;
        this.props[8] = 0;
        this.props[9] = 0;
        this.props[10] = 1;
        this.props[11] = 0;
        this.props[12] = 0;
        this.props[13] = 0;
        this.props[14] = 0;
        this.props[15] = 1;
        return this;
    }

    function rotate(angle) {
        if(angle === 0){
            return this;
        }
        var mCos = _cos(angle);
        var mSin = _sin(angle);
        return this._t(mCos, -mSin,  0, 0, mSin,  mCos, 0, 0, 0,  0,  1, 0, 0, 0, 0, 1);
    }

    function rotateX(angle){
        if(angle === 0){
            return this;
        }
        var mCos = _cos(angle);
        var mSin = _sin(angle);
        return this._t(1, 0, 0, 0, 0, mCos, -mSin, 0, 0, mSin,  mCos, 0, 0, 0, 0, 1);
    }

    function rotateY(angle){
        if(angle === 0){
            return this;
        }
        var mCos = _cos(angle);
        var mSin = _sin(angle);
        return this._t(mCos,  0,  mSin, 0, 0, 1, 0, 0, -mSin,  0,  mCos, 0, 0, 0, 0, 1);
    }

    function rotateZ(angle){
        if(angle === 0){
            return this;
        }
        var mCos = _cos(angle);
        var mSin = _sin(angle);
        return this._t(mCos, -mSin,  0, 0, mSin,  mCos, 0, 0, 0,  0,  1, 0, 0, 0, 0, 1);
    }

    function shear(sx,sy){
        return this._t(1, sy, sx, 1, 0, 0);
    }

    function skew(ax, ay){
        return this.shear(_tan(ax), _tan(ay));
    }

    function skewFromAxis(ax, angle){
        var mCos = _cos(angle);
        var mSin = _sin(angle);
        return this._t(mCos, mSin,  0, 0, -mSin,  mCos, 0, 0, 0,  0,  1, 0, 0, 0, 0, 1)
            ._t(1, 0,  0, 0, _tan(ax),  1, 0, 0, 0,  0,  1, 0, 0, 0, 0, 1)
            ._t(mCos, -mSin,  0, 0, mSin,  mCos, 0, 0, 0,  0,  1, 0, 0, 0, 0, 1);
        //return this._t(mCos, mSin, -mSin, mCos, 0, 0)._t(1, 0, _tan(ax), 1, 0, 0)._t(mCos, -mSin, mSin, mCos, 0, 0);
    }

    function scale(sx, sy, sz) {
        sz = isNaN(sz) ? 1 : sz;
        if(sx == 1 && sy == 1 && sz == 1){
            return this;
        }
        return this._t(sx, 0, 0, 0, 0, sy, 0, 0, 0, 0, sz, 0, 0, 0, 0, 1);
    }

    function setTransform(a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p) {
        this.props[0] = a;
        this.props[1] = b;
        this.props[2] = c;
        this.props[3] = d;
        this.props[4] = e;
        this.props[5] = f;
        this.props[6] = g;
        this.props[7] = h;
        this.props[8] = i;
        this.props[9] = j;
        this.props[10] = k;
        this.props[11] = l;
        this.props[12] = m;
        this.props[13] = n;
        this.props[14] = o;
        this.props[15] = p;
        return this;
    }

    function translate(tx, ty, tz) {
        tz = tz || 0;
        if(tx !== 0 || ty !== 0 || tz !== 0){
            return this._t(1,0,0,0,0,1,0,0,0,0,1,0,tx,ty,tz,1);
        }
        return this;
    }

    function transform(a2, b2, c2, d2, e2, f2, g2, h2, i2, j2, k2, l2, m2, n2, o2, p2) {

        var _p = this.props;

        if(a2 === 1 && b2 === 0 && c2 === 0 && d2 === 0 && e2 === 0 && f2 === 1 && g2 === 0 && h2 === 0 && i2 === 0 && j2 === 0 && k2 === 1 && l2 === 0){
            //NOTE: commenting this condition because TurboFan deoptimizes code when present
            //if(m2 !== 0 || n2 !== 0 || o2 !== 0){
                _p[12] = _p[12] * a2 + _p[15] * m2;
                _p[13] = _p[13] * f2 + _p[15] * n2;
                _p[14] = _p[14] * k2 + _p[15] * o2;
                _p[15] = _p[15] * p2;
            //}
            this._identityCalculated = false;
            return this;
        }

        var a1 = _p[0];
        var b1 = _p[1];
        var c1 = _p[2];
        var d1 = _p[3];
        var e1 = _p[4];
        var f1 = _p[5];
        var g1 = _p[6];
        var h1 = _p[7];
        var i1 = _p[8];
        var j1 = _p[9];
        var k1 = _p[10];
        var l1 = _p[11];
        var m1 = _p[12];
        var n1 = _p[13];
        var o1 = _p[14];
        var p1 = _p[15];

        /* matrix order (canvas compatible):
         * ace
         * bdf
         * 001
         */
        _p[0] = a1 * a2 + b1 * e2 + c1 * i2 + d1 * m2;
        _p[1] = a1 * b2 + b1 * f2 + c1 * j2 + d1 * n2 ;
        _p[2] = a1 * c2 + b1 * g2 + c1 * k2 + d1 * o2 ;
        _p[3] = a1 * d2 + b1 * h2 + c1 * l2 + d1 * p2 ;

        _p[4] = e1 * a2 + f1 * e2 + g1 * i2 + h1 * m2 ;
        _p[5] = e1 * b2 + f1 * f2 + g1 * j2 + h1 * n2 ;
        _p[6] = e1 * c2 + f1 * g2 + g1 * k2 + h1 * o2 ;
        _p[7] = e1 * d2 + f1 * h2 + g1 * l2 + h1 * p2 ;

        _p[8] = i1 * a2 + j1 * e2 + k1 * i2 + l1 * m2 ;
        _p[9] = i1 * b2 + j1 * f2 + k1 * j2 + l1 * n2 ;
        _p[10] = i1 * c2 + j1 * g2 + k1 * k2 + l1 * o2 ;
        _p[11] = i1 * d2 + j1 * h2 + k1 * l2 + l1 * p2 ;

        _p[12] = m1 * a2 + n1 * e2 + o1 * i2 + p1 * m2 ;
        _p[13] = m1 * b2 + n1 * f2 + o1 * j2 + p1 * n2 ;
        _p[14] = m1 * c2 + n1 * g2 + o1 * k2 + p1 * o2 ;
        _p[15] = m1 * d2 + n1 * h2 + o1 * l2 + p1 * p2 ;

        this._identityCalculated = false;
        return this;
    }

    function isIdentity() {
        if(!this._identityCalculated){
            this._identity = !(this.props[0] !== 1 || this.props[1] !== 0 || this.props[2] !== 0 || this.props[3] !== 0 || this.props[4] !== 0 || this.props[5] !== 1 || this.props[6] !== 0 || this.props[7] !== 0 || this.props[8] !== 0 || this.props[9] !== 0 || this.props[10] !== 1 || this.props[11] !== 0 || this.props[12] !== 0 || this.props[13] !== 0 || this.props[14] !== 0 || this.props[15] !== 1);
            this._identityCalculated = true;
        }
        return this._identity;
    }

    function equals(matr){
        var i = 0;
        while (i < 16) {
            if(matr.props[i] !== this.props[i]) {
                return false;
            }
            i+=1;
        }
        return true;
    }

    function clone(matr){
        var i;
        for(i=0;i<16;i+=1){
            matr.props[i] = this.props[i];
        }
    }

    function cloneFromProps(props){
        var i;
        for(i=0;i<16;i+=1){
            this.props[i] = props[i];
        }
    }

    function applyToPoint(x, y, z) {

        return {
            x: x * this.props[0] + y * this.props[4] + z * this.props[8] + this.props[12],
            y: x * this.props[1] + y * this.props[5] + z * this.props[9] + this.props[13],
            z: x * this.props[2] + y * this.props[6] + z * this.props[10] + this.props[14]
        };
        /*return {
         x: x * me.a + y * me.c + me.e,
         y: x * me.b + y * me.d + me.f
         };*/
    }
    function applyToX(x, y, z) {
        return x * this.props[0] + y * this.props[4] + z * this.props[8] + this.props[12];
    }
    function applyToY(x, y, z) {
        return x * this.props[1] + y * this.props[5] + z * this.props[9] + this.props[13];
    }
    function applyToZ(x, y, z) {
        return x * this.props[2] + y * this.props[6] + z * this.props[10] + this.props[14];
    }

    function inversePoint(pt) {
        var determinant = this.props[0] * this.props[5] - this.props[1] * this.props[4];
        var a = this.props[5]/determinant;
        var b = - this.props[1]/determinant;
        var c = - this.props[4]/determinant;
        var d = this.props[0]/determinant;
        var e = (this.props[4] * this.props[13] - this.props[5] * this.props[12])/determinant;
        var f = - (this.props[0] * this.props[13] - this.props[1] * this.props[12])/determinant;
        return [pt[0] * a + pt[1] * c + e, pt[0] * b + pt[1] * d + f, 0];
    }

    function inversePoints(pts){
        var i, len = pts.length, retPts = [];
        for(i=0;i<len;i+=1){
            retPts[i] = inversePoint(pts[i]);
        }
        return retPts;
    }

    function applyToTriplePoints(pt1, pt2, pt3) {
        var arr = createTypedArray('float32', 6);
        if(this.isIdentity()) {
            arr[0] = pt1[0];
            arr[1] = pt1[1];
            arr[2] = pt2[0];
            arr[3] = pt2[1];
            arr[4] = pt3[0];
            arr[5] = pt3[1];
        } else {
            var p0 = this.props[0], p1 = this.props[1], p4 = this.props[4], p5 = this.props[5], p12 = this.props[12], p13 = this.props[13];
            arr[0] = pt1[0] * p0 + pt1[1] * p4 + p12;
            arr[1] = pt1[0] * p1 + pt1[1] * p5 + p13;
            arr[2] = pt2[0] * p0 + pt2[1] * p4 + p12;
            arr[3] = pt2[0] * p1 + pt2[1] * p5 + p13;
            arr[4] = pt3[0] * p0 + pt3[1] * p4 + p12;
            arr[5] = pt3[0] * p1 + pt3[1] * p5 + p13;
        }
        return arr;
    }

    function applyToPointArray(x,y,z){
        var arr;
        if(this.isIdentity()) {
            arr = [x,y,z];
        } else {
            arr = [x * this.props[0] + y * this.props[4] + z * this.props[8] + this.props[12],x * this.props[1] + y * this.props[5] + z * this.props[9] + this.props[13],x * this.props[2] + y * this.props[6] + z * this.props[10] + this.props[14]];
        }
        return arr;
    }

    function applyToPointStringified(x, y) {
        if(this.isIdentity()) {
            return x + ',' + y;
        }
        return (x * this.props[0] + y * this.props[4] + this.props[12])+','+(x * this.props[1] + y * this.props[5] + this.props[13]);
    }

    function toCSS() {
        //Doesn't make much sense to add this optimization. If it is an identity matrix, it's very likely this will get called only once since it won't be keyframed.
        /*if(this.isIdentity()) {
            return '';
        }*/
        var i = 0;
        var props = this.props;
        var cssValue = 'matrix3d(';
        var v = 10000;
        while(i<16){
            cssValue += _rnd(props[i]*v)/v;
            cssValue += i === 15 ? ')':',';
            i += 1;
        }
        return cssValue;
    }

    function to2dCSS() {
        //Doesn't make much sense to add this optimization. If it is an identity matrix, it's very likely this will get called only once since it won't be keyframed.
        /*if(this.isIdentity()) {
            return '';
        }*/
        var v = 10000;
        var props = this.props;
        return "matrix(" + _rnd(props[0]*v)/v + ',' + _rnd(props[1]*v)/v + ',' + _rnd(props[4]*v)/v + ',' + _rnd(props[5]*v)/v + ',' + _rnd(props[12]*v)/v + ',' + _rnd(props[13]*v)/v + ")";
    }

    function MatrixInstance(){
        this.reset = reset;
        this.rotate = rotate;
        this.rotateX = rotateX;
        this.rotateY = rotateY;
        this.rotateZ = rotateZ;
        this.skew = skew;
        this.skewFromAxis = skewFromAxis;
        this.shear = shear;
        this.scale = scale;
        this.setTransform = setTransform;
        this.translate = translate;
        this.transform = transform;
        this.applyToPoint = applyToPoint;
        this.applyToX = applyToX;
        this.applyToY = applyToY;
        this.applyToZ = applyToZ;
        this.applyToPointArray = applyToPointArray;
        this.applyToTriplePoints = applyToTriplePoints;
        this.applyToPointStringified = applyToPointStringified;
        this.toCSS = toCSS;
        this.to2dCSS = to2dCSS;
        this.clone = clone;
        this.cloneFromProps = cloneFromProps;
        this.equals = equals;
        this.inversePoints = inversePoints;
        this.inversePoint = inversePoint;
        this._t = this.transform;
        this.isIdentity = isIdentity;
        this._identity = true;
        this._identityCalculated = false;

        this.props = createTypedArray('float32', 16);
        this.reset();
    };

    return function() {
        return new MatrixInstance()
    }
}());

module.exports = Matrix;
},{"./typedArrays":9}],9:[function(require,module,exports){
var createTypedArray = (function(){
	function createRegularArray(type, len){
		var i = 0, arr = [], value;
		switch(type) {
			case 'int16':
			case 'uint8c':
				value = 1;
				break;
			default:
				value = 1.1;
				break;
		}
		for(i = 0; i < len; i += 1) {
			arr.push(value);
		}
		return arr;
	}
	function createTypedArray(type, len){
		if(type === 'float32') {
			return new Float32Array(len);
		} else if(type === 'int16') {
			return new Int16Array(len);
		} else if(type === 'uint8c') {
			return new Uint8ClampedArray(len);
		}
	}
	if(typeof Uint8ClampedArray === 'function' && typeof Float32Array === 'function') {
		return createTypedArray;
	} else {
		return createRegularArray;
	}
}());

module.exports = createTypedArray;

},{}],10:[function(require,module,exports){
var AnimationItem = require('./animation/AnimationItem');

function createAnimationApi(anim) {
	return Object.assign({}, AnimationItem(anim));
}

module.exports = {
	createAnimationApi : createAnimationApi
}
},{"./animation/AnimationItem":1}],11:[function(require,module,exports){
var keyPathBuilder = require('../helpers/keyPathBuilder');
var layer_types = require('../enums/layer_types');

function KeyPathList(elements, node_type) {

	function _getLength() {
		return elements.length;
	}

	function _filterLayerByType(elements, type) {
		return elements.filter(function(element) {
			return element.getTargetLayer().data.ty === layer_types[type];
		});
	}

	function _filterLayerByName(elements, name) {
		return elements.filter(function(element) {
			return element.getTargetLayer().data.nm === name;
		});
	}

	function _filterLayerByProperty(elements, name) {
		return elements.filter(function(element) {
			if(element.hasProperty(name)) {
				return element.getProperty(name);
			}
			return false;
		});
	}

	function getLayersByType(selector) {
		return KeyPathList(_filterLayerByType(elements, selector), 'layer');
	}

	function getLayersByName(selector) {
		return KeyPathList(_filterLayerByName(elements, selector), 'layer');
	}

	function getPropertiesBySelector(selector) {
		return KeyPathList(elements.filter(function(element) {
			return element.hasProperty(selector);
		}).map(function(element) {
			return element.getProperty(selector);
		}), 'property');
	}

	function getLayerProperty(selector) {
		var layers = _filterLayerByProperty(elements, selector);
		var properties = layers.map(function(element){
			return element.getProperty(selector);
		})
		return KeyPathList(properties, 'property');
	}

	function getKeyPath(propertyPath) {
		var keyPathData = keyPathBuilder(propertyPath);
		var selector = keyPathData.selector;
		var nodesByName, nodesByType, selectedNodes;
		if (node_type === 'renderer' || node_type === 'layer') {
			nodesByName = getLayersByName(selector);
			nodesByType = getLayersByType(selector);
			if (nodesByName.length === 0 && nodesByType.length === 0) {
				selectedNodes = getLayerProperty(selector);
			} else {
				selectedNodes = nodesByName.concat(nodesByType);
			}
			if (keyPathData.propertyPath) {
				return selectedNodes.getKeyPath(keyPathData.propertyPath);
			} else {
				return selectedNodes;
			}
		} else if(node_type === 'property') {
			selectedNodes = getPropertiesBySelector(selector);
			if (keyPathData.propertyPath) {
				return selectedNodes.getKeyPath(keyPathData.propertyPath);
			} else {
				return selectedNodes;
			}
		}
	}

	function concat(nodes) {
		var nodesElements = nodes.getElements();
		return KeyPathList(elements.concat(nodesElements), node_type);
	}

	function getElements() {
		return elements;
	}

	function getPropertyAtIndex(index) {
		return elements[index];
	}

	var methods = {
		getKeyPath: getKeyPath,
		concat: concat,
		getElements: getElements,
		getPropertyAtIndex: getPropertyAtIndex
	}

	Object.defineProperty(methods, 'length', {
		get: _getLength
	});

	return methods;
}

module.exports = KeyPathList;
},{"../enums/layer_types":3,"../helpers/keyPathBuilder":5}],12:[function(require,module,exports){
var key_path_separator = require('../enums/key_path_separator');
var property_names = require('../enums/property_names');

function KeyPathNode(state) {

	function getPropertyByPath(selector, propertyPath) {
		var instanceProperties = state.properties || [];
		var i = 0, len = instanceProperties.length;
		while(i < len) {
			if(instanceProperties[i].name === selector) {
				return instanceProperties[i].value;
			}
			i += 1;
		}
		return null;

	}

	function hasProperty(selector) {
		return !!getPropertyByPath(selector);
	}

	function getProperty(selector) {
		return getPropertyByPath(selector);
	}

	function fromKeypathLayerPoint(point) {
		return state.parent.fromKeypathLayerPoint(point);
	}

	function toKeypathLayerPoint(point) {
		return state.parent.toKeypathLayerPoint(point);
	}

	var methods = {
		hasProperty: hasProperty,
		getProperty: getProperty,
		fromKeypathLayerPoint: fromKeypathLayerPoint,
		toKeypathLayerPoint: toKeypathLayerPoint
	}
	return methods;
}

module.exports = KeyPathNode;
},{"../enums/key_path_separator":2,"../enums/property_names":4}],13:[function(require,module,exports){
var KeyPathNode = require('../key_path/KeyPathNode');
var Transform = require('./transform/Transform');
var Effects = require('./effects/Effects');
var Matrix = require('../helpers/transformationMatrix');

function LayerBase(state) {

	var transform = Transform(state.element.finalTransform.mProp, state);
	var effects = Effects(state.element.effectsManager.effectElements || [], state);

	function _buildPropertyMap() {
		state.properties.push({
			name: 'transform',
			value: transform
		},{
			name: 'Transform',
			value: transform
		},{
			name: 'Effects',
			value: effects
		},{
			name: 'effects',
			value: effects
		})
	}

    function getElementToPoint(point) {
    }

	function toKeypathLayerPoint(point) {
		var element = state.element;
    	if(state.parent.toKeypathLayerPoint) {
        	point = state.parent.toKeypathLayerPoint(point);
        }
    	var toWorldMat = Matrix();
        var transformMat = state.getProperty('Transform').getTargetTransform();
        transformMat.applyToMatrix(toWorldMat);
        if(element.hierarchy && element.hierarchy.length){
            var i, len = element.hierarchy.length;
            for(i=0;i<len;i+=1){
                element.hierarchy[i].finalTransform.mProp.applyToMatrix(toWorldMat);
            }
        }
        return toWorldMat.inversePoint(point);
	}

	function fromKeypathLayerPoint(point) {
		var element = state.element;
		var toWorldMat = Matrix();
        var transformMat = state.getProperty('Transform').getTargetTransform();
        transformMat.applyToMatrix(toWorldMat);
        if(element.hierarchy && element.hierarchy.length){
            var i, len = element.hierarchy.length;
            for(i=0;i<len;i+=1){
                element.hierarchy[i].finalTransform.mProp.applyToMatrix(toWorldMat);
            }
        }
        point = toWorldMat.applyToPointArray(point[0],point[1],point[2]||0);
        if(state.parent.fromKeypathLayerPoint) {
        	return state.parent.fromKeypathLayerPoint(point);
        } else {
        	return point;
        }
	}

	function getTargetLayer() {
		return state.element;
	}

	var methods = {
		getTargetLayer: getTargetLayer,
		toKeypathLayerPoint: toKeypathLayerPoint,
		fromKeypathLayerPoint: fromKeypathLayerPoint
	}

	_buildPropertyMap();

	return Object.assign(state, KeyPathNode(state), methods);
}

module.exports = LayerBase;
},{"../helpers/transformationMatrix":8,"../key_path/KeyPathNode":12,"./effects/Effects":19,"./transform/Transform":39}],14:[function(require,module,exports){
var layer_types = require('../enums/layer_types');
var layer_api = require('../helpers/layerAPIBuilder');

function LayerList(elements) {

	function _getLength() {
		return elements.length;
	}

	function _filterLayerByType(elements, type) {
		return elements.filter(function(element) {
			return element.data.ty === layer_types[type];
		});
	}

	function _filterLayerByName(elements, name) {
		return elements.filter(function(element) {
			return element.data.nm === name;
		});
	}

	function getLayers() {
		 return LayerList(elements);
	}

	function getLayersByType(type) {
		var elementsList = _filterLayerByType(elements, type);
		return LayerList(elementsList);
	}

	function getLayersByName(type) {
		var elementsList = _filterLayerByName(elements, type);
		return LayerList(elementsList);
	}

	function layer(index) {
		if (index >= elements.length) {
			return [];
		}
		return layer_api(elements[parseInt(index)]);
	}

	function addIteratableMethods(iteratableMethods, list) {
		iteratableMethods.reduce(function(accumulator, value){
			var _value = value;
			accumulator[value] = function() {
				var _arguments = arguments;
				return elements.map(function(element){
					var layer = layer_api(element);
					if(layer[_value]) {
						return layer[_value].apply(null, _arguments);
					}
					return null;
				});
			}
			return accumulator;
		}, methods);
	}

	function getTargetElements() {
		return elements;
	}

	function concat(list) {
		return elements.concat(list.getTargetElements());
	}

	var methods = {
		getLayers: getLayers,
		getLayersByType: getLayersByType,
		getLayersByName: getLayersByName,
		layer: layer,
		concat: concat,
		getTargetElements: getTargetElements
	};

	addIteratableMethods(['setTranslate', 'getType', 'getDuration']);
	addIteratableMethods(['setText', 'getText', 'setDocumentData', 'canResizeFont', 'setMinimumFontSize']);

	Object.defineProperty(methods, 'length', {
		get: _getLength
	});
	return methods;
}

module.exports = LayerList;
},{"../enums/layer_types":3,"../helpers/layerAPIBuilder":6}],15:[function(require,module,exports){
var KeyPathNode = require('../../key_path/KeyPathNode');
var Property = require('../../property/Property');

function Camera(element, parent) {

	var instance = {};

	var state = {
		element: element,
		parent: parent,
		properties: _buildPropertyMap()
	}

	function _buildPropertyMap() {
		return [
			{
				name: 'Point of Interest',
				value: Property(element.a, parent)
			},
			{
				name: 'Zoom',
				value: Property(element.pe, parent)
			},
			{
				name: 'Position',
				value: Property(element.p, parent)
			},
			{
				name: 'X Rotation',
				value: Property(element.rx, parent)
			},
			{
				name: 'Y Rotation',
				value: Property(element.ry, parent)
			},
			{
				name: 'Z Rotation',
				value: Property(element.rz, parent)
			}
		]
	}

	function getTargetLayer() {
		return state.element;
	}

	var methods = {
		getTargetLayer: getTargetLayer
	}

	return Object.assign(instance, KeyPathNode(state), methods);
}

module.exports = Camera;
},{"../../key_path/KeyPathNode":12,"../../property/Property":40}],16:[function(require,module,exports){
var KeyPathList = require('../../key_path/KeyPathList');
var LayerBase = require('../LayerBase');
var layer_api = require('../../helpers/layerAPIBuilder');
var Property = require('../../property/Property');
var TimeRemap = require('./TimeRemap');

function Composition(element, parent) {

	var instance = {};

	var state = {
		element: element,
		parent: parent,
		properties: _buildPropertyMap()
	}

	function buildLayerApi(layer, index) {
		var _layerApi = null;
		var ob = {
			name: layer.nm
		}

		function getLayerApi() {
			if(!_layerApi) {
				_layerApi = layer_api(element.elements[index], state)
			}
			return _layerApi
		}

		Object.defineProperty(ob, 'value', {
			get : getLayerApi
		})
		return ob;
	}

	
	function _buildPropertyMap() {
		var compositionLayers = element.layers.map(buildLayerApi)
		return [
			{
				name: 'Time Remap',
				value: TimeRemap(element.tm)
			}
		].concat(compositionLayers)
	}

	var methods = {
	}

	return Object.assign(instance, LayerBase(state), KeyPathList(state.elements, 'layer'), methods);
}

module.exports = Composition;
},{"../../helpers/layerAPIBuilder":6,"../../key_path/KeyPathList":11,"../../property/Property":40,"../LayerBase":13,"./TimeRemap":17}],17:[function(require,module,exports){
var KeyPathNode = require('../../key_path/KeyPathNode');
var ValueProperty = require('../../property/ValueProperty');

function TimeRemap(property, parent) {
	var state = {
		property: property,
		parent: parent
	}

	var _isCallbackAdded = false;
	var currentSegmentInit = 0;
	var currentSegmentEnd = 0;
	var previousTime = 0, currentTime = 0;
	var initTime = 0;
	var _loop = true;
	var _loopCount = 0;
	var _speed = 1;
	var _paused = false;
	var _isDebugging = false;
	var queuedSegments = [];

	function playSegment(init, end, clear) {
		_paused = false;
		if(clear) {
			clearQueue();
			currentTime = init;
		}
		if(_isDebugging) {
			console.log(init, end);
		}
		_loopCount = 0;
		previousTime = Date.now();
		currentSegmentInit = init;
		currentSegmentEnd = end;
		addCallback();
	}

	function playQueuedSegment() {
		var newSegment = queuedSegments.shift();
		playSegment(newSegment[0], newSegment[1]);
	}

	function queueSegment(init, end) {
		queuedSegments.push([init, end]);
	}

	function clearQueue() {
		queuedSegments.length = 0;
	}

	function _segmentPlayer(currentValue) {
		if(currentSegmentInit === currentSegmentEnd) {
			currentTime = currentSegmentInit;
		} else if(!_paused) {
			var nowTime = Date.now();
			var elapsedTime = _speed * (nowTime - previousTime) / 1000;
			previousTime = nowTime;
			if(currentSegmentInit < currentSegmentEnd) {
				currentTime += elapsedTime;
				if(currentTime > currentSegmentEnd) {
					_loopCount += 1;
					if(queuedSegments.length) {
						playQueuedSegment();
					} else if(!_loop) {
						currentTime = currentSegmentEnd;
					} else {
						currentTime = currentSegmentInit + (currentTime - currentSegmentEnd);
					}
				}
			} else {
				currentTime -= elapsedTime;
				if(currentTime < currentSegmentEnd) {
					_loopCount += 1;
					if(queuedSegments.length) {
						playQueuedSegment();
					} else if(!_loop) {
						currentTime = currentSegmentEnd;
					} else {
						currentTime = currentSegmentInit - (currentSegmentEnd - currentTime);
					}
				}
			}
			if(_isDebugging) {
				console.log(currentTime)
			}
		}
		return currentTime;
	}

	function addCallback() {
		if(!_isCallbackAdded) {
			_isCallbackAdded = true;
			instance.setValue(_segmentPlayer, _isDebugging)
		}
	}

	function playTo(end, clear) {
		_paused = false;
		if(clear) {
			clearQueue();
		}
		addCallback();
		currentSegmentEnd = end;
	}

	function getCurrentTime() {
		if(_isCallbackAdded) {
			return elapsedTime;
		} else {
			return property.v / property.mult;
		}
	}

	function setLoop(flag) {
		_loop = flag;
	}

	function setSpeed(value) {
		_speed = value;
	}

	function setDebugging(flag) {
		_isDebugging = flag;
	}

	function pause() {
		_paused = true;
	}

	var methods = {
		playSegment: playSegment,
		playTo: playTo,
		queueSegment: queueSegment,
		clearQueue: clearQueue,
		setLoop: setLoop,
		setSpeed: setSpeed,
		pause: pause,
		setDebugging: setDebugging,
		getCurrentTime: getCurrentTime
	}

	var instance = {}

	return Object.assign(instance, methods, ValueProperty(state), KeyPathNode(state));
}

module.exports = TimeRemap;
},{"../../key_path/KeyPathNode":12,"../../property/ValueProperty":41}],18:[function(require,module,exports){
var Property = require('../../property/Property');

function EffectElement(effect, parent) {

	return Property(effect.p, parent);
}

module.exports = EffectElement;
},{"../../property/Property":40}],19:[function(require,module,exports){
var KeyPathNode = require('../../key_path/KeyPathNode');
var Property = require('../../property/Property');
var EffectElement = require('./EffectElement');

function Effects(effects, parent) {

	var state = {
		parent: parent,
		properties: buildProperties()
	}

	function getValue(effectData, index) {
		var nm = effectData.data ? effectData.data.nm : index.toString();
		var effectElement = effectData.data ? Effects(effectData.effectElements, parent) : Property(effectData.p, parent);
		return {
			name: nm,
			value: effectElement
		}
	}

	function buildProperties() {
		var i, len = effects.length;
		var arr = [];
		for (i = 0; i < len; i += 1) {
			arr.push(getValue(effects[i], i));
		}
		return arr;
	}

	var methods = {
	}

	return Object.assign(methods, KeyPathNode(state));
}

module.exports = Effects;
},{"../../key_path/KeyPathNode":12,"../../property/Property":40,"./EffectElement":18}],20:[function(require,module,exports){
var LayerBase = require('../LayerBase');

function Image(element) {

	var methods = {
	}

	return Object.assign({}, LayerBase(element), methods);
}

module.exports = Image;
},{"../LayerBase":13}],21:[function(require,module,exports){
var LayerBase = require('../LayerBase');

function NullElement(element, parent) {

	var instance = {};

	var state = {
		element: element,
		parent: parent,
		properties: _buildPropertyMap()
	}

	function _buildPropertyMap() {
		return [
		]
	}

	var methods = {
	}

	return Object.assign(instance, LayerBase(state), methods);
}

module.exports = NullElement;
},{"../LayerBase":13}],22:[function(require,module,exports){
var LayerBase = require('../LayerBase');
var ShapeContents = require('./ShapeContents');

function Shape(element, parent) {

	var state = {
		properties: [],
		parent: parent,
		element: element
	}
	var shapeContents = ShapeContents(element.data.shapes, element.itemsData, state);

	

	function _buildPropertyMap() {
		state.properties.push(
			{
				name: 'Contents',
				value: shapeContents
			}
		)
	}

	var methods = {
	}

	_buildPropertyMap();

	return Object.assign(state, LayerBase(state), methods);
}

module.exports = Shape;
},{"../LayerBase":13,"./ShapeContents":23}],23:[function(require,module,exports){
var KeyPathNode = require('../../key_path/KeyPathNode');
var Property = require('../../property/Property');
var ShapeRectangle = require('./ShapeRectangle');
var ShapeFill = require('./ShapeFill');
var ShapeStroke = require('./ShapeStroke');
var ShapeEllipse = require('./ShapeEllipse');
var ShapeGradientFill = require('./ShapeGradientFill');
var ShapeGradientStroke = require('./ShapeGradientStroke');
var ShapeTrimPaths = require('./ShapeTrimPaths');
var ShapeRepeater = require('./ShapeRepeater');
var ShapePolystar = require('./ShapePolystar');
var ShapeRoundCorners = require('./ShapeRoundCorners');
var ShapePath = require('./ShapePath');
var Transform = require('../transform/Transform');
var Matrix = require('../../helpers/transformationMatrix');

function ShapeContents(shapesData, shapes, parent) {
	var state = {
		properties: _buildPropertyMap(),
		parent: parent
	}

	var cachedShapeProperties = [];

	function buildShapeObject(shape, index) {
		var ob = {
			name: shape.nm
		}
		Object.defineProperty(ob, 'value', {
		   get() {
		   	if(cachedShapeProperties[index]) {
		   		return cachedShapeProperties[index];
		   	} else {
		   		var property;
		   	}
	   		if(shape.ty === 'gr') {
	   			property = ShapeContents(shapesData[index].it, shapes[index].it, state);
	   		} else if(shape.ty === 'rc') {
	   			property = ShapeRectangle(shapes[index], state);
	   		} else if(shape.ty === 'el') {
	   			property = ShapeEllipse(shapes[index], state);
	   		} else if(shape.ty === 'fl') {
	   			property = ShapeFill(shapes[index], state);
	   		} else if(shape.ty === 'st') {
	   			property = ShapeStroke(shapes[index], state);
	   		} else if(shape.ty === 'gf') {
	   			property = ShapeGradientFill(shapes[index], state);
	   		} else if(shape.ty === 'gs') {
	   			property = ShapeGradientStroke(shapes[index], state);
	   		} else if(shape.ty === 'tm') {
	   			property = ShapeTrimPaths(shapes[index], state);
	   		} else if(shape.ty === 'rp') {
	   			property = ShapeRepeater(shapes[index], state);
	   		} else if(shape.ty === 'sr') {
	   			property = ShapePolystar(shapes[index], state);
	   		} else if(shape.ty === 'rd') {
	   			property = ShapeRoundCorners(shapes[index], state);
	   		} else if(shape.ty === 'sh') {
	   			property = ShapePath(shapes[index], state);
	   		} else if(shape.ty === 'tr') {
	   			property = Transform(shapes[index].transform.mProps, state);
	   		} else {
	   			console.log(shape.ty);
	   		}
	   		cachedShapeProperties[index] = property;
	   		return property;
		   }
		});
		return ob
	}

	function _buildPropertyMap() {
		return shapesData.map(function(shape, index) {
			return buildShapeObject(shape, index)
		});
	}

	function fromKeypathLayerPoint(point) {
		if(state.hasProperty('Transform')) {
    		var toWorldMat = Matrix();
        	var transformMat = state.getProperty('Transform').getTargetTransform();
			transformMat.applyToMatrix(toWorldMat);
        	point = toWorldMat.applyToPointArray(point[0],point[1],point[2]||0);
		}
		return state.parent.fromKeypathLayerPoint(point);
	}

	function toKeypathLayerPoint(point) {
		point = state.parent.toKeypathLayerPoint(point);
		if(state.hasProperty('Transform')) {
    		var toWorldMat = Matrix();
        	var transformMat = state.getProperty('Transform').getTargetTransform();
			transformMat.applyToMatrix(toWorldMat);
        	point = toWorldMat.inversePoint(point);
		}
		return point;
	}

	var methods = {
		fromKeypathLayerPoint: fromKeypathLayerPoint,
		toKeypathLayerPoint: toKeypathLayerPoint
	}

	//state.properties = _buildPropertyMap();

	return Object.assign(state, KeyPathNode(state), methods)
}

module.exports = ShapeContents;
},{"../../helpers/transformationMatrix":8,"../../key_path/KeyPathNode":12,"../../property/Property":40,"../transform/Transform":39,"./ShapeEllipse":24,"./ShapeFill":25,"./ShapeGradientFill":26,"./ShapeGradientStroke":27,"./ShapePath":28,"./ShapePolystar":29,"./ShapeRectangle":30,"./ShapeRepeater":31,"./ShapeRoundCorners":32,"./ShapeStroke":33,"./ShapeTrimPaths":34}],24:[function(require,module,exports){
var KeyPathNode = require('../../key_path/KeyPathNode');
var Property = require('../../property/Property');

function ShapeEllipse(element, parent) {

	var state = {
		parent: parent,
		properties: _buildPropertyMap()
	}

	function _buildPropertyMap() {
		return [
			{
				name: 'Size',
				value: Property(element.sh.s, parent)
			},
			{
				name: 'Position',
				value: Property(element.sh.p, parent)
			}
		]
	}

	var methods = {
	}

	return Object.assign(methods, KeyPathNode(state));
}

module.exports = ShapeEllipse;
},{"../../key_path/KeyPathNode":12,"../../property/Property":40}],25:[function(require,module,exports){
var KeyPathNode = require('../../key_path/KeyPathNode');
var Property = require('../../property/Property');

function ShapeFill(element, parent) {

	var state = {
		parent: parent,
		properties: _buildPropertyMap()
	}

	function _buildPropertyMap() {
		return [
			{
				name: 'Color',
				value: Property(element.c, parent)
			},
			{
				name: 'Opacity',
				value: {
					setValue: Property(element.o, parent)
				}
			}
		]
	}

	var methods = {
	}

	return Object.assign(methods, KeyPathNode(state));
}

module.exports = ShapeFill;
},{"../../key_path/KeyPathNode":12,"../../property/Property":40}],26:[function(require,module,exports){
var KeyPathNode = require('../../key_path/KeyPathNode');
var Property = require('../../property/Property');

function ShapeGradientFill(element, parent) {

	var state = {
		parent: parent,
		properties: _buildPropertyMap()
	}

	function _buildPropertyMap() {
		return [
			{
				name: 'Start Point',
				value: Property(element.s, parent)
			},
			{
				name: 'End Point',
				value: Property(element.s, parent)
			},
			{
				name: 'Opacity',
				value: Property(element.o, parent)
			},
			{
				name: 'Highlight Length',
				value: Property(element.h, parent)
			},
			{
				name: 'Highlight Angle',
				value: Property(element.a, parent)
			},
			{
				name: 'Colors',
				value: Property(element.g.prop, parent)
			}
		]
	}

	var methods = {
	}

	return Object.assign(methods, KeyPathNode(state));
}

module.exports = ShapeGradientFill;
},{"../../key_path/KeyPathNode":12,"../../property/Property":40}],27:[function(require,module,exports){
var KeyPathNode = require('../../key_path/KeyPathNode');
var Property = require('../../property/Property');

function ShapeGradientStroke(element, parent) {

	var state = {
		parent: parent,
		properties: _buildPropertyMap()
	}

	function _buildPropertyMap() {
		return [
			{
				name: 'Start Point',
				value: Property(element.s, parent)
			},
			{
				name: 'End Point',
				value: Property(element.e, parent)
			},
			{
				name: 'Opacity',
				value: Property(element.o, parent)
			},
			{
				name: 'Highlight Length',
				value: Property(element.h, parent)
			},
			{
				name: 'Highlight Angle',
				value: Property(element.a, parent)
			},
			{
				name: 'Colors',
				value: Property(element.g.prop, parent)
			},
			{
				name: 'Stroke Width',
				value: Property(element.w, parent)
			}
		]
	}

	var methods = {
	}

	return Object.assign(methods, KeyPathNode(state));
}

module.exports = ShapeGradientStroke;
},{"../../key_path/KeyPathNode":12,"../../property/Property":40}],28:[function(require,module,exports){
var KeyPathNode = require('../../key_path/KeyPathNode');
var Property = require('../../property/Property');

function ShapePath(element, parent) {

	var state = {
		parent: parent,
		properties: _buildPropertyMap()
	}

	function setPath(value) {
		Property(element.sh).setValue(value);
	}

	function _buildPropertyMap() {
		return [
			{
				name: 'path',
				value:Property(element.sh, parent)
			}
		]
	}

	var methods = {
	}

	return Object.assign(methods, KeyPathNode(state));
}

module.exports = ShapePath;
},{"../../key_path/KeyPathNode":12,"../../property/Property":40}],29:[function(require,module,exports){
var KeyPathNode = require('../../key_path/KeyPathNode');
var Property = require('../../property/Property');

function ShapePolystar(element, parent) {

	var state = {
		parent: parent,
		properties: _buildPropertyMap()
	}

	function _buildPropertyMap() {
		return [
			{
				name: 'Points',
				value: Property(element.sh.pt, parent)
			},
			{
				name: 'Position',
				value: Property(element.sh.p, parent)
			},
			{
				name: 'Rotation',
				value: Property(element.sh.r, parent)
			},
			{
				name: 'Inner Radius',
				value: Property(element.sh.ir, parent)
			},
			{
				name: 'Outer Radius',
				value: Property(element.sh.or, parent)
			},
			{
				name: 'Inner Roundness',
				value: Property(element.sh.is, parent)
			},
			{
				name: 'Outer Roundness',
				value: Property(element.sh.os, parent)
			}
		]
	}

	var methods = {
	}

	return Object.assign(methods, KeyPathNode(state));
}

module.exports = ShapePolystar;
},{"../../key_path/KeyPathNode":12,"../../property/Property":40}],30:[function(require,module,exports){
var KeyPathNode = require('../../key_path/KeyPathNode');
var Property = require('../../property/Property');

function ShapeRectangle(element, parent) {

	var state = {
		parent: parent,
		properties: _buildPropertyMap()
	}

	function _buildPropertyMap() {
		return [
			{
				name: 'Size',
				value: Property(element.sh.s, parent)
			},
			{
				name: 'Position',
				value: Property(element.sh.p, parent)
			},
			{
				name: 'Roundness',
				value: Property(element.sh.r, parent)
			}
		]
	}

	var methods = {
	}

	return Object.assign(methods, KeyPathNode(state));
}

module.exports = ShapeRectangle;
},{"../../key_path/KeyPathNode":12,"../../property/Property":40}],31:[function(require,module,exports){
var KeyPathNode = require('../../key_path/KeyPathNode');
var Property = require('../../property/Property');
var Transform = require('../transform/Transform');

function ShapeRepeater(element, parent) {

	var state = {
		parent: parent,
		properties: _buildPropertyMap()
	}

	function _buildPropertyMap() {
		return [
			{
				name: 'Copies',
				value: Property(element.c, parent)
			},
			{
				name: 'Offset',
				value: Property(element.o, parent)
			},
			{
				name: 'Transform',
				value: Transform(element.tr, parent)
			}
		]
	}

	var methods = {
	}

	return Object.assign(methods, KeyPathNode(state));
}

module.exports = ShapeRepeater;
},{"../../key_path/KeyPathNode":12,"../../property/Property":40,"../transform/Transform":39}],32:[function(require,module,exports){
var KeyPathNode = require('../../key_path/KeyPathNode');
var Property = require('../../property/Property');

function ShapeRoundCorners(element, parent) {

	var state = {
		parent: parent,
		properties: _buildPropertyMap()
	}

	function _buildPropertyMap() {
		return [
			{
				name: 'Radius',
				value: Property(element.rd, parent)
			}
		]
	}

	var methods = {
	}

	return Object.assign(methods, KeyPathNode(state));
}

module.exports = ShapeRoundCorners;
},{"../../key_path/KeyPathNode":12,"../../property/Property":40}],33:[function(require,module,exports){
var KeyPathNode = require('../../key_path/KeyPathNode');
var Property = require('../../property/Property');

function ShapeStroke(element, parent) {
	var state = {
		parent: parent,
		properties: _buildPropertyMap()
	}

	function _buildPropertyMap() {
		return [
			{
				name: 'color',
				value: Property(element.c, parent)
			},
			{
				name: 'stroke width',
				value: Property(element.w, parent)
			},
			{
				name: 'opacity',
				value: Property(element.o, parent)
			}
		]
	}

	var methods = {
	}

	return Object.assign(methods, KeyPathNode(state));
}

module.exports = ShapeStroke
},{"../../key_path/KeyPathNode":12,"../../property/Property":40}],34:[function(require,module,exports){
var KeyPathNode = require('../../key_path/KeyPathNode');
var Property = require('../../property/Property');

function ShapeTrimPaths(element, parent) {

	var state = {
		parent: parent,
		properties: _buildPropertyMap()
	}

	function _buildPropertyMap() {
		return [
			{
				name: 'Start',
				value: Property(element.s, parent)
			},
			{
				name: 'End',
				value: Property(element.e, parent)
			},
			{
				name: 'Offset',
				value: Property(element.o, parent)
			}
		]
	}

	var methods = {
	}

	return Object.assign(methods, KeyPathNode(state));
}

module.exports = ShapeTrimPaths;
},{"../../key_path/KeyPathNode":12,"../../property/Property":40}],35:[function(require,module,exports){
var LayerBase = require('../LayerBase');

function Solid(element, parent) {

	var state = {
		element: element,
		parent: parent,
		properties: _buildPropertyMap()
	}

	function _buildPropertyMap() {
		return [
		]
	}

	var methods = {
	}

	return Object.assign({}, LayerBase(state), methods);
}

module.exports = Solid;
},{"../LayerBase":13}],36:[function(require,module,exports){
var KeyPathNode = require('../../key_path/KeyPathNode');
var Property = require('../../property/Property');
var TextAnimator = require('./TextAnimator');

function Text(element, parent) {

	var instance = {}

	var state = {
		element: element,
		parent: parent,
		properties: _buildPropertyMap()
	}

	function setDocumentData(_function) {
		var previousValue;
		setInterval(function() {
			var newValue = _function(element.textProperty.currentData);
			if (previousValue !== newValue) {
				element.updateDocumentData(newValue)
			}
		}, 500)
		console.log(element)
	}

	function addAnimators() {
		var animatorProperties = [];
		var animators = element.textAnimator._animatorsData;
		var i, len = animators.length;
		var textAnimator;
		for (i = 0; i < len; i += 1) {
			textAnimator = TextAnimator(animators[i])
			animatorProperties.push({
				name: element.textAnimator._textData.a[i].nm || 'Animator ' + (i+1), //Fallback for old animations
				value: textAnimator
			})
		}
		return animatorProperties;
	}

	function _buildPropertyMap() {
		return [
			{
				name:'Source',
				value: {
					setValue: setDocumentData
				}
			}
		].concat(addAnimators())
	}

	var methods = {
	}

	return Object.assign(instance, methods, KeyPathNode(state));

}

module.exports = Text;
},{"../../key_path/KeyPathNode":12,"../../property/Property":40,"./TextAnimator":37}],37:[function(require,module,exports){
var KeyPathNode = require('../../key_path/KeyPathNode');
var Property = require('../../property/Property');

function TextAnimator(animator) {

	var instance = {}

	var state = {
		properties: _buildPropertyMap()
	}

	function setAnchorPoint(value) {
		Property(animator.a.a).setValue(value);
	}

	function setFillBrightness(value) {
		Property(animator.a.fb).setValue(value);
	}

	function setFillColor(value) {
		Property(animator.a.fc).setValue(value);
	}

	function setFillHue(value) {
		Property(animator.a.fh).setValue(value);
	}

	function setFillSaturation(value) {
		Property(animator.a.fs).setValue(value);
	}

	function setFillOpacity(value) {
		Property(animator.a.fo).setValue(value);
	}

	function setOpacity(value) {
		Property(animator.a.o).setValue(value);
	}

	function setPosition(value) {
		Property(animator.a.p).setValue(value);
	}

	function setRotation(value) {
		Property(animator.a.r).setValue(value);
	}

	function setRotationX(value) {
		Property(animator.a.rx).setValue(value);
	}

	function setRotationY(value) {
		Property(animator.a.ry).setValue(value);
	}

	function setScale(value) {
		Property(animator.a.s).setValue(value);
	}

	function setSkewAxis(value) {
		Property(animator.a.sa).setValue(value);
	}

	function setStrokeColor(value) {
		Property(animator.a.sc).setValue(value);
	}

	function setSkew(value) {
		Property(animator.a.sk).setValue(value);
	}

	function setStrokeOpacity(value) {
		Property(animator.a.so).setValue(value);
	}

	function setStrokeWidth(value) {
		Property(animator.a.sw).setValue(value);
	}

	function setStrokeBrightness(value) {
		Property(animator.a.sb).setValue(value);
	}

	function setStrokeHue(value) {
		Property(animator.a.sh).setValue(value);
	}

	function setStrokeSaturation(value) {
		Property(animator.a.ss).setValue(value);
	}

	function setTrackingAmount(value) {
		Property(animator.a.t).setValue(value);
	}

	function _buildPropertyMap() {
		return [
			{
				name:'Anchor Point',
				value: {
					setValue: setAnchorPoint
				}
			},
			{
				name:'Fill Brightness',
				value: {
					setValue: setFillBrightness
				}
			},
			{
				name:'Fill Color',
				value: {
					setValue: setFillColor
				}
			},
			{
				name:'Fill Hue',
				value: {
					setValue: setFillHue
				}
			},
			{
				name:'Fill Saturation',
				value: {
					setValue: setFillSaturation
				}
			},
			{
				name:'Fill Opacity',
				value: {
					setValue: setFillOpacity
				}
			},
			{
				name:'Opacity',
				value: {
					setValue: setOpacity
				}
			},
			{
				name:'Position',
				value: {
					setValue: setPosition
				}
			},
			{
				name:'Rotation X',
				value: {
					setValue: setRotationX
				}
			},
			{
				name:'Rotation Y',
				value: {
					setValue: setRotationY
				}
			},
			{
				name:'Scale',
				value: {
					setValue: setScale
				}
			},
			{
				name:'Skew Axis',
				value: {
					setValue: setSkewAxis
				}
			},
			{
				name:'Stroke Color',
				value: {
					setValue: setStrokeColor
				}
			},
			{
				name:'Skew',
				value: {
					setValue: setSkew
				}
			},
			{
				name:'Stroke Width',
				value: {
					setValue: setStrokeWidth
				}
			},
			{
				name:'Tracking Amount',
				value: {
					setValue: setTrackingAmount
				}
			},
			{
				name:'Stroke Opacity',
				value: {
					setValue: setStrokeOpacity
				}
			},
			{
				name:'Stroke Brightness',
				value: {
					setValue: setStrokeBrightness
				}
			},
			{
				name:'Stroke Saturation',
				value: {
					setValue: setStrokeSaturation
				}
			},
			{
				name:'Stroke Hue',
				value: {
					setValue: setStrokeHue
				}
			},
			
		]
	}

	var methods = {
	}

	return Object.assign(instance, methods, KeyPathNode(state));

}

module.exports = TextAnimator;
},{"../../key_path/KeyPathNode":12,"../../property/Property":40}],38:[function(require,module,exports){
var LayerBase = require('../LayerBase');
var Text = require('./Text');

function TextElement(element) {

	var instance = {};

	var TextProperty = Text(element);
	var state = {
		element: element,
		properties: _buildPropertyMap()
	}

	function _buildPropertyMap() {
		return [
			{
				name: 'text',
				value: TextProperty
			},
			{
				name: 'Text',
				value: TextProperty
			}
		]
	}

	function getText() {
		return element.textProperty.currentData.t;
	}

	function setText(value, index) {
		setDocumentData({t: value}, index);
	}

	function setDocumentData(data, index) {
		return element.updateDocumentData(data, index);
	}
	
	function canResizeFont(_canResize) {
		return element.canResizeFont(_canResize);
	}

	function setMinimumFontSize(_fontSize) {
		return element.setMinimumFontSize(_fontSize);
	}

	var methods = {
		getText: getText,
		setText: setText,
		canResizeFont: canResizeFont,
		setDocumentData: setDocumentData,
		setMinimumFontSize: setMinimumFontSize
	}

	return Object.assign(instance, LayerBase(state), methods);

}

module.exports = TextElement;
},{"../LayerBase":13,"./Text":36}],39:[function(require,module,exports){
var KeyPathNode = require('../../key_path/KeyPathNode');
var Property = require('../../property/Property');

function Transform(props, parent) {
	var state = {
		properties: _buildPropertyMap()
	}

	function _buildPropertyMap() {
		return [
			{
				name: 'Anchor Point',
				value: Property(props.a, parent)
			},
			{
				name: 'Point of Interest',
				value: Property(props.a, parent)
			},
			{
				name: 'Position',
				value: Property(props.p, parent)
			},
			{
				name: 'Scale',
				value: Property(props.s, parent)
			},
			{
				name: 'Rotation',
				value: Property(props.r, parent)
			},
			{
				name: 'X Position',
				value: Property(props.px, parent)
			},
			{
				name: 'Y Position',
				value: Property(props.py, parent)
			},
			{
				name: 'Z Position',
				value: Property(props.pz, parent)
			},
			{
				name: 'X Rotation',
				value: Property(props.rx, parent)
			},
			{
				name: 'Y Rotation',
				value: Property(props.ry, parent)
			},
			{
				name: 'Z Rotation',
				value: Property(props.rz, parent)
			},
			{
				name: 'Opacity',
				value: Property(props.po, parent)
			}
		]
	}

	function getTargetTransform() {
		return props;
	}

	var methods = {
		getTargetTransform: getTargetTransform
	}

	return Object.assign(methods, KeyPathNode(state));
}

module.exports = Transform;
},{"../../key_path/KeyPathNode":12,"../../property/Property":40}],40:[function(require,module,exports){
var KeyPathNode = require('../key_path/KeyPathNode');
var ValueProperty = require('./ValueProperty');

function Property(property, parent) {
	var state = {
		property: property,
		parent: parent
	}

	var methods = {}

	return Object.assign({}, methods, ValueProperty(state), KeyPathNode(state));
}

module.exports = Property;
},{"../key_path/KeyPathNode":12,"./ValueProperty":41}],41:[function(require,module,exports){
function ValueProperty(state) {
	
	function setValue(value) {
		var property = state.property;
		if(!property || !property.addEffect) {
			return;
		}
		if (typeof value === 'function') {
			property.addEffect(value);
		} else if (property.propType === 'multidimensional' && typeof value === 'object' && value.length === 2) {
			property.addEffect(function(){return value});
		} else if (property.propType === 'unidimensional' && typeof value === 'number') {
			property.addEffect(function(){return value});
		}
	}

	function getValue() {
		return state.property.v;
	}

	var methods = {
		setValue: setValue,
		getValue: getValue
	}

	return methods;
}

module.exports = ValueProperty;
},{}],42:[function(require,module,exports){
var LayerList = require('../layer/LayerList');
var KeyPathList = require('../key_path/KeyPathList');

function Renderer(state) {

	state._type = 'renderer';

	function getRendererType() {
		return state.animation.animType;
	}

	return Object.assign({
		getRendererType: getRendererType
	}, LayerList(state.elements), KeyPathList(state.elements, 'renderer'));
}

module.exports = Renderer;
},{"../key_path/KeyPathList":11,"../layer/LayerList":14}]},{},[10])(10)
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvYW5pbWF0aW9uL0FuaW1hdGlvbkl0ZW0uanMiLCJzcmMvZW51bXMva2V5X3BhdGhfc2VwYXJhdG9yLmpzIiwic3JjL2VudW1zL2xheWVyX3R5cGVzLmpzIiwic3JjL2VudW1zL3Byb3BlcnR5X25hbWVzLmpzIiwic3JjL2hlbHBlcnMva2V5UGF0aEJ1aWxkZXIuanMiLCJzcmMvaGVscGVycy9sYXllckFQSUJ1aWxkZXIuanMiLCJzcmMvaGVscGVycy9zdHJpbmdTYW5pdGl6ZXIuanMiLCJzcmMvaGVscGVycy90cmFuc2Zvcm1hdGlvbk1hdHJpeC5qcyIsInNyYy9oZWxwZXJzL3R5cGVkQXJyYXlzLmpzIiwic3JjL2luZGV4LmpzIiwic3JjL2tleV9wYXRoL0tleVBhdGhMaXN0LmpzIiwic3JjL2tleV9wYXRoL0tleVBhdGhOb2RlLmpzIiwic3JjL2xheWVyL0xheWVyQmFzZS5qcyIsInNyYy9sYXllci9MYXllckxpc3QuanMiLCJzcmMvbGF5ZXIvY2FtZXJhL0NhbWVyYS5qcyIsInNyYy9sYXllci9jb21wb3NpdGlvbi9Db21wb3NpdGlvbi5qcyIsInNyYy9sYXllci9jb21wb3NpdGlvbi9UaW1lUmVtYXAuanMiLCJzcmMvbGF5ZXIvZWZmZWN0cy9FZmZlY3RFbGVtZW50LmpzIiwic3JjL2xheWVyL2VmZmVjdHMvRWZmZWN0cy5qcyIsInNyYy9sYXllci9pbWFnZS9JbWFnZUVsZW1lbnQuanMiLCJzcmMvbGF5ZXIvbnVsbF9lbGVtZW50L051bGxFbGVtZW50LmpzIiwic3JjL2xheWVyL3NoYXBlL1NoYXBlLmpzIiwic3JjL2xheWVyL3NoYXBlL1NoYXBlQ29udGVudHMuanMiLCJzcmMvbGF5ZXIvc2hhcGUvU2hhcGVFbGxpcHNlLmpzIiwic3JjL2xheWVyL3NoYXBlL1NoYXBlRmlsbC5qcyIsInNyYy9sYXllci9zaGFwZS9TaGFwZUdyYWRpZW50RmlsbC5qcyIsInNyYy9sYXllci9zaGFwZS9TaGFwZUdyYWRpZW50U3Ryb2tlLmpzIiwic3JjL2xheWVyL3NoYXBlL1NoYXBlUGF0aC5qcyIsInNyYy9sYXllci9zaGFwZS9TaGFwZVBvbHlzdGFyLmpzIiwic3JjL2xheWVyL3NoYXBlL1NoYXBlUmVjdGFuZ2xlLmpzIiwic3JjL2xheWVyL3NoYXBlL1NoYXBlUmVwZWF0ZXIuanMiLCJzcmMvbGF5ZXIvc2hhcGUvU2hhcGVSb3VuZENvcm5lcnMuanMiLCJzcmMvbGF5ZXIvc2hhcGUvU2hhcGVTdHJva2UuanMiLCJzcmMvbGF5ZXIvc2hhcGUvU2hhcGVUcmltUGF0aHMuanMiLCJzcmMvbGF5ZXIvc29saWQvU29saWRFbGVtZW50LmpzIiwic3JjL2xheWVyL3RleHQvVGV4dC5qcyIsInNyYy9sYXllci90ZXh0L1RleHRBbmltYXRvci5qcyIsInNyYy9sYXllci90ZXh0L1RleHRFbGVtZW50LmpzIiwic3JjL2xheWVyL3RyYW5zZm9ybS9UcmFuc2Zvcm0uanMiLCJzcmMvcHJvcGVydHkvUHJvcGVydHkuanMiLCJzcmMvcHJvcGVydHkvVmFsdWVQcm9wZXJ0eS5qcyIsInNyYy9yZW5kZXJlci9SZW5kZXJlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNySkE7O0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQkE7QUFDQTtBQUNBOztBQ0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JZQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwT0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciBSZW5kZXJlciA9IHJlcXVpcmUoJy4uL3JlbmRlcmVyL1JlbmRlcmVyJyk7XHJcbnZhciBsYXllcl9hcGkgPSByZXF1aXJlKCcuLi9oZWxwZXJzL2xheWVyQVBJQnVpbGRlcicpO1xyXG5cclxuZnVuY3Rpb24gQW5pbWF0aW9uSXRlbUZhY3RvcnkoYW5pbWF0aW9uKSB7XHJcblxyXG5cdHZhciBzdGF0ZSA9IHtcclxuXHRcdGFuaW1hdGlvbjogYW5pbWF0aW9uLFxyXG5cdFx0ZWxlbWVudHM6IGFuaW1hdGlvbi5yZW5kZXJlci5lbGVtZW50cy5tYXAoKGl0ZW0pID0+IGxheWVyX2FwaShpdGVtLCBhbmltYXRpb24pKSxcclxuXHRcdGJvdW5kaW5nUmVjdDogbnVsbCxcclxuXHRcdHNjYWxlRGF0YTogbnVsbFxyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gZ2V0Q3VycmVudEZyYW1lKCkge1xyXG5cdFx0cmV0dXJuIGFuaW1hdGlvbi5jdXJyZW50RnJhbWU7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBnZXRDdXJyZW50VGltZSgpIHtcclxuXHRcdHJldHVybiBhbmltYXRpb24uY3VycmVudEZyYW1lIC8gYW5pbWF0aW9uLmZyYW1lUmF0ZTtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIGFkZFZhbHVlQ2FsbGJhY2socHJvcGVydGllcywgdmFsdWUpIHtcclxuXHRcdHZhciBpLCBsZW4gPSBwcm9wZXJ0aWVzLmxlbmd0aDtcclxuXHRcdGZvciAoaSA9IDA7IGkgPCBsZW47IGkgKz0gMSkge1xyXG5cdFx0XHRwcm9wZXJ0aWVzLmdldFByb3BlcnR5QXRJbmRleChpKS5zZXRWYWx1ZSh2YWx1ZSk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiB0b0tleXBhdGhMYXllclBvaW50KHByb3BlcnRpZXMsIHBvaW50KSB7XHJcblx0XHR2YXIgaSwgbGVuID0gcHJvcGVydGllcy5sZW5ndGg7XHJcblx0XHR2YXIgcG9pbnRzID0gW107XHJcblx0XHRmb3IgKGkgPSAwOyBpIDwgbGVuOyBpICs9IDEpIHtcclxuXHRcdFx0cG9pbnRzLnB1c2gocHJvcGVydGllcy5nZXRQcm9wZXJ0eUF0SW5kZXgoaSkudG9LZXlwYXRoTGF5ZXJQb2ludChwb2ludCkpO1xyXG5cdFx0fVxyXG5cdFx0aWYocG9pbnRzLmxlbmd0aCA9PT0gMSkge1xyXG5cdFx0XHRyZXR1cm4gcG9pbnRzWzBdO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIHBvaW50cztcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIGZyb21LZXlwYXRoTGF5ZXJQb2ludChwcm9wZXJ0aWVzLCBwb2ludCkge1xyXG5cdFx0dmFyIGksIGxlbiA9IHByb3BlcnRpZXMubGVuZ3RoO1xyXG5cdFx0dmFyIHBvaW50cyA9IFtdO1xyXG5cdFx0Zm9yIChpID0gMDsgaSA8IGxlbjsgaSArPSAxKSB7XHJcblx0XHRcdHBvaW50cy5wdXNoKHByb3BlcnRpZXMuZ2V0UHJvcGVydHlBdEluZGV4KGkpLmZyb21LZXlwYXRoTGF5ZXJQb2ludChwb2ludCkpO1xyXG5cdFx0fVxyXG5cdFx0aWYocG9pbnRzLmxlbmd0aCA9PT0gMSkge1xyXG5cdFx0XHRyZXR1cm4gcG9pbnRzWzBdO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIHBvaW50cztcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIGNhbGN1bGF0ZVNjYWxlRGF0YShib3VuZGluZ1JlY3QpIHtcclxuXHRcdHZhciBjb21wV2lkdGggPSBhbmltYXRpb24uYW5pbWF0aW9uRGF0YS53O1xyXG4gICAgICAgIHZhciBjb21wSGVpZ2h0ID0gYW5pbWF0aW9uLmFuaW1hdGlvbkRhdGEuaDtcclxuXHRcdHZhciBjb21wUmVsID0gY29tcFdpZHRoIC8gY29tcEhlaWdodDtcclxuICAgICAgICB2YXIgZWxlbWVudFdpZHRoID0gYm91bmRpbmdSZWN0LndpZHRoO1xyXG4gICAgICAgIHZhciBlbGVtZW50SGVpZ2h0ID0gYm91bmRpbmdSZWN0LmhlaWdodDtcclxuICAgICAgICB2YXIgZWxlbWVudFJlbCA9IGVsZW1lbnRXaWR0aCAvIGVsZW1lbnRIZWlnaHQ7XHJcbiAgICAgICAgdmFyIHNjYWxlLHNjYWxlWE9mZnNldCxzY2FsZVlPZmZzZXQ7XHJcbiAgICAgICAgdmFyIHhBbGlnbm1lbnQsIHlBbGlnbm1lbnQsIHNjYWxlTW9kZTtcclxuICAgICAgICB2YXIgYXNwZWN0UmF0aW8gPSBhbmltYXRpb24ucmVuZGVyZXIucmVuZGVyQ29uZmlnLnByZXNlcnZlQXNwZWN0UmF0aW8uc3BsaXQoJyAnKTtcclxuICAgICAgICBpZihhc3BlY3RSYXRpb1sxXSA9PT0gJ21lZXQnKSB7XHJcbiAgICAgICAgXHRzY2FsZSA9IGVsZW1lbnRSZWwgPiBjb21wUmVsID8gZWxlbWVudEhlaWdodCAvIGNvbXBIZWlnaHQgOiBlbGVtZW50V2lkdGggLyBjb21wV2lkdGg7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICBcdHNjYWxlID0gZWxlbWVudFJlbCA+IGNvbXBSZWwgPyBlbGVtZW50V2lkdGggLyBjb21wV2lkdGggOiBlbGVtZW50SGVpZ2h0IC8gY29tcEhlaWdodDtcclxuICAgICAgICB9XHJcbiAgICAgICAgeEFsaWdubWVudCA9IGFzcGVjdFJhdGlvWzBdLnN1YnN0cigwLDQpO1xyXG4gICAgICAgIHlBbGlnbm1lbnQgPSBhc3BlY3RSYXRpb1swXS5zdWJzdHIoNCk7XHJcbiAgICAgICAgaWYoeEFsaWdubWVudCA9PT0gJ3hNaW4nKSB7XHJcbiAgICAgICAgXHRzY2FsZVhPZmZzZXQgPSAwO1xyXG4gICAgICAgIH0gZWxzZSBpZih4QWxpZ25tZW50ID09PSAneE1pZCcpIHtcclxuICAgICAgICBcdHNjYWxlWE9mZnNldCA9IChlbGVtZW50V2lkdGggLSBjb21wV2lkdGggKiBzY2FsZSkgLyAyO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgXHRzY2FsZVhPZmZzZXQgPSAoZWxlbWVudFdpZHRoIC0gY29tcFdpZHRoICogc2NhbGUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYoeUFsaWdubWVudCA9PT0gJ1lNaW4nKSB7XHJcblx0ICAgICAgICBzY2FsZVlPZmZzZXQgPSAwO1xyXG4gICAgICAgIH0gZWxzZSBpZih5QWxpZ25tZW50ID09PSAnWU1pZCcpIHtcclxuXHQgICAgICAgIHNjYWxlWU9mZnNldCA9IChlbGVtZW50SGVpZ2h0IC0gY29tcEhlaWdodCAqIHNjYWxlKSAvIDI7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuXHQgICAgICAgIHNjYWxlWU9mZnNldCA9IChlbGVtZW50SGVpZ2h0IC0gY29tcEhlaWdodCAqIHNjYWxlKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICBcdHNjYWxlWU9mZnNldDogc2NhbGVZT2Zmc2V0LFxyXG4gICAgICAgIFx0c2NhbGVYT2Zmc2V0OiBzY2FsZVhPZmZzZXQsXHJcbiAgICAgICAgXHRzY2FsZTogc2NhbGVcclxuICAgICAgICB9XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiByZWNhbGN1bGF0ZVNpemUoY29udGFpbmVyKSB7XHJcblx0XHR2YXIgY29udGFpbmVyID0gYW5pbWF0aW9uLndyYXBwZXI7XHJcblx0XHRzdGF0ZS5ib3VuZGluZ1JlY3QgPSBjb250YWluZXIuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XHJcblx0XHRzdGF0ZS5zY2FsZURhdGEgPSBjYWxjdWxhdGVTY2FsZURhdGEoc3RhdGUuYm91bmRpbmdSZWN0KTtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIHRvQ29udGFpbmVyUG9pbnQocG9pbnQpIHtcclxuXHRcdGlmKCFhbmltYXRpb24ud3JhcHBlciB8fCAhYW5pbWF0aW9uLndyYXBwZXIuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KSB7XHJcblx0XHRcdHJldHVybiBwb2ludDtcclxuXHRcdH1cclxuXHRcdGlmKCFzdGF0ZS5ib3VuZGluZ1JlY3QpIHtcclxuXHRcdFx0cmVjYWxjdWxhdGVTaXplKCk7XHJcblx0XHR9XHJcblxyXG5cdFx0dmFyIGJvdW5kaW5nUmVjdCA9IHN0YXRlLmJvdW5kaW5nUmVjdDtcclxuXHRcdHZhciBuZXdQb2ludCA9IFtwb2ludFswXSAtIGJvdW5kaW5nUmVjdC5sZWZ0LCBwb2ludFsxXSAtIGJvdW5kaW5nUmVjdC50b3BdO1xyXG5cdFx0dmFyIHNjYWxlRGF0YSA9IHN0YXRlLnNjYWxlRGF0YTtcclxuXHJcbiAgICAgICAgbmV3UG9pbnRbMF0gPSAobmV3UG9pbnRbMF0gLSBzY2FsZURhdGEuc2NhbGVYT2Zmc2V0KSAvIHNjYWxlRGF0YS5zY2FsZTtcclxuICAgICAgICBuZXdQb2ludFsxXSA9IChuZXdQb2ludFsxXSAtIHNjYWxlRGF0YS5zY2FsZVlPZmZzZXQpIC8gc2NhbGVEYXRhLnNjYWxlO1xyXG5cclxuXHRcdHJldHVybiBuZXdQb2ludDtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIGZyb21Db250YWluZXJQb2ludChwb2ludCkge1xyXG5cdFx0aWYoIWFuaW1hdGlvbi53cmFwcGVyIHx8ICFhbmltYXRpb24ud3JhcHBlci5nZXRCb3VuZGluZ0NsaWVudFJlY3QpIHtcclxuXHRcdFx0cmV0dXJuIHBvaW50O1xyXG5cdFx0fVxyXG5cdFx0aWYoIXN0YXRlLmJvdW5kaW5nUmVjdCkge1xyXG5cdFx0XHRyZWNhbGN1bGF0ZVNpemUoKTtcclxuXHRcdH1cclxuXHRcdHZhciBib3VuZGluZ1JlY3QgPSBzdGF0ZS5ib3VuZGluZ1JlY3Q7XHJcblx0XHR2YXIgc2NhbGVEYXRhID0gc3RhdGUuc2NhbGVEYXRhO1xyXG5cclxuXHRcdHZhciBuZXdQb2ludCA9IFtwb2ludFswXSAqIHNjYWxlRGF0YS5zY2FsZSArIHNjYWxlRGF0YS5zY2FsZVhPZmZzZXQsIHBvaW50WzFdICogc2NhbGVEYXRhLnNjYWxlICsgc2NhbGVEYXRhLnNjYWxlWU9mZnNldF07XHJcblxyXG5cdFx0dmFyIG5ld1BvaW50ID0gW25ld1BvaW50WzBdICsgYm91bmRpbmdSZWN0LmxlZnQsIG5ld1BvaW50WzFdICsgYm91bmRpbmdSZWN0LnRvcF07XHJcblx0XHRyZXR1cm4gbmV3UG9pbnQ7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBnZXRTY2FsZURhdGEoKSB7XHJcblx0XHRyZXR1cm4gc3RhdGUuc2NhbGVEYXRhO1xyXG5cdH1cclxuXHJcblx0dmFyIG1ldGhvZHMgPSB7XHJcblx0XHRyZWNhbGN1bGF0ZVNpemU6IHJlY2FsY3VsYXRlU2l6ZSxcclxuXHRcdGdldFNjYWxlRGF0YTogZ2V0U2NhbGVEYXRhLFxyXG5cdFx0dG9Db250YWluZXJQb2ludDogdG9Db250YWluZXJQb2ludCxcclxuXHRcdGZyb21Db250YWluZXJQb2ludDogZnJvbUNvbnRhaW5lclBvaW50LFxyXG5cdFx0Z2V0Q3VycmVudEZyYW1lOiBnZXRDdXJyZW50RnJhbWUsXHJcblx0XHRnZXRDdXJyZW50VGltZTogZ2V0Q3VycmVudFRpbWUsXHJcblx0XHRhZGRWYWx1ZUNhbGxiYWNrOiBhZGRWYWx1ZUNhbGxiYWNrLFxyXG5cdFx0dG9LZXlwYXRoTGF5ZXJQb2ludDogdG9LZXlwYXRoTGF5ZXJQb2ludCxcclxuXHRcdGZyb21LZXlwYXRoTGF5ZXJQb2ludDogZnJvbUtleXBhdGhMYXllclBvaW50XHJcblx0fVxyXG5cclxuXHRyZXR1cm4gT2JqZWN0LmFzc2lnbih7fSwgUmVuZGVyZXIoc3RhdGUpLCBtZXRob2RzKTtcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBBbmltYXRpb25JdGVtRmFjdG9yeTsiLCJtb2R1bGUuZXhwb3J0cyA9ICcsJzsiLCJtb2R1bGUuZXhwb3J0cyA9IHtcclxuXHQgMDogMCxcclxuXHQgMTogMSxcclxuXHQgMjogMixcclxuXHQgMzogMyxcclxuXHQgNDogNCxcclxuXHQgNTogNSxcclxuXHQgMTM6IDEzLFxyXG5cdCdjb21wJzogMCxcclxuXHQnY29tcG9zaXRpb24nOiAwLFxyXG5cdCdzb2xpZCc6IDEsXHJcblx0J2ltYWdlJzogMixcclxuXHQnbnVsbCc6IDMsXHJcblx0J3NoYXBlJzogNCxcclxuXHQndGV4dCc6IDUsXHJcblx0J2NhbWVyYSc6IDEzXHJcbn0iLCJtb2R1bGUuZXhwb3J0cyA9IHtcclxuXHRMQVlFUl9UUkFOU0ZPUk06ICd0cmFuc2Zvcm0nXHJcbn0iLCJ2YXIga2V5X3BhdGhfc2VwYXJhdG9yID0gcmVxdWlyZSgnLi4vZW51bXMva2V5X3BhdGhfc2VwYXJhdG9yJyk7XHJcbnZhciBzYW5pdGl6ZVN0cmluZyA9IHJlcXVpcmUoJy4vc3RyaW5nU2FuaXRpemVyJyk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHByb3BlcnR5UGF0aCkge1xyXG5cdHZhciBrZXlQYXRoU3BsaXQgPSBwcm9wZXJ0eVBhdGguc3BsaXQoa2V5X3BhdGhfc2VwYXJhdG9yKTtcclxuXHR2YXIgc2VsZWN0b3IgPSBrZXlQYXRoU3BsaXQuc2hpZnQoKTtcclxuXHRyZXR1cm4ge1xyXG5cdFx0c2VsZWN0b3I6IHNhbml0aXplU3RyaW5nKHNlbGVjdG9yKSxcclxuXHRcdHByb3BlcnR5UGF0aDoga2V5UGF0aFNwbGl0LmpvaW4oa2V5X3BhdGhfc2VwYXJhdG9yKVxyXG5cdH1cclxufSIsInZhciBUZXh0RWxlbWVudCA9IHJlcXVpcmUoJy4uL2xheWVyL3RleHQvVGV4dEVsZW1lbnQnKTtcclxudmFyIFNoYXBlRWxlbWVudCA9IHJlcXVpcmUoJy4uL2xheWVyL3NoYXBlL1NoYXBlJyk7XHJcbnZhciBOdWxsRWxlbWVudCA9IHJlcXVpcmUoJy4uL2xheWVyL251bGxfZWxlbWVudC9OdWxsRWxlbWVudCcpO1xyXG52YXIgU29saWRFbGVtZW50ID0gcmVxdWlyZSgnLi4vbGF5ZXIvc29saWQvU29saWRFbGVtZW50Jyk7XHJcbnZhciBJbWFnZUVsZW1lbnQgPSByZXF1aXJlKCcuLi9sYXllci9pbWFnZS9JbWFnZUVsZW1lbnQnKTtcclxudmFyIENhbWVyYUVsZW1lbnQgPSByZXF1aXJlKCcuLi9sYXllci9jYW1lcmEvQ2FtZXJhJyk7XHJcbnZhciBMYXllckJhc2UgPSByZXF1aXJlKCcuLi9sYXllci9MYXllckJhc2UnKTtcclxuXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGdldExheWVyQXBpKGVsZW1lbnQsIHBhcmVudCkge1xyXG5cdHZhciBsYXllclR5cGUgPSBlbGVtZW50LmRhdGEudHk7XHJcblx0dmFyIENvbXBvc2l0aW9uID0gcmVxdWlyZSgnLi4vbGF5ZXIvY29tcG9zaXRpb24vQ29tcG9zaXRpb24nKTtcclxuXHRzd2l0Y2gobGF5ZXJUeXBlKSB7XHJcblx0XHRjYXNlIDA6XHJcblx0XHRyZXR1cm4gQ29tcG9zaXRpb24oZWxlbWVudCwgcGFyZW50KTtcclxuXHRcdGNhc2UgMTpcclxuXHRcdHJldHVybiBTb2xpZEVsZW1lbnQoZWxlbWVudCwgcGFyZW50KTtcclxuXHRcdGNhc2UgMjpcclxuXHRcdHJldHVybiBJbWFnZUVsZW1lbnQoZWxlbWVudCwgcGFyZW50KTtcclxuXHRcdGNhc2UgMzpcclxuXHRcdHJldHVybiBOdWxsRWxlbWVudChlbGVtZW50LCBwYXJlbnQpO1xyXG5cdFx0Y2FzZSA0OlxyXG5cdFx0cmV0dXJuIFNoYXBlRWxlbWVudChlbGVtZW50LCBwYXJlbnQsIGVsZW1lbnQuZGF0YS5zaGFwZXMsIGVsZW1lbnQuaXRlbXNEYXRhKTtcclxuXHRcdGNhc2UgNTpcclxuXHRcdHJldHVybiBUZXh0RWxlbWVudChlbGVtZW50LCBwYXJlbnQpO1xyXG5cdFx0Y2FzZSAxMzpcclxuXHRcdHJldHVybiBDYW1lcmFFbGVtZW50KGVsZW1lbnQsIHBhcmVudCk7XHJcblx0XHRkZWZhdWx0OlxyXG5cdFx0cmV0dXJuIExheWVyQmFzZShlbGVtZW50LCBwYXJlbnQpO1xyXG5cdH1cclxufSIsImZ1bmN0aW9uIHNhbml0aXplU3RyaW5nKHN0cmluZykge1xyXG5cdHJldHVybiBzdHJpbmcudHJpbSgpO1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHNhbml0aXplU3RyaW5nIiwidmFyIGNyZWF0ZVR5cGVkQXJyYXkgPSByZXF1aXJlKCcuL3R5cGVkQXJyYXlzJylcclxuXHJcbi8qIVxyXG4gVHJhbnNmb3JtYXRpb24gTWF0cml4IHYyLjBcclxuIChjKSBFcGlzdGVtZXggMjAxNC0yMDE1XHJcbiB3d3cuZXBpc3RlbWV4LmNvbVxyXG4gQnkgS2VuIEZ5cnN0ZW5iZXJnXHJcbiBDb250cmlidXRpb25zIGJ5IGxlZW9uaXlhLlxyXG4gTGljZW5zZTogTUlULCBoZWFkZXIgcmVxdWlyZWQuXHJcbiAqL1xyXG5cclxuLyoqXHJcbiAqIDJEIHRyYW5zZm9ybWF0aW9uIG1hdHJpeCBvYmplY3QgaW5pdGlhbGl6ZWQgd2l0aCBpZGVudGl0eSBtYXRyaXguXHJcbiAqXHJcbiAqIFRoZSBtYXRyaXggY2FuIHN5bmNocm9uaXplIGEgY2FudmFzIGNvbnRleHQgYnkgc3VwcGx5aW5nIHRoZSBjb250ZXh0XHJcbiAqIGFzIGFuIGFyZ3VtZW50LCBvciBsYXRlciBhcHBseSBjdXJyZW50IGFic29sdXRlIHRyYW5zZm9ybSB0byBhblxyXG4gKiBleGlzdGluZyBjb250ZXh0LlxyXG4gKlxyXG4gKiBBbGwgdmFsdWVzIGFyZSBoYW5kbGVkIGFzIGZsb2F0aW5nIHBvaW50IHZhbHVlcy5cclxuICpcclxuICogQHBhcmFtIHtDYW52YXNSZW5kZXJpbmdDb250ZXh0MkR9IFtjb250ZXh0XSAtIE9wdGlvbmFsIGNvbnRleHQgdG8gc3luYyB3aXRoIE1hdHJpeFxyXG4gKiBAcHJvcCB7bnVtYmVyfSBhIC0gc2NhbGUgeFxyXG4gKiBAcHJvcCB7bnVtYmVyfSBiIC0gc2hlYXIgeVxyXG4gKiBAcHJvcCB7bnVtYmVyfSBjIC0gc2hlYXIgeFxyXG4gKiBAcHJvcCB7bnVtYmVyfSBkIC0gc2NhbGUgeVxyXG4gKiBAcHJvcCB7bnVtYmVyfSBlIC0gdHJhbnNsYXRlIHhcclxuICogQHByb3Age251bWJlcn0gZiAtIHRyYW5zbGF0ZSB5XHJcbiAqIEBwcm9wIHtDYW52YXNSZW5kZXJpbmdDb250ZXh0MkR8bnVsbH0gW2NvbnRleHQ9bnVsbF0gLSBzZXQgb3IgZ2V0IGN1cnJlbnQgY2FudmFzIGNvbnRleHRcclxuICogQGNvbnN0cnVjdG9yXHJcbiAqL1xyXG5cclxudmFyIE1hdHJpeCA9IChmdW5jdGlvbigpe1xyXG5cclxuICAgIHZhciBfY29zID0gTWF0aC5jb3M7XHJcbiAgICB2YXIgX3NpbiA9IE1hdGguc2luO1xyXG4gICAgdmFyIF90YW4gPSBNYXRoLnRhbjtcclxuICAgIHZhciBfcm5kID0gTWF0aC5yb3VuZDtcclxuXHJcbiAgICBmdW5jdGlvbiByZXNldCgpe1xyXG4gICAgICAgIHRoaXMucHJvcHNbMF0gPSAxO1xyXG4gICAgICAgIHRoaXMucHJvcHNbMV0gPSAwO1xyXG4gICAgICAgIHRoaXMucHJvcHNbMl0gPSAwO1xyXG4gICAgICAgIHRoaXMucHJvcHNbM10gPSAwO1xyXG4gICAgICAgIHRoaXMucHJvcHNbNF0gPSAwO1xyXG4gICAgICAgIHRoaXMucHJvcHNbNV0gPSAxO1xyXG4gICAgICAgIHRoaXMucHJvcHNbNl0gPSAwO1xyXG4gICAgICAgIHRoaXMucHJvcHNbN10gPSAwO1xyXG4gICAgICAgIHRoaXMucHJvcHNbOF0gPSAwO1xyXG4gICAgICAgIHRoaXMucHJvcHNbOV0gPSAwO1xyXG4gICAgICAgIHRoaXMucHJvcHNbMTBdID0gMTtcclxuICAgICAgICB0aGlzLnByb3BzWzExXSA9IDA7XHJcbiAgICAgICAgdGhpcy5wcm9wc1sxMl0gPSAwO1xyXG4gICAgICAgIHRoaXMucHJvcHNbMTNdID0gMDtcclxuICAgICAgICB0aGlzLnByb3BzWzE0XSA9IDA7XHJcbiAgICAgICAgdGhpcy5wcm9wc1sxNV0gPSAxO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHJvdGF0ZShhbmdsZSkge1xyXG4gICAgICAgIGlmKGFuZ2xlID09PSAwKXtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhciBtQ29zID0gX2NvcyhhbmdsZSk7XHJcbiAgICAgICAgdmFyIG1TaW4gPSBfc2luKGFuZ2xlKTtcclxuICAgICAgICByZXR1cm4gdGhpcy5fdChtQ29zLCAtbVNpbiwgIDAsIDAsIG1TaW4sICBtQ29zLCAwLCAwLCAwLCAgMCwgIDEsIDAsIDAsIDAsIDAsIDEpO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHJvdGF0ZVgoYW5nbGUpe1xyXG4gICAgICAgIGlmKGFuZ2xlID09PSAwKXtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhciBtQ29zID0gX2NvcyhhbmdsZSk7XHJcbiAgICAgICAgdmFyIG1TaW4gPSBfc2luKGFuZ2xlKTtcclxuICAgICAgICByZXR1cm4gdGhpcy5fdCgxLCAwLCAwLCAwLCAwLCBtQ29zLCAtbVNpbiwgMCwgMCwgbVNpbiwgIG1Db3MsIDAsIDAsIDAsIDAsIDEpO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHJvdGF0ZVkoYW5nbGUpe1xyXG4gICAgICAgIGlmKGFuZ2xlID09PSAwKXtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhciBtQ29zID0gX2NvcyhhbmdsZSk7XHJcbiAgICAgICAgdmFyIG1TaW4gPSBfc2luKGFuZ2xlKTtcclxuICAgICAgICByZXR1cm4gdGhpcy5fdChtQ29zLCAgMCwgIG1TaW4sIDAsIDAsIDEsIDAsIDAsIC1tU2luLCAgMCwgIG1Db3MsIDAsIDAsIDAsIDAsIDEpO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHJvdGF0ZVooYW5nbGUpe1xyXG4gICAgICAgIGlmKGFuZ2xlID09PSAwKXtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhciBtQ29zID0gX2NvcyhhbmdsZSk7XHJcbiAgICAgICAgdmFyIG1TaW4gPSBfc2luKGFuZ2xlKTtcclxuICAgICAgICByZXR1cm4gdGhpcy5fdChtQ29zLCAtbVNpbiwgIDAsIDAsIG1TaW4sICBtQ29zLCAwLCAwLCAwLCAgMCwgIDEsIDAsIDAsIDAsIDAsIDEpO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHNoZWFyKHN4LHN5KXtcclxuICAgICAgICByZXR1cm4gdGhpcy5fdCgxLCBzeSwgc3gsIDEsIDAsIDApO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHNrZXcoYXgsIGF5KXtcclxuICAgICAgICByZXR1cm4gdGhpcy5zaGVhcihfdGFuKGF4KSwgX3RhbihheSkpO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHNrZXdGcm9tQXhpcyhheCwgYW5nbGUpe1xyXG4gICAgICAgIHZhciBtQ29zID0gX2NvcyhhbmdsZSk7XHJcbiAgICAgICAgdmFyIG1TaW4gPSBfc2luKGFuZ2xlKTtcclxuICAgICAgICByZXR1cm4gdGhpcy5fdChtQ29zLCBtU2luLCAgMCwgMCwgLW1TaW4sICBtQ29zLCAwLCAwLCAwLCAgMCwgIDEsIDAsIDAsIDAsIDAsIDEpXHJcbiAgICAgICAgICAgIC5fdCgxLCAwLCAgMCwgMCwgX3RhbihheCksICAxLCAwLCAwLCAwLCAgMCwgIDEsIDAsIDAsIDAsIDAsIDEpXHJcbiAgICAgICAgICAgIC5fdChtQ29zLCAtbVNpbiwgIDAsIDAsIG1TaW4sICBtQ29zLCAwLCAwLCAwLCAgMCwgIDEsIDAsIDAsIDAsIDAsIDEpO1xyXG4gICAgICAgIC8vcmV0dXJuIHRoaXMuX3QobUNvcywgbVNpbiwgLW1TaW4sIG1Db3MsIDAsIDApLl90KDEsIDAsIF90YW4oYXgpLCAxLCAwLCAwKS5fdChtQ29zLCAtbVNpbiwgbVNpbiwgbUNvcywgMCwgMCk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gc2NhbGUoc3gsIHN5LCBzeikge1xyXG4gICAgICAgIHN6ID0gaXNOYU4oc3opID8gMSA6IHN6O1xyXG4gICAgICAgIGlmKHN4ID09IDEgJiYgc3kgPT0gMSAmJiBzeiA9PSAxKXtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzLl90KHN4LCAwLCAwLCAwLCAwLCBzeSwgMCwgMCwgMCwgMCwgc3osIDAsIDAsIDAsIDAsIDEpO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHNldFRyYW5zZm9ybShhLCBiLCBjLCBkLCBlLCBmLCBnLCBoLCBpLCBqLCBrLCBsLCBtLCBuLCBvLCBwKSB7XHJcbiAgICAgICAgdGhpcy5wcm9wc1swXSA9IGE7XHJcbiAgICAgICAgdGhpcy5wcm9wc1sxXSA9IGI7XHJcbiAgICAgICAgdGhpcy5wcm9wc1syXSA9IGM7XHJcbiAgICAgICAgdGhpcy5wcm9wc1szXSA9IGQ7XHJcbiAgICAgICAgdGhpcy5wcm9wc1s0XSA9IGU7XHJcbiAgICAgICAgdGhpcy5wcm9wc1s1XSA9IGY7XHJcbiAgICAgICAgdGhpcy5wcm9wc1s2XSA9IGc7XHJcbiAgICAgICAgdGhpcy5wcm9wc1s3XSA9IGg7XHJcbiAgICAgICAgdGhpcy5wcm9wc1s4XSA9IGk7XHJcbiAgICAgICAgdGhpcy5wcm9wc1s5XSA9IGo7XHJcbiAgICAgICAgdGhpcy5wcm9wc1sxMF0gPSBrO1xyXG4gICAgICAgIHRoaXMucHJvcHNbMTFdID0gbDtcclxuICAgICAgICB0aGlzLnByb3BzWzEyXSA9IG07XHJcbiAgICAgICAgdGhpcy5wcm9wc1sxM10gPSBuO1xyXG4gICAgICAgIHRoaXMucHJvcHNbMTRdID0gbztcclxuICAgICAgICB0aGlzLnByb3BzWzE1XSA9IHA7XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gdHJhbnNsYXRlKHR4LCB0eSwgdHopIHtcclxuICAgICAgICB0eiA9IHR6IHx8IDA7XHJcbiAgICAgICAgaWYodHggIT09IDAgfHwgdHkgIT09IDAgfHwgdHogIT09IDApe1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fdCgxLDAsMCwwLDAsMSwwLDAsMCwwLDEsMCx0eCx0eSx0eiwxKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gdHJhbnNmb3JtKGEyLCBiMiwgYzIsIGQyLCBlMiwgZjIsIGcyLCBoMiwgaTIsIGoyLCBrMiwgbDIsIG0yLCBuMiwgbzIsIHAyKSB7XHJcblxyXG4gICAgICAgIHZhciBfcCA9IHRoaXMucHJvcHM7XHJcblxyXG4gICAgICAgIGlmKGEyID09PSAxICYmIGIyID09PSAwICYmIGMyID09PSAwICYmIGQyID09PSAwICYmIGUyID09PSAwICYmIGYyID09PSAxICYmIGcyID09PSAwICYmIGgyID09PSAwICYmIGkyID09PSAwICYmIGoyID09PSAwICYmIGsyID09PSAxICYmIGwyID09PSAwKXtcclxuICAgICAgICAgICAgLy9OT1RFOiBjb21tZW50aW5nIHRoaXMgY29uZGl0aW9uIGJlY2F1c2UgVHVyYm9GYW4gZGVvcHRpbWl6ZXMgY29kZSB3aGVuIHByZXNlbnRcclxuICAgICAgICAgICAgLy9pZihtMiAhPT0gMCB8fCBuMiAhPT0gMCB8fCBvMiAhPT0gMCl7XHJcbiAgICAgICAgICAgICAgICBfcFsxMl0gPSBfcFsxMl0gKiBhMiArIF9wWzE1XSAqIG0yO1xyXG4gICAgICAgICAgICAgICAgX3BbMTNdID0gX3BbMTNdICogZjIgKyBfcFsxNV0gKiBuMjtcclxuICAgICAgICAgICAgICAgIF9wWzE0XSA9IF9wWzE0XSAqIGsyICsgX3BbMTVdICogbzI7XHJcbiAgICAgICAgICAgICAgICBfcFsxNV0gPSBfcFsxNV0gKiBwMjtcclxuICAgICAgICAgICAgLy99XHJcbiAgICAgICAgICAgIHRoaXMuX2lkZW50aXR5Q2FsY3VsYXRlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHZhciBhMSA9IF9wWzBdO1xyXG4gICAgICAgIHZhciBiMSA9IF9wWzFdO1xyXG4gICAgICAgIHZhciBjMSA9IF9wWzJdO1xyXG4gICAgICAgIHZhciBkMSA9IF9wWzNdO1xyXG4gICAgICAgIHZhciBlMSA9IF9wWzRdO1xyXG4gICAgICAgIHZhciBmMSA9IF9wWzVdO1xyXG4gICAgICAgIHZhciBnMSA9IF9wWzZdO1xyXG4gICAgICAgIHZhciBoMSA9IF9wWzddO1xyXG4gICAgICAgIHZhciBpMSA9IF9wWzhdO1xyXG4gICAgICAgIHZhciBqMSA9IF9wWzldO1xyXG4gICAgICAgIHZhciBrMSA9IF9wWzEwXTtcclxuICAgICAgICB2YXIgbDEgPSBfcFsxMV07XHJcbiAgICAgICAgdmFyIG0xID0gX3BbMTJdO1xyXG4gICAgICAgIHZhciBuMSA9IF9wWzEzXTtcclxuICAgICAgICB2YXIgbzEgPSBfcFsxNF07XHJcbiAgICAgICAgdmFyIHAxID0gX3BbMTVdO1xyXG5cclxuICAgICAgICAvKiBtYXRyaXggb3JkZXIgKGNhbnZhcyBjb21wYXRpYmxlKTpcclxuICAgICAgICAgKiBhY2VcclxuICAgICAgICAgKiBiZGZcclxuICAgICAgICAgKiAwMDFcclxuICAgICAgICAgKi9cclxuICAgICAgICBfcFswXSA9IGExICogYTIgKyBiMSAqIGUyICsgYzEgKiBpMiArIGQxICogbTI7XHJcbiAgICAgICAgX3BbMV0gPSBhMSAqIGIyICsgYjEgKiBmMiArIGMxICogajIgKyBkMSAqIG4yIDtcclxuICAgICAgICBfcFsyXSA9IGExICogYzIgKyBiMSAqIGcyICsgYzEgKiBrMiArIGQxICogbzIgO1xyXG4gICAgICAgIF9wWzNdID0gYTEgKiBkMiArIGIxICogaDIgKyBjMSAqIGwyICsgZDEgKiBwMiA7XHJcblxyXG4gICAgICAgIF9wWzRdID0gZTEgKiBhMiArIGYxICogZTIgKyBnMSAqIGkyICsgaDEgKiBtMiA7XHJcbiAgICAgICAgX3BbNV0gPSBlMSAqIGIyICsgZjEgKiBmMiArIGcxICogajIgKyBoMSAqIG4yIDtcclxuICAgICAgICBfcFs2XSA9IGUxICogYzIgKyBmMSAqIGcyICsgZzEgKiBrMiArIGgxICogbzIgO1xyXG4gICAgICAgIF9wWzddID0gZTEgKiBkMiArIGYxICogaDIgKyBnMSAqIGwyICsgaDEgKiBwMiA7XHJcblxyXG4gICAgICAgIF9wWzhdID0gaTEgKiBhMiArIGoxICogZTIgKyBrMSAqIGkyICsgbDEgKiBtMiA7XHJcbiAgICAgICAgX3BbOV0gPSBpMSAqIGIyICsgajEgKiBmMiArIGsxICogajIgKyBsMSAqIG4yIDtcclxuICAgICAgICBfcFsxMF0gPSBpMSAqIGMyICsgajEgKiBnMiArIGsxICogazIgKyBsMSAqIG8yIDtcclxuICAgICAgICBfcFsxMV0gPSBpMSAqIGQyICsgajEgKiBoMiArIGsxICogbDIgKyBsMSAqIHAyIDtcclxuXHJcbiAgICAgICAgX3BbMTJdID0gbTEgKiBhMiArIG4xICogZTIgKyBvMSAqIGkyICsgcDEgKiBtMiA7XHJcbiAgICAgICAgX3BbMTNdID0gbTEgKiBiMiArIG4xICogZjIgKyBvMSAqIGoyICsgcDEgKiBuMiA7XHJcbiAgICAgICAgX3BbMTRdID0gbTEgKiBjMiArIG4xICogZzIgKyBvMSAqIGsyICsgcDEgKiBvMiA7XHJcbiAgICAgICAgX3BbMTVdID0gbTEgKiBkMiArIG4xICogaDIgKyBvMSAqIGwyICsgcDEgKiBwMiA7XHJcblxyXG4gICAgICAgIHRoaXMuX2lkZW50aXR5Q2FsY3VsYXRlZCA9IGZhbHNlO1xyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGlzSWRlbnRpdHkoKSB7XHJcbiAgICAgICAgaWYoIXRoaXMuX2lkZW50aXR5Q2FsY3VsYXRlZCl7XHJcbiAgICAgICAgICAgIHRoaXMuX2lkZW50aXR5ID0gISh0aGlzLnByb3BzWzBdICE9PSAxIHx8IHRoaXMucHJvcHNbMV0gIT09IDAgfHwgdGhpcy5wcm9wc1syXSAhPT0gMCB8fCB0aGlzLnByb3BzWzNdICE9PSAwIHx8IHRoaXMucHJvcHNbNF0gIT09IDAgfHwgdGhpcy5wcm9wc1s1XSAhPT0gMSB8fCB0aGlzLnByb3BzWzZdICE9PSAwIHx8IHRoaXMucHJvcHNbN10gIT09IDAgfHwgdGhpcy5wcm9wc1s4XSAhPT0gMCB8fCB0aGlzLnByb3BzWzldICE9PSAwIHx8IHRoaXMucHJvcHNbMTBdICE9PSAxIHx8IHRoaXMucHJvcHNbMTFdICE9PSAwIHx8IHRoaXMucHJvcHNbMTJdICE9PSAwIHx8IHRoaXMucHJvcHNbMTNdICE9PSAwIHx8IHRoaXMucHJvcHNbMTRdICE9PSAwIHx8IHRoaXMucHJvcHNbMTVdICE9PSAxKTtcclxuICAgICAgICAgICAgdGhpcy5faWRlbnRpdHlDYWxjdWxhdGVkID0gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2lkZW50aXR5O1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGVxdWFscyhtYXRyKXtcclxuICAgICAgICB2YXIgaSA9IDA7XHJcbiAgICAgICAgd2hpbGUgKGkgPCAxNikge1xyXG4gICAgICAgICAgICBpZihtYXRyLnByb3BzW2ldICE9PSB0aGlzLnByb3BzW2ldKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaSs9MTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gY2xvbmUobWF0cil7XHJcbiAgICAgICAgdmFyIGk7XHJcbiAgICAgICAgZm9yKGk9MDtpPDE2O2krPTEpe1xyXG4gICAgICAgICAgICBtYXRyLnByb3BzW2ldID0gdGhpcy5wcm9wc1tpXTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gY2xvbmVGcm9tUHJvcHMocHJvcHMpe1xyXG4gICAgICAgIHZhciBpO1xyXG4gICAgICAgIGZvcihpPTA7aTwxNjtpKz0xKXtcclxuICAgICAgICAgICAgdGhpcy5wcm9wc1tpXSA9IHByb3BzW2ldO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBhcHBseVRvUG9pbnQoeCwgeSwgeikge1xyXG5cclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICB4OiB4ICogdGhpcy5wcm9wc1swXSArIHkgKiB0aGlzLnByb3BzWzRdICsgeiAqIHRoaXMucHJvcHNbOF0gKyB0aGlzLnByb3BzWzEyXSxcclxuICAgICAgICAgICAgeTogeCAqIHRoaXMucHJvcHNbMV0gKyB5ICogdGhpcy5wcm9wc1s1XSArIHogKiB0aGlzLnByb3BzWzldICsgdGhpcy5wcm9wc1sxM10sXHJcbiAgICAgICAgICAgIHo6IHggKiB0aGlzLnByb3BzWzJdICsgeSAqIHRoaXMucHJvcHNbNl0gKyB6ICogdGhpcy5wcm9wc1sxMF0gKyB0aGlzLnByb3BzWzE0XVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgLypyZXR1cm4ge1xyXG4gICAgICAgICB4OiB4ICogbWUuYSArIHkgKiBtZS5jICsgbWUuZSxcclxuICAgICAgICAgeTogeCAqIG1lLmIgKyB5ICogbWUuZCArIG1lLmZcclxuICAgICAgICAgfTsqL1xyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gYXBwbHlUb1goeCwgeSwgeikge1xyXG4gICAgICAgIHJldHVybiB4ICogdGhpcy5wcm9wc1swXSArIHkgKiB0aGlzLnByb3BzWzRdICsgeiAqIHRoaXMucHJvcHNbOF0gKyB0aGlzLnByb3BzWzEyXTtcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIGFwcGx5VG9ZKHgsIHksIHopIHtcclxuICAgICAgICByZXR1cm4geCAqIHRoaXMucHJvcHNbMV0gKyB5ICogdGhpcy5wcm9wc1s1XSArIHogKiB0aGlzLnByb3BzWzldICsgdGhpcy5wcm9wc1sxM107XHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiBhcHBseVRvWih4LCB5LCB6KSB7XHJcbiAgICAgICAgcmV0dXJuIHggKiB0aGlzLnByb3BzWzJdICsgeSAqIHRoaXMucHJvcHNbNl0gKyB6ICogdGhpcy5wcm9wc1sxMF0gKyB0aGlzLnByb3BzWzE0XTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBpbnZlcnNlUG9pbnQocHQpIHtcclxuICAgICAgICB2YXIgZGV0ZXJtaW5hbnQgPSB0aGlzLnByb3BzWzBdICogdGhpcy5wcm9wc1s1XSAtIHRoaXMucHJvcHNbMV0gKiB0aGlzLnByb3BzWzRdO1xyXG4gICAgICAgIHZhciBhID0gdGhpcy5wcm9wc1s1XS9kZXRlcm1pbmFudDtcclxuICAgICAgICB2YXIgYiA9IC0gdGhpcy5wcm9wc1sxXS9kZXRlcm1pbmFudDtcclxuICAgICAgICB2YXIgYyA9IC0gdGhpcy5wcm9wc1s0XS9kZXRlcm1pbmFudDtcclxuICAgICAgICB2YXIgZCA9IHRoaXMucHJvcHNbMF0vZGV0ZXJtaW5hbnQ7XHJcbiAgICAgICAgdmFyIGUgPSAodGhpcy5wcm9wc1s0XSAqIHRoaXMucHJvcHNbMTNdIC0gdGhpcy5wcm9wc1s1XSAqIHRoaXMucHJvcHNbMTJdKS9kZXRlcm1pbmFudDtcclxuICAgICAgICB2YXIgZiA9IC0gKHRoaXMucHJvcHNbMF0gKiB0aGlzLnByb3BzWzEzXSAtIHRoaXMucHJvcHNbMV0gKiB0aGlzLnByb3BzWzEyXSkvZGV0ZXJtaW5hbnQ7XHJcbiAgICAgICAgcmV0dXJuIFtwdFswXSAqIGEgKyBwdFsxXSAqIGMgKyBlLCBwdFswXSAqIGIgKyBwdFsxXSAqIGQgKyBmLCAwXTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBpbnZlcnNlUG9pbnRzKHB0cyl7XHJcbiAgICAgICAgdmFyIGksIGxlbiA9IHB0cy5sZW5ndGgsIHJldFB0cyA9IFtdO1xyXG4gICAgICAgIGZvcihpPTA7aTxsZW47aSs9MSl7XHJcbiAgICAgICAgICAgIHJldFB0c1tpXSA9IGludmVyc2VQb2ludChwdHNbaV0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcmV0UHRzO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGFwcGx5VG9UcmlwbGVQb2ludHMocHQxLCBwdDIsIHB0Mykge1xyXG4gICAgICAgIHZhciBhcnIgPSBjcmVhdGVUeXBlZEFycmF5KCdmbG9hdDMyJywgNik7XHJcbiAgICAgICAgaWYodGhpcy5pc0lkZW50aXR5KCkpIHtcclxuICAgICAgICAgICAgYXJyWzBdID0gcHQxWzBdO1xyXG4gICAgICAgICAgICBhcnJbMV0gPSBwdDFbMV07XHJcbiAgICAgICAgICAgIGFyclsyXSA9IHB0MlswXTtcclxuICAgICAgICAgICAgYXJyWzNdID0gcHQyWzFdO1xyXG4gICAgICAgICAgICBhcnJbNF0gPSBwdDNbMF07XHJcbiAgICAgICAgICAgIGFycls1XSA9IHB0M1sxXTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB2YXIgcDAgPSB0aGlzLnByb3BzWzBdLCBwMSA9IHRoaXMucHJvcHNbMV0sIHA0ID0gdGhpcy5wcm9wc1s0XSwgcDUgPSB0aGlzLnByb3BzWzVdLCBwMTIgPSB0aGlzLnByb3BzWzEyXSwgcDEzID0gdGhpcy5wcm9wc1sxM107XHJcbiAgICAgICAgICAgIGFyclswXSA9IHB0MVswXSAqIHAwICsgcHQxWzFdICogcDQgKyBwMTI7XHJcbiAgICAgICAgICAgIGFyclsxXSA9IHB0MVswXSAqIHAxICsgcHQxWzFdICogcDUgKyBwMTM7XHJcbiAgICAgICAgICAgIGFyclsyXSA9IHB0MlswXSAqIHAwICsgcHQyWzFdICogcDQgKyBwMTI7XHJcbiAgICAgICAgICAgIGFyclszXSA9IHB0MlswXSAqIHAxICsgcHQyWzFdICogcDUgKyBwMTM7XHJcbiAgICAgICAgICAgIGFycls0XSA9IHB0M1swXSAqIHAwICsgcHQzWzFdICogcDQgKyBwMTI7XHJcbiAgICAgICAgICAgIGFycls1XSA9IHB0M1swXSAqIHAxICsgcHQzWzFdICogcDUgKyBwMTM7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBhcnI7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gYXBwbHlUb1BvaW50QXJyYXkoeCx5LHope1xyXG4gICAgICAgIHZhciBhcnI7XHJcbiAgICAgICAgaWYodGhpcy5pc0lkZW50aXR5KCkpIHtcclxuICAgICAgICAgICAgYXJyID0gW3gseSx6XTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBhcnIgPSBbeCAqIHRoaXMucHJvcHNbMF0gKyB5ICogdGhpcy5wcm9wc1s0XSArIHogKiB0aGlzLnByb3BzWzhdICsgdGhpcy5wcm9wc1sxMl0seCAqIHRoaXMucHJvcHNbMV0gKyB5ICogdGhpcy5wcm9wc1s1XSArIHogKiB0aGlzLnByb3BzWzldICsgdGhpcy5wcm9wc1sxM10seCAqIHRoaXMucHJvcHNbMl0gKyB5ICogdGhpcy5wcm9wc1s2XSArIHogKiB0aGlzLnByb3BzWzEwXSArIHRoaXMucHJvcHNbMTRdXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGFycjtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBhcHBseVRvUG9pbnRTdHJpbmdpZmllZCh4LCB5KSB7XHJcbiAgICAgICAgaWYodGhpcy5pc0lkZW50aXR5KCkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHggKyAnLCcgKyB5O1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gKHggKiB0aGlzLnByb3BzWzBdICsgeSAqIHRoaXMucHJvcHNbNF0gKyB0aGlzLnByb3BzWzEyXSkrJywnKyh4ICogdGhpcy5wcm9wc1sxXSArIHkgKiB0aGlzLnByb3BzWzVdICsgdGhpcy5wcm9wc1sxM10pO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHRvQ1NTKCkge1xyXG4gICAgICAgIC8vRG9lc24ndCBtYWtlIG11Y2ggc2Vuc2UgdG8gYWRkIHRoaXMgb3B0aW1pemF0aW9uLiBJZiBpdCBpcyBhbiBpZGVudGl0eSBtYXRyaXgsIGl0J3MgdmVyeSBsaWtlbHkgdGhpcyB3aWxsIGdldCBjYWxsZWQgb25seSBvbmNlIHNpbmNlIGl0IHdvbid0IGJlIGtleWZyYW1lZC5cclxuICAgICAgICAvKmlmKHRoaXMuaXNJZGVudGl0eSgpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAnJztcclxuICAgICAgICB9Ki9cclxuICAgICAgICB2YXIgaSA9IDA7XHJcbiAgICAgICAgdmFyIHByb3BzID0gdGhpcy5wcm9wcztcclxuICAgICAgICB2YXIgY3NzVmFsdWUgPSAnbWF0cml4M2QoJztcclxuICAgICAgICB2YXIgdiA9IDEwMDAwO1xyXG4gICAgICAgIHdoaWxlKGk8MTYpe1xyXG4gICAgICAgICAgICBjc3NWYWx1ZSArPSBfcm5kKHByb3BzW2ldKnYpL3Y7XHJcbiAgICAgICAgICAgIGNzc1ZhbHVlICs9IGkgPT09IDE1ID8gJyknOicsJztcclxuICAgICAgICAgICAgaSArPSAxO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gY3NzVmFsdWU7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gdG8yZENTUygpIHtcclxuICAgICAgICAvL0RvZXNuJ3QgbWFrZSBtdWNoIHNlbnNlIHRvIGFkZCB0aGlzIG9wdGltaXphdGlvbi4gSWYgaXQgaXMgYW4gaWRlbnRpdHkgbWF0cml4LCBpdCdzIHZlcnkgbGlrZWx5IHRoaXMgd2lsbCBnZXQgY2FsbGVkIG9ubHkgb25jZSBzaW5jZSBpdCB3b24ndCBiZSBrZXlmcmFtZWQuXHJcbiAgICAgICAgLyppZih0aGlzLmlzSWRlbnRpdHkoKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gJyc7XHJcbiAgICAgICAgfSovXHJcbiAgICAgICAgdmFyIHYgPSAxMDAwMDtcclxuICAgICAgICB2YXIgcHJvcHMgPSB0aGlzLnByb3BzO1xyXG4gICAgICAgIHJldHVybiBcIm1hdHJpeChcIiArIF9ybmQocHJvcHNbMF0qdikvdiArICcsJyArIF9ybmQocHJvcHNbMV0qdikvdiArICcsJyArIF9ybmQocHJvcHNbNF0qdikvdiArICcsJyArIF9ybmQocHJvcHNbNV0qdikvdiArICcsJyArIF9ybmQocHJvcHNbMTJdKnYpL3YgKyAnLCcgKyBfcm5kKHByb3BzWzEzXSp2KS92ICsgXCIpXCI7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gTWF0cml4SW5zdGFuY2UoKXtcclxuICAgICAgICB0aGlzLnJlc2V0ID0gcmVzZXQ7XHJcbiAgICAgICAgdGhpcy5yb3RhdGUgPSByb3RhdGU7XHJcbiAgICAgICAgdGhpcy5yb3RhdGVYID0gcm90YXRlWDtcclxuICAgICAgICB0aGlzLnJvdGF0ZVkgPSByb3RhdGVZO1xyXG4gICAgICAgIHRoaXMucm90YXRlWiA9IHJvdGF0ZVo7XHJcbiAgICAgICAgdGhpcy5za2V3ID0gc2tldztcclxuICAgICAgICB0aGlzLnNrZXdGcm9tQXhpcyA9IHNrZXdGcm9tQXhpcztcclxuICAgICAgICB0aGlzLnNoZWFyID0gc2hlYXI7XHJcbiAgICAgICAgdGhpcy5zY2FsZSA9IHNjYWxlO1xyXG4gICAgICAgIHRoaXMuc2V0VHJhbnNmb3JtID0gc2V0VHJhbnNmb3JtO1xyXG4gICAgICAgIHRoaXMudHJhbnNsYXRlID0gdHJhbnNsYXRlO1xyXG4gICAgICAgIHRoaXMudHJhbnNmb3JtID0gdHJhbnNmb3JtO1xyXG4gICAgICAgIHRoaXMuYXBwbHlUb1BvaW50ID0gYXBwbHlUb1BvaW50O1xyXG4gICAgICAgIHRoaXMuYXBwbHlUb1ggPSBhcHBseVRvWDtcclxuICAgICAgICB0aGlzLmFwcGx5VG9ZID0gYXBwbHlUb1k7XHJcbiAgICAgICAgdGhpcy5hcHBseVRvWiA9IGFwcGx5VG9aO1xyXG4gICAgICAgIHRoaXMuYXBwbHlUb1BvaW50QXJyYXkgPSBhcHBseVRvUG9pbnRBcnJheTtcclxuICAgICAgICB0aGlzLmFwcGx5VG9UcmlwbGVQb2ludHMgPSBhcHBseVRvVHJpcGxlUG9pbnRzO1xyXG4gICAgICAgIHRoaXMuYXBwbHlUb1BvaW50U3RyaW5naWZpZWQgPSBhcHBseVRvUG9pbnRTdHJpbmdpZmllZDtcclxuICAgICAgICB0aGlzLnRvQ1NTID0gdG9DU1M7XHJcbiAgICAgICAgdGhpcy50bzJkQ1NTID0gdG8yZENTUztcclxuICAgICAgICB0aGlzLmNsb25lID0gY2xvbmU7XHJcbiAgICAgICAgdGhpcy5jbG9uZUZyb21Qcm9wcyA9IGNsb25lRnJvbVByb3BzO1xyXG4gICAgICAgIHRoaXMuZXF1YWxzID0gZXF1YWxzO1xyXG4gICAgICAgIHRoaXMuaW52ZXJzZVBvaW50cyA9IGludmVyc2VQb2ludHM7XHJcbiAgICAgICAgdGhpcy5pbnZlcnNlUG9pbnQgPSBpbnZlcnNlUG9pbnQ7XHJcbiAgICAgICAgdGhpcy5fdCA9IHRoaXMudHJhbnNmb3JtO1xyXG4gICAgICAgIHRoaXMuaXNJZGVudGl0eSA9IGlzSWRlbnRpdHk7XHJcbiAgICAgICAgdGhpcy5faWRlbnRpdHkgPSB0cnVlO1xyXG4gICAgICAgIHRoaXMuX2lkZW50aXR5Q2FsY3VsYXRlZCA9IGZhbHNlO1xyXG5cclxuICAgICAgICB0aGlzLnByb3BzID0gY3JlYXRlVHlwZWRBcnJheSgnZmxvYXQzMicsIDE2KTtcclxuICAgICAgICB0aGlzLnJlc2V0KCk7XHJcbiAgICB9O1xyXG5cclxuICAgIHJldHVybiBmdW5jdGlvbigpIHtcclxuICAgICAgICByZXR1cm4gbmV3IE1hdHJpeEluc3RhbmNlKClcclxuICAgIH1cclxufSgpKTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gTWF0cml4OyIsInZhciBjcmVhdGVUeXBlZEFycmF5ID0gKGZ1bmN0aW9uKCl7XHJcblx0ZnVuY3Rpb24gY3JlYXRlUmVndWxhckFycmF5KHR5cGUsIGxlbil7XHJcblx0XHR2YXIgaSA9IDAsIGFyciA9IFtdLCB2YWx1ZTtcclxuXHRcdHN3aXRjaCh0eXBlKSB7XHJcblx0XHRcdGNhc2UgJ2ludDE2JzpcclxuXHRcdFx0Y2FzZSAndWludDhjJzpcclxuXHRcdFx0XHR2YWx1ZSA9IDE7XHJcblx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdGRlZmF1bHQ6XHJcblx0XHRcdFx0dmFsdWUgPSAxLjE7XHJcblx0XHRcdFx0YnJlYWs7XHJcblx0XHR9XHJcblx0XHRmb3IoaSA9IDA7IGkgPCBsZW47IGkgKz0gMSkge1xyXG5cdFx0XHRhcnIucHVzaCh2YWx1ZSk7XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gYXJyO1xyXG5cdH1cclxuXHRmdW5jdGlvbiBjcmVhdGVUeXBlZEFycmF5KHR5cGUsIGxlbil7XHJcblx0XHRpZih0eXBlID09PSAnZmxvYXQzMicpIHtcclxuXHRcdFx0cmV0dXJuIG5ldyBGbG9hdDMyQXJyYXkobGVuKTtcclxuXHRcdH0gZWxzZSBpZih0eXBlID09PSAnaW50MTYnKSB7XHJcblx0XHRcdHJldHVybiBuZXcgSW50MTZBcnJheShsZW4pO1xyXG5cdFx0fSBlbHNlIGlmKHR5cGUgPT09ICd1aW50OGMnKSB7XHJcblx0XHRcdHJldHVybiBuZXcgVWludDhDbGFtcGVkQXJyYXkobGVuKTtcclxuXHRcdH1cclxuXHR9XHJcblx0aWYodHlwZW9mIFVpbnQ4Q2xhbXBlZEFycmF5ID09PSAnZnVuY3Rpb24nICYmIHR5cGVvZiBGbG9hdDMyQXJyYXkgPT09ICdmdW5jdGlvbicpIHtcclxuXHRcdHJldHVybiBjcmVhdGVUeXBlZEFycmF5O1xyXG5cdH0gZWxzZSB7XHJcblx0XHRyZXR1cm4gY3JlYXRlUmVndWxhckFycmF5O1xyXG5cdH1cclxufSgpKTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gY3JlYXRlVHlwZWRBcnJheTtcclxuIiwidmFyIEFuaW1hdGlvbkl0ZW0gPSByZXF1aXJlKCcuL2FuaW1hdGlvbi9BbmltYXRpb25JdGVtJyk7XHJcblxyXG5mdW5jdGlvbiBjcmVhdGVBbmltYXRpb25BcGkoYW5pbSkge1xyXG5cdHJldHVybiBPYmplY3QuYXNzaWduKHt9LCBBbmltYXRpb25JdGVtKGFuaW0pKTtcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB7XHJcblx0Y3JlYXRlQW5pbWF0aW9uQXBpIDogY3JlYXRlQW5pbWF0aW9uQXBpXHJcbn0iLCJ2YXIga2V5UGF0aEJ1aWxkZXIgPSByZXF1aXJlKCcuLi9oZWxwZXJzL2tleVBhdGhCdWlsZGVyJyk7XHJcbnZhciBsYXllcl90eXBlcyA9IHJlcXVpcmUoJy4uL2VudW1zL2xheWVyX3R5cGVzJyk7XHJcblxyXG5mdW5jdGlvbiBLZXlQYXRoTGlzdChlbGVtZW50cywgbm9kZV90eXBlKSB7XHJcblxyXG5cdGZ1bmN0aW9uIF9nZXRMZW5ndGgoKSB7XHJcblx0XHRyZXR1cm4gZWxlbWVudHMubGVuZ3RoO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gX2ZpbHRlckxheWVyQnlUeXBlKGVsZW1lbnRzLCB0eXBlKSB7XHJcblx0XHRyZXR1cm4gZWxlbWVudHMuZmlsdGVyKGZ1bmN0aW9uKGVsZW1lbnQpIHtcclxuXHRcdFx0cmV0dXJuIGVsZW1lbnQuZ2V0VGFyZ2V0TGF5ZXIoKS5kYXRhLnR5ID09PSBsYXllcl90eXBlc1t0eXBlXTtcclxuXHRcdH0pO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gX2ZpbHRlckxheWVyQnlOYW1lKGVsZW1lbnRzLCBuYW1lKSB7XHJcblx0XHRyZXR1cm4gZWxlbWVudHMuZmlsdGVyKGZ1bmN0aW9uKGVsZW1lbnQpIHtcclxuXHRcdFx0cmV0dXJuIGVsZW1lbnQuZ2V0VGFyZ2V0TGF5ZXIoKS5kYXRhLm5tID09PSBuYW1lO1xyXG5cdFx0fSk7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBfZmlsdGVyTGF5ZXJCeVByb3BlcnR5KGVsZW1lbnRzLCBuYW1lKSB7XHJcblx0XHRyZXR1cm4gZWxlbWVudHMuZmlsdGVyKGZ1bmN0aW9uKGVsZW1lbnQpIHtcclxuXHRcdFx0aWYoZWxlbWVudC5oYXNQcm9wZXJ0eShuYW1lKSkge1xyXG5cdFx0XHRcdHJldHVybiBlbGVtZW50LmdldFByb3BlcnR5KG5hbWUpO1xyXG5cdFx0XHR9XHJcblx0XHRcdHJldHVybiBmYWxzZTtcclxuXHRcdH0pO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gZ2V0TGF5ZXJzQnlUeXBlKHNlbGVjdG9yKSB7XHJcblx0XHRyZXR1cm4gS2V5UGF0aExpc3QoX2ZpbHRlckxheWVyQnlUeXBlKGVsZW1lbnRzLCBzZWxlY3RvciksICdsYXllcicpO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gZ2V0TGF5ZXJzQnlOYW1lKHNlbGVjdG9yKSB7XHJcblx0XHRyZXR1cm4gS2V5UGF0aExpc3QoX2ZpbHRlckxheWVyQnlOYW1lKGVsZW1lbnRzLCBzZWxlY3RvciksICdsYXllcicpO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gZ2V0UHJvcGVydGllc0J5U2VsZWN0b3Ioc2VsZWN0b3IpIHtcclxuXHRcdHJldHVybiBLZXlQYXRoTGlzdChlbGVtZW50cy5maWx0ZXIoZnVuY3Rpb24oZWxlbWVudCkge1xyXG5cdFx0XHRyZXR1cm4gZWxlbWVudC5oYXNQcm9wZXJ0eShzZWxlY3Rvcik7XHJcblx0XHR9KS5tYXAoZnVuY3Rpb24oZWxlbWVudCkge1xyXG5cdFx0XHRyZXR1cm4gZWxlbWVudC5nZXRQcm9wZXJ0eShzZWxlY3Rvcik7XHJcblx0XHR9KSwgJ3Byb3BlcnR5Jyk7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBnZXRMYXllclByb3BlcnR5KHNlbGVjdG9yKSB7XHJcblx0XHR2YXIgbGF5ZXJzID0gX2ZpbHRlckxheWVyQnlQcm9wZXJ0eShlbGVtZW50cywgc2VsZWN0b3IpO1xyXG5cdFx0dmFyIHByb3BlcnRpZXMgPSBsYXllcnMubWFwKGZ1bmN0aW9uKGVsZW1lbnQpe1xyXG5cdFx0XHRyZXR1cm4gZWxlbWVudC5nZXRQcm9wZXJ0eShzZWxlY3Rvcik7XHJcblx0XHR9KVxyXG5cdFx0cmV0dXJuIEtleVBhdGhMaXN0KHByb3BlcnRpZXMsICdwcm9wZXJ0eScpO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gZ2V0S2V5UGF0aChwcm9wZXJ0eVBhdGgpIHtcclxuXHRcdHZhciBrZXlQYXRoRGF0YSA9IGtleVBhdGhCdWlsZGVyKHByb3BlcnR5UGF0aCk7XHJcblx0XHR2YXIgc2VsZWN0b3IgPSBrZXlQYXRoRGF0YS5zZWxlY3RvcjtcclxuXHRcdHZhciBub2Rlc0J5TmFtZSwgbm9kZXNCeVR5cGUsIHNlbGVjdGVkTm9kZXM7XHJcblx0XHRpZiAobm9kZV90eXBlID09PSAncmVuZGVyZXInIHx8IG5vZGVfdHlwZSA9PT0gJ2xheWVyJykge1xyXG5cdFx0XHRub2Rlc0J5TmFtZSA9IGdldExheWVyc0J5TmFtZShzZWxlY3Rvcik7XHJcblx0XHRcdG5vZGVzQnlUeXBlID0gZ2V0TGF5ZXJzQnlUeXBlKHNlbGVjdG9yKTtcclxuXHRcdFx0aWYgKG5vZGVzQnlOYW1lLmxlbmd0aCA9PT0gMCAmJiBub2Rlc0J5VHlwZS5sZW5ndGggPT09IDApIHtcclxuXHRcdFx0XHRzZWxlY3RlZE5vZGVzID0gZ2V0TGF5ZXJQcm9wZXJ0eShzZWxlY3Rvcik7XHJcblx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0c2VsZWN0ZWROb2RlcyA9IG5vZGVzQnlOYW1lLmNvbmNhdChub2Rlc0J5VHlwZSk7XHJcblx0XHRcdH1cclxuXHRcdFx0aWYgKGtleVBhdGhEYXRhLnByb3BlcnR5UGF0aCkge1xyXG5cdFx0XHRcdHJldHVybiBzZWxlY3RlZE5vZGVzLmdldEtleVBhdGgoa2V5UGF0aERhdGEucHJvcGVydHlQYXRoKTtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRyZXR1cm4gc2VsZWN0ZWROb2RlcztcclxuXHRcdFx0fVxyXG5cdFx0fSBlbHNlIGlmKG5vZGVfdHlwZSA9PT0gJ3Byb3BlcnR5Jykge1xyXG5cdFx0XHRzZWxlY3RlZE5vZGVzID0gZ2V0UHJvcGVydGllc0J5U2VsZWN0b3Ioc2VsZWN0b3IpO1xyXG5cdFx0XHRpZiAoa2V5UGF0aERhdGEucHJvcGVydHlQYXRoKSB7XHJcblx0XHRcdFx0cmV0dXJuIHNlbGVjdGVkTm9kZXMuZ2V0S2V5UGF0aChrZXlQYXRoRGF0YS5wcm9wZXJ0eVBhdGgpO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdHJldHVybiBzZWxlY3RlZE5vZGVzO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBjb25jYXQobm9kZXMpIHtcclxuXHRcdHZhciBub2Rlc0VsZW1lbnRzID0gbm9kZXMuZ2V0RWxlbWVudHMoKTtcclxuXHRcdHJldHVybiBLZXlQYXRoTGlzdChlbGVtZW50cy5jb25jYXQobm9kZXNFbGVtZW50cyksIG5vZGVfdHlwZSk7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBnZXRFbGVtZW50cygpIHtcclxuXHRcdHJldHVybiBlbGVtZW50cztcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIGdldFByb3BlcnR5QXRJbmRleChpbmRleCkge1xyXG5cdFx0cmV0dXJuIGVsZW1lbnRzW2luZGV4XTtcclxuXHR9XHJcblxyXG5cdHZhciBtZXRob2RzID0ge1xyXG5cdFx0Z2V0S2V5UGF0aDogZ2V0S2V5UGF0aCxcclxuXHRcdGNvbmNhdDogY29uY2F0LFxyXG5cdFx0Z2V0RWxlbWVudHM6IGdldEVsZW1lbnRzLFxyXG5cdFx0Z2V0UHJvcGVydHlBdEluZGV4OiBnZXRQcm9wZXJ0eUF0SW5kZXhcclxuXHR9XHJcblxyXG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShtZXRob2RzLCAnbGVuZ3RoJywge1xyXG5cdFx0Z2V0OiBfZ2V0TGVuZ3RoXHJcblx0fSk7XHJcblxyXG5cdHJldHVybiBtZXRob2RzO1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEtleVBhdGhMaXN0OyIsInZhciBrZXlfcGF0aF9zZXBhcmF0b3IgPSByZXF1aXJlKCcuLi9lbnVtcy9rZXlfcGF0aF9zZXBhcmF0b3InKTtcclxudmFyIHByb3BlcnR5X25hbWVzID0gcmVxdWlyZSgnLi4vZW51bXMvcHJvcGVydHlfbmFtZXMnKTtcclxuXHJcbmZ1bmN0aW9uIEtleVBhdGhOb2RlKHN0YXRlKSB7XHJcblxyXG5cdGZ1bmN0aW9uIGdldFByb3BlcnR5QnlQYXRoKHNlbGVjdG9yLCBwcm9wZXJ0eVBhdGgpIHtcclxuXHRcdHZhciBpbnN0YW5jZVByb3BlcnRpZXMgPSBzdGF0ZS5wcm9wZXJ0aWVzIHx8IFtdO1xyXG5cdFx0dmFyIGkgPSAwLCBsZW4gPSBpbnN0YW5jZVByb3BlcnRpZXMubGVuZ3RoO1xyXG5cdFx0d2hpbGUoaSA8IGxlbikge1xyXG5cdFx0XHRpZihpbnN0YW5jZVByb3BlcnRpZXNbaV0ubmFtZSA9PT0gc2VsZWN0b3IpIHtcclxuXHRcdFx0XHRyZXR1cm4gaW5zdGFuY2VQcm9wZXJ0aWVzW2ldLnZhbHVlO1xyXG5cdFx0XHR9XHJcblx0XHRcdGkgKz0gMTtcclxuXHRcdH1cclxuXHRcdHJldHVybiBudWxsO1xyXG5cclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIGhhc1Byb3BlcnR5KHNlbGVjdG9yKSB7XHJcblx0XHRyZXR1cm4gISFnZXRQcm9wZXJ0eUJ5UGF0aChzZWxlY3Rvcik7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBnZXRQcm9wZXJ0eShzZWxlY3Rvcikge1xyXG5cdFx0cmV0dXJuIGdldFByb3BlcnR5QnlQYXRoKHNlbGVjdG9yKTtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIGZyb21LZXlwYXRoTGF5ZXJQb2ludChwb2ludCkge1xyXG5cdFx0cmV0dXJuIHN0YXRlLnBhcmVudC5mcm9tS2V5cGF0aExheWVyUG9pbnQocG9pbnQpO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gdG9LZXlwYXRoTGF5ZXJQb2ludChwb2ludCkge1xyXG5cdFx0cmV0dXJuIHN0YXRlLnBhcmVudC50b0tleXBhdGhMYXllclBvaW50KHBvaW50KTtcclxuXHR9XHJcblxyXG5cdHZhciBtZXRob2RzID0ge1xyXG5cdFx0aGFzUHJvcGVydHk6IGhhc1Byb3BlcnR5LFxyXG5cdFx0Z2V0UHJvcGVydHk6IGdldFByb3BlcnR5LFxyXG5cdFx0ZnJvbUtleXBhdGhMYXllclBvaW50OiBmcm9tS2V5cGF0aExheWVyUG9pbnQsXHJcblx0XHR0b0tleXBhdGhMYXllclBvaW50OiB0b0tleXBhdGhMYXllclBvaW50XHJcblx0fVxyXG5cdHJldHVybiBtZXRob2RzO1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEtleVBhdGhOb2RlOyIsInZhciBLZXlQYXRoTm9kZSA9IHJlcXVpcmUoJy4uL2tleV9wYXRoL0tleVBhdGhOb2RlJyk7XHJcbnZhciBUcmFuc2Zvcm0gPSByZXF1aXJlKCcuL3RyYW5zZm9ybS9UcmFuc2Zvcm0nKTtcclxudmFyIEVmZmVjdHMgPSByZXF1aXJlKCcuL2VmZmVjdHMvRWZmZWN0cycpO1xyXG52YXIgTWF0cml4ID0gcmVxdWlyZSgnLi4vaGVscGVycy90cmFuc2Zvcm1hdGlvbk1hdHJpeCcpO1xyXG5cclxuZnVuY3Rpb24gTGF5ZXJCYXNlKHN0YXRlKSB7XHJcblxyXG5cdHZhciB0cmFuc2Zvcm0gPSBUcmFuc2Zvcm0oc3RhdGUuZWxlbWVudC5maW5hbFRyYW5zZm9ybS5tUHJvcCwgc3RhdGUpO1xyXG5cdHZhciBlZmZlY3RzID0gRWZmZWN0cyhzdGF0ZS5lbGVtZW50LmVmZmVjdHNNYW5hZ2VyLmVmZmVjdEVsZW1lbnRzIHx8IFtdLCBzdGF0ZSk7XHJcblxyXG5cdGZ1bmN0aW9uIF9idWlsZFByb3BlcnR5TWFwKCkge1xyXG5cdFx0c3RhdGUucHJvcGVydGllcy5wdXNoKHtcclxuXHRcdFx0bmFtZTogJ3RyYW5zZm9ybScsXHJcblx0XHRcdHZhbHVlOiB0cmFuc2Zvcm1cclxuXHRcdH0se1xyXG5cdFx0XHRuYW1lOiAnVHJhbnNmb3JtJyxcclxuXHRcdFx0dmFsdWU6IHRyYW5zZm9ybVxyXG5cdFx0fSx7XHJcblx0XHRcdG5hbWU6ICdFZmZlY3RzJyxcclxuXHRcdFx0dmFsdWU6IGVmZmVjdHNcclxuXHRcdH0se1xyXG5cdFx0XHRuYW1lOiAnZWZmZWN0cycsXHJcblx0XHRcdHZhbHVlOiBlZmZlY3RzXHJcblx0XHR9KVxyXG5cdH1cclxuXHJcbiAgICBmdW5jdGlvbiBnZXRFbGVtZW50VG9Qb2ludChwb2ludCkge1xyXG4gICAgfVxyXG5cclxuXHRmdW5jdGlvbiB0b0tleXBhdGhMYXllclBvaW50KHBvaW50KSB7XHJcblx0XHR2YXIgZWxlbWVudCA9IHN0YXRlLmVsZW1lbnQ7XHJcbiAgICBcdGlmKHN0YXRlLnBhcmVudC50b0tleXBhdGhMYXllclBvaW50KSB7XHJcbiAgICAgICAgXHRwb2ludCA9IHN0YXRlLnBhcmVudC50b0tleXBhdGhMYXllclBvaW50KHBvaW50KTtcclxuICAgICAgICB9XHJcbiAgICBcdHZhciB0b1dvcmxkTWF0ID0gTWF0cml4KCk7XHJcbiAgICAgICAgdmFyIHRyYW5zZm9ybU1hdCA9IHN0YXRlLmdldFByb3BlcnR5KCdUcmFuc2Zvcm0nKS5nZXRUYXJnZXRUcmFuc2Zvcm0oKTtcclxuICAgICAgICB0cmFuc2Zvcm1NYXQuYXBwbHlUb01hdHJpeCh0b1dvcmxkTWF0KTtcclxuICAgICAgICBpZihlbGVtZW50LmhpZXJhcmNoeSAmJiBlbGVtZW50LmhpZXJhcmNoeS5sZW5ndGgpe1xyXG4gICAgICAgICAgICB2YXIgaSwgbGVuID0gZWxlbWVudC5oaWVyYXJjaHkubGVuZ3RoO1xyXG4gICAgICAgICAgICBmb3IoaT0wO2k8bGVuO2krPTEpe1xyXG4gICAgICAgICAgICAgICAgZWxlbWVudC5oaWVyYXJjaHlbaV0uZmluYWxUcmFuc2Zvcm0ubVByb3AuYXBwbHlUb01hdHJpeCh0b1dvcmxkTWF0KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdG9Xb3JsZE1hdC5pbnZlcnNlUG9pbnQocG9pbnQpO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gZnJvbUtleXBhdGhMYXllclBvaW50KHBvaW50KSB7XHJcblx0XHR2YXIgZWxlbWVudCA9IHN0YXRlLmVsZW1lbnQ7XHJcblx0XHR2YXIgdG9Xb3JsZE1hdCA9IE1hdHJpeCgpO1xyXG4gICAgICAgIHZhciB0cmFuc2Zvcm1NYXQgPSBzdGF0ZS5nZXRQcm9wZXJ0eSgnVHJhbnNmb3JtJykuZ2V0VGFyZ2V0VHJhbnNmb3JtKCk7XHJcbiAgICAgICAgdHJhbnNmb3JtTWF0LmFwcGx5VG9NYXRyaXgodG9Xb3JsZE1hdCk7XHJcbiAgICAgICAgaWYoZWxlbWVudC5oaWVyYXJjaHkgJiYgZWxlbWVudC5oaWVyYXJjaHkubGVuZ3RoKXtcclxuICAgICAgICAgICAgdmFyIGksIGxlbiA9IGVsZW1lbnQuaGllcmFyY2h5Lmxlbmd0aDtcclxuICAgICAgICAgICAgZm9yKGk9MDtpPGxlbjtpKz0xKXtcclxuICAgICAgICAgICAgICAgIGVsZW1lbnQuaGllcmFyY2h5W2ldLmZpbmFsVHJhbnNmb3JtLm1Qcm9wLmFwcGx5VG9NYXRyaXgodG9Xb3JsZE1hdCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcG9pbnQgPSB0b1dvcmxkTWF0LmFwcGx5VG9Qb2ludEFycmF5KHBvaW50WzBdLHBvaW50WzFdLHBvaW50WzJdfHwwKTtcclxuICAgICAgICBpZihzdGF0ZS5wYXJlbnQuZnJvbUtleXBhdGhMYXllclBvaW50KSB7XHJcbiAgICAgICAgXHRyZXR1cm4gc3RhdGUucGFyZW50LmZyb21LZXlwYXRoTGF5ZXJQb2ludChwb2ludCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICBcdHJldHVybiBwb2ludDtcclxuICAgICAgICB9XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBnZXRUYXJnZXRMYXllcigpIHtcclxuXHRcdHJldHVybiBzdGF0ZS5lbGVtZW50O1xyXG5cdH1cclxuXHJcblx0dmFyIG1ldGhvZHMgPSB7XHJcblx0XHRnZXRUYXJnZXRMYXllcjogZ2V0VGFyZ2V0TGF5ZXIsXHJcblx0XHR0b0tleXBhdGhMYXllclBvaW50OiB0b0tleXBhdGhMYXllclBvaW50LFxyXG5cdFx0ZnJvbUtleXBhdGhMYXllclBvaW50OiBmcm9tS2V5cGF0aExheWVyUG9pbnRcclxuXHR9XHJcblxyXG5cdF9idWlsZFByb3BlcnR5TWFwKCk7XHJcblxyXG5cdHJldHVybiBPYmplY3QuYXNzaWduKHN0YXRlLCBLZXlQYXRoTm9kZShzdGF0ZSksIG1ldGhvZHMpO1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IExheWVyQmFzZTsiLCJ2YXIgbGF5ZXJfdHlwZXMgPSByZXF1aXJlKCcuLi9lbnVtcy9sYXllcl90eXBlcycpO1xyXG52YXIgbGF5ZXJfYXBpID0gcmVxdWlyZSgnLi4vaGVscGVycy9sYXllckFQSUJ1aWxkZXInKTtcclxuXHJcbmZ1bmN0aW9uIExheWVyTGlzdChlbGVtZW50cykge1xyXG5cclxuXHRmdW5jdGlvbiBfZ2V0TGVuZ3RoKCkge1xyXG5cdFx0cmV0dXJuIGVsZW1lbnRzLmxlbmd0aDtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIF9maWx0ZXJMYXllckJ5VHlwZShlbGVtZW50cywgdHlwZSkge1xyXG5cdFx0cmV0dXJuIGVsZW1lbnRzLmZpbHRlcihmdW5jdGlvbihlbGVtZW50KSB7XHJcblx0XHRcdHJldHVybiBlbGVtZW50LmRhdGEudHkgPT09IGxheWVyX3R5cGVzW3R5cGVdO1xyXG5cdFx0fSk7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBfZmlsdGVyTGF5ZXJCeU5hbWUoZWxlbWVudHMsIG5hbWUpIHtcclxuXHRcdHJldHVybiBlbGVtZW50cy5maWx0ZXIoZnVuY3Rpb24oZWxlbWVudCkge1xyXG5cdFx0XHRyZXR1cm4gZWxlbWVudC5kYXRhLm5tID09PSBuYW1lO1xyXG5cdFx0fSk7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBnZXRMYXllcnMoKSB7XHJcblx0XHQgcmV0dXJuIExheWVyTGlzdChlbGVtZW50cyk7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBnZXRMYXllcnNCeVR5cGUodHlwZSkge1xyXG5cdFx0dmFyIGVsZW1lbnRzTGlzdCA9IF9maWx0ZXJMYXllckJ5VHlwZShlbGVtZW50cywgdHlwZSk7XHJcblx0XHRyZXR1cm4gTGF5ZXJMaXN0KGVsZW1lbnRzTGlzdCk7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBnZXRMYXllcnNCeU5hbWUodHlwZSkge1xyXG5cdFx0dmFyIGVsZW1lbnRzTGlzdCA9IF9maWx0ZXJMYXllckJ5TmFtZShlbGVtZW50cywgdHlwZSk7XHJcblx0XHRyZXR1cm4gTGF5ZXJMaXN0KGVsZW1lbnRzTGlzdCk7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBsYXllcihpbmRleCkge1xyXG5cdFx0aWYgKGluZGV4ID49IGVsZW1lbnRzLmxlbmd0aCkge1xyXG5cdFx0XHRyZXR1cm4gW107XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gbGF5ZXJfYXBpKGVsZW1lbnRzW3BhcnNlSW50KGluZGV4KV0pO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gYWRkSXRlcmF0YWJsZU1ldGhvZHMoaXRlcmF0YWJsZU1ldGhvZHMsIGxpc3QpIHtcclxuXHRcdGl0ZXJhdGFibGVNZXRob2RzLnJlZHVjZShmdW5jdGlvbihhY2N1bXVsYXRvciwgdmFsdWUpe1xyXG5cdFx0XHR2YXIgX3ZhbHVlID0gdmFsdWU7XHJcblx0XHRcdGFjY3VtdWxhdG9yW3ZhbHVlXSA9IGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdHZhciBfYXJndW1lbnRzID0gYXJndW1lbnRzO1xyXG5cdFx0XHRcdHJldHVybiBlbGVtZW50cy5tYXAoZnVuY3Rpb24oZWxlbWVudCl7XHJcblx0XHRcdFx0XHR2YXIgbGF5ZXIgPSBsYXllcl9hcGkoZWxlbWVudCk7XHJcblx0XHRcdFx0XHRpZihsYXllcltfdmFsdWVdKSB7XHJcblx0XHRcdFx0XHRcdHJldHVybiBsYXllcltfdmFsdWVdLmFwcGx5KG51bGwsIF9hcmd1bWVudHMpO1xyXG5cdFx0XHRcdFx0fVxyXG5cdFx0XHRcdFx0cmV0dXJuIG51bGw7XHJcblx0XHRcdFx0fSk7XHJcblx0XHRcdH1cclxuXHRcdFx0cmV0dXJuIGFjY3VtdWxhdG9yO1xyXG5cdFx0fSwgbWV0aG9kcyk7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBnZXRUYXJnZXRFbGVtZW50cygpIHtcclxuXHRcdHJldHVybiBlbGVtZW50cztcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIGNvbmNhdChsaXN0KSB7XHJcblx0XHRyZXR1cm4gZWxlbWVudHMuY29uY2F0KGxpc3QuZ2V0VGFyZ2V0RWxlbWVudHMoKSk7XHJcblx0fVxyXG5cclxuXHR2YXIgbWV0aG9kcyA9IHtcclxuXHRcdGdldExheWVyczogZ2V0TGF5ZXJzLFxyXG5cdFx0Z2V0TGF5ZXJzQnlUeXBlOiBnZXRMYXllcnNCeVR5cGUsXHJcblx0XHRnZXRMYXllcnNCeU5hbWU6IGdldExheWVyc0J5TmFtZSxcclxuXHRcdGxheWVyOiBsYXllcixcclxuXHRcdGNvbmNhdDogY29uY2F0LFxyXG5cdFx0Z2V0VGFyZ2V0RWxlbWVudHM6IGdldFRhcmdldEVsZW1lbnRzXHJcblx0fTtcclxuXHJcblx0YWRkSXRlcmF0YWJsZU1ldGhvZHMoWydzZXRUcmFuc2xhdGUnLCAnZ2V0VHlwZScsICdnZXREdXJhdGlvbiddKTtcclxuXHRhZGRJdGVyYXRhYmxlTWV0aG9kcyhbJ3NldFRleHQnLCAnZ2V0VGV4dCcsICdzZXREb2N1bWVudERhdGEnLCAnY2FuUmVzaXplRm9udCcsICdzZXRNaW5pbXVtRm9udFNpemUnXSk7XHJcblxyXG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShtZXRob2RzLCAnbGVuZ3RoJywge1xyXG5cdFx0Z2V0OiBfZ2V0TGVuZ3RoXHJcblx0fSk7XHJcblx0cmV0dXJuIG1ldGhvZHM7XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gTGF5ZXJMaXN0OyIsInZhciBLZXlQYXRoTm9kZSA9IHJlcXVpcmUoJy4uLy4uL2tleV9wYXRoL0tleVBhdGhOb2RlJyk7XHJcbnZhciBQcm9wZXJ0eSA9IHJlcXVpcmUoJy4uLy4uL3Byb3BlcnR5L1Byb3BlcnR5Jyk7XHJcblxyXG5mdW5jdGlvbiBDYW1lcmEoZWxlbWVudCwgcGFyZW50KSB7XHJcblxyXG5cdHZhciBpbnN0YW5jZSA9IHt9O1xyXG5cclxuXHR2YXIgc3RhdGUgPSB7XHJcblx0XHRlbGVtZW50OiBlbGVtZW50LFxyXG5cdFx0cGFyZW50OiBwYXJlbnQsXHJcblx0XHRwcm9wZXJ0aWVzOiBfYnVpbGRQcm9wZXJ0eU1hcCgpXHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBfYnVpbGRQcm9wZXJ0eU1hcCgpIHtcclxuXHRcdHJldHVybiBbXHJcblx0XHRcdHtcclxuXHRcdFx0XHRuYW1lOiAnUG9pbnQgb2YgSW50ZXJlc3QnLFxyXG5cdFx0XHRcdHZhbHVlOiBQcm9wZXJ0eShlbGVtZW50LmEsIHBhcmVudClcclxuXHRcdFx0fSxcclxuXHRcdFx0e1xyXG5cdFx0XHRcdG5hbWU6ICdab29tJyxcclxuXHRcdFx0XHR2YWx1ZTogUHJvcGVydHkoZWxlbWVudC5wZSwgcGFyZW50KVxyXG5cdFx0XHR9LFxyXG5cdFx0XHR7XHJcblx0XHRcdFx0bmFtZTogJ1Bvc2l0aW9uJyxcclxuXHRcdFx0XHR2YWx1ZTogUHJvcGVydHkoZWxlbWVudC5wLCBwYXJlbnQpXHJcblx0XHRcdH0sXHJcblx0XHRcdHtcclxuXHRcdFx0XHRuYW1lOiAnWCBSb3RhdGlvbicsXHJcblx0XHRcdFx0dmFsdWU6IFByb3BlcnR5KGVsZW1lbnQucngsIHBhcmVudClcclxuXHRcdFx0fSxcclxuXHRcdFx0e1xyXG5cdFx0XHRcdG5hbWU6ICdZIFJvdGF0aW9uJyxcclxuXHRcdFx0XHR2YWx1ZTogUHJvcGVydHkoZWxlbWVudC5yeSwgcGFyZW50KVxyXG5cdFx0XHR9LFxyXG5cdFx0XHR7XHJcblx0XHRcdFx0bmFtZTogJ1ogUm90YXRpb24nLFxyXG5cdFx0XHRcdHZhbHVlOiBQcm9wZXJ0eShlbGVtZW50LnJ6LCBwYXJlbnQpXHJcblx0XHRcdH1cclxuXHRcdF1cclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIGdldFRhcmdldExheWVyKCkge1xyXG5cdFx0cmV0dXJuIHN0YXRlLmVsZW1lbnQ7XHJcblx0fVxyXG5cclxuXHR2YXIgbWV0aG9kcyA9IHtcclxuXHRcdGdldFRhcmdldExheWVyOiBnZXRUYXJnZXRMYXllclxyXG5cdH1cclxuXHJcblx0cmV0dXJuIE9iamVjdC5hc3NpZ24oaW5zdGFuY2UsIEtleVBhdGhOb2RlKHN0YXRlKSwgbWV0aG9kcyk7XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQ2FtZXJhOyIsInZhciBLZXlQYXRoTGlzdCA9IHJlcXVpcmUoJy4uLy4uL2tleV9wYXRoL0tleVBhdGhMaXN0Jyk7XHJcbnZhciBMYXllckJhc2UgPSByZXF1aXJlKCcuLi9MYXllckJhc2UnKTtcclxudmFyIGxheWVyX2FwaSA9IHJlcXVpcmUoJy4uLy4uL2hlbHBlcnMvbGF5ZXJBUElCdWlsZGVyJyk7XHJcbnZhciBQcm9wZXJ0eSA9IHJlcXVpcmUoJy4uLy4uL3Byb3BlcnR5L1Byb3BlcnR5Jyk7XHJcbnZhciBUaW1lUmVtYXAgPSByZXF1aXJlKCcuL1RpbWVSZW1hcCcpO1xyXG5cclxuZnVuY3Rpb24gQ29tcG9zaXRpb24oZWxlbWVudCwgcGFyZW50KSB7XHJcblxyXG5cdHZhciBpbnN0YW5jZSA9IHt9O1xyXG5cclxuXHR2YXIgc3RhdGUgPSB7XHJcblx0XHRlbGVtZW50OiBlbGVtZW50LFxyXG5cdFx0cGFyZW50OiBwYXJlbnQsXHJcblx0XHRwcm9wZXJ0aWVzOiBfYnVpbGRQcm9wZXJ0eU1hcCgpXHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBidWlsZExheWVyQXBpKGxheWVyLCBpbmRleCkge1xyXG5cdFx0dmFyIF9sYXllckFwaSA9IG51bGw7XHJcblx0XHR2YXIgb2IgPSB7XHJcblx0XHRcdG5hbWU6IGxheWVyLm5tXHJcblx0XHR9XHJcblxyXG5cdFx0ZnVuY3Rpb24gZ2V0TGF5ZXJBcGkoKSB7XHJcblx0XHRcdGlmKCFfbGF5ZXJBcGkpIHtcclxuXHRcdFx0XHRfbGF5ZXJBcGkgPSBsYXllcl9hcGkoZWxlbWVudC5lbGVtZW50c1tpbmRleF0sIHN0YXRlKVxyXG5cdFx0XHR9XHJcblx0XHRcdHJldHVybiBfbGF5ZXJBcGlcclxuXHRcdH1cclxuXHJcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkob2IsICd2YWx1ZScsIHtcclxuXHRcdFx0Z2V0IDogZ2V0TGF5ZXJBcGlcclxuXHRcdH0pXHJcblx0XHRyZXR1cm4gb2I7XHJcblx0fVxyXG5cclxuXHRcclxuXHRmdW5jdGlvbiBfYnVpbGRQcm9wZXJ0eU1hcCgpIHtcclxuXHRcdHZhciBjb21wb3NpdGlvbkxheWVycyA9IGVsZW1lbnQubGF5ZXJzLm1hcChidWlsZExheWVyQXBpKVxyXG5cdFx0cmV0dXJuIFtcclxuXHRcdFx0e1xyXG5cdFx0XHRcdG5hbWU6ICdUaW1lIFJlbWFwJyxcclxuXHRcdFx0XHR2YWx1ZTogVGltZVJlbWFwKGVsZW1lbnQudG0pXHJcblx0XHRcdH1cclxuXHRcdF0uY29uY2F0KGNvbXBvc2l0aW9uTGF5ZXJzKVxyXG5cdH1cclxuXHJcblx0dmFyIG1ldGhvZHMgPSB7XHJcblx0fVxyXG5cclxuXHRyZXR1cm4gT2JqZWN0LmFzc2lnbihpbnN0YW5jZSwgTGF5ZXJCYXNlKHN0YXRlKSwgS2V5UGF0aExpc3Qoc3RhdGUuZWxlbWVudHMsICdsYXllcicpLCBtZXRob2RzKTtcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBDb21wb3NpdGlvbjsiLCJ2YXIgS2V5UGF0aE5vZGUgPSByZXF1aXJlKCcuLi8uLi9rZXlfcGF0aC9LZXlQYXRoTm9kZScpO1xyXG52YXIgVmFsdWVQcm9wZXJ0eSA9IHJlcXVpcmUoJy4uLy4uL3Byb3BlcnR5L1ZhbHVlUHJvcGVydHknKTtcclxuXHJcbmZ1bmN0aW9uIFRpbWVSZW1hcChwcm9wZXJ0eSwgcGFyZW50KSB7XHJcblx0dmFyIHN0YXRlID0ge1xyXG5cdFx0cHJvcGVydHk6IHByb3BlcnR5LFxyXG5cdFx0cGFyZW50OiBwYXJlbnRcclxuXHR9XHJcblxyXG5cdHZhciBfaXNDYWxsYmFja0FkZGVkID0gZmFsc2U7XHJcblx0dmFyIGN1cnJlbnRTZWdtZW50SW5pdCA9IDA7XHJcblx0dmFyIGN1cnJlbnRTZWdtZW50RW5kID0gMDtcclxuXHR2YXIgcHJldmlvdXNUaW1lID0gMCwgY3VycmVudFRpbWUgPSAwO1xyXG5cdHZhciBpbml0VGltZSA9IDA7XHJcblx0dmFyIF9sb29wID0gdHJ1ZTtcclxuXHR2YXIgX2xvb3BDb3VudCA9IDA7XHJcblx0dmFyIF9zcGVlZCA9IDE7XHJcblx0dmFyIF9wYXVzZWQgPSBmYWxzZTtcclxuXHR2YXIgX2lzRGVidWdnaW5nID0gZmFsc2U7XHJcblx0dmFyIHF1ZXVlZFNlZ21lbnRzID0gW107XHJcblxyXG5cdGZ1bmN0aW9uIHBsYXlTZWdtZW50KGluaXQsIGVuZCwgY2xlYXIpIHtcclxuXHRcdF9wYXVzZWQgPSBmYWxzZTtcclxuXHRcdGlmKGNsZWFyKSB7XHJcblx0XHRcdGNsZWFyUXVldWUoKTtcclxuXHRcdFx0Y3VycmVudFRpbWUgPSBpbml0O1xyXG5cdFx0fVxyXG5cdFx0aWYoX2lzRGVidWdnaW5nKSB7XHJcblx0XHRcdGNvbnNvbGUubG9nKGluaXQsIGVuZCk7XHJcblx0XHR9XHJcblx0XHRfbG9vcENvdW50ID0gMDtcclxuXHRcdHByZXZpb3VzVGltZSA9IERhdGUubm93KCk7XHJcblx0XHRjdXJyZW50U2VnbWVudEluaXQgPSBpbml0O1xyXG5cdFx0Y3VycmVudFNlZ21lbnRFbmQgPSBlbmQ7XHJcblx0XHRhZGRDYWxsYmFjaygpO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gcGxheVF1ZXVlZFNlZ21lbnQoKSB7XHJcblx0XHR2YXIgbmV3U2VnbWVudCA9IHF1ZXVlZFNlZ21lbnRzLnNoaWZ0KCk7XHJcblx0XHRwbGF5U2VnbWVudChuZXdTZWdtZW50WzBdLCBuZXdTZWdtZW50WzFdKTtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIHF1ZXVlU2VnbWVudChpbml0LCBlbmQpIHtcclxuXHRcdHF1ZXVlZFNlZ21lbnRzLnB1c2goW2luaXQsIGVuZF0pO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gY2xlYXJRdWV1ZSgpIHtcclxuXHRcdHF1ZXVlZFNlZ21lbnRzLmxlbmd0aCA9IDA7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBfc2VnbWVudFBsYXllcihjdXJyZW50VmFsdWUpIHtcclxuXHRcdGlmKGN1cnJlbnRTZWdtZW50SW5pdCA9PT0gY3VycmVudFNlZ21lbnRFbmQpIHtcclxuXHRcdFx0Y3VycmVudFRpbWUgPSBjdXJyZW50U2VnbWVudEluaXQ7XHJcblx0XHR9IGVsc2UgaWYoIV9wYXVzZWQpIHtcclxuXHRcdFx0dmFyIG5vd1RpbWUgPSBEYXRlLm5vdygpO1xyXG5cdFx0XHR2YXIgZWxhcHNlZFRpbWUgPSBfc3BlZWQgKiAobm93VGltZSAtIHByZXZpb3VzVGltZSkgLyAxMDAwO1xyXG5cdFx0XHRwcmV2aW91c1RpbWUgPSBub3dUaW1lO1xyXG5cdFx0XHRpZihjdXJyZW50U2VnbWVudEluaXQgPCBjdXJyZW50U2VnbWVudEVuZCkge1xyXG5cdFx0XHRcdGN1cnJlbnRUaW1lICs9IGVsYXBzZWRUaW1lO1xyXG5cdFx0XHRcdGlmKGN1cnJlbnRUaW1lID4gY3VycmVudFNlZ21lbnRFbmQpIHtcclxuXHRcdFx0XHRcdF9sb29wQ291bnQgKz0gMTtcclxuXHRcdFx0XHRcdGlmKHF1ZXVlZFNlZ21lbnRzLmxlbmd0aCkge1xyXG5cdFx0XHRcdFx0XHRwbGF5UXVldWVkU2VnbWVudCgpO1xyXG5cdFx0XHRcdFx0fSBlbHNlIGlmKCFfbG9vcCkge1xyXG5cdFx0XHRcdFx0XHRjdXJyZW50VGltZSA9IGN1cnJlbnRTZWdtZW50RW5kO1xyXG5cdFx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdFx0Y3VycmVudFRpbWUgPSBjdXJyZW50U2VnbWVudEluaXQgKyAoY3VycmVudFRpbWUgLSBjdXJyZW50U2VnbWVudEVuZCk7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdGN1cnJlbnRUaW1lIC09IGVsYXBzZWRUaW1lO1xyXG5cdFx0XHRcdGlmKGN1cnJlbnRUaW1lIDwgY3VycmVudFNlZ21lbnRFbmQpIHtcclxuXHRcdFx0XHRcdF9sb29wQ291bnQgKz0gMTtcclxuXHRcdFx0XHRcdGlmKHF1ZXVlZFNlZ21lbnRzLmxlbmd0aCkge1xyXG5cdFx0XHRcdFx0XHRwbGF5UXVldWVkU2VnbWVudCgpO1xyXG5cdFx0XHRcdFx0fSBlbHNlIGlmKCFfbG9vcCkge1xyXG5cdFx0XHRcdFx0XHRjdXJyZW50VGltZSA9IGN1cnJlbnRTZWdtZW50RW5kO1xyXG5cdFx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdFx0Y3VycmVudFRpbWUgPSBjdXJyZW50U2VnbWVudEluaXQgLSAoY3VycmVudFNlZ21lbnRFbmQgLSBjdXJyZW50VGltZSk7XHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblx0XHRcdGlmKF9pc0RlYnVnZ2luZykge1xyXG5cdFx0XHRcdGNvbnNvbGUubG9nKGN1cnJlbnRUaW1lKVxyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gY3VycmVudFRpbWU7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBhZGRDYWxsYmFjaygpIHtcclxuXHRcdGlmKCFfaXNDYWxsYmFja0FkZGVkKSB7XHJcblx0XHRcdF9pc0NhbGxiYWNrQWRkZWQgPSB0cnVlO1xyXG5cdFx0XHRpbnN0YW5jZS5zZXRWYWx1ZShfc2VnbWVudFBsYXllciwgX2lzRGVidWdnaW5nKVxyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gcGxheVRvKGVuZCwgY2xlYXIpIHtcclxuXHRcdF9wYXVzZWQgPSBmYWxzZTtcclxuXHRcdGlmKGNsZWFyKSB7XHJcblx0XHRcdGNsZWFyUXVldWUoKTtcclxuXHRcdH1cclxuXHRcdGFkZENhbGxiYWNrKCk7XHJcblx0XHRjdXJyZW50U2VnbWVudEVuZCA9IGVuZDtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIGdldEN1cnJlbnRUaW1lKCkge1xyXG5cdFx0aWYoX2lzQ2FsbGJhY2tBZGRlZCkge1xyXG5cdFx0XHRyZXR1cm4gZWxhcHNlZFRpbWU7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHRyZXR1cm4gcHJvcGVydHkudiAvIHByb3BlcnR5Lm11bHQ7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBzZXRMb29wKGZsYWcpIHtcclxuXHRcdF9sb29wID0gZmxhZztcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIHNldFNwZWVkKHZhbHVlKSB7XHJcblx0XHRfc3BlZWQgPSB2YWx1ZTtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIHNldERlYnVnZ2luZyhmbGFnKSB7XHJcblx0XHRfaXNEZWJ1Z2dpbmcgPSBmbGFnO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gcGF1c2UoKSB7XHJcblx0XHRfcGF1c2VkID0gdHJ1ZTtcclxuXHR9XHJcblxyXG5cdHZhciBtZXRob2RzID0ge1xyXG5cdFx0cGxheVNlZ21lbnQ6IHBsYXlTZWdtZW50LFxyXG5cdFx0cGxheVRvOiBwbGF5VG8sXHJcblx0XHRxdWV1ZVNlZ21lbnQ6IHF1ZXVlU2VnbWVudCxcclxuXHRcdGNsZWFyUXVldWU6IGNsZWFyUXVldWUsXHJcblx0XHRzZXRMb29wOiBzZXRMb29wLFxyXG5cdFx0c2V0U3BlZWQ6IHNldFNwZWVkLFxyXG5cdFx0cGF1c2U6IHBhdXNlLFxyXG5cdFx0c2V0RGVidWdnaW5nOiBzZXREZWJ1Z2dpbmcsXHJcblx0XHRnZXRDdXJyZW50VGltZTogZ2V0Q3VycmVudFRpbWVcclxuXHR9XHJcblxyXG5cdHZhciBpbnN0YW5jZSA9IHt9XHJcblxyXG5cdHJldHVybiBPYmplY3QuYXNzaWduKGluc3RhbmNlLCBtZXRob2RzLCBWYWx1ZVByb3BlcnR5KHN0YXRlKSwgS2V5UGF0aE5vZGUoc3RhdGUpKTtcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBUaW1lUmVtYXA7IiwidmFyIFByb3BlcnR5ID0gcmVxdWlyZSgnLi4vLi4vcHJvcGVydHkvUHJvcGVydHknKTtcclxuXHJcbmZ1bmN0aW9uIEVmZmVjdEVsZW1lbnQoZWZmZWN0LCBwYXJlbnQpIHtcclxuXHJcblx0cmV0dXJuIFByb3BlcnR5KGVmZmVjdC5wLCBwYXJlbnQpO1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEVmZmVjdEVsZW1lbnQ7IiwidmFyIEtleVBhdGhOb2RlID0gcmVxdWlyZSgnLi4vLi4va2V5X3BhdGgvS2V5UGF0aE5vZGUnKTtcclxudmFyIFByb3BlcnR5ID0gcmVxdWlyZSgnLi4vLi4vcHJvcGVydHkvUHJvcGVydHknKTtcclxudmFyIEVmZmVjdEVsZW1lbnQgPSByZXF1aXJlKCcuL0VmZmVjdEVsZW1lbnQnKTtcclxuXHJcbmZ1bmN0aW9uIEVmZmVjdHMoZWZmZWN0cywgcGFyZW50KSB7XHJcblxyXG5cdHZhciBzdGF0ZSA9IHtcclxuXHRcdHBhcmVudDogcGFyZW50LFxyXG5cdFx0cHJvcGVydGllczogYnVpbGRQcm9wZXJ0aWVzKClcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIGdldFZhbHVlKGVmZmVjdERhdGEsIGluZGV4KSB7XHJcblx0XHR2YXIgbm0gPSBlZmZlY3REYXRhLmRhdGEgPyBlZmZlY3REYXRhLmRhdGEubm0gOiBpbmRleC50b1N0cmluZygpO1xyXG5cdFx0dmFyIGVmZmVjdEVsZW1lbnQgPSBlZmZlY3REYXRhLmRhdGEgPyBFZmZlY3RzKGVmZmVjdERhdGEuZWZmZWN0RWxlbWVudHMsIHBhcmVudCkgOiBQcm9wZXJ0eShlZmZlY3REYXRhLnAsIHBhcmVudCk7XHJcblx0XHRyZXR1cm4ge1xyXG5cdFx0XHRuYW1lOiBubSxcclxuXHRcdFx0dmFsdWU6IGVmZmVjdEVsZW1lbnRcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIGJ1aWxkUHJvcGVydGllcygpIHtcclxuXHRcdHZhciBpLCBsZW4gPSBlZmZlY3RzLmxlbmd0aDtcclxuXHRcdHZhciBhcnIgPSBbXTtcclxuXHRcdGZvciAoaSA9IDA7IGkgPCBsZW47IGkgKz0gMSkge1xyXG5cdFx0XHRhcnIucHVzaChnZXRWYWx1ZShlZmZlY3RzW2ldLCBpKSk7XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gYXJyO1xyXG5cdH1cclxuXHJcblx0dmFyIG1ldGhvZHMgPSB7XHJcblx0fVxyXG5cclxuXHRyZXR1cm4gT2JqZWN0LmFzc2lnbihtZXRob2RzLCBLZXlQYXRoTm9kZShzdGF0ZSkpO1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEVmZmVjdHM7IiwidmFyIExheWVyQmFzZSA9IHJlcXVpcmUoJy4uL0xheWVyQmFzZScpO1xyXG5cclxuZnVuY3Rpb24gSW1hZ2UoZWxlbWVudCkge1xyXG5cclxuXHR2YXIgbWV0aG9kcyA9IHtcclxuXHR9XHJcblxyXG5cdHJldHVybiBPYmplY3QuYXNzaWduKHt9LCBMYXllckJhc2UoZWxlbWVudCksIG1ldGhvZHMpO1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEltYWdlOyIsInZhciBMYXllckJhc2UgPSByZXF1aXJlKCcuLi9MYXllckJhc2UnKTtcclxuXHJcbmZ1bmN0aW9uIE51bGxFbGVtZW50KGVsZW1lbnQsIHBhcmVudCkge1xyXG5cclxuXHR2YXIgaW5zdGFuY2UgPSB7fTtcclxuXHJcblx0dmFyIHN0YXRlID0ge1xyXG5cdFx0ZWxlbWVudDogZWxlbWVudCxcclxuXHRcdHBhcmVudDogcGFyZW50LFxyXG5cdFx0cHJvcGVydGllczogX2J1aWxkUHJvcGVydHlNYXAoKVxyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gX2J1aWxkUHJvcGVydHlNYXAoKSB7XHJcblx0XHRyZXR1cm4gW1xyXG5cdFx0XVxyXG5cdH1cclxuXHJcblx0dmFyIG1ldGhvZHMgPSB7XHJcblx0fVxyXG5cclxuXHRyZXR1cm4gT2JqZWN0LmFzc2lnbihpbnN0YW5jZSwgTGF5ZXJCYXNlKHN0YXRlKSwgbWV0aG9kcyk7XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gTnVsbEVsZW1lbnQ7IiwidmFyIExheWVyQmFzZSA9IHJlcXVpcmUoJy4uL0xheWVyQmFzZScpO1xyXG52YXIgU2hhcGVDb250ZW50cyA9IHJlcXVpcmUoJy4vU2hhcGVDb250ZW50cycpO1xyXG5cclxuZnVuY3Rpb24gU2hhcGUoZWxlbWVudCwgcGFyZW50KSB7XHJcblxyXG5cdHZhciBzdGF0ZSA9IHtcclxuXHRcdHByb3BlcnRpZXM6IFtdLFxyXG5cdFx0cGFyZW50OiBwYXJlbnQsXHJcblx0XHRlbGVtZW50OiBlbGVtZW50XHJcblx0fVxyXG5cdHZhciBzaGFwZUNvbnRlbnRzID0gU2hhcGVDb250ZW50cyhlbGVtZW50LmRhdGEuc2hhcGVzLCBlbGVtZW50Lml0ZW1zRGF0YSwgc3RhdGUpO1xyXG5cclxuXHRcclxuXHJcblx0ZnVuY3Rpb24gX2J1aWxkUHJvcGVydHlNYXAoKSB7XHJcblx0XHRzdGF0ZS5wcm9wZXJ0aWVzLnB1c2goXHJcblx0XHRcdHtcclxuXHRcdFx0XHRuYW1lOiAnQ29udGVudHMnLFxyXG5cdFx0XHRcdHZhbHVlOiBzaGFwZUNvbnRlbnRzXHJcblx0XHRcdH1cclxuXHRcdClcclxuXHR9XHJcblxyXG5cdHZhciBtZXRob2RzID0ge1xyXG5cdH1cclxuXHJcblx0X2J1aWxkUHJvcGVydHlNYXAoKTtcclxuXHJcblx0cmV0dXJuIE9iamVjdC5hc3NpZ24oc3RhdGUsIExheWVyQmFzZShzdGF0ZSksIG1ldGhvZHMpO1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFNoYXBlOyIsInZhciBLZXlQYXRoTm9kZSA9IHJlcXVpcmUoJy4uLy4uL2tleV9wYXRoL0tleVBhdGhOb2RlJyk7XHJcbnZhciBQcm9wZXJ0eSA9IHJlcXVpcmUoJy4uLy4uL3Byb3BlcnR5L1Byb3BlcnR5Jyk7XHJcbnZhciBTaGFwZVJlY3RhbmdsZSA9IHJlcXVpcmUoJy4vU2hhcGVSZWN0YW5nbGUnKTtcclxudmFyIFNoYXBlRmlsbCA9IHJlcXVpcmUoJy4vU2hhcGVGaWxsJyk7XHJcbnZhciBTaGFwZVN0cm9rZSA9IHJlcXVpcmUoJy4vU2hhcGVTdHJva2UnKTtcclxudmFyIFNoYXBlRWxsaXBzZSA9IHJlcXVpcmUoJy4vU2hhcGVFbGxpcHNlJyk7XHJcbnZhciBTaGFwZUdyYWRpZW50RmlsbCA9IHJlcXVpcmUoJy4vU2hhcGVHcmFkaWVudEZpbGwnKTtcclxudmFyIFNoYXBlR3JhZGllbnRTdHJva2UgPSByZXF1aXJlKCcuL1NoYXBlR3JhZGllbnRTdHJva2UnKTtcclxudmFyIFNoYXBlVHJpbVBhdGhzID0gcmVxdWlyZSgnLi9TaGFwZVRyaW1QYXRocycpO1xyXG52YXIgU2hhcGVSZXBlYXRlciA9IHJlcXVpcmUoJy4vU2hhcGVSZXBlYXRlcicpO1xyXG52YXIgU2hhcGVQb2x5c3RhciA9IHJlcXVpcmUoJy4vU2hhcGVQb2x5c3RhcicpO1xyXG52YXIgU2hhcGVSb3VuZENvcm5lcnMgPSByZXF1aXJlKCcuL1NoYXBlUm91bmRDb3JuZXJzJyk7XHJcbnZhciBTaGFwZVBhdGggPSByZXF1aXJlKCcuL1NoYXBlUGF0aCcpO1xyXG52YXIgVHJhbnNmb3JtID0gcmVxdWlyZSgnLi4vdHJhbnNmb3JtL1RyYW5zZm9ybScpO1xyXG52YXIgTWF0cml4ID0gcmVxdWlyZSgnLi4vLi4vaGVscGVycy90cmFuc2Zvcm1hdGlvbk1hdHJpeCcpO1xyXG5cclxuZnVuY3Rpb24gU2hhcGVDb250ZW50cyhzaGFwZXNEYXRhLCBzaGFwZXMsIHBhcmVudCkge1xyXG5cdHZhciBzdGF0ZSA9IHtcclxuXHRcdHByb3BlcnRpZXM6IF9idWlsZFByb3BlcnR5TWFwKCksXHJcblx0XHRwYXJlbnQ6IHBhcmVudFxyXG5cdH1cclxuXHJcblx0dmFyIGNhY2hlZFNoYXBlUHJvcGVydGllcyA9IFtdO1xyXG5cclxuXHRmdW5jdGlvbiBidWlsZFNoYXBlT2JqZWN0KHNoYXBlLCBpbmRleCkge1xyXG5cdFx0dmFyIG9iID0ge1xyXG5cdFx0XHRuYW1lOiBzaGFwZS5ubVxyXG5cdFx0fVxyXG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KG9iLCAndmFsdWUnLCB7XHJcblx0XHQgICBnZXQoKSB7XHJcblx0XHQgICBcdGlmKGNhY2hlZFNoYXBlUHJvcGVydGllc1tpbmRleF0pIHtcclxuXHRcdCAgIFx0XHRyZXR1cm4gY2FjaGVkU2hhcGVQcm9wZXJ0aWVzW2luZGV4XTtcclxuXHRcdCAgIFx0fSBlbHNlIHtcclxuXHRcdCAgIFx0XHR2YXIgcHJvcGVydHk7XHJcblx0XHQgICBcdH1cclxuXHQgICBcdFx0aWYoc2hhcGUudHkgPT09ICdncicpIHtcclxuXHQgICBcdFx0XHRwcm9wZXJ0eSA9IFNoYXBlQ29udGVudHMoc2hhcGVzRGF0YVtpbmRleF0uaXQsIHNoYXBlc1tpbmRleF0uaXQsIHN0YXRlKTtcclxuXHQgICBcdFx0fSBlbHNlIGlmKHNoYXBlLnR5ID09PSAncmMnKSB7XHJcblx0ICAgXHRcdFx0cHJvcGVydHkgPSBTaGFwZVJlY3RhbmdsZShzaGFwZXNbaW5kZXhdLCBzdGF0ZSk7XHJcblx0ICAgXHRcdH0gZWxzZSBpZihzaGFwZS50eSA9PT0gJ2VsJykge1xyXG5cdCAgIFx0XHRcdHByb3BlcnR5ID0gU2hhcGVFbGxpcHNlKHNoYXBlc1tpbmRleF0sIHN0YXRlKTtcclxuXHQgICBcdFx0fSBlbHNlIGlmKHNoYXBlLnR5ID09PSAnZmwnKSB7XHJcblx0ICAgXHRcdFx0cHJvcGVydHkgPSBTaGFwZUZpbGwoc2hhcGVzW2luZGV4XSwgc3RhdGUpO1xyXG5cdCAgIFx0XHR9IGVsc2UgaWYoc2hhcGUudHkgPT09ICdzdCcpIHtcclxuXHQgICBcdFx0XHRwcm9wZXJ0eSA9IFNoYXBlU3Ryb2tlKHNoYXBlc1tpbmRleF0sIHN0YXRlKTtcclxuXHQgICBcdFx0fSBlbHNlIGlmKHNoYXBlLnR5ID09PSAnZ2YnKSB7XHJcblx0ICAgXHRcdFx0cHJvcGVydHkgPSBTaGFwZUdyYWRpZW50RmlsbChzaGFwZXNbaW5kZXhdLCBzdGF0ZSk7XHJcblx0ICAgXHRcdH0gZWxzZSBpZihzaGFwZS50eSA9PT0gJ2dzJykge1xyXG5cdCAgIFx0XHRcdHByb3BlcnR5ID0gU2hhcGVHcmFkaWVudFN0cm9rZShzaGFwZXNbaW5kZXhdLCBzdGF0ZSk7XHJcblx0ICAgXHRcdH0gZWxzZSBpZihzaGFwZS50eSA9PT0gJ3RtJykge1xyXG5cdCAgIFx0XHRcdHByb3BlcnR5ID0gU2hhcGVUcmltUGF0aHMoc2hhcGVzW2luZGV4XSwgc3RhdGUpO1xyXG5cdCAgIFx0XHR9IGVsc2UgaWYoc2hhcGUudHkgPT09ICdycCcpIHtcclxuXHQgICBcdFx0XHRwcm9wZXJ0eSA9IFNoYXBlUmVwZWF0ZXIoc2hhcGVzW2luZGV4XSwgc3RhdGUpO1xyXG5cdCAgIFx0XHR9IGVsc2UgaWYoc2hhcGUudHkgPT09ICdzcicpIHtcclxuXHQgICBcdFx0XHRwcm9wZXJ0eSA9IFNoYXBlUG9seXN0YXIoc2hhcGVzW2luZGV4XSwgc3RhdGUpO1xyXG5cdCAgIFx0XHR9IGVsc2UgaWYoc2hhcGUudHkgPT09ICdyZCcpIHtcclxuXHQgICBcdFx0XHRwcm9wZXJ0eSA9IFNoYXBlUm91bmRDb3JuZXJzKHNoYXBlc1tpbmRleF0sIHN0YXRlKTtcclxuXHQgICBcdFx0fSBlbHNlIGlmKHNoYXBlLnR5ID09PSAnc2gnKSB7XHJcblx0ICAgXHRcdFx0cHJvcGVydHkgPSBTaGFwZVBhdGgoc2hhcGVzW2luZGV4XSwgc3RhdGUpO1xyXG5cdCAgIFx0XHR9IGVsc2UgaWYoc2hhcGUudHkgPT09ICd0cicpIHtcclxuXHQgICBcdFx0XHRwcm9wZXJ0eSA9IFRyYW5zZm9ybShzaGFwZXNbaW5kZXhdLnRyYW5zZm9ybS5tUHJvcHMsIHN0YXRlKTtcclxuXHQgICBcdFx0fSBlbHNlIHtcclxuXHQgICBcdFx0XHRjb25zb2xlLmxvZyhzaGFwZS50eSk7XHJcblx0ICAgXHRcdH1cclxuXHQgICBcdFx0Y2FjaGVkU2hhcGVQcm9wZXJ0aWVzW2luZGV4XSA9IHByb3BlcnR5O1xyXG5cdCAgIFx0XHRyZXR1cm4gcHJvcGVydHk7XHJcblx0XHQgICB9XHJcblx0XHR9KTtcclxuXHRcdHJldHVybiBvYlxyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gX2J1aWxkUHJvcGVydHlNYXAoKSB7XHJcblx0XHRyZXR1cm4gc2hhcGVzRGF0YS5tYXAoZnVuY3Rpb24oc2hhcGUsIGluZGV4KSB7XHJcblx0XHRcdHJldHVybiBidWlsZFNoYXBlT2JqZWN0KHNoYXBlLCBpbmRleClcclxuXHRcdH0pO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gZnJvbUtleXBhdGhMYXllclBvaW50KHBvaW50KSB7XHJcblx0XHRpZihzdGF0ZS5oYXNQcm9wZXJ0eSgnVHJhbnNmb3JtJykpIHtcclxuICAgIFx0XHR2YXIgdG9Xb3JsZE1hdCA9IE1hdHJpeCgpO1xyXG4gICAgICAgIFx0dmFyIHRyYW5zZm9ybU1hdCA9IHN0YXRlLmdldFByb3BlcnR5KCdUcmFuc2Zvcm0nKS5nZXRUYXJnZXRUcmFuc2Zvcm0oKTtcclxuXHRcdFx0dHJhbnNmb3JtTWF0LmFwcGx5VG9NYXRyaXgodG9Xb3JsZE1hdCk7XHJcbiAgICAgICAgXHRwb2ludCA9IHRvV29ybGRNYXQuYXBwbHlUb1BvaW50QXJyYXkocG9pbnRbMF0scG9pbnRbMV0scG9pbnRbMl18fDApO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIHN0YXRlLnBhcmVudC5mcm9tS2V5cGF0aExheWVyUG9pbnQocG9pbnQpO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gdG9LZXlwYXRoTGF5ZXJQb2ludChwb2ludCkge1xyXG5cdFx0cG9pbnQgPSBzdGF0ZS5wYXJlbnQudG9LZXlwYXRoTGF5ZXJQb2ludChwb2ludCk7XHJcblx0XHRpZihzdGF0ZS5oYXNQcm9wZXJ0eSgnVHJhbnNmb3JtJykpIHtcclxuICAgIFx0XHR2YXIgdG9Xb3JsZE1hdCA9IE1hdHJpeCgpO1xyXG4gICAgICAgIFx0dmFyIHRyYW5zZm9ybU1hdCA9IHN0YXRlLmdldFByb3BlcnR5KCdUcmFuc2Zvcm0nKS5nZXRUYXJnZXRUcmFuc2Zvcm0oKTtcclxuXHRcdFx0dHJhbnNmb3JtTWF0LmFwcGx5VG9NYXRyaXgodG9Xb3JsZE1hdCk7XHJcbiAgICAgICAgXHRwb2ludCA9IHRvV29ybGRNYXQuaW52ZXJzZVBvaW50KHBvaW50KTtcclxuXHRcdH1cclxuXHRcdHJldHVybiBwb2ludDtcclxuXHR9XHJcblxyXG5cdHZhciBtZXRob2RzID0ge1xyXG5cdFx0ZnJvbUtleXBhdGhMYXllclBvaW50OiBmcm9tS2V5cGF0aExheWVyUG9pbnQsXHJcblx0XHR0b0tleXBhdGhMYXllclBvaW50OiB0b0tleXBhdGhMYXllclBvaW50XHJcblx0fVxyXG5cclxuXHQvL3N0YXRlLnByb3BlcnRpZXMgPSBfYnVpbGRQcm9wZXJ0eU1hcCgpO1xyXG5cclxuXHRyZXR1cm4gT2JqZWN0LmFzc2lnbihzdGF0ZSwgS2V5UGF0aE5vZGUoc3RhdGUpLCBtZXRob2RzKVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFNoYXBlQ29udGVudHM7IiwidmFyIEtleVBhdGhOb2RlID0gcmVxdWlyZSgnLi4vLi4va2V5X3BhdGgvS2V5UGF0aE5vZGUnKTtcclxudmFyIFByb3BlcnR5ID0gcmVxdWlyZSgnLi4vLi4vcHJvcGVydHkvUHJvcGVydHknKTtcclxuXHJcbmZ1bmN0aW9uIFNoYXBlRWxsaXBzZShlbGVtZW50LCBwYXJlbnQpIHtcclxuXHJcblx0dmFyIHN0YXRlID0ge1xyXG5cdFx0cGFyZW50OiBwYXJlbnQsXHJcblx0XHRwcm9wZXJ0aWVzOiBfYnVpbGRQcm9wZXJ0eU1hcCgpXHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBfYnVpbGRQcm9wZXJ0eU1hcCgpIHtcclxuXHRcdHJldHVybiBbXHJcblx0XHRcdHtcclxuXHRcdFx0XHRuYW1lOiAnU2l6ZScsXHJcblx0XHRcdFx0dmFsdWU6IFByb3BlcnR5KGVsZW1lbnQuc2gucywgcGFyZW50KVxyXG5cdFx0XHR9LFxyXG5cdFx0XHR7XHJcblx0XHRcdFx0bmFtZTogJ1Bvc2l0aW9uJyxcclxuXHRcdFx0XHR2YWx1ZTogUHJvcGVydHkoZWxlbWVudC5zaC5wLCBwYXJlbnQpXHJcblx0XHRcdH1cclxuXHRcdF1cclxuXHR9XHJcblxyXG5cdHZhciBtZXRob2RzID0ge1xyXG5cdH1cclxuXHJcblx0cmV0dXJuIE9iamVjdC5hc3NpZ24obWV0aG9kcywgS2V5UGF0aE5vZGUoc3RhdGUpKTtcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBTaGFwZUVsbGlwc2U7IiwidmFyIEtleVBhdGhOb2RlID0gcmVxdWlyZSgnLi4vLi4va2V5X3BhdGgvS2V5UGF0aE5vZGUnKTtcclxudmFyIFByb3BlcnR5ID0gcmVxdWlyZSgnLi4vLi4vcHJvcGVydHkvUHJvcGVydHknKTtcclxuXHJcbmZ1bmN0aW9uIFNoYXBlRmlsbChlbGVtZW50LCBwYXJlbnQpIHtcclxuXHJcblx0dmFyIHN0YXRlID0ge1xyXG5cdFx0cGFyZW50OiBwYXJlbnQsXHJcblx0XHRwcm9wZXJ0aWVzOiBfYnVpbGRQcm9wZXJ0eU1hcCgpXHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBfYnVpbGRQcm9wZXJ0eU1hcCgpIHtcclxuXHRcdHJldHVybiBbXHJcblx0XHRcdHtcclxuXHRcdFx0XHRuYW1lOiAnQ29sb3InLFxyXG5cdFx0XHRcdHZhbHVlOiBQcm9wZXJ0eShlbGVtZW50LmMsIHBhcmVudClcclxuXHRcdFx0fSxcclxuXHRcdFx0e1xyXG5cdFx0XHRcdG5hbWU6ICdPcGFjaXR5JyxcclxuXHRcdFx0XHR2YWx1ZToge1xyXG5cdFx0XHRcdFx0c2V0VmFsdWU6IFByb3BlcnR5KGVsZW1lbnQubywgcGFyZW50KVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0XVxyXG5cdH1cclxuXHJcblx0dmFyIG1ldGhvZHMgPSB7XHJcblx0fVxyXG5cclxuXHRyZXR1cm4gT2JqZWN0LmFzc2lnbihtZXRob2RzLCBLZXlQYXRoTm9kZShzdGF0ZSkpO1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFNoYXBlRmlsbDsiLCJ2YXIgS2V5UGF0aE5vZGUgPSByZXF1aXJlKCcuLi8uLi9rZXlfcGF0aC9LZXlQYXRoTm9kZScpO1xyXG52YXIgUHJvcGVydHkgPSByZXF1aXJlKCcuLi8uLi9wcm9wZXJ0eS9Qcm9wZXJ0eScpO1xyXG5cclxuZnVuY3Rpb24gU2hhcGVHcmFkaWVudEZpbGwoZWxlbWVudCwgcGFyZW50KSB7XHJcblxyXG5cdHZhciBzdGF0ZSA9IHtcclxuXHRcdHBhcmVudDogcGFyZW50LFxyXG5cdFx0cHJvcGVydGllczogX2J1aWxkUHJvcGVydHlNYXAoKVxyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gX2J1aWxkUHJvcGVydHlNYXAoKSB7XHJcblx0XHRyZXR1cm4gW1xyXG5cdFx0XHR7XHJcblx0XHRcdFx0bmFtZTogJ1N0YXJ0IFBvaW50JyxcclxuXHRcdFx0XHR2YWx1ZTogUHJvcGVydHkoZWxlbWVudC5zLCBwYXJlbnQpXHJcblx0XHRcdH0sXHJcblx0XHRcdHtcclxuXHRcdFx0XHRuYW1lOiAnRW5kIFBvaW50JyxcclxuXHRcdFx0XHR2YWx1ZTogUHJvcGVydHkoZWxlbWVudC5zLCBwYXJlbnQpXHJcblx0XHRcdH0sXHJcblx0XHRcdHtcclxuXHRcdFx0XHRuYW1lOiAnT3BhY2l0eScsXHJcblx0XHRcdFx0dmFsdWU6IFByb3BlcnR5KGVsZW1lbnQubywgcGFyZW50KVxyXG5cdFx0XHR9LFxyXG5cdFx0XHR7XHJcblx0XHRcdFx0bmFtZTogJ0hpZ2hsaWdodCBMZW5ndGgnLFxyXG5cdFx0XHRcdHZhbHVlOiBQcm9wZXJ0eShlbGVtZW50LmgsIHBhcmVudClcclxuXHRcdFx0fSxcclxuXHRcdFx0e1xyXG5cdFx0XHRcdG5hbWU6ICdIaWdobGlnaHQgQW5nbGUnLFxyXG5cdFx0XHRcdHZhbHVlOiBQcm9wZXJ0eShlbGVtZW50LmEsIHBhcmVudClcclxuXHRcdFx0fSxcclxuXHRcdFx0e1xyXG5cdFx0XHRcdG5hbWU6ICdDb2xvcnMnLFxyXG5cdFx0XHRcdHZhbHVlOiBQcm9wZXJ0eShlbGVtZW50LmcucHJvcCwgcGFyZW50KVxyXG5cdFx0XHR9XHJcblx0XHRdXHJcblx0fVxyXG5cclxuXHR2YXIgbWV0aG9kcyA9IHtcclxuXHR9XHJcblxyXG5cdHJldHVybiBPYmplY3QuYXNzaWduKG1ldGhvZHMsIEtleVBhdGhOb2RlKHN0YXRlKSk7XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gU2hhcGVHcmFkaWVudEZpbGw7IiwidmFyIEtleVBhdGhOb2RlID0gcmVxdWlyZSgnLi4vLi4va2V5X3BhdGgvS2V5UGF0aE5vZGUnKTtcclxudmFyIFByb3BlcnR5ID0gcmVxdWlyZSgnLi4vLi4vcHJvcGVydHkvUHJvcGVydHknKTtcclxuXHJcbmZ1bmN0aW9uIFNoYXBlR3JhZGllbnRTdHJva2UoZWxlbWVudCwgcGFyZW50KSB7XHJcblxyXG5cdHZhciBzdGF0ZSA9IHtcclxuXHRcdHBhcmVudDogcGFyZW50LFxyXG5cdFx0cHJvcGVydGllczogX2J1aWxkUHJvcGVydHlNYXAoKVxyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gX2J1aWxkUHJvcGVydHlNYXAoKSB7XHJcblx0XHRyZXR1cm4gW1xyXG5cdFx0XHR7XHJcblx0XHRcdFx0bmFtZTogJ1N0YXJ0IFBvaW50JyxcclxuXHRcdFx0XHR2YWx1ZTogUHJvcGVydHkoZWxlbWVudC5zLCBwYXJlbnQpXHJcblx0XHRcdH0sXHJcblx0XHRcdHtcclxuXHRcdFx0XHRuYW1lOiAnRW5kIFBvaW50JyxcclxuXHRcdFx0XHR2YWx1ZTogUHJvcGVydHkoZWxlbWVudC5lLCBwYXJlbnQpXHJcblx0XHRcdH0sXHJcblx0XHRcdHtcclxuXHRcdFx0XHRuYW1lOiAnT3BhY2l0eScsXHJcblx0XHRcdFx0dmFsdWU6IFByb3BlcnR5KGVsZW1lbnQubywgcGFyZW50KVxyXG5cdFx0XHR9LFxyXG5cdFx0XHR7XHJcblx0XHRcdFx0bmFtZTogJ0hpZ2hsaWdodCBMZW5ndGgnLFxyXG5cdFx0XHRcdHZhbHVlOiBQcm9wZXJ0eShlbGVtZW50LmgsIHBhcmVudClcclxuXHRcdFx0fSxcclxuXHRcdFx0e1xyXG5cdFx0XHRcdG5hbWU6ICdIaWdobGlnaHQgQW5nbGUnLFxyXG5cdFx0XHRcdHZhbHVlOiBQcm9wZXJ0eShlbGVtZW50LmEsIHBhcmVudClcclxuXHRcdFx0fSxcclxuXHRcdFx0e1xyXG5cdFx0XHRcdG5hbWU6ICdDb2xvcnMnLFxyXG5cdFx0XHRcdHZhbHVlOiBQcm9wZXJ0eShlbGVtZW50LmcucHJvcCwgcGFyZW50KVxyXG5cdFx0XHR9LFxyXG5cdFx0XHR7XHJcblx0XHRcdFx0bmFtZTogJ1N0cm9rZSBXaWR0aCcsXHJcblx0XHRcdFx0dmFsdWU6IFByb3BlcnR5KGVsZW1lbnQudywgcGFyZW50KVxyXG5cdFx0XHR9XHJcblx0XHRdXHJcblx0fVxyXG5cclxuXHR2YXIgbWV0aG9kcyA9IHtcclxuXHR9XHJcblxyXG5cdHJldHVybiBPYmplY3QuYXNzaWduKG1ldGhvZHMsIEtleVBhdGhOb2RlKHN0YXRlKSk7XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gU2hhcGVHcmFkaWVudFN0cm9rZTsiLCJ2YXIgS2V5UGF0aE5vZGUgPSByZXF1aXJlKCcuLi8uLi9rZXlfcGF0aC9LZXlQYXRoTm9kZScpO1xyXG52YXIgUHJvcGVydHkgPSByZXF1aXJlKCcuLi8uLi9wcm9wZXJ0eS9Qcm9wZXJ0eScpO1xyXG5cclxuZnVuY3Rpb24gU2hhcGVQYXRoKGVsZW1lbnQsIHBhcmVudCkge1xyXG5cclxuXHR2YXIgc3RhdGUgPSB7XHJcblx0XHRwYXJlbnQ6IHBhcmVudCxcclxuXHRcdHByb3BlcnRpZXM6IF9idWlsZFByb3BlcnR5TWFwKClcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIHNldFBhdGgodmFsdWUpIHtcclxuXHRcdFByb3BlcnR5KGVsZW1lbnQuc2gpLnNldFZhbHVlKHZhbHVlKTtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIF9idWlsZFByb3BlcnR5TWFwKCkge1xyXG5cdFx0cmV0dXJuIFtcclxuXHRcdFx0e1xyXG5cdFx0XHRcdG5hbWU6ICdwYXRoJyxcclxuXHRcdFx0XHR2YWx1ZTpQcm9wZXJ0eShlbGVtZW50LnNoLCBwYXJlbnQpXHJcblx0XHRcdH1cclxuXHRcdF1cclxuXHR9XHJcblxyXG5cdHZhciBtZXRob2RzID0ge1xyXG5cdH1cclxuXHJcblx0cmV0dXJuIE9iamVjdC5hc3NpZ24obWV0aG9kcywgS2V5UGF0aE5vZGUoc3RhdGUpKTtcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBTaGFwZVBhdGg7IiwidmFyIEtleVBhdGhOb2RlID0gcmVxdWlyZSgnLi4vLi4va2V5X3BhdGgvS2V5UGF0aE5vZGUnKTtcclxudmFyIFByb3BlcnR5ID0gcmVxdWlyZSgnLi4vLi4vcHJvcGVydHkvUHJvcGVydHknKTtcclxuXHJcbmZ1bmN0aW9uIFNoYXBlUG9seXN0YXIoZWxlbWVudCwgcGFyZW50KSB7XHJcblxyXG5cdHZhciBzdGF0ZSA9IHtcclxuXHRcdHBhcmVudDogcGFyZW50LFxyXG5cdFx0cHJvcGVydGllczogX2J1aWxkUHJvcGVydHlNYXAoKVxyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gX2J1aWxkUHJvcGVydHlNYXAoKSB7XHJcblx0XHRyZXR1cm4gW1xyXG5cdFx0XHR7XHJcblx0XHRcdFx0bmFtZTogJ1BvaW50cycsXHJcblx0XHRcdFx0dmFsdWU6IFByb3BlcnR5KGVsZW1lbnQuc2gucHQsIHBhcmVudClcclxuXHRcdFx0fSxcclxuXHRcdFx0e1xyXG5cdFx0XHRcdG5hbWU6ICdQb3NpdGlvbicsXHJcblx0XHRcdFx0dmFsdWU6IFByb3BlcnR5KGVsZW1lbnQuc2gucCwgcGFyZW50KVxyXG5cdFx0XHR9LFxyXG5cdFx0XHR7XHJcblx0XHRcdFx0bmFtZTogJ1JvdGF0aW9uJyxcclxuXHRcdFx0XHR2YWx1ZTogUHJvcGVydHkoZWxlbWVudC5zaC5yLCBwYXJlbnQpXHJcblx0XHRcdH0sXHJcblx0XHRcdHtcclxuXHRcdFx0XHRuYW1lOiAnSW5uZXIgUmFkaXVzJyxcclxuXHRcdFx0XHR2YWx1ZTogUHJvcGVydHkoZWxlbWVudC5zaC5pciwgcGFyZW50KVxyXG5cdFx0XHR9LFxyXG5cdFx0XHR7XHJcblx0XHRcdFx0bmFtZTogJ091dGVyIFJhZGl1cycsXHJcblx0XHRcdFx0dmFsdWU6IFByb3BlcnR5KGVsZW1lbnQuc2gub3IsIHBhcmVudClcclxuXHRcdFx0fSxcclxuXHRcdFx0e1xyXG5cdFx0XHRcdG5hbWU6ICdJbm5lciBSb3VuZG5lc3MnLFxyXG5cdFx0XHRcdHZhbHVlOiBQcm9wZXJ0eShlbGVtZW50LnNoLmlzLCBwYXJlbnQpXHJcblx0XHRcdH0sXHJcblx0XHRcdHtcclxuXHRcdFx0XHRuYW1lOiAnT3V0ZXIgUm91bmRuZXNzJyxcclxuXHRcdFx0XHR2YWx1ZTogUHJvcGVydHkoZWxlbWVudC5zaC5vcywgcGFyZW50KVxyXG5cdFx0XHR9XHJcblx0XHRdXHJcblx0fVxyXG5cclxuXHR2YXIgbWV0aG9kcyA9IHtcclxuXHR9XHJcblxyXG5cdHJldHVybiBPYmplY3QuYXNzaWduKG1ldGhvZHMsIEtleVBhdGhOb2RlKHN0YXRlKSk7XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gU2hhcGVQb2x5c3RhcjsiLCJ2YXIgS2V5UGF0aE5vZGUgPSByZXF1aXJlKCcuLi8uLi9rZXlfcGF0aC9LZXlQYXRoTm9kZScpO1xyXG52YXIgUHJvcGVydHkgPSByZXF1aXJlKCcuLi8uLi9wcm9wZXJ0eS9Qcm9wZXJ0eScpO1xyXG5cclxuZnVuY3Rpb24gU2hhcGVSZWN0YW5nbGUoZWxlbWVudCwgcGFyZW50KSB7XHJcblxyXG5cdHZhciBzdGF0ZSA9IHtcclxuXHRcdHBhcmVudDogcGFyZW50LFxyXG5cdFx0cHJvcGVydGllczogX2J1aWxkUHJvcGVydHlNYXAoKVxyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gX2J1aWxkUHJvcGVydHlNYXAoKSB7XHJcblx0XHRyZXR1cm4gW1xyXG5cdFx0XHR7XHJcblx0XHRcdFx0bmFtZTogJ1NpemUnLFxyXG5cdFx0XHRcdHZhbHVlOiBQcm9wZXJ0eShlbGVtZW50LnNoLnMsIHBhcmVudClcclxuXHRcdFx0fSxcclxuXHRcdFx0e1xyXG5cdFx0XHRcdG5hbWU6ICdQb3NpdGlvbicsXHJcblx0XHRcdFx0dmFsdWU6IFByb3BlcnR5KGVsZW1lbnQuc2gucCwgcGFyZW50KVxyXG5cdFx0XHR9LFxyXG5cdFx0XHR7XHJcblx0XHRcdFx0bmFtZTogJ1JvdW5kbmVzcycsXHJcblx0XHRcdFx0dmFsdWU6IFByb3BlcnR5KGVsZW1lbnQuc2guciwgcGFyZW50KVxyXG5cdFx0XHR9XHJcblx0XHRdXHJcblx0fVxyXG5cclxuXHR2YXIgbWV0aG9kcyA9IHtcclxuXHR9XHJcblxyXG5cdHJldHVybiBPYmplY3QuYXNzaWduKG1ldGhvZHMsIEtleVBhdGhOb2RlKHN0YXRlKSk7XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gU2hhcGVSZWN0YW5nbGU7IiwidmFyIEtleVBhdGhOb2RlID0gcmVxdWlyZSgnLi4vLi4va2V5X3BhdGgvS2V5UGF0aE5vZGUnKTtcclxudmFyIFByb3BlcnR5ID0gcmVxdWlyZSgnLi4vLi4vcHJvcGVydHkvUHJvcGVydHknKTtcclxudmFyIFRyYW5zZm9ybSA9IHJlcXVpcmUoJy4uL3RyYW5zZm9ybS9UcmFuc2Zvcm0nKTtcclxuXHJcbmZ1bmN0aW9uIFNoYXBlUmVwZWF0ZXIoZWxlbWVudCwgcGFyZW50KSB7XHJcblxyXG5cdHZhciBzdGF0ZSA9IHtcclxuXHRcdHBhcmVudDogcGFyZW50LFxyXG5cdFx0cHJvcGVydGllczogX2J1aWxkUHJvcGVydHlNYXAoKVxyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gX2J1aWxkUHJvcGVydHlNYXAoKSB7XHJcblx0XHRyZXR1cm4gW1xyXG5cdFx0XHR7XHJcblx0XHRcdFx0bmFtZTogJ0NvcGllcycsXHJcblx0XHRcdFx0dmFsdWU6IFByb3BlcnR5KGVsZW1lbnQuYywgcGFyZW50KVxyXG5cdFx0XHR9LFxyXG5cdFx0XHR7XHJcblx0XHRcdFx0bmFtZTogJ09mZnNldCcsXHJcblx0XHRcdFx0dmFsdWU6IFByb3BlcnR5KGVsZW1lbnQubywgcGFyZW50KVxyXG5cdFx0XHR9LFxyXG5cdFx0XHR7XHJcblx0XHRcdFx0bmFtZTogJ1RyYW5zZm9ybScsXHJcblx0XHRcdFx0dmFsdWU6IFRyYW5zZm9ybShlbGVtZW50LnRyLCBwYXJlbnQpXHJcblx0XHRcdH1cclxuXHRcdF1cclxuXHR9XHJcblxyXG5cdHZhciBtZXRob2RzID0ge1xyXG5cdH1cclxuXHJcblx0cmV0dXJuIE9iamVjdC5hc3NpZ24obWV0aG9kcywgS2V5UGF0aE5vZGUoc3RhdGUpKTtcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBTaGFwZVJlcGVhdGVyOyIsInZhciBLZXlQYXRoTm9kZSA9IHJlcXVpcmUoJy4uLy4uL2tleV9wYXRoL0tleVBhdGhOb2RlJyk7XHJcbnZhciBQcm9wZXJ0eSA9IHJlcXVpcmUoJy4uLy4uL3Byb3BlcnR5L1Byb3BlcnR5Jyk7XHJcblxyXG5mdW5jdGlvbiBTaGFwZVJvdW5kQ29ybmVycyhlbGVtZW50LCBwYXJlbnQpIHtcclxuXHJcblx0dmFyIHN0YXRlID0ge1xyXG5cdFx0cGFyZW50OiBwYXJlbnQsXHJcblx0XHRwcm9wZXJ0aWVzOiBfYnVpbGRQcm9wZXJ0eU1hcCgpXHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBfYnVpbGRQcm9wZXJ0eU1hcCgpIHtcclxuXHRcdHJldHVybiBbXHJcblx0XHRcdHtcclxuXHRcdFx0XHRuYW1lOiAnUmFkaXVzJyxcclxuXHRcdFx0XHR2YWx1ZTogUHJvcGVydHkoZWxlbWVudC5yZCwgcGFyZW50KVxyXG5cdFx0XHR9XHJcblx0XHRdXHJcblx0fVxyXG5cclxuXHR2YXIgbWV0aG9kcyA9IHtcclxuXHR9XHJcblxyXG5cdHJldHVybiBPYmplY3QuYXNzaWduKG1ldGhvZHMsIEtleVBhdGhOb2RlKHN0YXRlKSk7XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gU2hhcGVSb3VuZENvcm5lcnM7IiwidmFyIEtleVBhdGhOb2RlID0gcmVxdWlyZSgnLi4vLi4va2V5X3BhdGgvS2V5UGF0aE5vZGUnKTtcclxudmFyIFByb3BlcnR5ID0gcmVxdWlyZSgnLi4vLi4vcHJvcGVydHkvUHJvcGVydHknKTtcclxuXHJcbmZ1bmN0aW9uIFNoYXBlU3Ryb2tlKGVsZW1lbnQsIHBhcmVudCkge1xyXG5cdHZhciBzdGF0ZSA9IHtcclxuXHRcdHBhcmVudDogcGFyZW50LFxyXG5cdFx0cHJvcGVydGllczogX2J1aWxkUHJvcGVydHlNYXAoKVxyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gX2J1aWxkUHJvcGVydHlNYXAoKSB7XHJcblx0XHRyZXR1cm4gW1xyXG5cdFx0XHR7XHJcblx0XHRcdFx0bmFtZTogJ2NvbG9yJyxcclxuXHRcdFx0XHR2YWx1ZTogUHJvcGVydHkoZWxlbWVudC5jLCBwYXJlbnQpXHJcblx0XHRcdH0sXHJcblx0XHRcdHtcclxuXHRcdFx0XHRuYW1lOiAnc3Ryb2tlIHdpZHRoJyxcclxuXHRcdFx0XHR2YWx1ZTogUHJvcGVydHkoZWxlbWVudC53LCBwYXJlbnQpXHJcblx0XHRcdH0sXHJcblx0XHRcdHtcclxuXHRcdFx0XHRuYW1lOiAnb3BhY2l0eScsXHJcblx0XHRcdFx0dmFsdWU6IFByb3BlcnR5KGVsZW1lbnQubywgcGFyZW50KVxyXG5cdFx0XHR9XHJcblx0XHRdXHJcblx0fVxyXG5cclxuXHR2YXIgbWV0aG9kcyA9IHtcclxuXHR9XHJcblxyXG5cdHJldHVybiBPYmplY3QuYXNzaWduKG1ldGhvZHMsIEtleVBhdGhOb2RlKHN0YXRlKSk7XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gU2hhcGVTdHJva2UiLCJ2YXIgS2V5UGF0aE5vZGUgPSByZXF1aXJlKCcuLi8uLi9rZXlfcGF0aC9LZXlQYXRoTm9kZScpO1xyXG52YXIgUHJvcGVydHkgPSByZXF1aXJlKCcuLi8uLi9wcm9wZXJ0eS9Qcm9wZXJ0eScpO1xyXG5cclxuZnVuY3Rpb24gU2hhcGVUcmltUGF0aHMoZWxlbWVudCwgcGFyZW50KSB7XHJcblxyXG5cdHZhciBzdGF0ZSA9IHtcclxuXHRcdHBhcmVudDogcGFyZW50LFxyXG5cdFx0cHJvcGVydGllczogX2J1aWxkUHJvcGVydHlNYXAoKVxyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gX2J1aWxkUHJvcGVydHlNYXAoKSB7XHJcblx0XHRyZXR1cm4gW1xyXG5cdFx0XHR7XHJcblx0XHRcdFx0bmFtZTogJ1N0YXJ0JyxcclxuXHRcdFx0XHR2YWx1ZTogUHJvcGVydHkoZWxlbWVudC5zLCBwYXJlbnQpXHJcblx0XHRcdH0sXHJcblx0XHRcdHtcclxuXHRcdFx0XHRuYW1lOiAnRW5kJyxcclxuXHRcdFx0XHR2YWx1ZTogUHJvcGVydHkoZWxlbWVudC5lLCBwYXJlbnQpXHJcblx0XHRcdH0sXHJcblx0XHRcdHtcclxuXHRcdFx0XHRuYW1lOiAnT2Zmc2V0JyxcclxuXHRcdFx0XHR2YWx1ZTogUHJvcGVydHkoZWxlbWVudC5vLCBwYXJlbnQpXHJcblx0XHRcdH1cclxuXHRcdF1cclxuXHR9XHJcblxyXG5cdHZhciBtZXRob2RzID0ge1xyXG5cdH1cclxuXHJcblx0cmV0dXJuIE9iamVjdC5hc3NpZ24obWV0aG9kcywgS2V5UGF0aE5vZGUoc3RhdGUpKTtcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBTaGFwZVRyaW1QYXRoczsiLCJ2YXIgTGF5ZXJCYXNlID0gcmVxdWlyZSgnLi4vTGF5ZXJCYXNlJyk7XHJcblxyXG5mdW5jdGlvbiBTb2xpZChlbGVtZW50LCBwYXJlbnQpIHtcclxuXHJcblx0dmFyIHN0YXRlID0ge1xyXG5cdFx0ZWxlbWVudDogZWxlbWVudCxcclxuXHRcdHBhcmVudDogcGFyZW50LFxyXG5cdFx0cHJvcGVydGllczogX2J1aWxkUHJvcGVydHlNYXAoKVxyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gX2J1aWxkUHJvcGVydHlNYXAoKSB7XHJcblx0XHRyZXR1cm4gW1xyXG5cdFx0XVxyXG5cdH1cclxuXHJcblx0dmFyIG1ldGhvZHMgPSB7XHJcblx0fVxyXG5cclxuXHRyZXR1cm4gT2JqZWN0LmFzc2lnbih7fSwgTGF5ZXJCYXNlKHN0YXRlKSwgbWV0aG9kcyk7XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gU29saWQ7IiwidmFyIEtleVBhdGhOb2RlID0gcmVxdWlyZSgnLi4vLi4va2V5X3BhdGgvS2V5UGF0aE5vZGUnKTtcclxudmFyIFByb3BlcnR5ID0gcmVxdWlyZSgnLi4vLi4vcHJvcGVydHkvUHJvcGVydHknKTtcclxudmFyIFRleHRBbmltYXRvciA9IHJlcXVpcmUoJy4vVGV4dEFuaW1hdG9yJyk7XHJcblxyXG5mdW5jdGlvbiBUZXh0KGVsZW1lbnQsIHBhcmVudCkge1xyXG5cclxuXHR2YXIgaW5zdGFuY2UgPSB7fVxyXG5cclxuXHR2YXIgc3RhdGUgPSB7XHJcblx0XHRlbGVtZW50OiBlbGVtZW50LFxyXG5cdFx0cGFyZW50OiBwYXJlbnQsXHJcblx0XHRwcm9wZXJ0aWVzOiBfYnVpbGRQcm9wZXJ0eU1hcCgpXHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBzZXREb2N1bWVudERhdGEoX2Z1bmN0aW9uKSB7XHJcblx0XHR2YXIgcHJldmlvdXNWYWx1ZTtcclxuXHRcdHNldEludGVydmFsKGZ1bmN0aW9uKCkge1xyXG5cdFx0XHR2YXIgbmV3VmFsdWUgPSBfZnVuY3Rpb24oZWxlbWVudC50ZXh0UHJvcGVydHkuY3VycmVudERhdGEpO1xyXG5cdFx0XHRpZiAocHJldmlvdXNWYWx1ZSAhPT0gbmV3VmFsdWUpIHtcclxuXHRcdFx0XHRlbGVtZW50LnVwZGF0ZURvY3VtZW50RGF0YShuZXdWYWx1ZSlcclxuXHRcdFx0fVxyXG5cdFx0fSwgNTAwKVxyXG5cdFx0Y29uc29sZS5sb2coZWxlbWVudClcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIGFkZEFuaW1hdG9ycygpIHtcclxuXHRcdHZhciBhbmltYXRvclByb3BlcnRpZXMgPSBbXTtcclxuXHRcdHZhciBhbmltYXRvcnMgPSBlbGVtZW50LnRleHRBbmltYXRvci5fYW5pbWF0b3JzRGF0YTtcclxuXHRcdHZhciBpLCBsZW4gPSBhbmltYXRvcnMubGVuZ3RoO1xyXG5cdFx0dmFyIHRleHRBbmltYXRvcjtcclxuXHRcdGZvciAoaSA9IDA7IGkgPCBsZW47IGkgKz0gMSkge1xyXG5cdFx0XHR0ZXh0QW5pbWF0b3IgPSBUZXh0QW5pbWF0b3IoYW5pbWF0b3JzW2ldKVxyXG5cdFx0XHRhbmltYXRvclByb3BlcnRpZXMucHVzaCh7XHJcblx0XHRcdFx0bmFtZTogZWxlbWVudC50ZXh0QW5pbWF0b3IuX3RleHREYXRhLmFbaV0ubm0gfHwgJ0FuaW1hdG9yICcgKyAoaSsxKSwgLy9GYWxsYmFjayBmb3Igb2xkIGFuaW1hdGlvbnNcclxuXHRcdFx0XHR2YWx1ZTogdGV4dEFuaW1hdG9yXHJcblx0XHRcdH0pXHJcblx0XHR9XHJcblx0XHRyZXR1cm4gYW5pbWF0b3JQcm9wZXJ0aWVzO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gX2J1aWxkUHJvcGVydHlNYXAoKSB7XHJcblx0XHRyZXR1cm4gW1xyXG5cdFx0XHR7XHJcblx0XHRcdFx0bmFtZTonU291cmNlJyxcclxuXHRcdFx0XHR2YWx1ZToge1xyXG5cdFx0XHRcdFx0c2V0VmFsdWU6IHNldERvY3VtZW50RGF0YVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0XS5jb25jYXQoYWRkQW5pbWF0b3JzKCkpXHJcblx0fVxyXG5cclxuXHR2YXIgbWV0aG9kcyA9IHtcclxuXHR9XHJcblxyXG5cdHJldHVybiBPYmplY3QuYXNzaWduKGluc3RhbmNlLCBtZXRob2RzLCBLZXlQYXRoTm9kZShzdGF0ZSkpO1xyXG5cclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBUZXh0OyIsInZhciBLZXlQYXRoTm9kZSA9IHJlcXVpcmUoJy4uLy4uL2tleV9wYXRoL0tleVBhdGhOb2RlJyk7XHJcbnZhciBQcm9wZXJ0eSA9IHJlcXVpcmUoJy4uLy4uL3Byb3BlcnR5L1Byb3BlcnR5Jyk7XHJcblxyXG5mdW5jdGlvbiBUZXh0QW5pbWF0b3IoYW5pbWF0b3IpIHtcclxuXHJcblx0dmFyIGluc3RhbmNlID0ge31cclxuXHJcblx0dmFyIHN0YXRlID0ge1xyXG5cdFx0cHJvcGVydGllczogX2J1aWxkUHJvcGVydHlNYXAoKVxyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gc2V0QW5jaG9yUG9pbnQodmFsdWUpIHtcclxuXHRcdFByb3BlcnR5KGFuaW1hdG9yLmEuYSkuc2V0VmFsdWUodmFsdWUpO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gc2V0RmlsbEJyaWdodG5lc3ModmFsdWUpIHtcclxuXHRcdFByb3BlcnR5KGFuaW1hdG9yLmEuZmIpLnNldFZhbHVlKHZhbHVlKTtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIHNldEZpbGxDb2xvcih2YWx1ZSkge1xyXG5cdFx0UHJvcGVydHkoYW5pbWF0b3IuYS5mYykuc2V0VmFsdWUodmFsdWUpO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gc2V0RmlsbEh1ZSh2YWx1ZSkge1xyXG5cdFx0UHJvcGVydHkoYW5pbWF0b3IuYS5maCkuc2V0VmFsdWUodmFsdWUpO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gc2V0RmlsbFNhdHVyYXRpb24odmFsdWUpIHtcclxuXHRcdFByb3BlcnR5KGFuaW1hdG9yLmEuZnMpLnNldFZhbHVlKHZhbHVlKTtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIHNldEZpbGxPcGFjaXR5KHZhbHVlKSB7XHJcblx0XHRQcm9wZXJ0eShhbmltYXRvci5hLmZvKS5zZXRWYWx1ZSh2YWx1ZSk7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBzZXRPcGFjaXR5KHZhbHVlKSB7XHJcblx0XHRQcm9wZXJ0eShhbmltYXRvci5hLm8pLnNldFZhbHVlKHZhbHVlKTtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIHNldFBvc2l0aW9uKHZhbHVlKSB7XHJcblx0XHRQcm9wZXJ0eShhbmltYXRvci5hLnApLnNldFZhbHVlKHZhbHVlKTtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIHNldFJvdGF0aW9uKHZhbHVlKSB7XHJcblx0XHRQcm9wZXJ0eShhbmltYXRvci5hLnIpLnNldFZhbHVlKHZhbHVlKTtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIHNldFJvdGF0aW9uWCh2YWx1ZSkge1xyXG5cdFx0UHJvcGVydHkoYW5pbWF0b3IuYS5yeCkuc2V0VmFsdWUodmFsdWUpO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gc2V0Um90YXRpb25ZKHZhbHVlKSB7XHJcblx0XHRQcm9wZXJ0eShhbmltYXRvci5hLnJ5KS5zZXRWYWx1ZSh2YWx1ZSk7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBzZXRTY2FsZSh2YWx1ZSkge1xyXG5cdFx0UHJvcGVydHkoYW5pbWF0b3IuYS5zKS5zZXRWYWx1ZSh2YWx1ZSk7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBzZXRTa2V3QXhpcyh2YWx1ZSkge1xyXG5cdFx0UHJvcGVydHkoYW5pbWF0b3IuYS5zYSkuc2V0VmFsdWUodmFsdWUpO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gc2V0U3Ryb2tlQ29sb3IodmFsdWUpIHtcclxuXHRcdFByb3BlcnR5KGFuaW1hdG9yLmEuc2MpLnNldFZhbHVlKHZhbHVlKTtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIHNldFNrZXcodmFsdWUpIHtcclxuXHRcdFByb3BlcnR5KGFuaW1hdG9yLmEuc2spLnNldFZhbHVlKHZhbHVlKTtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIHNldFN0cm9rZU9wYWNpdHkodmFsdWUpIHtcclxuXHRcdFByb3BlcnR5KGFuaW1hdG9yLmEuc28pLnNldFZhbHVlKHZhbHVlKTtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIHNldFN0cm9rZVdpZHRoKHZhbHVlKSB7XHJcblx0XHRQcm9wZXJ0eShhbmltYXRvci5hLnN3KS5zZXRWYWx1ZSh2YWx1ZSk7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBzZXRTdHJva2VCcmlnaHRuZXNzKHZhbHVlKSB7XHJcblx0XHRQcm9wZXJ0eShhbmltYXRvci5hLnNiKS5zZXRWYWx1ZSh2YWx1ZSk7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBzZXRTdHJva2VIdWUodmFsdWUpIHtcclxuXHRcdFByb3BlcnR5KGFuaW1hdG9yLmEuc2gpLnNldFZhbHVlKHZhbHVlKTtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIHNldFN0cm9rZVNhdHVyYXRpb24odmFsdWUpIHtcclxuXHRcdFByb3BlcnR5KGFuaW1hdG9yLmEuc3MpLnNldFZhbHVlKHZhbHVlKTtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIHNldFRyYWNraW5nQW1vdW50KHZhbHVlKSB7XHJcblx0XHRQcm9wZXJ0eShhbmltYXRvci5hLnQpLnNldFZhbHVlKHZhbHVlKTtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIF9idWlsZFByb3BlcnR5TWFwKCkge1xyXG5cdFx0cmV0dXJuIFtcclxuXHRcdFx0e1xyXG5cdFx0XHRcdG5hbWU6J0FuY2hvciBQb2ludCcsXHJcblx0XHRcdFx0dmFsdWU6IHtcclxuXHRcdFx0XHRcdHNldFZhbHVlOiBzZXRBbmNob3JQb2ludFxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSxcclxuXHRcdFx0e1xyXG5cdFx0XHRcdG5hbWU6J0ZpbGwgQnJpZ2h0bmVzcycsXHJcblx0XHRcdFx0dmFsdWU6IHtcclxuXHRcdFx0XHRcdHNldFZhbHVlOiBzZXRGaWxsQnJpZ2h0bmVzc1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSxcclxuXHRcdFx0e1xyXG5cdFx0XHRcdG5hbWU6J0ZpbGwgQ29sb3InLFxyXG5cdFx0XHRcdHZhbHVlOiB7XHJcblx0XHRcdFx0XHRzZXRWYWx1ZTogc2V0RmlsbENvbG9yXHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9LFxyXG5cdFx0XHR7XHJcblx0XHRcdFx0bmFtZTonRmlsbCBIdWUnLFxyXG5cdFx0XHRcdHZhbHVlOiB7XHJcblx0XHRcdFx0XHRzZXRWYWx1ZTogc2V0RmlsbEh1ZVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSxcclxuXHRcdFx0e1xyXG5cdFx0XHRcdG5hbWU6J0ZpbGwgU2F0dXJhdGlvbicsXHJcblx0XHRcdFx0dmFsdWU6IHtcclxuXHRcdFx0XHRcdHNldFZhbHVlOiBzZXRGaWxsU2F0dXJhdGlvblxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSxcclxuXHRcdFx0e1xyXG5cdFx0XHRcdG5hbWU6J0ZpbGwgT3BhY2l0eScsXHJcblx0XHRcdFx0dmFsdWU6IHtcclxuXHRcdFx0XHRcdHNldFZhbHVlOiBzZXRGaWxsT3BhY2l0eVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSxcclxuXHRcdFx0e1xyXG5cdFx0XHRcdG5hbWU6J09wYWNpdHknLFxyXG5cdFx0XHRcdHZhbHVlOiB7XHJcblx0XHRcdFx0XHRzZXRWYWx1ZTogc2V0T3BhY2l0eVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSxcclxuXHRcdFx0e1xyXG5cdFx0XHRcdG5hbWU6J1Bvc2l0aW9uJyxcclxuXHRcdFx0XHR2YWx1ZToge1xyXG5cdFx0XHRcdFx0c2V0VmFsdWU6IHNldFBvc2l0aW9uXHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9LFxyXG5cdFx0XHR7XHJcblx0XHRcdFx0bmFtZTonUm90YXRpb24gWCcsXHJcblx0XHRcdFx0dmFsdWU6IHtcclxuXHRcdFx0XHRcdHNldFZhbHVlOiBzZXRSb3RhdGlvblhcclxuXHRcdFx0XHR9XHJcblx0XHRcdH0sXHJcblx0XHRcdHtcclxuXHRcdFx0XHRuYW1lOidSb3RhdGlvbiBZJyxcclxuXHRcdFx0XHR2YWx1ZToge1xyXG5cdFx0XHRcdFx0c2V0VmFsdWU6IHNldFJvdGF0aW9uWVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSxcclxuXHRcdFx0e1xyXG5cdFx0XHRcdG5hbWU6J1NjYWxlJyxcclxuXHRcdFx0XHR2YWx1ZToge1xyXG5cdFx0XHRcdFx0c2V0VmFsdWU6IHNldFNjYWxlXHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9LFxyXG5cdFx0XHR7XHJcblx0XHRcdFx0bmFtZTonU2tldyBBeGlzJyxcclxuXHRcdFx0XHR2YWx1ZToge1xyXG5cdFx0XHRcdFx0c2V0VmFsdWU6IHNldFNrZXdBeGlzXHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9LFxyXG5cdFx0XHR7XHJcblx0XHRcdFx0bmFtZTonU3Ryb2tlIENvbG9yJyxcclxuXHRcdFx0XHR2YWx1ZToge1xyXG5cdFx0XHRcdFx0c2V0VmFsdWU6IHNldFN0cm9rZUNvbG9yXHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9LFxyXG5cdFx0XHR7XHJcblx0XHRcdFx0bmFtZTonU2tldycsXHJcblx0XHRcdFx0dmFsdWU6IHtcclxuXHRcdFx0XHRcdHNldFZhbHVlOiBzZXRTa2V3XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9LFxyXG5cdFx0XHR7XHJcblx0XHRcdFx0bmFtZTonU3Ryb2tlIFdpZHRoJyxcclxuXHRcdFx0XHR2YWx1ZToge1xyXG5cdFx0XHRcdFx0c2V0VmFsdWU6IHNldFN0cm9rZVdpZHRoXHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9LFxyXG5cdFx0XHR7XHJcblx0XHRcdFx0bmFtZTonVHJhY2tpbmcgQW1vdW50JyxcclxuXHRcdFx0XHR2YWx1ZToge1xyXG5cdFx0XHRcdFx0c2V0VmFsdWU6IHNldFRyYWNraW5nQW1vdW50XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9LFxyXG5cdFx0XHR7XHJcblx0XHRcdFx0bmFtZTonU3Ryb2tlIE9wYWNpdHknLFxyXG5cdFx0XHRcdHZhbHVlOiB7XHJcblx0XHRcdFx0XHRzZXRWYWx1ZTogc2V0U3Ryb2tlT3BhY2l0eVxyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSxcclxuXHRcdFx0e1xyXG5cdFx0XHRcdG5hbWU6J1N0cm9rZSBCcmlnaHRuZXNzJyxcclxuXHRcdFx0XHR2YWx1ZToge1xyXG5cdFx0XHRcdFx0c2V0VmFsdWU6IHNldFN0cm9rZUJyaWdodG5lc3NcclxuXHRcdFx0XHR9XHJcblx0XHRcdH0sXHJcblx0XHRcdHtcclxuXHRcdFx0XHRuYW1lOidTdHJva2UgU2F0dXJhdGlvbicsXHJcblx0XHRcdFx0dmFsdWU6IHtcclxuXHRcdFx0XHRcdHNldFZhbHVlOiBzZXRTdHJva2VTYXR1cmF0aW9uXHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9LFxyXG5cdFx0XHR7XHJcblx0XHRcdFx0bmFtZTonU3Ryb2tlIEh1ZScsXHJcblx0XHRcdFx0dmFsdWU6IHtcclxuXHRcdFx0XHRcdHNldFZhbHVlOiBzZXRTdHJva2VIdWVcclxuXHRcdFx0XHR9XHJcblx0XHRcdH0sXHJcblx0XHRcdFxyXG5cdFx0XVxyXG5cdH1cclxuXHJcblx0dmFyIG1ldGhvZHMgPSB7XHJcblx0fVxyXG5cclxuXHRyZXR1cm4gT2JqZWN0LmFzc2lnbihpbnN0YW5jZSwgbWV0aG9kcywgS2V5UGF0aE5vZGUoc3RhdGUpKTtcclxuXHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gVGV4dEFuaW1hdG9yOyIsInZhciBMYXllckJhc2UgPSByZXF1aXJlKCcuLi9MYXllckJhc2UnKTtcclxudmFyIFRleHQgPSByZXF1aXJlKCcuL1RleHQnKTtcclxuXHJcbmZ1bmN0aW9uIFRleHRFbGVtZW50KGVsZW1lbnQpIHtcclxuXHJcblx0dmFyIGluc3RhbmNlID0ge307XHJcblxyXG5cdHZhciBUZXh0UHJvcGVydHkgPSBUZXh0KGVsZW1lbnQpO1xyXG5cdHZhciBzdGF0ZSA9IHtcclxuXHRcdGVsZW1lbnQ6IGVsZW1lbnQsXHJcblx0XHRwcm9wZXJ0aWVzOiBfYnVpbGRQcm9wZXJ0eU1hcCgpXHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBfYnVpbGRQcm9wZXJ0eU1hcCgpIHtcclxuXHRcdHJldHVybiBbXHJcblx0XHRcdHtcclxuXHRcdFx0XHRuYW1lOiAndGV4dCcsXHJcblx0XHRcdFx0dmFsdWU6IFRleHRQcm9wZXJ0eVxyXG5cdFx0XHR9LFxyXG5cdFx0XHR7XHJcblx0XHRcdFx0bmFtZTogJ1RleHQnLFxyXG5cdFx0XHRcdHZhbHVlOiBUZXh0UHJvcGVydHlcclxuXHRcdFx0fVxyXG5cdFx0XVxyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gZ2V0VGV4dCgpIHtcclxuXHRcdHJldHVybiBlbGVtZW50LnRleHRQcm9wZXJ0eS5jdXJyZW50RGF0YS50O1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gc2V0VGV4dCh2YWx1ZSwgaW5kZXgpIHtcclxuXHRcdHNldERvY3VtZW50RGF0YSh7dDogdmFsdWV9LCBpbmRleCk7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBzZXREb2N1bWVudERhdGEoZGF0YSwgaW5kZXgpIHtcclxuXHRcdHJldHVybiBlbGVtZW50LnVwZGF0ZURvY3VtZW50RGF0YShkYXRhLCBpbmRleCk7XHJcblx0fVxyXG5cdFxyXG5cdGZ1bmN0aW9uIGNhblJlc2l6ZUZvbnQoX2NhblJlc2l6ZSkge1xyXG5cdFx0cmV0dXJuIGVsZW1lbnQuY2FuUmVzaXplRm9udChfY2FuUmVzaXplKTtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIHNldE1pbmltdW1Gb250U2l6ZShfZm9udFNpemUpIHtcclxuXHRcdHJldHVybiBlbGVtZW50LnNldE1pbmltdW1Gb250U2l6ZShfZm9udFNpemUpO1xyXG5cdH1cclxuXHJcblx0dmFyIG1ldGhvZHMgPSB7XHJcblx0XHRnZXRUZXh0OiBnZXRUZXh0LFxyXG5cdFx0c2V0VGV4dDogc2V0VGV4dCxcclxuXHRcdGNhblJlc2l6ZUZvbnQ6IGNhblJlc2l6ZUZvbnQsXHJcblx0XHRzZXREb2N1bWVudERhdGE6IHNldERvY3VtZW50RGF0YSxcclxuXHRcdHNldE1pbmltdW1Gb250U2l6ZTogc2V0TWluaW11bUZvbnRTaXplXHJcblx0fVxyXG5cclxuXHRyZXR1cm4gT2JqZWN0LmFzc2lnbihpbnN0YW5jZSwgTGF5ZXJCYXNlKHN0YXRlKSwgbWV0aG9kcyk7XHJcblxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFRleHRFbGVtZW50OyIsInZhciBLZXlQYXRoTm9kZSA9IHJlcXVpcmUoJy4uLy4uL2tleV9wYXRoL0tleVBhdGhOb2RlJyk7XHJcbnZhciBQcm9wZXJ0eSA9IHJlcXVpcmUoJy4uLy4uL3Byb3BlcnR5L1Byb3BlcnR5Jyk7XHJcblxyXG5mdW5jdGlvbiBUcmFuc2Zvcm0ocHJvcHMsIHBhcmVudCkge1xyXG5cdHZhciBzdGF0ZSA9IHtcclxuXHRcdHByb3BlcnRpZXM6IF9idWlsZFByb3BlcnR5TWFwKClcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIF9idWlsZFByb3BlcnR5TWFwKCkge1xyXG5cdFx0cmV0dXJuIFtcclxuXHRcdFx0e1xyXG5cdFx0XHRcdG5hbWU6ICdBbmNob3IgUG9pbnQnLFxyXG5cdFx0XHRcdHZhbHVlOiBQcm9wZXJ0eShwcm9wcy5hLCBwYXJlbnQpXHJcblx0XHRcdH0sXHJcblx0XHRcdHtcclxuXHRcdFx0XHRuYW1lOiAnUG9pbnQgb2YgSW50ZXJlc3QnLFxyXG5cdFx0XHRcdHZhbHVlOiBQcm9wZXJ0eShwcm9wcy5hLCBwYXJlbnQpXHJcblx0XHRcdH0sXHJcblx0XHRcdHtcclxuXHRcdFx0XHRuYW1lOiAnUG9zaXRpb24nLFxyXG5cdFx0XHRcdHZhbHVlOiBQcm9wZXJ0eShwcm9wcy5wLCBwYXJlbnQpXHJcblx0XHRcdH0sXHJcblx0XHRcdHtcclxuXHRcdFx0XHRuYW1lOiAnU2NhbGUnLFxyXG5cdFx0XHRcdHZhbHVlOiBQcm9wZXJ0eShwcm9wcy5zLCBwYXJlbnQpXHJcblx0XHRcdH0sXHJcblx0XHRcdHtcclxuXHRcdFx0XHRuYW1lOiAnUm90YXRpb24nLFxyXG5cdFx0XHRcdHZhbHVlOiBQcm9wZXJ0eShwcm9wcy5yLCBwYXJlbnQpXHJcblx0XHRcdH0sXHJcblx0XHRcdHtcclxuXHRcdFx0XHRuYW1lOiAnWCBQb3NpdGlvbicsXHJcblx0XHRcdFx0dmFsdWU6IFByb3BlcnR5KHByb3BzLnB4LCBwYXJlbnQpXHJcblx0XHRcdH0sXHJcblx0XHRcdHtcclxuXHRcdFx0XHRuYW1lOiAnWSBQb3NpdGlvbicsXHJcblx0XHRcdFx0dmFsdWU6IFByb3BlcnR5KHByb3BzLnB5LCBwYXJlbnQpXHJcblx0XHRcdH0sXHJcblx0XHRcdHtcclxuXHRcdFx0XHRuYW1lOiAnWiBQb3NpdGlvbicsXHJcblx0XHRcdFx0dmFsdWU6IFByb3BlcnR5KHByb3BzLnB6LCBwYXJlbnQpXHJcblx0XHRcdH0sXHJcblx0XHRcdHtcclxuXHRcdFx0XHRuYW1lOiAnWCBSb3RhdGlvbicsXHJcblx0XHRcdFx0dmFsdWU6IFByb3BlcnR5KHByb3BzLnJ4LCBwYXJlbnQpXHJcblx0XHRcdH0sXHJcblx0XHRcdHtcclxuXHRcdFx0XHRuYW1lOiAnWSBSb3RhdGlvbicsXHJcblx0XHRcdFx0dmFsdWU6IFByb3BlcnR5KHByb3BzLnJ5LCBwYXJlbnQpXHJcblx0XHRcdH0sXHJcblx0XHRcdHtcclxuXHRcdFx0XHRuYW1lOiAnWiBSb3RhdGlvbicsXHJcblx0XHRcdFx0dmFsdWU6IFByb3BlcnR5KHByb3BzLnJ6LCBwYXJlbnQpXHJcblx0XHRcdH0sXHJcblx0XHRcdHtcclxuXHRcdFx0XHRuYW1lOiAnT3BhY2l0eScsXHJcblx0XHRcdFx0dmFsdWU6IFByb3BlcnR5KHByb3BzLnBvLCBwYXJlbnQpXHJcblx0XHRcdH1cclxuXHRcdF1cclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIGdldFRhcmdldFRyYW5zZm9ybSgpIHtcclxuXHRcdHJldHVybiBwcm9wcztcclxuXHR9XHJcblxyXG5cdHZhciBtZXRob2RzID0ge1xyXG5cdFx0Z2V0VGFyZ2V0VHJhbnNmb3JtOiBnZXRUYXJnZXRUcmFuc2Zvcm1cclxuXHR9XHJcblxyXG5cdHJldHVybiBPYmplY3QuYXNzaWduKG1ldGhvZHMsIEtleVBhdGhOb2RlKHN0YXRlKSk7XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gVHJhbnNmb3JtOyIsInZhciBLZXlQYXRoTm9kZSA9IHJlcXVpcmUoJy4uL2tleV9wYXRoL0tleVBhdGhOb2RlJyk7XHJcbnZhciBWYWx1ZVByb3BlcnR5ID0gcmVxdWlyZSgnLi9WYWx1ZVByb3BlcnR5Jyk7XHJcblxyXG5mdW5jdGlvbiBQcm9wZXJ0eShwcm9wZXJ0eSwgcGFyZW50KSB7XHJcblx0dmFyIHN0YXRlID0ge1xyXG5cdFx0cHJvcGVydHk6IHByb3BlcnR5LFxyXG5cdFx0cGFyZW50OiBwYXJlbnRcclxuXHR9XHJcblxyXG5cdHZhciBtZXRob2RzID0ge31cclxuXHJcblx0cmV0dXJuIE9iamVjdC5hc3NpZ24oe30sIG1ldGhvZHMsIFZhbHVlUHJvcGVydHkoc3RhdGUpLCBLZXlQYXRoTm9kZShzdGF0ZSkpO1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFByb3BlcnR5OyIsImZ1bmN0aW9uIFZhbHVlUHJvcGVydHkoc3RhdGUpIHtcclxuXHRcclxuXHRmdW5jdGlvbiBzZXRWYWx1ZSh2YWx1ZSkge1xyXG5cdFx0dmFyIHByb3BlcnR5ID0gc3RhdGUucHJvcGVydHk7XHJcblx0XHRpZighcHJvcGVydHkgfHwgIXByb3BlcnR5LmFkZEVmZmVjdCkge1xyXG5cdFx0XHRyZXR1cm47XHJcblx0XHR9XHJcblx0XHRpZiAodHlwZW9mIHZhbHVlID09PSAnZnVuY3Rpb24nKSB7XHJcblx0XHRcdHByb3BlcnR5LmFkZEVmZmVjdCh2YWx1ZSk7XHJcblx0XHR9IGVsc2UgaWYgKHByb3BlcnR5LnByb3BUeXBlID09PSAnbXVsdGlkaW1lbnNpb25hbCcgJiYgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJiB2YWx1ZS5sZW5ndGggPT09IDIpIHtcclxuXHRcdFx0cHJvcGVydHkuYWRkRWZmZWN0KGZ1bmN0aW9uKCl7cmV0dXJuIHZhbHVlfSk7XHJcblx0XHR9IGVsc2UgaWYgKHByb3BlcnR5LnByb3BUeXBlID09PSAndW5pZGltZW5zaW9uYWwnICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicpIHtcclxuXHRcdFx0cHJvcGVydHkuYWRkRWZmZWN0KGZ1bmN0aW9uKCl7cmV0dXJuIHZhbHVlfSk7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBnZXRWYWx1ZSgpIHtcclxuXHRcdHJldHVybiBzdGF0ZS5wcm9wZXJ0eS52O1xyXG5cdH1cclxuXHJcblx0dmFyIG1ldGhvZHMgPSB7XHJcblx0XHRzZXRWYWx1ZTogc2V0VmFsdWUsXHJcblx0XHRnZXRWYWx1ZTogZ2V0VmFsdWVcclxuXHR9XHJcblxyXG5cdHJldHVybiBtZXRob2RzO1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFZhbHVlUHJvcGVydHk7IiwidmFyIExheWVyTGlzdCA9IHJlcXVpcmUoJy4uL2xheWVyL0xheWVyTGlzdCcpO1xyXG52YXIgS2V5UGF0aExpc3QgPSByZXF1aXJlKCcuLi9rZXlfcGF0aC9LZXlQYXRoTGlzdCcpO1xyXG5cclxuZnVuY3Rpb24gUmVuZGVyZXIoc3RhdGUpIHtcclxuXHJcblx0c3RhdGUuX3R5cGUgPSAncmVuZGVyZXInO1xyXG5cclxuXHRmdW5jdGlvbiBnZXRSZW5kZXJlclR5cGUoKSB7XHJcblx0XHRyZXR1cm4gc3RhdGUuYW5pbWF0aW9uLmFuaW1UeXBlO1xyXG5cdH1cclxuXHJcblx0cmV0dXJuIE9iamVjdC5hc3NpZ24oe1xyXG5cdFx0Z2V0UmVuZGVyZXJUeXBlOiBnZXRSZW5kZXJlclR5cGVcclxuXHR9LCBMYXllckxpc3Qoc3RhdGUuZWxlbWVudHMpLCBLZXlQYXRoTGlzdChzdGF0ZS5lbGVtZW50cywgJ3JlbmRlcmVyJykpO1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFJlbmRlcmVyOyJdfQ==
