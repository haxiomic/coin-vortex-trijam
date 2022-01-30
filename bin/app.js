(function ($global) { "use strict";
var $estr = function() { return js_Boot.__string_rec(this,''); },$hxEnums = $hxEnums || {},$_;
class EReg {
	constructor(r,opt) {
		this.r = new RegExp(r,opt.split("u").join(""));
	}
	match(s) {
		if(this.r.global) {
			this.r.lastIndex = 0;
		}
		this.r.m = this.r.exec(s);
		this.r.s = s;
		return this.r.m != null;
	}
	matched(n) {
		if(this.r.m != null && n >= 0 && n < this.r.m.length) {
			return this.r.m[n];
		} else {
			throw haxe_Exception.thrown("EReg::matched");
		}
	}
	matchedRight() {
		if(this.r.m == null) {
			throw haxe_Exception.thrown("No string matched");
		}
		let sz = this.r.m.index + this.r.m[0].length;
		return HxOverrides.substr(this.r.s,sz,this.r.s.length - sz);
	}
}
EReg.__name__ = true;
class HxOverrides {
	static substr(s,pos,len) {
		if(len == null) {
			len = s.length;
		} else if(len < 0) {
			if(pos == 0) {
				len = s.length + len;
			} else {
				return "";
			}
		}
		return s.substr(pos,len);
	}
	static now() {
		return Date.now();
	}
}
HxOverrides.__name__ = true;
class event_ViewEventManager {
	constructor(el) {
		this.appActivated = false;
		this.useCapture = true;
		this.activePointerCount = 0;
		this.activePointers = new haxe_ds_IntMap();
		this.el = el;
		this.eventHandler = new event__$ViewEventManager_EventDispatcher();
		if(el.tabIndex == null) {
			el.tabIndex = 1;
		}
		el.style.touchAction = "none";
		el.setAttribute("touch-action","none");
		let cancelEvent = function(e) {
			e.preventDefault();
			e.stopPropagation();
		};
		el.addEventListener("gesturestart",cancelEvent,false);
		el.addEventListener("gesturechange",cancelEvent,false);
		this.addPointerEventListeners();
		this.addWheelEventListeners();
		this.addKeyboardEventListeners();
		this.addLifeCycleEventListeners();
		this.onVisibilityChange();
	}
	onVisibilityChange() {
		switch(window.document.visibilityState) {
		case "hidden":
			if(this.appActivated) {
				let _g = 0;
				let _g1 = this.eventHandler.onDeactivateCallbacks;
				while(_g < _g1.length) _g1[_g++]();
				this.appActivated = false;
			}
			break;
		case "visible":
			if(!this.appActivated) {
				let _g = 0;
				let _g1 = this.eventHandler.onActivateCallbacks;
				while(_g < _g1.length) _g1[_g++]();
				this.appActivated = true;
			}
			break;
		}
	}
	addPointerEventListeners() {
		let _gthis = this;
		let executePointerMethodFromMouseEvent = function(mouseEvent,pointerMethod) {
			let pressure = Math.max((mouseEvent.force != null ? mouseEvent.force : mouseEvent.webkitForce != null ? mouseEvent.webkitForce : 0.5) - 1,0);
			let bounds = _gthis.el.getBoundingClientRect();
			pointerMethod(new event_PointerEvent(mouseEvent.button,$bind(mouseEvent,mouseEvent.preventDefault),function() {
				return mouseEvent.defaultPrevented;
			},mouseEvent.timeStamp,mouseEvent,1,"mouse",true,mouseEvent.buttons,mouseEvent.clientX - bounds.left,mouseEvent.clientY - bounds.top,1,1,bounds.width,bounds.height,pressure,0,0,0,0));
		};
		let touchInfoForType_h = Object.create(null);
		let getTouchInfoForType = function(type) {
			let touchInfo = touchInfoForType_h[type];
			if(touchInfo == null) {
				touchInfo = { primaryTouchIdentifier : null, activeCount : 0};
				touchInfoForType_h[type] = touchInfo;
			}
			return touchInfo;
		};
		let executePointerMethodFromTouchEvent = function(touchEvent,pointerMethod) {
			let buttonStates;
			switch(touchEvent.type) {
			case "touchforcechange":case "touchmove":
				buttonStates = { button : -1, buttons : 1};
				break;
			case "touchstart":
				buttonStates = { button : 0, buttons : 1};
				break;
			default:
				buttonStates = { button : 0, buttons : 0};
			}
			let _g = 0;
			let _g1 = touchEvent.changedTouches.length;
			while(_g < _g1) {
				let touch = touchEvent.changedTouches[_g++];
				if(touchEvent.type == "touchforcechange") {
					let touchIsActive = false;
					let _g = 0;
					let _g1 = touchEvent.touches;
					while(_g < _g1.length) if(touch == _g1[_g++]) {
						touchIsActive = true;
						break;
					}
					if(!touchIsActive) {
						continue;
					}
				}
				let touchInfo = getTouchInfoForType(touch.touchType);
				if(touchInfo.activeCount == 0 && touchEvent.type == "touchstart") {
					touchInfo.primaryTouchIdentifier = touch.identifier;
				}
				switch(touchEvent.type) {
				case "touchcancel":case "touchend":
					touchInfo.activeCount--;
					break;
				case "touchstart":
					touchInfo.activeCount++;
					break;
				}
				let tanAlt = Math.tan(touch.altitudeAngle);
				let radToDeg = 180.0 / Math.PI;
				let tiltX = Math.atan(Math.cos(touch.azimuthAngle) / tanAlt) * radToDeg;
				let tiltY = Math.atan(Math.sin(touch.azimuthAngle) / tanAlt) * radToDeg;
				let radiusX = touch.radiusX != null ? touch.radiusX : touch.webkitRadiusX != null ? touch.webkitRadiusX : 5;
				let radiusY = touch.radiusY != null ? touch.radiusY : touch.webkitRadiusY != null ? touch.webkitRadiusY : 5;
				let bounds = _gthis.el.getBoundingClientRect();
				let _g1 = touch.identifier;
				let _g2 = touch.touchType == "stylus" ? "pen" : "touch";
				let _g3 = touch.identifier == touchInfo.primaryTouchIdentifier;
				let _g4 = buttonStates.button;
				let _g5 = buttonStates.buttons;
				let _g6 = touch.clientX - bounds.left;
				let _g7 = touch.clientY - bounds.top;
				let _g8 = bounds.width;
				let _g9 = bounds.height;
				let _g10 = touch.force;
				let _g11 = isFinite(tiltX) ? tiltX : 0;
				pointerMethod(new event_PointerEvent(_g4,$bind(touchEvent,touchEvent.preventDefault),function() {
					return touchEvent.defaultPrevented;
				},touchEvent.timeStamp,touchEvent,_g1,_g2,_g3,_g5,_g6,_g7,radiusX * 2,radiusY * 2,_g8,_g9,_g10,0,_g11,isFinite(tiltY) ? tiltY : 0,touch.rotationAngle));
			}
		};
		let updatePointerState = function(e) {
			let existingPointer = _gthis.activePointers.h[e.pointerId];
			if(existingPointer != null) {
				existingPointer.buttons = e.buttons;
				existingPointer.x = e.x;
				existingPointer.y = e.y;
				existingPointer.width = e.width;
				existingPointer.height = e.height;
				existingPointer.viewWidth = e.viewWidth;
				existingPointer.viewHeight = e.viewHeight;
				existingPointer.pressure = e.pressure;
				existingPointer.tangentialPressure = e.tangentialPressure;
				existingPointer.tiltX = e.tiltX;
				existingPointer.tiltY = e.tiltY;
				existingPointer.twist = e.twist;
			} else {
				_gthis.activePointers.h[e.pointerId] = new event_PointerState(e.pointerId,e.pointerType,e.isPrimary,e.buttons,e.x,e.y,e.width,e.height,e.viewWidth,e.viewHeight,e.pressure,e.tangentialPressure,e.tiltX,e.tiltY,e.twist);
				_gthis.activePointerCount++;
			}
		};
		let removePointerState = function(e) {
			if(_gthis.activePointers.remove(e.pointerId)) {
				_gthis.activePointerCount--;
			}
		};
		let onPointerDown = function(e) {
			updatePointerState(e);
			let onTargetView = e.nativeEvent.target == _gthis.el;
			let _g = 0;
			let _g1 = _gthis.eventHandler.onPointerDownCallbacks;
			while(_g < _g1.length) _g1[_g++](e,onTargetView);
		};
		let onPointerMove = function(e) {
			updatePointerState(e);
			let onTargetView = e.nativeEvent.target == _gthis.el;
			let _g = 0;
			let _g1 = _gthis.eventHandler.onPointerMoveCallbacks;
			while(_g < _g1.length) _g1[_g++](e,onTargetView);
		};
		let onPointerUp = function(e) {
			switch(e.pointerType) {
			case "mouse":
				updatePointerState(e);
				break;
			case "pen":case "touch":
				removePointerState(e);
				break;
			}
			let onTargetView = e.nativeEvent.target == _gthis.el;
			let _g = 0;
			let _g1 = _gthis.eventHandler.onPointerUpCallbacks;
			while(_g < _g1.length) _g1[_g++](e,onTargetView);
		};
		let onPointerCancel = function(e) {
			switch(e.pointerType) {
			case "mouse":
				updatePointerState(e);
				break;
			case "pen":case "touch":
				removePointerState(e);
				break;
			}
			let onTargetView = e.nativeEvent.target == _gthis.el;
			let _g = 0;
			let _g1 = _gthis.eventHandler.onPointerCancelCallbacks;
			while(_g < _g1.length) _g1[_g++](e,onTargetView);
		};
		if(window.PointerEvent) {
			window.addEventListener("pointerdown",function(e) {
				let onPointerDown1 = onPointerDown;
				let e1 = e;
				let bounds = _gthis.el.getBoundingClientRect();
				onPointerDown1(new event_PointerEvent(e1.button,$bind(e1,e1.preventDefault),function() {
					return e1.defaultPrevented;
				},e1.timeStamp,e1,e1.pointerId,e1.pointerType,e1.isPrimary,e1.buttons,e1.x - bounds.left,e1.y - bounds.top,e1.width,e1.height,bounds.width,bounds.height,e1.pressure,e1.tangentialPressure,e1.tiltX,e1.tiltY,e1.twist));
			},this.useCapture);
			if(PointerEvent.prototype.getCoalescedEvents != null) {
				window.addEventListener("pointermove",function(e) {
					let _g = 0;
					let _g1 = e.getCoalescedEvents();
					while(_g < _g1.length) {
						let onPointerMove1 = onPointerMove;
						let e = _g1[_g++];
						let bounds = _gthis.el.getBoundingClientRect();
						onPointerMove1(new event_PointerEvent(e.button,$bind(e,e.preventDefault),function() {
							return e.defaultPrevented;
						},e.timeStamp,e,e.pointerId,e.pointerType,e.isPrimary,e.buttons,e.x - bounds.left,e.y - bounds.top,e.width,e.height,bounds.width,bounds.height,e.pressure,e.tangentialPressure,e.tiltX,e.tiltY,e.twist));
					}
				},this.useCapture);
			} else {
				window.addEventListener("pointermove",function(e) {
					let onPointerMove1 = onPointerMove;
					let e1 = e;
					let bounds = _gthis.el.getBoundingClientRect();
					onPointerMove1(new event_PointerEvent(e1.button,$bind(e1,e1.preventDefault),function() {
						return e1.defaultPrevented;
					},e1.timeStamp,e1,e1.pointerId,e1.pointerType,e1.isPrimary,e1.buttons,e1.x - bounds.left,e1.y - bounds.top,e1.width,e1.height,bounds.width,bounds.height,e1.pressure,e1.tangentialPressure,e1.tiltX,e1.tiltY,e1.twist));
				},this.useCapture);
			}
			window.addEventListener("pointerup",function(e) {
				let onPointerUp1 = onPointerUp;
				let e1 = e;
				let bounds = _gthis.el.getBoundingClientRect();
				onPointerUp1(new event_PointerEvent(e1.button,$bind(e1,e1.preventDefault),function() {
					return e1.defaultPrevented;
				},e1.timeStamp,e1,e1.pointerId,e1.pointerType,e1.isPrimary,e1.buttons,e1.x - bounds.left,e1.y - bounds.top,e1.width,e1.height,bounds.width,bounds.height,e1.pressure,e1.tangentialPressure,e1.tiltX,e1.tiltY,e1.twist));
			},this.useCapture);
			window.addEventListener("pointercancel",function(e) {
				let onPointerCancel1 = onPointerCancel;
				let e1 = e;
				let bounds = _gthis.el.getBoundingClientRect();
				onPointerCancel1(new event_PointerEvent(e1.button,$bind(e1,e1.preventDefault),function() {
					return e1.defaultPrevented;
				},e1.timeStamp,e1,e1.pointerId,e1.pointerType,e1.isPrimary,e1.buttons,e1.x - bounds.left,e1.y - bounds.top,e1.width,e1.height,bounds.width,bounds.height,e1.pressure,e1.tangentialPressure,e1.tiltX,e1.tiltY,e1.twist));
			},this.useCapture);
		} else {
			window.addEventListener("mousedown",function(e) {
				executePointerMethodFromMouseEvent(e,onPointerDown);
			},this.useCapture);
			window.addEventListener("mousemove",function(e) {
				executePointerMethodFromMouseEvent(e,onPointerMove);
			},this.useCapture);
			window.addEventListener("webkitmouseforcechanged",function(e) {
				executePointerMethodFromMouseEvent(e,onPointerMove);
			},this.useCapture);
			window.addEventListener("mouseup",function(e) {
				executePointerMethodFromMouseEvent(e,onPointerUp);
			},this.useCapture);
			window.addEventListener("touchstart",function(e) {
				executePointerMethodFromTouchEvent(e,onPointerDown);
			},{ capture : this.useCapture, passive : false});
			window.addEventListener("touchmove",function(e) {
				executePointerMethodFromTouchEvent(e,onPointerMove);
			},{ capture : this.useCapture, passive : false});
			window.addEventListener("touchforcechange",function(e) {
				executePointerMethodFromTouchEvent(e,onPointerMove);
			},{ capture : this.useCapture, passive : false});
			window.addEventListener("touchend",function(e) {
				executePointerMethodFromTouchEvent(e,onPointerUp);
			},{ capture : this.useCapture, passive : false});
			window.addEventListener("touchcancel",function(e) {
				executePointerMethodFromTouchEvent(e,onPointerCancel);
			},{ capture : this.useCapture, passive : false});
		}
	}
	addWheelEventListeners() {
		let _gthis = this;
		window.addEventListener("wheel",function(e) {
			let bounds = _gthis.el.getBoundingClientRect();
			let x_px = e.clientX;
			let y_px = e.clientY;
			let deltaX_px = e.deltaX;
			let deltaY_px = e.deltaY;
			let deltaZ_px = e.deltaZ;
			switch(e.deltaMode) {
			case 0:
				deltaX_px = e.deltaX;
				deltaY_px = e.deltaY;
				deltaZ_px = e.deltaZ;
				break;
			case 1:
				deltaX_px = e.deltaX * 16;
				deltaY_px = e.deltaY * 16;
				deltaZ_px = e.deltaZ * 16;
				break;
			case 2:
				deltaX_px = e.deltaX * 100;
				deltaY_px = e.deltaY * 100;
				deltaZ_px = e.deltaZ * 100;
				break;
			}
			let event = new event_WheelEvent(deltaX_px,deltaY_px,deltaZ_px,x_px - bounds.left,y_px - bounds.top,bounds.width,bounds.height,e.altKey,e.ctrlKey,e.metaKey,e.shiftKey,$bind(e,e.preventDefault),function() {
				return e.defaultPrevented;
			},e.timeStamp,e);
			let onTargetView = e.target == _gthis.el;
			let _g = 0;
			let _g1 = _gthis.eventHandler.onWheelCallbacks;
			while(_g < _g1.length) _g1[_g++](event,onTargetView);
		},{ passive : false, capture : this.useCapture});
	}
	addKeyboardEventListeners() {
		let _gthis = this;
		window.addEventListener("keydown",function(e) {
			let onTargetView = e.target == _gthis.el;
			let event = e;
			let _g = 0;
			let _g1 = _gthis.eventHandler.onKeyDownCallbacks;
			while(_g < _g1.length) _g1[_g++](event,onTargetView);
		});
		window.addEventListener("keyup",function(e) {
			let onTargetView = e.target == _gthis.el;
			let event = e;
			let _g = 0;
			let _g1 = _gthis.eventHandler.onKeyUpCallbacks;
			while(_g < _g1.length) _g1[_g++](event,onTargetView);
		});
	}
	addLifeCycleEventListeners() {
		let _gthis = this;
		window.document.addEventListener("visibilitychange",function() {
			_gthis.onVisibilityChange();
		});
	}
}
event_ViewEventManager.__name__ = true;
class event__$ViewEventManager_EventDispatcher {
	constructor() {
		this.onDeactivateCallbacks = [];
		this.onActivateCallbacks = [];
		this.onKeyUpCallbacks = [];
		this.onKeyDownCallbacks = [];
		this.onWheelCallbacks = [];
		this.onPointerCancelCallbacks = [];
		this.onPointerUpCallbacks = [];
		this.onPointerMoveCallbacks = [];
		this.onPointerDownCallbacks = [];
	}
}
event__$ViewEventManager_EventDispatcher.__name__ = true;
class control_ArcBallControl {
	constructor(options) {
		this._drivingPointerId = null;
		this._onDown_clientXY = new Vec2Data(0,0);
		this._onDown_angleAroundXZ = 0;
		this._onDown_angleAroundY = 0;
		this.orientation = new Vec4Data(0,0,0,1);
		this.position = new Vec3Data(0.,0.,0.);
		this.target = new Vec3Data(0.,0.,0.);
		this.radius = new animation_Spring(1.);
		this.axialRotation = new animation_Spring(0.);
		this.angleAroundXZ = new animation_Spring(0.);
		this.angleAroundY = new animation_Spring(0.);
		let a = control_ArcBallControl.defaults;
		let options_viewEventManager = options.viewEventManager;
		let options_radius = options.radius != null ? options.radius : a.radius;
		let options_interactionSurface = options.interactionSurface;
		let options_angleAroundXZ = options.angleAroundXZ != null ? options.angleAroundXZ : a.angleAroundXZ;
		this.dragSpeed = options.dragSpeed != null ? options.dragSpeed : a.dragSpeed;
		this.zoomSpeed = options.zoomSpeed != null ? options.zoomSpeed : a.zoomSpeed;
		let v = options.strength != null ? options.strength : a.strength;
		this.angleAroundY.strength = v;
		this.angleAroundXZ.strength = v;
		this.radius.strength = v;
		let v1 = options.damping != null ? options.damping : a.damping;
		this.angleAroundY.damping = v1;
		this.angleAroundXZ.damping = v1;
		this.radius.damping = v1;
		this.angleAroundY.forceCompletion(options.angleAroundY != null ? options.angleAroundY : a.angleAroundY);
		this.angleAroundXZ.forceCompletion(options_angleAroundXZ);
		this.radius.forceCompletion(options_radius);
		let viewEventManager = options_viewEventManager;
		if(options_viewEventManager == null && options_interactionSurface != null) {
			viewEventManager = new event_ViewEventManager(options_interactionSurface);
		}
		let _gthis = this;
		if(viewEventManager != null) {
			viewEventManager.eventHandler.onPointerDownCallbacks.push($bind(this,this.handlePointerDown));
			viewEventManager.eventHandler.onPointerMoveCallbacks.push($bind(this,this.handlePointerMove));
			viewEventManager.eventHandler.onPointerUpCallbacks.push($bind(this,this.handlePointerUp));
			viewEventManager.eventHandler.onPointerCancelCallbacks.push($bind(this,this.handlePointerUp));
			let cb = function(e,onView) {
				if(onView && Math.abs(_gthis.zoomSpeed) > 0) {
					_gthis.radius.target += e.deltaY * _gthis.zoomSpeed / 1000;
					_gthis.radius.target = Math.max(_gthis.radius.target,0);
					e.preventDefault();
					e.nativeEvent.stopPropagation();
				}
			};
			viewEventManager.eventHandler.onWheelCallbacks.push(cb);
		}
	}
	handlePointerDown(e,onTargetView) {
		if(onTargetView && e.button == 0 && e.isPrimary && Math.abs(this.dragSpeed) > 0) {
			this._drivingPointerId = e.pointerId;
			this._onDown_angleAroundY = this.angleAroundY.target;
			this._onDown_angleAroundXZ = this.angleAroundXZ.target;
			this._onDown_clientXY.x = e.x;
			this._onDown_clientXY.y = e.y;
			e.preventDefault();
			e.nativeEvent.stopPropagation();
		}
	}
	handlePointerMove(e,_) {
		if(e.pointerId == this._drivingPointerId) {
			let surfaceSize_x = e.viewWidth;
			let surfaceSize_y = e.viewHeight;
			let a = this._onDown_clientXY;
			this.angleAroundXZ.target = this._onDown_angleAroundXZ + (e.y / surfaceSize_y - a.y / surfaceSize_y) * this.dragSpeed;
			let this1 = this.orientation;
			let u_x = this1.x;
			let u_y = this1.y;
			let u_z = this1.z;
			let s = this1.w;
			let up_y = u_y * (2 * (u_x * 0. + u_y + u_z * 0.)) + (s * s - (u_x * u_x + u_y * u_y + u_z * u_z)) + (u_z * 0. - u_x * 0.) * (2 * s);
			this.angleAroundY.target = this._onDown_angleAroundY - (1.0 - Math.pow(Math.abs(up_y) + 1,-4)) * (up_y >= 0 ? 1 : -1) * (e.x / surfaceSize_x - a.x / surfaceSize_x) * this.dragSpeed * (e.viewWidth / e.viewHeight);
			e.preventDefault();
			e.nativeEvent.stopPropagation();
		}
	}
	handlePointerUp(e,_) {
		if(e.pointerId == this._drivingPointerId) {
			this._drivingPointerId = null;
			e.preventDefault();
			e.nativeEvent.stopPropagation();
		}
	}
}
control_ArcBallControl.__name__ = true;
Math.__name__ = true;
var three_Mesh = require("three").Mesh;
class rendering_BackgroundEnvironment extends three_Mesh {
	constructor(roughness) {
		if(roughness == null) {
			roughness = 0.5;
		}
		let environmentMaterial = new rendering_EnvironmentMaterial(roughness);
		super(new three_BoxGeometry(1,1,1),environmentMaterial);
		this.geometry.deleteAttribute("normal");
		this.geometry.deleteAttribute("uv");
		this.name = "BackgroundEnvironment";
		this.frustumCulled = false;
		this.castShadow = false;
		this.receiveShadow = false;
		this.matrixAutoUpdate = false;
		this.renderOrder = -Infinity;
		let _gthis = this;
		this.onBeforeRender = function(renderer,scene,camera,geometry,material,group) {
			let _this = _gthis.material;
			let v = scene.environment;
			if(v != _this.uEnvMap.value) {
				_this.needsUpdate = true;
			}
			if(v != null) {
				_this.uFlipEnvMap.value = v.isCubeTexture == true ? -1 : 1;
			}
			_this.uEnvMap.value = v;
			_this.envMap = v;
			_gthis.matrixWorld.copyPosition(camera.matrixWorld);
		};
	}
}
rendering_BackgroundEnvironment.__name__ = true;
var three_ShaderMaterial = require("three").ShaderMaterial;
class rendering_EnvironmentMaterial extends three_ShaderMaterial {
	constructor(roughness) {
		let uRoughness = new three_Uniform(0.5);
		let uFlipEnvMap = new three_Uniform(-1);
		let uEnvMap = new three_Uniform(null);
		let uMultiplier = new three_Uniform(new three_Color(1,1,1));
		super({ name : "BackgroundEnvironment", uniforms : { "envMap" : uEnvMap, "flipEnvMap" : uFlipEnvMap, "uRoughness" : uRoughness, "uMultiplier" : uMultiplier}, vertexShader : Three.ShaderLib.cube.vertexShader, fragmentShader : "\n\t\t\t\tuniform float uRoughness;\n\t\t\t\tuniform vec3 uMultiplier;\n\t\t\t\t#include <envmap_common_pars_fragment>\n\t\t\t\t#ifdef USE_ENVMAP\n\t\t\t\tvarying vec3 vWorldDirection;\n\t\t\t\t#endif\n\t\t\t\t#include <cube_uv_reflection_fragment>\n\n\t\t\t\tvoid main() {\n\t\t\t\t\t#ifdef USE_ENVMAP\n\t\t\t\t\t\tvec3 reflectVec = vWorldDirection;\n\t\t\t\t\t\t#ifdef ENVMAP_TYPE_CUBE\n\t\t\t\t\t\t\tvec4 envColor = textureCube( envMap, vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );\n\t\t\t\t\t\t#elif defined( ENVMAP_TYPE_CUBE_UV )\n\t\t\t\t\t\t\tvec4 envColor = textureCubeUV(envMap, reflectVec, uRoughness);\n\t\t\t\t\t\t#elif defined( ENVMAP_TYPE_EQUIREC )\n\t\t\t\t\t\t\tvec2 sampleUV;\n\t\t\t\t\t\t\treflectVec = normalize( reflectVec );\n\t\t\t\t\t\t\tsampleUV.y = asin( clamp( reflectVec.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;\n\t\t\t\t\t\t\tsampleUV.x = atan( reflectVec.z, reflectVec.x ) * RECIPROCAL_PI2 + 0.5;\n\t\t\t\t\t\t\tvec4 envColor = texture2D( envMap, sampleUV );\n\t\t\t\t\t\t#elif defined( ENVMAP_TYPE_SPHERE )\n\t\t\t\t\t\t\treflectVec = normalize( reflectVec );\n\t\t\t\t\t\t\tvec3 reflectView = normalize( ( viewMatrix * vec4( reflectVec, 0.0 ) ).xyz + vec3( 0.0, 0.0, 1.0 ) );\n\t\t\t\t\t\t\tvec4 envColor = texture2D( envMap, reflectView.xy * 0.5 + 0.5 );\n\t\t\t\t\t\t#else\n\t\t\t\t\t\t\tvec4 envColor = vec4( 0.0 );\n\t\t\t\t\t\t#endif\n\t\t\t\t\t\t#ifndef ENVMAP_TYPE_CUBE_UV\n\t\t\t\t\t\t\tenvColor = envMapTexelToLinear( envColor );\n\t\t\t\t\t\t#endif\n\t\t\t\t\t#endif\n\t\t\t\t\t#ifdef USE_ENVMAP\n\t\t\t\t\t\tgl_FragColor = envColor;\n\t\t\t\t\t#else\n\t\t\t\t\t\tgl_FragColor = vec4(1., 1., 1., 1.);\n\t\t\t\t\t#endif\n\n\t\t\t\t\t\n\n\t\t\t\t\tgl_FragColor.rgb *= uMultiplier;\n\t\t\t\t\t#include <tonemapping_fragment>\n\t\t\t\t\t#include <encodings_fragment>\n\t\t\t\t}\n\t\t\t", side : three_Side.DoubleSide, depthWrite : false, depthTest : true, blending : three_Blending.NoBlending});
		this.uRoughness = uRoughness;
		this.uFlipEnvMap = uFlipEnvMap;
		this.uEnvMap = uEnvMap;
		this.uMultiplier = uMultiplier;
		uRoughness.value = roughness;
	}
}
rendering_EnvironmentMaterial.__name__ = true;
var three_Uniform = require("three").Uniform;
var three_Color = require("three").Color;
var Three = require("three");
var three_Side = require("three");
var three_Blending = require("three");
var three_BufferGeometry = require("three").BufferGeometry;
var three_BoxGeometry = require("three").BoxGeometry;
var three_PerspectiveCamera = require("three").PerspectiveCamera;
var ui_ExposedGUI = require("dat.gui").GUI;
class ui_DevUI extends ui_ExposedGUI {
	constructor(options) {
		super(options);
		let styleEl = window.document.createElement("style");
		styleEl.innerHTML = "\n\t\t.dg .title {\n\t\t\toverflow: hidden;\n\t\t\twhite-space: nowrap;\n\t\t}\n\t\t/** allow function buttons to use all space **/\n\t\t.dg .function .property-name {\n\t\t\twidth: auto;\n\t\t\twhite-space: nowrap;\n\t\t}\n\t\t";
		window.document.head.appendChild(styleEl);
	}
	addFolder(name) {
		return ui_DevUI.patchFolder(super.addFolder(name));
	}
	static patchController(g,getAssignSyntax) {
		let e = g.domElement.closest("li");
		e.addEventListener("click",function(e) {
			if(e.getModifierState("Alt")) {
				e.preventDefault();
				e.stopImmediatePropagation();
			}
		},true);
		g.getAssignSyntax = getAssignSyntax;
		return g;
	}
	static patchFolder(g) {
		let e = g.domElement.closest("li");
		e.addEventListener("click",function(e) {
			if(e.getModifierState("Alt")) {
				let _g = [];
				let _g1 = 0;
				let _g2 = g.__controllers;
				while(_g1 < _g2.length) {
					let controller = _g2[_g1];
					++_g1;
					if(controller.getAssignSyntax != null) {
						_g.push(controller.getAssignSyntax());
					} else {
						_g.push("// missing .getAssignSyntax() for " + controller.property);
					}
				}
				let lines = _g;
				let _g3 = [];
				let _g4 = 0;
				let _g5 = lines;
				while(_g4 < _g5.length) {
					let v = _g5[_g4];
					++_g4;
					if(v != null) {
						_g3.push(v);
					}
				}
				$global.console.log("// " + g.name + "\n" + lines.join("\n"));
				e.preventDefault();
				e.stopImmediatePropagation();
			}
		},true);
		return g;
	}
	static internalAddMaterial(g,material,fallbackName) {
		let name = material.name == null || material.name == "" ? fallbackName : material.name;
		while(Object.prototype.hasOwnProperty.call(g.__folders,name)) {
			let endNumReg = new EReg("(\\d)+$","");
			if(endNumReg.match(name)) {
				let num = Std.parseInt(endNumReg.matched(1));
				name = endNumReg.matchedRight() + Std.string(num + 1);
			} else {
				name += "2";
			}
		}
		let g1 = g.addFolder(name);
		let m = material;
		let type = "Material";
		let o = { };
		Object.defineProperty(o,"visible",{ set : function(__value) {
			m.visible = __value;
		}, get : function() {
			return m.visible;
		}});
		ui_DevUI.patchController(g1.add(o,"visible").name("visible"),function() {
			return "m.visible" + " = " + (m.visible == null ? "null" : "" + m.visible) + ";";
		}).name("visible");
		let o1 = { };
		Object.defineProperty(o1,"transparent",{ set : function(__value) {
			m.transparent = __value;
		}, get : function() {
			return m.transparent;
		}});
		ui_DevUI.patchController(g1.add(o1,"transparent").name("transparent"),function() {
			return "m.transparent" + " = " + (m.transparent == null ? "null" : "" + m.transparent) + ";";
		}).name("transparent");
		let o2 = { };
		Object.defineProperty(o2,"opacity",{ set : function(__value) {
			m.opacity = __value;
		}, get : function() {
			return m.opacity;
		}});
		let c = g1.add(o2,"opacity").name("opacity");
		c = c.min(0);
		c = c.max(1);
		ui_DevUI.patchController(c,function() {
			return "m.opacity" + " = " + m.opacity + ";";
		}).name("opacity");
		let o3 = { };
		Object.defineProperty(o3,"colorWrite",{ set : function(__value) {
			m.colorWrite = __value;
		}, get : function() {
			return m.colorWrite;
		}});
		ui_DevUI.patchController(g1.add(o3,"colorWrite").name("colorWrite"),function() {
			return "m.colorWrite" + " = " + (m.colorWrite == null ? "null" : "" + m.colorWrite) + ";";
		}).name("colorWrite");
		let o4 = { };
		Object.defineProperty(o4,"depthWrite",{ set : function(__value) {
			m.depthWrite = __value;
		}, get : function() {
			return m.depthWrite;
		}});
		ui_DevUI.patchController(g1.add(o4,"depthWrite").name("depthWrite"),function() {
			return "m.depthWrite" + " = " + (m.depthWrite == null ? "null" : "" + m.depthWrite) + ";";
		}).name("depthWrite");
		let o5 = { };
		Object.defineProperty(o5,"depthTest",{ set : function(__value) {
			m.depthTest = __value;
		}, get : function() {
			return m.depthTest;
		}});
		ui_DevUI.patchController(g1.add(o5,"depthTest").name("depthTest"),function() {
			return "m.depthTest" + " = " + (m.depthTest == null ? "null" : "" + m.depthTest) + ";";
		}).name("depthTest");
		if(((m) instanceof three_MeshBasicMaterial)) {
			let m1 = m;
			let color = m1.color;
			if(color == null) {
				color = new three_Color();
				m1.color = color;
			}
			ui_DevUI.patchController(g1.addColor({ c : color.getHex()},"c").name("color").onChange(function(hex) {
				return color.setHex(hex);
			}),function() {
				return "m.color" + ".setHex(0x" + color.getHexString() + ");";
			});
		}
		if(((m) instanceof three_MeshStandardMaterial) || ((m) instanceof material_CustomPhysicalMaterial)) {
			type = "MeshStandardMaterial";
			let m1 = m;
			let o = { };
			Object.defineProperty(o,"flatShading",{ set : function(__value) {
				m1.flatShading = __value;
			}, get : function() {
				return m1.flatShading;
			}});
			ui_DevUI.patchController(g1.add(o,"flatShading").name("flatShading"),function() {
				return "m.flatShading" + " = " + (m1.flatShading == null ? "null" : "" + m1.flatShading) + ";";
			}).name("flatShading").onChange(function(_) {
				return m1.needsUpdate = true;
			});
			let o1 = { };
			Object.defineProperty(o1,"roughness",{ set : function(__value) {
				m1.roughness = __value;
			}, get : function() {
				return m1.roughness;
			}});
			let c = g1.add(o1,"roughness").name("roughness");
			c = c.min(0);
			c = c.max(1);
			ui_DevUI.patchController(c,function() {
				return "m.roughness" + " = " + m1.roughness + ";";
			}).name("roughness");
			let o2 = { };
			Object.defineProperty(o2,"metalness",{ set : function(__value) {
				m1.metalness = __value;
			}, get : function() {
				return m1.metalness;
			}});
			let c1 = g1.add(o2,"metalness").name("metalness");
			c1 = c1.min(0);
			c1 = c1.max(1);
			ui_DevUI.patchController(c1,function() {
				return "m.metalness" + " = " + m1.metalness + ";";
			}).name("metalness");
			let o3 = { };
			Object.defineProperty(o3,"emissiveIntensity",{ set : function(__value) {
				m1.emissiveIntensity = __value;
			}, get : function() {
				return m1.emissiveIntensity;
			}});
			let c2 = g1.add(o3,"emissiveIntensity").name("emissiveIntensity");
			c2 = c2.min(0);
			c2 = c2.max(20);
			ui_DevUI.patchController(c2,function() {
				return "m.emissiveIntensity" + " = " + m1.emissiveIntensity + ";";
			}).name("emissiveIntensity");
			let color = m1.color;
			if(color == null) {
				color = new three_Color();
				m1.color = color;
			}
			ui_DevUI.patchController(g1.addColor({ c : color.getHex()},"c").name("color").onChange(function(hex) {
				return color.setHex(hex);
			}),function() {
				return "m.color" + ".setHex(0x" + color.getHexString() + ");";
			});
			let color1 = m1.emissive;
			if(color1 == null) {
				color1 = new three_Color();
				m1.emissive = color1;
			}
			ui_DevUI.patchController(g1.addColor({ c : color1.getHex()},"c").name("emissive").onChange(function(hex) {
				return color1.setHex(hex);
			}),function() {
				return "m.emissive" + ".setHex(0x" + color1.getHexString() + ");";
			});
			let names = ["FrontSide","BackSide","DoubleSide"];
			let values = [three_Side.FrontSide,three_Side.BackSide,three_Side.DoubleSide];
			let obj = { };
			let _g = 0;
			let _g1 = names.length;
			while(_g < _g1) {
				let i = _g++;
				obj[names[i]] = values[i];
			}
			let o4 = { };
			Object.defineProperty(o4,"side",{ set : function(__strValue) {
				let _g = 0;
				while(_g < values.length) {
					let value = values[_g];
					++_g;
					if(Std.string(value) == __strValue) {
						m1.side = value;
						break;
					}
				}
			}, get : function() {
				return m1.side;
			}});
			ui_DevUI.patchController(g1.add(o4,"side",obj).name("side"),function() {
				return "m.side = " + names[values.indexOf(m1.side)] + ";";
			}).onChange(function(_) {
				return m1.needsUpdate = true;
			});
			let o5 = { };
			Object.defineProperty(o5,"envMapIntensity",{ set : function(__value) {
				m1.envMapIntensity = __value;
			}, get : function() {
				return m1.envMapIntensity;
			}});
			let c3 = g1.add(o5,"envMapIntensity").name("envMapIntensity");
			c3 = c3.min(0);
			c3 = c3.max(4);
			ui_DevUI.patchController(c3,function() {
				return "m.envMapIntensity" + " = " + m1.envMapIntensity + ";";
			}).name("envMapIntensity");
			let o6 = { };
			Object.defineProperty(o6,"aoMapIntensity",{ set : function(__value) {
				m1.aoMapIntensity = __value;
			}, get : function() {
				return m1.aoMapIntensity;
			}});
			let c4 = g1.add(o6,"aoMapIntensity").name("aoMapIntensity");
			c4 = c4.min(0);
			c4 = c4.max(4);
			ui_DevUI.patchController(c4,function() {
				return "m.aoMapIntensity" + " = " + m1.aoMapIntensity + ";";
			}).name("aoMapIntensity");
		}
		if(((m) instanceof three_MeshPhysicalMaterial)) {
			type = "MeshPhysicalMaterial";
			let m1 = m;
			let o = { };
			Object.defineProperty(o,"clearcoat",{ set : function(__value) {
				m1.clearcoat = __value;
			}, get : function() {
				return m1.clearcoat;
			}});
			let c = g1.add(o,"clearcoat").name("clearcoat");
			c = c.min(0);
			c = c.max(1);
			ui_DevUI.patchController(c,function() {
				return "m.clearcoat" + " = " + m1.clearcoat + ";";
			}).name("clearcoat");
			let o1 = { };
			Object.defineProperty(o1,"clearcoatRoughness",{ set : function(__value) {
				m1.clearcoatRoughness = __value;
			}, get : function() {
				return m1.clearcoatRoughness;
			}});
			let c1 = g1.add(o1,"clearcoatRoughness").name("clearcoatRoughness");
			c1 = c1.min(0);
			c1 = c1.max(1);
			ui_DevUI.patchController(c1,function() {
				return "m.clearcoatRoughness" + " = " + m1.clearcoatRoughness + ";";
			}).name("clearcoatRoughness");
			let o2 = { };
			Object.defineProperty(o2,"transmission",{ set : function(__value) {
				m1.transmission = __value;
			}, get : function() {
				return m1.transmission;
			}});
			let c2 = g1.add(o2,"transmission").name("transmission");
			c2 = c2.min(0);
			c2 = c2.max(1);
			ui_DevUI.patchController(c2,function() {
				return "m.transmission" + " = " + m1.transmission + ";";
			}).name("transmission");
			let o3 = { };
			Object.defineProperty(o3,"ior",{ set : function(__value) {
				m1.ior = __value;
			}, get : function() {
				return m1.ior;
			}});
			let c3 = g1.add(o3,"ior").name("ior");
			c3 = c3.min(0);
			c3 = c3.max(3);
			ui_DevUI.patchController(c3,function() {
				return "m.ior" + " = " + m1.ior + ";";
			}).name("ior");
			let o4 = { };
			Object.defineProperty(o4,"thickness",{ set : function(__value) {
				m1.thickness = __value;
			}, get : function() {
				return m1.thickness;
			}});
			let c4 = g1.add(o4,"thickness").name("thickness");
			c4 = c4.min(0);
			c4 = c4.max(3);
			ui_DevUI.patchController(c4,function() {
				return "m.thickness" + " = " + m1.thickness + ";";
			}).name("thickness");
			let color = m1.attenuationColor;
			if(color == null) {
				color = new three_Color();
				m1.attenuationColor = color;
			}
			ui_DevUI.patchController(g1.addColor({ c : color.getHex()},"c").name("attenuationColor").onChange(function(hex) {
				return color.setHex(hex);
			}),function() {
				return "m.attenuationColor" + ".setHex(0x" + color.getHexString() + ");";
			});
			let o5 = { };
			Object.defineProperty(o5,"attenuationDistance",{ set : function(__value) {
				m1.attenuationDistance = __value;
			}, get : function() {
				return m1.attenuationDistance;
			}});
			let c5 = g1.add(o5,"attenuationDistance").name("attenuationDistance");
			c5 = c5.min(0);
			c5 = c5.max(10);
			ui_DevUI.patchController(c5,function() {
				return "m.attenuationDistance" + " = " + m1.attenuationDistance + ";";
			}).name("attenuationDistance");
			let o6 = { };
			Object.defineProperty(o6,"sheen",{ set : function(__value) {
				m1.sheen = __value;
			}, get : function() {
				return m1.sheen;
			}});
			let c6 = g1.add(o6,"sheen").name("sheen");
			c6 = c6.min(0);
			c6 = c6.max(1);
			ui_DevUI.patchController(c6,function() {
				return "m.sheen" + " = " + m1.sheen + ";";
			}).name("sheen");
			let o7 = { };
			Object.defineProperty(o7,"sheenRoughness",{ set : function(__value) {
				m1.sheenRoughness = __value;
			}, get : function() {
				return m1.sheenRoughness;
			}});
			let c7 = g1.add(o7,"sheenRoughness").name("sheenRoughness");
			c7 = c7.min(0);
			c7 = c7.max(1);
			ui_DevUI.patchController(c7,function() {
				return "m.sheenRoughness" + " = " + m1.sheenRoughness + ";";
			}).name("sheenRoughness");
			let color1 = m1.sheenColor;
			if(color1 == null) {
				color1 = new three_Color();
				m1.sheenColor = color1;
			}
			ui_DevUI.patchController(g1.addColor({ c : color1.getHex()},"c").name("sheenColor").onChange(function(hex) {
				return color1.setHex(hex);
			}),function() {
				return "m.sheenColor" + ".setHex(0x" + color1.getHexString() + ");";
			});
		} else if(((m) instanceof material_CustomPhysicalMaterial)) {
			type = "CustomPhysicalMaterial";
			let m1 = m;
			let o = { };
			Object.defineProperty(o,"clearcoat",{ set : function(__value) {
				let v = __value;
				if(m1.clearcoat > 0 != v > 0) {
					m1.version++;
				}
				m1.clearcoat = v;
			}, get : function() {
				return m1.clearcoat;
			}});
			let c = g1.add(o,"clearcoat").name("clearcoat");
			c = c.min(0);
			c = c.max(1);
			ui_DevUI.patchController(c,function() {
				return "m.clearcoat" + " = " + m1.clearcoat + ";";
			}).name("clearcoat");
			let o1 = { };
			Object.defineProperty(o1,"clearcoatRoughness",{ set : function(__value) {
				m1.clearcoatRoughness = __value;
			}, get : function() {
				return m1.clearcoatRoughness;
			}});
			let c1 = g1.add(o1,"clearcoatRoughness").name("clearcoatRoughness");
			c1 = c1.min(0);
			c1 = c1.max(1);
			ui_DevUI.patchController(c1,function() {
				return "m.clearcoatRoughness" + " = " + m1.clearcoatRoughness + ";";
			}).name("clearcoatRoughness");
			let o2 = { };
			Object.defineProperty(o2,"transmission",{ set : function(__value) {
				let v = __value;
				if(m1.transmission > 0 != v > 0) {
					m1.version++;
				}
				m1.transmission = v;
			}, get : function() {
				return m1.transmission;
			}});
			let c2 = g1.add(o2,"transmission").name("transmission");
			c2 = c2.min(0);
			c2 = c2.max(1);
			ui_DevUI.patchController(c2,function() {
				return "m.transmission" + " = " + m1.transmission + ";";
			}).name("transmission");
			let o3 = { };
			Object.defineProperty(o3,"ior",{ set : function(__value) {
				m1.ior = __value;
			}, get : function() {
				return m1.ior;
			}});
			let c3 = g1.add(o3,"ior").name("ior");
			c3 = c3.min(0);
			c3 = c3.max(3);
			ui_DevUI.patchController(c3,function() {
				return "m.ior" + " = " + m1.ior + ";";
			}).name("ior");
			let o4 = { };
			Object.defineProperty(o4,"thickness",{ set : function(__value) {
				m1.thickness = __value;
			}, get : function() {
				return m1.thickness;
			}});
			let c4 = g1.add(o4,"thickness").name("thickness");
			c4 = c4.min(0);
			c4 = c4.max(4);
			ui_DevUI.patchController(c4,function() {
				return "m.thickness" + " = " + m1.thickness + ";";
			}).name("thickness");
			let color = m1.attenuationColor;
			if(color == null) {
				color = new three_Color();
				m1.attenuationColor = color;
			}
			ui_DevUI.patchController(g1.addColor({ c : color.getHex()},"c").name("attenuationColor").onChange(function(hex) {
				return color.setHex(hex);
			}),function() {
				return "m.attenuationColor" + ".setHex(0x" + color.getHexString() + ");";
			});
			let o5 = { };
			Object.defineProperty(o5,"attenuationDistance",{ set : function(__value) {
				m1.attenuationDistance = __value;
			}, get : function() {
				return m1.attenuationDistance;
			}});
			let c5 = g1.add(o5,"attenuationDistance").name("attenuationDistance");
			c5 = c5.min(0);
			c5 = c5.max(10);
			ui_DevUI.patchController(c5,function() {
				return "m.attenuationDistance" + " = " + m1.attenuationDistance + ";";
			}).name("attenuationDistance");
			let o6 = { };
			Object.defineProperty(o6,"sheen",{ set : function(__value) {
				let v = __value;
				if(m1.sheen > 0 != v > 0) {
					m1.version++;
				}
				m1.sheen = v;
			}, get : function() {
				return m1.sheen;
			}});
			let c6 = g1.add(o6,"sheen").name("sheen");
			c6 = c6.min(0);
			c6 = c6.max(1);
			ui_DevUI.patchController(c6,function() {
				return "m.sheen" + " = " + m1.sheen + ";";
			}).name("sheen");
			let o7 = { };
			Object.defineProperty(o7,"sheenRoughness",{ set : function(__value) {
				m1.sheenRoughness = __value;
			}, get : function() {
				return m1.sheenRoughness;
			}});
			let c7 = g1.add(o7,"sheenRoughness").name("sheenRoughness");
			c7 = c7.min(0);
			c7 = c7.max(1);
			ui_DevUI.patchController(c7,function() {
				return "m.sheenRoughness" + " = " + m1.sheenRoughness + ";";
			}).name("sheenRoughness");
			let color1 = m1.sheenColor;
			if(color1 == null) {
				color1 = new three_Color();
				m1.sheenColor = color1;
			}
			ui_DevUI.patchController(g1.addColor({ c : color1.getHex()},"c").name("sheenColor").onChange(function(hex) {
				return color1.setHex(hex);
			}),function() {
				return "m.sheenColor" + ".setHex(0x" + color1.getHexString() + ");";
			});
		}
		g1.name = "" + name + " :" + type;
		return g1;
	}
}
ui_DevUI.__name__ = true;
var three_WebGLRenderer = require("three").WebGLRenderer;
var three_TextureEncoding = require("three");
var three_ToneMapping = require("three");
class Std {
	static string(s) {
		return js_Boot.__string_rec(s,"");
	}
	static parseInt(x) {
		if(x != null) {
			let _g = 0;
			let _g1 = x.length;
			while(_g < _g1) {
				let i = _g++;
				let c = x.charCodeAt(i);
				if(c <= 8 || c >= 14 && c != 32 && c != 45) {
					let nc = x.charCodeAt(i + 1);
					let v = parseInt(x,nc == 120 || nc == 88 ? 16 : 10);
					if(isNaN(v)) {
						return null;
					} else {
						return v;
					}
				}
			}
		}
		return null;
	}
}
Std.__name__ = true;
class js_Boot {
	static __string_rec(o,s) {
		if(o == null) {
			return "null";
		}
		if(s.length >= 5) {
			return "<...>";
		}
		let t = typeof(o);
		if(t == "function" && (o.__name__ || o.__ename__)) {
			t = "object";
		}
		switch(t) {
		case "function":
			return "<function>";
		case "object":
			if(o.__enum__) {
				let e = $hxEnums[o.__enum__];
				let con = e.__constructs__[o._hx_index];
				let n = con._hx_name;
				if(con.__params__) {
					s = s + "\t";
					return n + "(" + ((function($this) {
						var $r;
						let _g = [];
						{
							let _g1 = 0;
							let _g2 = con.__params__;
							while(true) {
								if(!(_g1 < _g2.length)) {
									break;
								}
								let p = _g2[_g1];
								_g1 = _g1 + 1;
								_g.push(js_Boot.__string_rec(o[p],s));
							}
						}
						$r = _g;
						return $r;
					}(this))).join(",") + ")";
				} else {
					return n;
				}
			}
			if(((o) instanceof Array)) {
				let str = "[";
				s += "\t";
				let _g = 0;
				let _g1 = o.length;
				while(_g < _g1) {
					let i = _g++;
					str += (i > 0 ? "," : "") + js_Boot.__string_rec(o[i],s);
				}
				str += "]";
				return str;
			}
			let tostr;
			try {
				tostr = o.toString;
			} catch( _g ) {
				return "???";
			}
			if(tostr != null && tostr != Object.toString && typeof(tostr) == "function") {
				let s2 = o.toString();
				if(s2 != "[object Object]") {
					return s2;
				}
			}
			let str = "{\n";
			s += "\t";
			let hasp = o.hasOwnProperty != null;
			let k = null;
			for( k in o ) {
			if(hasp && !o.hasOwnProperty(k)) {
				continue;
			}
			if(k == "prototype" || k == "__class__" || k == "__super__" || k == "__interfaces__" || k == "__properties__") {
				continue;
			}
			if(str.length != 2) {
				str += ", \n";
			}
			str += s + k + " : " + js_Boot.__string_rec(o[k],s);
			}
			s = s.substring(1);
			str += "\n" + s + "}";
			return str;
		case "string":
			return o;
		default:
			return String(o);
		}
	}
}
js_Boot.__name__ = true;
var three_Scene = require("three").Scene;
class environment_EnvironmentManager {
	constructor(renderer,scene,path,onEnvironmentLoaded) {
		this._environmentPath = null;
		this.renderer = renderer;
		this.scene = scene;
		this.onEnvironmentLoaded = onEnvironmentLoaded != null ? onEnvironmentLoaded : function(_) {
		};
		this.environmentSun = new three_DirectionalLight(16777215,0);
		this.environmentSun.castShadow = true;
		this.environmentSun.shadow.bias = -0.001;
		this.environmentSun.shadow.radius = 7;
		this.environmentSun.layers.enable(1);
		this.environmentSun.visible = false;
		scene.add(this.environmentSun);
		this.environmentAmbient = new three_AmbientLight(0,1);
		this.environmentAmbient.visible = false;
		scene.add(this.environmentAmbient);
		this.setEnvironmentMapPath(path);
	}
	setEnvironmentMapPath(path,onLoaded,onError) {
		if(path == this.get_environmentPath()) {
			return;
		}
		if(onLoaded == null) {
			onLoaded = function(e) {
			};
		}
		if(onError == null) {
			onError = function(e) {
				$global.console.error(e);
			};
		}
		this._environmentPath = path;
		let _gthis = this;
		if(path != null) {
			let ext = haxe_io_Path.extension(path);
			switch(ext.toLowerCase()) {
			case "hdr":
				let iblGenerator = new tool_IBLGenerator(this.renderer);
				iblGenerator.compileEquirectangularShader();
				new three_examples_jsm_loaders_rgbeloader_RGBELoader().setDataType(three_TextureDataType.FloatType).load(path,function(texture,texData) {
					if(_gthis._pmremRenderTarget != null) {
						_gthis._pmremRenderTarget.dispose();
					}
					_gthis._pmremRenderTarget = iblGenerator.fromEquirectangular(texture);
					iblGenerator.dispose();
					_gthis._pmremRenderTarget.texture.sourceFile = path;
					_gthis.setEnvironmentMap(_gthis._pmremRenderTarget.texture);
					onLoaded(_gthis._pmremRenderTarget.texture);
					_gthis.onEnvironmentLoaded(_gthis._pmremRenderTarget.texture);
				});
				break;
			case "png":
				new three_TextureLoader().load(path,function(texture) {
					texture.minFilter = three_TextureFilter.NearestFilter;
					texture.magFilter = three_TextureFilter.NearestFilter;
					texture.type = three_TextureDataType.UnsignedByteType;
					texture.format = three_PixelFormat.RGBEFormat;
					texture.encoding = three_TextureEncoding.RGBDEncoding;
					texture.mapping = three_Mapping.CubeUVReflectionMapping;
					texture.generateMipmaps = false;
					texture.flipY = false;
					texture.sourceFile = path;
					_gthis.setEnvironmentMap(texture);
					onLoaded(texture);
					_gthis.onEnvironmentLoaded(texture);
				});
				break;
			default:
				let error = "Unknown environment extension " + ext;
				$global.console.error(error);
				onError(error);
			}
		}
	}
	setEnvironmentMap(texture) {
		if(this.scene.environment != null) {
			this.scene.environment.dispose();
		}
		this.scene.environment = texture;
	}
	downloadPmremEnvironmentMap() {
		let document = window.document;
		let renderTarget = this._pmremRenderTarget;
		let environmentPath = this.get_environmentPath();
		if(renderTarget != null && environmentPath != null) {
			let w = renderTarget.width | 0;
			let h = renderTarget.height | 0;
			let buffer = new Uint8ClampedArray(w * h * 4 | 0);
			this.renderer.readRenderTargetPixels(renderTarget,0,0,w,h,buffer);
			let pngCanvas = document.createElement("canvas");
			pngCanvas.width = w;
			pngCanvas.height = h;
			pngCanvas.getContext("2d",null).putImageData(new ImageData(buffer,w,h),0,0);
			let encodingName;
			switch(renderTarget.texture.encoding) {
			case three_TextureEncoding.RGBDEncoding:
				encodingName = "rgbd";
				break;
			case three_TextureEncoding.RGBEEncoding:
				encodingName = "rgbe";
				break;
			case three_TextureEncoding.RGBM16Encoding:
				encodingName = "rgbm17";
				break;
			case three_TextureEncoding.RGBM7Encoding:
				encodingName = "rgbm7";
				break;
			default:
				encodingName = null;
			}
			let filename = haxe_io_Path.withoutDirectory(haxe_io_Path.withoutExtension(environmentPath)) + (encodingName != null ? "." + encodingName : "") + ("." + "png");
			pngCanvas.toBlob(function(blob) {
				let a = document.createElement("a");
				document.body.appendChild(a);
				a.style.display = "none";
				let url = URL.createObjectURL(blob);
				a.href = url;
				a.download = filename;
				a.click();
				URL.revokeObjectURL(url);
			},"image/" + "png",1);
		} else {
			window.alert("First load a .hdr environment file in order to download a pre-processed version");
		}
	}
	set_environmentPath(v) {
		this.setEnvironmentMapPath(v);
		return v;
	}
	get_environmentPath() {
		return this._environmentPath;
	}
}
environment_EnvironmentManager.__name__ = true;
var three_DirectionalLight = require("three").DirectionalLight;
var three_AmbientLight = require("three").AmbientLight;
function Main_main() {
	window.document.body.appendChild(Main_canvas);
	Main_scene.add(Main_background);
	Main_scene.add(new Vortex());
	Main_scene.add(new three_AxesHelper());
	Main_arcBallControl.target.y = 0.;
	Main_animationFrame(window.performance.now());
}
function Main_animationFrame(time_ms) {
	let time_s = time_ms / 1000;
	let dt_ms = Main_animationFrame_lastTime_ms > 0 ? time_ms - Main_animationFrame_lastTime_ms : 0.0;
	if(dt_ms < 1) {
		dt_ms = 1;
	} else if(dt_ms > 33.3333333333333357) {
		dt_ms = 33.3333333333333357;
	}
	Main_animationFrame_lastTime_ms = time_ms;
	Main_uTime_s.value = time_s;
	let gl = Main_renderer.getContext();
	let x = window.innerWidth;
	let y = window.innerHeight;
	let b = Main_pixelRatio;
	let x1 = Math.floor(x * b);
	let y1 = Math.floor(y * b);
	if(!(x1 == gl.drawingBufferWidth && y1 == gl.drawingBufferHeight)) {
		Main_canvas.width = Math.floor(x1);
		Main_canvas.height = Math.floor(y1);
	}
	let newAspect = x1 / y1;
	if(Main_camera.aspect != newAspect) {
		Main_camera.aspect = newAspect;
		Main_camera.updateProjectionMatrix();
	}
	Main_update(time_s,dt_ms / 1000);
	Main_renderer.setRenderTarget(null);
	Main_renderer.setViewport(0,0,gl.drawingBufferWidth,gl.drawingBufferHeight);
	Main_renderer.clear(true,true,true);
	Main_renderer.render(Main_scene,Main_camera);
	window.requestAnimationFrame(Main_animationFrame);
}
function Main_update(time_s,dt_s) {
	let _this = Main_arcBallControl;
	let camera = Main_camera;
	_this.angleAroundY.step(dt_s);
	_this.angleAroundXZ.step(dt_s);
	_this.axialRotation.step(dt_s);
	_this.radius.step(dt_s);
	_this.position.x = _this.radius.value * Math.sin(_this.angleAroundY.value) * Math.cos(_this.angleAroundXZ.value);
	_this.position.z = _this.radius.value * Math.cos(_this.angleAroundY.value) * Math.cos(_this.angleAroundXZ.value);
	_this.position.y = _this.radius.value * Math.sin(_this.angleAroundXZ.value);
	let this1 = _this.position;
	let v = this1;
	let lenSq = v.x * this1.x + v.y * this1.y + v.z * this1.z;
	let denominator = lenSq == 0.0 ? 1.0 : Math.sqrt(lenSq);
	let angle = _this.axialRotation.value;
	let sa = Math.sin(angle * 0.5);
	let x = v.x / denominator * sa;
	let y = v.y / denominator * sa;
	let z = v.z / denominator * sa;
	let w = Math.cos(angle * 0.5);
	let angle1 = _this.angleAroundY.value;
	let sa1 = Math.sin(angle1 * 0.5);
	let x1 = 0 * sa1;
	let y1 = 1 * sa1;
	let z1 = 0 * sa1;
	let w1 = Math.cos(angle1 * 0.5);
	let angle2 = -_this.angleAroundXZ.value;
	let sa2 = Math.sin(angle2 * 0.5);
	let x2 = 1 * sa2;
	let y2 = 0 * sa2;
	let z2 = 0 * sa2;
	let w2 = Math.cos(angle2 * 0.5);
	let this2 = _this.orientation;
	let x3 = x1 * w2 + y1 * z2 - z1 * y2 + w1 * x2;
	let y3 = -x1 * z2 + y1 * w2 + z1 * x2 + w1 * y2;
	let z3 = x1 * y2 - y1 * x2 + z1 * w2 + w1 * z2;
	let w3 = -x1 * x2 - y1 * y2 - z1 * z2 + w1 * w2;
	this2.x = x * w3 + y * z3 - z * y3 + w * x3;
	this2.y = -x * z3 + y * w3 + z * x3 + w * y3;
	this2.z = x * y3 - y * x3 + z * w3 + w * z3;
	this2.w = -x * x3 - y * y3 - z * z3 + w * w3;
	let a = _this.position;
	let b = _this.target;
	let q = _this.orientation;
	camera.position.x = a.x + b.x;
	camera.position.y = a.y + b.y;
	camera.position.z = a.z + b.z;
	camera.quaternion.x = q.x;
	camera.quaternion.y = q.y;
	camera.quaternion.z = q.z;
	camera.quaternion.w = q.w;
}
function Main_initDevUI() {
	let gui = new ui_DevUI({ closed : false});
	gui.domElement.style.userSelect = "none";
	gui.domElement.parentElement.style.zIndex = "1000";
	let g = gui.addFolder("Rendering");
	let o = { };
	Object.defineProperty(o,"pixelRatio",{ set : function(__value) {
		Main_pixelRatio = __value;
	}, get : function() {
		return Main_pixelRatio;
	}});
	let c = g.add(o,"pixelRatio").name("pixelRatio");
	c = c.min(0.1);
	c = c.max(4);
	ui_DevUI.patchController(c,function() {
		return "pixelRatio" + " = " + Main_pixelRatio + ";";
	}).name("pixelRatio").name("resolution");
	let o1 = { };
	Object.defineProperty(o1,"fov",{ set : function(__value) {
		Main_camera.fov = __value;
	}, get : function() {
		return Main_camera.fov;
	}});
	let c1 = g.add(o1,"fov").name("fov");
	c1 = c1.min(1);
	c1 = c1.max(200);
	ui_DevUI.patchController(c1,function() {
		return "camera.fov" + " = " + Main_camera.fov + ";";
	}).name("fov").onChange(function(_) {
		Main_camera.updateProjectionMatrix();
	});
	let renderer = Main_renderer;
	let names = ["NoToneMapping","LinearToneMapping","ReinhardToneMapping","CineonToneMapping","ACESFilmicToneMapping"];
	let values = [three_ToneMapping.NoToneMapping,three_ToneMapping.LinearToneMapping,three_ToneMapping.ReinhardToneMapping,three_ToneMapping.CineonToneMapping,three_ToneMapping.ACESFilmicToneMapping];
	let obj = { };
	let _g = 0;
	let _g1 = names.length;
	while(_g < _g1) {
		let i = _g++;
		obj[names[i]] = values[i];
	}
	let o2 = { };
	Object.defineProperty(o2,"toneMapping",{ set : function(__strValue) {
		let _g = 0;
		while(_g < values.length) {
			let value = values[_g];
			++_g;
			if(Std.string(value) == __strValue) {
				renderer.toneMapping = value;
				break;
			}
		}
	}, get : function() {
		return renderer.toneMapping;
	}});
	ui_DevUI.patchController(g.add(o2,"toneMapping",obj).name("toneMapping"),function() {
		return "renderer.toneMapping = " + names[values.indexOf(renderer.toneMapping)] + ";";
	}).onChange(function(v) {
		let outputEncoding = renderer.outputEncoding;
		renderer.outputEncoding = outputEncoding != three_TextureEncoding.LinearEncoding ? three_TextureEncoding.LinearEncoding : three_TextureEncoding.GammaEncoding;
		return window.requestAnimationFrame(function(t) {
			renderer.outputEncoding = outputEncoding;
		});
	});
	let names1 = ["LinearEncoding","sRGBEncoding","GammaEncoding","RGBEEncoding","LogLuvEncoding","RGBM7Encoding","RGBM16Encoding","RGBDEncoding"];
	let values1 = [three_TextureEncoding.LinearEncoding,three_TextureEncoding.sRGBEncoding,three_TextureEncoding.GammaEncoding,three_TextureEncoding.RGBEEncoding,three_TextureEncoding.LogLuvEncoding,three_TextureEncoding.RGBM7Encoding,three_TextureEncoding.RGBM16Encoding,three_TextureEncoding.RGBDEncoding];
	let obj1 = { };
	let _g2 = 0;
	let _g3 = names1.length;
	while(_g2 < _g3) {
		let i = _g2++;
		obj1[names1[i]] = values1[i];
	}
	let o3 = { };
	Object.defineProperty(o3,"outputEncoding",{ set : function(__strValue) {
		let _g = 0;
		while(_g < values1.length) {
			let value = values1[_g];
			++_g;
			if(Std.string(value) == __strValue) {
				renderer.outputEncoding = value;
				break;
			}
		}
	}, get : function() {
		return renderer.outputEncoding;
	}});
	ui_DevUI.patchController(g.add(o3,"outputEncoding",obj1).name("outputEncoding"),function() {
		return "renderer.outputEncoding = " + names1[values1.indexOf(renderer.outputEncoding)] + ";";
	});
	let o4 = { };
	Object.defineProperty(o4,"toneMappingExposure",{ set : function(__value) {
		renderer.toneMappingExposure = __value;
	}, get : function() {
		return renderer.toneMappingExposure;
	}});
	let c2 = g.add(o4,"toneMappingExposure").name("toneMappingExposure");
	c2 = c2.min(0);
	c2 = c2.max(4);
	ui_DevUI.patchController(c2,function() {
		return "renderer.toneMappingExposure" + " = " + renderer.toneMappingExposure + ";";
	}).name("toneMappingExposure");
	let o5 = { };
	Object.defineProperty(o5,"enabled",{ set : function(__value) {
		renderer.shadowMap.enabled = __value;
	}, get : function() {
		return renderer.shadowMap.enabled;
	}});
	ui_DevUI.patchController(g.add(o5,"enabled").name("enabled"),function() {
		return "renderer.shadowMap.enabled" + " = " + Std.string(renderer.shadowMap.enabled) + ";";
	}).name("enabled").name("Shadows");
	let options = ["assets/env/leadenhall_market_1k.hdr","assets/env/hilly_terrain_01_1k.rgbd.png","assets/env/snowy_park_01_1k.rgbd.png","assets/env/birchwood_2k.rgbd.png","assets/env/christmas_photo_studio_01_1k.hdr","assets/env/royal_esplanade_1k.rgbd.png","assets/env/winter_lake_01_1k.rgbd.png","assets/env/snowy_forest_path_01_1k.rgbd.png","assets/env/night_bridge_2k.rgbd.png","assets/env/kiara_1_dawn_2k.rgbd.png","assets/env/paul_lobe_haus_1k.rgbd.png","assets/env/venice_sunset_2k.rgbd.png","assets/env/blouberg_sunrise_1_2k.rgbd.png","assets/env/the_sky_is_on_fire_2k.rgbd.png","assets/env/cinema_lobby_1k.hdr"];
	let _this = options;
	let result = new Array(_this.length);
	let _g4 = 0;
	let _g11 = _this.length;
	while(_g4 < _g11) {
		let i = _g4++;
		result[i] = Std.string(_this[i]);
	}
	let names2 = result;
	let values2 = options;
	let obj2 = { };
	let _g5 = 0;
	let _g6 = names2.length;
	while(_g5 < _g6) {
		let i = _g5++;
		obj2[names2[i]] = values2[i];
	}
	let o6 = { };
	Object.defineProperty(o6,"environmentPath",{ set : function(__strValue) {
		let _g = 0;
		while(_g < values2.length) {
			let value = values2[_g];
			++_g;
			if((value == null ? "null" : "" + value) == __strValue) {
				Main_environmentManager.set_environmentPath(value);
				break;
			}
		}
	}, get : function() {
		return Main_environmentManager.get_environmentPath();
	}});
	ui_DevUI.patchController(g.add(o6,"environmentPath",obj2).name("environmentPath"),function() {
		return "environmentManager.environmentPath = " + names2[values2.indexOf(Main_environmentManager.get_environmentPath())] + ";";
	});
	let o7 = { };
	Object.defineProperty(o7,"roughness",{ set : function(__value) {
		Main_background.material.uRoughness.value = __value;
	}, get : function() {
		return Main_background.material.uRoughness.value;
	}});
	let c3 = g.add(o7,"roughness").name("roughness");
	c3 = c3.min(0);
	c3 = c3.max(1);
	ui_DevUI.patchController(c3,function() {
		return "background.roughness" + " = " + Main_background.material.uRoughness.value + ";";
	}).name("roughness").name("Background Blur");
	ui_DevUI.patchController(g.add({ "fn" : function() {
		Main_environmentManager.downloadPmremEnvironmentMap();
	}},"fn").name("() -> environmentManager.downloadPmremEnvironmentMap()"),function() {
		return "() -> environmentManager.downloadPmremEnvironmentMap()" + ";";
	}).name("Download Processed HDR");
	let g1 = gui.addFolder("Controls");
	let c4 = Main_arcBallControl;
	let o8 = { };
	Object.defineProperty(o8,"dragSpeed",{ set : function(__value) {
		c4.dragSpeed = __value;
	}, get : function() {
		return c4.dragSpeed;
	}});
	let c5 = g1.add(o8,"dragSpeed").name("dragSpeed");
	c5 = c5.min(0);
	c5 = c5.max(15);
	ui_DevUI.patchController(c5,function() {
		return "c.dragSpeed" + " = " + c4.dragSpeed + ";";
	}).name("dragSpeed");
	let o9 = { };
	Object.defineProperty(o9,"zoomSpeed",{ set : function(__value) {
		c4.zoomSpeed = __value;
	}, get : function() {
		return c4.zoomSpeed;
	}});
	let c6 = g1.add(o9,"zoomSpeed").name("zoomSpeed");
	c6 = c6.min(0);
	c6 = c6.max(20);
	ui_DevUI.patchController(c6,function() {
		return "c.zoomSpeed" + " = " + c4.zoomSpeed + ";";
	}).name("zoomSpeed");
	let o10 = { };
	Object.defineProperty(o10,"strength",{ set : function(__value) {
		let v = __value;
		c4.angleAroundY.strength = v;
		c4.angleAroundXZ.strength = v;
		c4.radius.strength = v;
	}, get : function() {
		return c4.angleAroundY.strength;
	}});
	let c7 = g1.add(o10,"strength").name("strength");
	c7 = c7.min(0);
	c7 = c7.max(1000);
	ui_DevUI.patchController(c7,function() {
		return "c.strength" + " = " + c4.angleAroundY.strength + ";";
	}).name("strength");
	let o11 = { };
	Object.defineProperty(o11,"damping",{ set : function(__value) {
		let v = __value;
		c4.angleAroundY.damping = v;
		c4.angleAroundXZ.damping = v;
		c4.radius.damping = v;
	}, get : function() {
		return c4.angleAroundY.damping;
	}});
	let c8 = g1.add(o11,"damping").name("damping");
	c8 = c8.min(0);
	c8 = c8.max(200);
	ui_DevUI.patchController(c8,function() {
		return "c.damping" + " = " + c4.angleAroundY.damping + ";";
	}).name("damping");
	return gui;
}
class Reflect {
	static field(o,field) {
		try {
			return o[field];
		} catch( _g ) {
			return null;
		}
	}
	static fields(o) {
		let a = [];
		if(o != null) {
			let hasOwnProperty = Object.prototype.hasOwnProperty;
			for( var f in o ) {
			if(f != "__id__" && f != "hx__closures__" && hasOwnProperty.call(o,f)) {
				a.push(f);
			}
			}
		}
		return a;
	}
}
Reflect.__name__ = true;
function Structure_extendAny(base,extendWidth) {
	let extended = { };
	if(base != null) {
		let _g = 0;
		let _g1 = Reflect.fields(base);
		while(_g < _g1.length) {
			let field = _g1[_g];
			++_g;
			extended[field] = Reflect.field(base,field);
		}
	}
	if(extendWidth != null) {
		let _g = 0;
		let _g1 = Reflect.fields(extendWidth);
		while(_g < _g1.length) {
			let field = _g1[_g];
			++_g;
			extended[field] = Reflect.field(extendWidth,field);
		}
	}
	return extended;
}
class Vec2Data {
	constructor(x,y) {
		this.x = x;
		this.y = y;
	}
}
Vec2Data.__name__ = true;
class Vec3Data {
	constructor(x,y,z) {
		this.x = x;
		this.y = y;
		this.z = z;
	}
}
Vec3Data.__name__ = true;
class Vec4Data {
	constructor(x,y,z,w) {
		this.x = x;
		this.y = y;
		this.z = z;
		this.w = w;
	}
}
Vec4Data.__name__ = true;
class Vortex extends three_Mesh {
	constructor() {
		let vortexMaterial = new VortexMaterial({ side : three_Side.DoubleSide});
		vortexMaterial.visible = true;
		vortexMaterial.transparent = false;
		vortexMaterial.opacity = 1;
		vortexMaterial.colorWrite = true;
		vortexMaterial.depthWrite = true;
		vortexMaterial.depthTest = true;
		vortexMaterial.flatShading = false;
		vortexMaterial.roughness = 0.24711356195071515;
		vortexMaterial.metalness = 0.1037394451145959;
		vortexMaterial.emissiveIntensity = 0;
		vortexMaterial.color.setHex(261);
		vortexMaterial.emissive.setHex(0);
		vortexMaterial.side = three_Side.DoubleSide;
		vortexMaterial.envMapIntensity = 1;
		vortexMaterial.aoMapIntensity = 1;
		if(vortexMaterial.clearcoat > 0 != false) {
			vortexMaterial.version++;
		}
		vortexMaterial.clearcoat = 0;
		vortexMaterial.clearcoatRoughness = 0;
		if(vortexMaterial.transmission > 0 != false) {
			vortexMaterial.version++;
		}
		vortexMaterial.transmission = 0;
		vortexMaterial.ior = 1.4692400482509047;
		vortexMaterial.thickness = 0;
		vortexMaterial.attenuationColor.setHex(16777215);
		vortexMaterial.attenuationDistance = 0;
		if(vortexMaterial.sheen > 0 != false) {
			vortexMaterial.version++;
		}
		vortexMaterial.sheen = 0;
		vortexMaterial.sheenRoughness = 1;
		vortexMaterial.sheenColor.setHex(0);
		ui_DevUI.patchFolder(ui_DevUI.internalAddMaterial(Main_devUI,vortexMaterial,"vortexMaterial"));
		super(new VortexGeometry(100,100),vortexMaterial);
		let domeMaterial = new three_MeshPhysicalMaterial({ });
		domeMaterial.visible = true;
		domeMaterial.transparent = false;
		domeMaterial.opacity = 1;
		domeMaterial.colorWrite = true;
		domeMaterial.depthWrite = true;
		domeMaterial.depthTest = true;
		domeMaterial.flatShading = false;
		domeMaterial.roughness = 0.07065311046010685;
		domeMaterial.metalness = 0;
		domeMaterial.emissiveIntensity = 1;
		domeMaterial.color.setHex(16777215);
		domeMaterial.emissive.setHex(0);
		domeMaterial.side = three_Side.DoubleSide;
		domeMaterial.envMapIntensity = 1;
		domeMaterial.aoMapIntensity = 1;
		domeMaterial.clearcoat = 0.13682577976908494;
		domeMaterial.clearcoatRoughness = 0;
		domeMaterial.transmission = 1;
		domeMaterial.ior = 1.7008443908323283;
		domeMaterial.thickness = 0.14578666207134242;
		domeMaterial.attenuationColor.setHex(1718427);
		domeMaterial.attenuationDistance = 6.6620713424090985;
		domeMaterial.sheen = 0;
		domeMaterial.sheenRoughness = 1;
		domeMaterial.sheenColor.setHex(0);
		ui_DevUI.patchFolder(ui_DevUI.internalAddMaterial(Main_devUI,domeMaterial,"domeMaterial"));
		let dome = new three_Mesh(new three_SphereGeometry(1,40,40,0,Math.PI),domeMaterial);
		dome.rotateX(-Math.PI * 0.5);
		dome.scale.setScalar(3);
		this.add(dome);
	}
}
Vortex.__name__ = true;
class material_CustomPhysicalMaterial extends three_ShaderMaterial {
	constructor(additionalUniforms,parameters) {
		let tmp = Structure_extendAny(Three.ShaderLib.physical.uniforms,additionalUniforms != null ? additionalUniforms : { });
		super(Structure_extendAny({ defines : { "STANDARD" : "", "PHYSICAL" : ""}, uniforms : tmp, vertexShader : Three.ShaderLib.physical.vertexShader, fragmentShader : Three.ShaderLib.physical.fragmentShader, fog : true},parameters != null ? parameters : { }));
		this.flatShading = false;
		this.color = new three_Color(16777215);
		this.roughness = 1.0;
		this.metalness = 0.0;
		this.map = null;
		this.lightMap = null;
		this.lightMapIntensity = 1.0;
		this.aoMap = null;
		this.aoMapIntensity = 1.0;
		this.emissive = new three_Color(0);
		this.emissiveIntensity = 1.0;
		this.emissiveMap = null;
		this.bumpMap = null;
		this.bumpScale = 1;
		this.normalMap = null;
		this.normalMapType = three_NormalMapTypes.TangentSpaceNormalMap;
		this.normalScale = new three_Vector2(1,1);
		this.displacementMap = null;
		this.displacementScale = 1;
		this.displacementBias = 0;
		this.roughnessMap = null;
		this.metalnessMap = null;
		this.alphaMap = null;
		this.envMap = null;
		this.envMapIntensity = 1.0;
		this.refractionRatio = 0.98;
		this.wireframeLinecap = "round";
		this.wireframeLinejoin = "round";
		this.isMeshStandardMaterial = true;
		if(this.clearcoat > 0 != false) {
			this.version++;
		}
		this.clearcoat = 0.0;
		this.clearcoatMap = null;
		this.clearcoatRoughness = 0.0;
		this.clearcoatRoughnessMap = null;
		this.clearcoatNormalScale = new three_Vector2(1,1);
		this.clearcoatNormalMap = null;
		if(this.sheen > 0 != false) {
			this.version++;
		}
		this.sheen = 0.0;
		this.sheenColor = new three_Color(0);
		this.sheenColorMap = null;
		this.sheenRoughness = 1.0;
		this.sheenRoughnessMap = null;
		this.transparency = 0.0;
		if(this.transmission > 0 != false) {
			this.version++;
		}
		this.transmission = 0.;
		this.ior = 1.5;
		this.transmissionMap = null;
		this.thickness = 0.01;
		this.thicknessMap = null;
		this.attenuationDistance = 0.0;
		this.attenuationColor = new three_Color(1,1,1);
		this.specularIntensity = 1.0;
		this.specularColor = new three_Color(1,1,1);
		this.specularIntensityMap = null;
		this.specularColorMap = null;
		this.isMeshPhysicalMaterial = true;
		this.isInitialized = true;
		if(parameters != null) {
			this.setValues(parameters);
		}
	}
	setValues(parameters) {
		if(!this.isInitialized) {
			let _g = 0;
			let _g1 = Reflect.fields(parameters);
			while(_g < _g1.length) this[_g1[_g++]] = null;
		}
		super.setValues(parameters);
	}
}
material_CustomPhysicalMaterial.__name__ = true;
class VortexMaterial extends material_CustomPhysicalMaterial {
	constructor(options) {
		super(null,options);
		this.defines["USE_UV"] = "1";
		this.fragmentShader = "\n\t\t\t#define STANDARD\n\t\t\t#ifdef PHYSICAL\n\t\t\t\t#define IOR\n\t\t\t\t#define SPECULAR\n\t\t\t#endif\n\t\t\tuniform vec3 diffuse;\n\t\t\tuniform vec3 emissive;\n\t\t\tuniform float roughness;\n\t\t\tuniform float metalness;\n\t\t\tuniform float opacity;\n\t\t\t#ifdef IOR\n\t\t\t\tuniform float ior;\n\t\t\t#endif\n\t\t\t#ifdef SPECULAR\n\t\t\t\tuniform float specularIntensity;\n\t\t\t\tuniform vec3 specularColor;\n\t\t\t\t#ifdef USE_SPECULARINTENSITYMAP\n\t\t\t\t\tuniform sampler2D specularIntensityMap;\n\t\t\t\t#endif\n\t\t\t\t#ifdef USE_SPECULARCOLORMAP\n\t\t\t\t\tuniform sampler2D specularColorMap;\n\t\t\t\t#endif\n\t\t\t#endif\n\t\t\t#ifdef USE_CLEARCOAT\n\t\t\t\tuniform float clearcoat;\n\t\t\t\tuniform float clearcoatRoughness;\n\t\t\t#endif\n\t\t\t#ifdef USE_SHEEN\n\t\t\t\tuniform vec3 sheenColor;\n\t\t\t\tuniform float sheenRoughness;\n\t\t\t\t#ifdef USE_SHEENCOLORMAP\n\t\t\t\t\tuniform sampler2D sheenColorMap;\n\t\t\t\t#endif\n\t\t\t\t#ifdef USE_SHEENROUGHNESSMAP\n\t\t\t\t\tuniform sampler2D sheenRoughnessMap;\n\t\t\t\t#endif\n\t\t\t#endif\n\t\t\tvarying vec3 vViewPosition;\n\t\t\t#include <common>\n\t\t\t#include <packing>\n\t\t\t#include <dithering_pars_fragment>\n\t\t\t#include <color_pars_fragment>\n\t\t\t#include <uv_pars_fragment>\n\t\t\t#include <uv2_pars_fragment>\n\t\t\t#include <map_pars_fragment>\n\t\t\t#include <alphamap_pars_fragment>\n\t\t\t#include <alphatest_pars_fragment>\n\t\t\t#include <aomap_pars_fragment>\n\t\t\t#include <lightmap_pars_fragment>\n\t\t\t#include <emissivemap_pars_fragment>\n\t\t\t#include <bsdfs>\n\t\t\t#include <cube_uv_reflection_fragment>\n\t\t\t#include <envmap_common_pars_fragment>\n\t\t\t#include <envmap_physical_pars_fragment>\n\t\t\t#include <fog_pars_fragment>\n\t\t\t#include <lights_pars_begin>\n\t\t\t#include <normal_pars_fragment>\n\t\t\t#include <lights_physical_pars_fragment>\n\t\t\t#include <transmission_pars_fragment>\n\t\t\t#include <shadowmap_pars_fragment>\n\t\t\t#include <bumpmap_pars_fragment>\n\t\t\t#include <normalmap_pars_fragment>\n\t\t\t#include <clearcoat_pars_fragment>\n\t\t\t#include <roughnessmap_pars_fragment>\n\t\t\t#include <metalnessmap_pars_fragment>\n\t\t\t#include <logdepthbuf_pars_fragment>\n\t\t\t#include <clipping_planes_pars_fragment>\n\n\t\t\tfloat stripes(vec2 p, float w, float i) {\n\t\t\t\tw *= 0.5;\n\t\t\t\tfloat x = fract((p.x - p.y) * 10.);\n\t\t\t\tfloat e = 0.034;\n\t\t\t\treturn smoothstep(0.5 - w - e, 0.5-w, x) * smoothstep(0.5 + w + e, 0.5+w, x);\n\t\t\t}\n\n\t\t\tvoid main() {\n\t\t\t\t#include <clipping_planes_fragment>\n\t\t\t\tvec4 diffuseColor = vec4( diffuse, opacity );\n\n\t\t\t\tdiffuseColor = vec4(stripes(vUv, 0.5, 10.));\n\n\t\t\t\tReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );\n\t\t\t\tvec3 totalEmissiveRadiance = emissive;\n\t\t\t\t#include <logdepthbuf_fragment>\n\t\t\t\t#include <map_fragment>\n\t\t\t\t#include <color_fragment>\n\t\t\t\t#include <alphamap_fragment>\n\t\t\t\t#include <alphatest_fragment>\n\t\t\t\t#include <roughnessmap_fragment>\n\t\t\t\t#include <metalnessmap_fragment>\n\t\t\t\t#include <normal_fragment_begin>\n\t\t\t\t#include <normal_fragment_maps>\n\t\t\t\t#include <clearcoat_normal_fragment_begin>\n\t\t\t\t#include <clearcoat_normal_fragment_maps>\n\t\t\t\t#include <emissivemap_fragment>\n\t\t\t\t#include <lights_physical_fragment>\n\t\t\t\t#include <lights_fragment_begin>\n\t\t\t\t#include <lights_fragment_maps>\n\t\t\t\t#include <lights_fragment_end>\n\t\t\t\t#include <aomap_fragment>\n\t\t\t\tvec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;\n\t\t\t\tvec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;\n\t\t\t\t#include <transmission_fragment>\n\t\t\t\tvec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;\n\t\t\t\t#ifdef USE_CLEARCOAT\n\t\t\t\t\tfloat dotNVcc = saturate( dot( geometry.clearcoatNormal, geometry.viewDir ) );\n\t\t\t\t\tvec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );\n\t\t\t\t\toutgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + clearcoatSpecular * material.clearcoat;\n\t\t\t\t#endif\n\t\t\t\t#include <output_fragment>\n\t\t\t\t#include <tonemapping_fragment>\n\t\t\t\t#include <encodings_fragment>\n\t\t\t\t#include <fog_fragment>\n\t\t\t\t#include <premultiplied_alpha_fragment>\n\t\t\t\t#include <dithering_fragment>\n\t\t\t}\n\t\t";
	}
}
VortexMaterial.__name__ = true;
class VortexGeometry extends three_BufferGeometry {
	constructor(widthSegments,heightSegments) {
		super();
		let indexCount = widthSegments * heightSegments * 2 * 3;
		let vertexCount = (widthSegments + 1) * (heightSegments + 1);
		let hSpacing = 4. / heightSegments;
		let vertices = new Float32Array(3 * vertexCount);
		let uvs = new Float32Array(2 * vertexCount);
		let _g = 0;
		let _g1 = heightSegments + 1;
		while(_g < _g1) {
			let vertexRow = _g++;
			let _g1 = 0;
			let _g2 = widthSegments + 1;
			while(_g1 < _g2) {
				let vertexColumn = _g1++;
				let i = vertexRow * (widthSegments + 1) + vertexColumn;
				let self_x = vertexColumn / widthSegments;
				let angle = self_x * Math.PI * 2.;
				let self_x1 = 0;
				let self_y = 0;
				let self_z = 0;
				self_y = -hSpacing * vertexRow;
				let r = 1 / (self_y - 0.3);
				self_x1 = Math.cos(angle) * r;
				self_z = Math.sin(angle) * r;
				let vi = i * 3;
				vertices[vi] = self_x1;
				vertices[1 + vi] = self_y;
				vertices[2 + vi] = self_z;
				let ui = i * 2;
				uvs[ui] = self_x;
				uvs[1 + ui] = vertexRow / widthSegments;
			}
		}
		let indices = new Uint32Array(indexCount);
		let indexOffset = 0;
		let _g2 = 0;
		while(_g2 < heightSegments) {
			let vertexRow = _g2++;
			let _g = 0;
			while(_g < widthSegments) {
				let vertexColumn = _g++;
				let tl = vertexRow * (widthSegments + 1) + vertexColumn;
				let br = (vertexRow + 1) * (widthSegments + 1) + (vertexColumn + 1);
				let i = indexOffset;
				indices[i] = tl;
				indices[i + 1] = (vertexRow + 1) * (widthSegments + 1) + vertexColumn;
				indices[i + 2] = br;
				indices[i + 3] = tl;
				indices[i + 4] = br;
				indices[i + 5] = vertexRow * (widthSegments + 1) + (vertexColumn + 1);
				indexOffset += 6;
			}
		}
		this.setIndex(new three_BufferAttribute(indices,1));
		this.setAttribute("position",new three_Float32BufferAttribute(vertices,3));
		this.setAttribute("uv",new three_Float32BufferAttribute(uvs,2));
		this.computeVertexNormals();
	}
}
VortexGeometry.__name__ = true;
class animation_Spring {
	constructor(initialValue,target,style,velocity,onUpdate,onComplete) {
		if(velocity == null) {
			velocity = 0.0;
		}
		this.minEnergyThreshold = 1e-5;
		if(style == null) {
			style = animation_SpringStyle.Critical(0.5);
		}
		this.value = initialValue;
		this.target = target == null ? initialValue : target;
		switch(style._hx_index) {
		case 0:
			this.damping = 3.356694 / style.approxHalfLife_s;
			this.strength = this.damping * this.damping / 4;
			break;
		case 1:
			this.damping = style.damping;
			this.strength = style.strength;
			break;
		}
		this.velocity = velocity;
		this.onUpdate = onUpdate;
		this.onComplete = onComplete;
	}
	step(dt_s) {
		let V0 = this.velocity;
		let X0 = this.value - this.target;
		if(X0 == 0 && V0 == 0 || dt_s == 0) {
			return;
		}
		let k = this.strength;
		let b = this.damping;
		if(this.getTotalEnergy() < this.minEnergyThreshold) {
			this.velocity = 0;
			this.value = this.target;
			if(this.onComplete != null) {
				this.onComplete();
			}
		} else {
			let critical = k * 4 - b * b;
			if(critical > 0) {
				let q = 0.5 * Math.sqrt(critical);
				let B = (b * X0 * 0.5 + V0) / q;
				let m = Math.exp(-b * 0.5 * dt_s);
				let c = Math.cos(q * dt_s);
				let s = Math.sin(q * dt_s);
				this.velocity = m * ((B * q - 0.5 * X0 * b) * c + (-X0 * q - 0.5 * b * B) * s);
				this.value = m * (X0 * c + B * s) + this.target;
			} else if(critical < 0) {
				let u = 0.5 * Math.sqrt(-critical);
				let p = -0.5 * b + u;
				let n = -0.5 * b - u;
				let B = -(n * X0 - V0) / (2 * u);
				let A = X0 - B;
				let ep = Math.exp(p * dt_s);
				let en = Math.exp(n * dt_s);
				this.velocity = A * n * en + B * p * ep;
				this.value = A * en + B * ep + this.target;
			} else {
				let w = Math.sqrt(k);
				let B = V0 + w * X0;
				let e = Math.exp(-w * dt_s);
				this.velocity = (B - w * (X0 + B * dt_s)) * e;
				this.value = (X0 + B * dt_s) * e + this.target;
			}
		}
		if(this.onUpdate != null) {
			this.onUpdate(this.value,this.velocity);
		}
	}
	getTotalEnergy() {
		let x = this.value - this.target;
		return 0.5 * this.velocity * this.velocity + 0.5 * this.strength * x * x;
	}
	forceCompletion(v) {
		if(v != null) {
			this.target = v;
		}
		this.value = this.target;
		this.velocity = 0;
		this.step(0);
	}
}
animation_Spring.__name__ = true;
var animation_SpringStyle = $hxEnums["animation.SpringStyle"] = { __ename__:true,__constructs__:null
	,Critical: ($_=function(approxHalfLife_s) { return {_hx_index:0,approxHalfLife_s:approxHalfLife_s,__enum__:"animation.SpringStyle",toString:$estr}; },$_._hx_name="Critical",$_.__params__ = ["approxHalfLife_s"],$_)
	,Custom: ($_=function(strength,damping) { return {_hx_index:1,strength:strength,damping:damping,__enum__:"animation.SpringStyle",toString:$estr}; },$_._hx_name="Custom",$_.__params__ = ["strength","damping"],$_)
};
animation_SpringStyle.__constructs__ = [animation_SpringStyle.Critical,animation_SpringStyle.Custom];
class event_KeyboardEvent {
}
event_KeyboardEvent.__name__ = true;
class event_PointerState {
	constructor(pointerId,pointerType,isPrimary,buttons,x,y,width,height,viewWidth,viewHeight,pressure,tangentialPressure,tiltX,tiltY,twist) {
		this.pointerId = pointerId;
		this.pointerType = pointerType;
		this.isPrimary = isPrimary;
		this.buttons = buttons;
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.viewWidth = viewWidth;
		this.viewHeight = viewHeight;
		this.pressure = pressure;
		this.tangentialPressure = tangentialPressure;
		this.tiltX = tiltX;
		this.tiltY = tiltY;
		this.twist = twist;
	}
}
event_PointerState.__name__ = true;
class event_PointerEvent extends event_PointerState {
	constructor(button,preventDefault,defaultPrevented,timeStamp,nativeEvent,pointerId,pointerType,isPrimary,buttons,x,y,width,height,viewWidth,viewHeight,pressure,tangentialPressure,tiltX,tiltY,twist) {
		super(pointerId,pointerType,isPrimary,buttons,x,y,width,height,viewWidth,viewHeight,pressure,tangentialPressure,tiltX,tiltY,twist);
		this.button = button;
		this.preventDefault = preventDefault;
		this.defaultPrevented = defaultPrevented;
		this.timeStamp = timeStamp;
		this.nativeEvent = nativeEvent;
	}
}
event_PointerEvent.__name__ = true;
class event_WheelEvent {
	constructor(deltaX,deltaY,deltaZ,x,y,viewWidth,viewHeight,altKey,ctrlKey,metaKey,shiftKey,preventDefault,defaultPrevented,timeStamp,nativeEvent) {
		this.deltaX = deltaX;
		this.deltaY = deltaY;
		this.deltaZ = deltaZ;
		this.x = x;
		this.y = y;
		this.viewWidth = viewWidth;
		this.viewHeight = viewHeight;
		this.altKey = altKey;
		this.ctrlKey = ctrlKey;
		this.metaKey = metaKey;
		this.shiftKey = shiftKey;
		this.preventDefault = preventDefault;
		this.defaultPrevented = defaultPrevented;
		this.timeStamp = timeStamp;
		this.nativeEvent = nativeEvent;
	}
}
event_WheelEvent.__name__ = true;
class haxe_Exception extends Error {
	constructor(message,previous,native) {
		super(message);
		this.message = message;
		this.__previousException = previous;
		this.__nativeException = native != null ? native : this;
	}
	get_native() {
		return this.__nativeException;
	}
	static thrown(value) {
		if(((value) instanceof haxe_Exception)) {
			return value.get_native();
		} else if(((value) instanceof Error)) {
			return value;
		} else {
			let e = new haxe_ValueException(value);
			return e;
		}
	}
}
haxe_Exception.__name__ = true;
class haxe_ValueException extends haxe_Exception {
	constructor(value,previous,native) {
		super(String(value),previous,native);
		this.value = value;
	}
}
haxe_ValueException.__name__ = true;
class haxe_ds_IntMap {
	constructor() {
		this.h = { };
	}
	remove(key) {
		if(!this.h.hasOwnProperty(key)) {
			return false;
		}
		delete(this.h[key]);
		return true;
	}
}
haxe_ds_IntMap.__name__ = true;
class haxe_io_Path {
	constructor(path) {
		switch(path) {
		case ".":case "..":
			this.dir = path;
			this.file = "";
			return;
		}
		let c1 = path.lastIndexOf("/");
		let c2 = path.lastIndexOf("\\");
		if(c1 < c2) {
			this.dir = HxOverrides.substr(path,0,c2);
			path = HxOverrides.substr(path,c2 + 1,null);
			this.backslash = true;
		} else if(c2 < c1) {
			this.dir = HxOverrides.substr(path,0,c1);
			path = HxOverrides.substr(path,c1 + 1,null);
		} else {
			this.dir = null;
		}
		let cp = path.lastIndexOf(".");
		if(cp != -1) {
			this.ext = HxOverrides.substr(path,cp + 1,null);
			this.file = HxOverrides.substr(path,0,cp);
		} else {
			this.ext = null;
			this.file = path;
		}
	}
	toString() {
		return (this.dir == null ? "" : this.dir + (this.backslash ? "\\" : "/")) + this.file + (this.ext == null ? "" : "." + this.ext);
	}
	static withoutExtension(path) {
		let s = new haxe_io_Path(path);
		s.ext = null;
		return s.toString();
	}
	static withoutDirectory(path) {
		let s = new haxe_io_Path(path);
		s.dir = null;
		return s.toString();
	}
	static extension(path) {
		let s = new haxe_io_Path(path);
		if(s.ext == null) {
			return "";
		}
		return s.ext;
	}
}
haxe_io_Path.__name__ = true;
class haxe_iterators_ArrayIterator {
	constructor(array) {
		this.current = 0;
		this.array = array;
	}
	hasNext() {
		return this.current < this.array.length;
	}
	next() {
		return this.array[this.current++];
	}
}
haxe_iterators_ArrayIterator.__name__ = true;
var three_AxesHelper = require("three").AxesHelper;
var three_BufferAttribute = require("three").BufferAttribute;
var three_Float32BufferAttribute = require("three").Float32BufferAttribute;
var three_Mapping = require("three");
var three_MeshBasicMaterial = require("three").MeshBasicMaterial;
var three_MeshStandardMaterial = require("three").MeshStandardMaterial;
var three_MeshPhysicalMaterial = require("three").MeshPhysicalMaterial;
var three_NormalMapTypes = require("three");
var three_PixelFormat = require("three");
var three_SphereGeometry = require("three").SphereGeometry;
var three_TextureDataType = require("three");
var three_TextureFilter = require("three");
var three_TextureLoader = require("three").TextureLoader;
var three_Vector2 = require("three").Vector2;
var three_WebGLRenderTarget = require("three").WebGLRenderTarget;
var three_examples_jsm_loaders_rgbeloader_RGBELoader = require("three/examples/jsm/loaders/RGBELoader").RGBELoader;
var tool_PMREMGeneratorInternal = require("three").PMREMGenerator;
class tool_IBLGenerator extends tool_PMREMGeneratorInternal {
	constructor(renderer) {
		super(renderer);
	}
	_allocateTargets(equirectangular) {
		let params = { magFilter : three_TextureFilter.NearestFilter, minFilter : three_TextureFilter.NearestFilter, generateMipmaps : false, type : three_TextureDataType.UnsignedByteType, format : three_PixelFormat.RGBEFormat, encoding : this._isLDR(equirectangular) ? equirectangular.encoding : three_TextureEncoding.RGBDEncoding, depthBuffer : false, stencilBuffer : false};
		let cubeUVRenderTarget = this._createRenderTarget(params);
		cubeUVRenderTarget.depthBuffer = equirectangular != null ? false : true;
		this._pingPongRenderTarget = this._createRenderTarget(params);
		return cubeUVRenderTarget;
	}
	_isLDR(texture) {
		if(texture == null || texture.type != three_TextureDataType.UnsignedByteType) {
			return false;
		}
		if(!(texture.encoding == three_TextureEncoding.LinearEncoding || texture.encoding == three_TextureEncoding.sRGBEncoding)) {
			return texture.encoding == three_TextureEncoding.GammaEncoding;
		} else {
			return true;
		}
	}
	_createRenderTarget(params) {
		let cubeUVRenderTarget = new three_WebGLRenderTarget(3 * tool_IBLGenerator.SIZE_MAX,3 * tool_IBLGenerator.SIZE_MAX,params);
		cubeUVRenderTarget.texture.mapping = three_Mapping.CubeUVReflectionMapping;
		cubeUVRenderTarget.texture.name = "PMREM.cubeUv";
		cubeUVRenderTarget.scissorTest = true;
		return cubeUVRenderTarget;
	}
}
tool_IBLGenerator.__name__ = true;
function $bind(o,m) { if( m == null ) return null; if( m.__id__ == null ) m.__id__ = $global.$haxeUID++; var f; if( o.hx__closures__ == null ) o.hx__closures__ = {}; else f = o.hx__closures__[m.__id__]; if( f == null ) { f = m.bind(o); o.hx__closures__[m.__id__] = f; } return f; }
$global.$haxeUID |= 0;
if(typeof(performance) != "undefined" ? typeof(performance.now) == "function" : false) {
	HxOverrides.now = performance.now.bind(performance);
}
{
	String.__name__ = true;
	Array.__name__ = true;
}
js_Boot.__toStr = ({ }).toString;
control_ArcBallControl.defaults = { strength : 700, damping : 100, dragSpeed : 6, angleAroundY : 0, angleAroundXZ : 0, radius : 1, zoomSpeed : 1};
var Main_pixelRatio = Math.min(window.devicePixelRatio,2);
var Main_camera = new three_PerspectiveCamera(70,1,0.01,100);
var Main_canvas = (function($this) {
	var $r;
	let canvas = window.document.createElement("canvas");
	canvas.style.position = "absolute";
	canvas.style.zIndex = "0";
	canvas.style.top = "0";
	canvas.style.left = "0";
	canvas.style.width = "100%";
	canvas.style.height = "100%";
	$r = canvas;
	return $r;
}(this));
var Main_renderer = (function($this) {
	var $r;
	let renderer = new three_WebGLRenderer({ canvas : Main_canvas, antialias : true, powerPreference : "high-performance"});
	renderer.autoClear = false;
	renderer.autoClearColor = false;
	renderer.autoClearDepth = false;
	renderer.outputEncoding = three_TextureEncoding.sRGBEncoding;
	renderer.toneMapping = three_ToneMapping.ACESFilmicToneMapping;
	renderer.toneMappingExposure = 1.0;
	renderer.physicallyCorrectLights = true;
	renderer.shadowMap.enabled = false;
	$r = renderer;
	return $r;
}(this));
var Main_scene = new three_Scene();
var Main_eventManager = new event_ViewEventManager(Main_canvas);
var Main_arcBallControl = new control_ArcBallControl({ viewEventManager : Main_eventManager, radius : 4., dragSpeed : 4., zoomSpeed : 1., angleAroundXZ : 0.5});
var Main_uTime_s = new three_Uniform(0.0);
var Main_background = new rendering_BackgroundEnvironment();
var Main_environmentManager = new environment_EnvironmentManager(Main_renderer,Main_scene,"assets/env/paul_lobe_haus_1k.rgbd.png",function(env) {
});
var Main_devUI = Main_initDevUI();
var Main_animationFrame_lastTime_ms = -1.0;
tool_IBLGenerator.LOD_MAX = 8;
tool_IBLGenerator.SIZE_MAX = Math.pow(2,tool_IBLGenerator.LOD_MAX);
Main_main();
})(typeof window != "undefined" ? window : typeof global != "undefined" ? global : typeof self != "undefined" ? self : this);
