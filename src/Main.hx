import Structure.apply;
import animation.Animator;
import animation.Spring;
import three.Vector3;
import environment.EnvironmentManager;
import event.ViewEventManager;
import rendering.BackgroundEnvironment;
import three.AxesHelper;
import three.Scene;
import three.Uniform;
import three.WebGLRenderer;
import ui.DevUI;
import Math.isFinite;

// settings
var pixelRatio = min(window.devicePixelRatio, 2);

final camera = new three.PerspectiveCamera(70, 1, 0.01, 100);
final canvas = {
	var canvas = document.createCanvasElement();
	canvas.style.position = 'absolute';
	canvas.style.zIndex = '0';
	canvas.style.top = '0';
	canvas.style.left = '0';
	canvas.style.width = '100%';
	canvas.style.height = '100%';
	canvas;
}

final renderer = {
	var renderer = new WebGLRenderer({
		canvas: canvas,
		antialias: true,
		powerPreference: 'high-performance',
	});
	renderer.autoClear = false;
	renderer.autoClearColor = false;
	renderer.autoClearDepth = false;
	renderer.outputEncoding = sRGBEncoding;
	renderer.toneMapping = ACESFilmicToneMapping;
	renderer.toneMappingExposure = 1.0;
	renderer.physicallyCorrectLights = true;
	renderer.shadowMap.enabled = false;
	renderer;
};

final gl = renderer.getContext();

final scene = new Scene();

final eventManager = new ViewEventManager(canvas);

final arcBallControl = new control.ArcBallControl({
	viewEventManager: eventManager,
	radius: 5.,
	dragSpeed: 4.,
	zoomSpeed: 1.,
	angleAroundY: 0.,
	angleAroundXZ: 0.5,
});

final uTime_s = new Uniform(0.0);

final background = new BackgroundEnvironment();
final environmentManager = new EnvironmentManager(renderer, scene, 'assets/env/paul_lobe_haus_1k.rgbd.png', (env) -> {});

@:keep var devUI = initDevUI();

var G: Float = 0.;
var drag: Float = 0.;
var initialVelocity = vec2(0);
var control: Float = 0.;
var coin = new Coin();

var leftDown = false;
var rightDown = false;
var firstPerson = true;

var timer = document.createDivElement();

var aliveTime = 0.;

function main() {
	G = 0.16767189384800965;
	drag = 0.0203;
	initialVelocity.x = 0;
	initialVelocity.y = 1.6794761330346373;
	control = 1.;

	devUI.internal.hide();
	#if dev
	// devUI.internal.show();
	#end

	document.body.appendChild(canvas);

	// create scene
	// load a hdr environment texture and add the background object
	scene.add(background);

	scene.add(new Vortex());

	scene.add(coin);
	
	{
		var g = devUI.addFolder('Setup');
		g.internal.open();
		g.add(G, 0, 0.5);
		g.add(drag, 0., 0.1);
		g.add(initialVelocity.x, -2, 2);
		g.add(initialVelocity.y, -2, 2);
		g.add(control, -2, 2);
	}

	timer.innerHTML = 'hello world';
	apply(timer.style, {
		position: 'absolute',
		zIndex: '100',
		left: '20px',
		top: '20px',
		fontFamily: 'sans-serif',
		fontSize: '30px',
	});
	document.body.appendChild(timer);

	#if dev
	var axis = new AxesHelper();
	scene.add(axis);
	#end

	// set camera look-at target
	arcBallControl.target.y = 0.;
	
	eventManager.onKeyUp((e, onView) -> {
		switch e.key {
			case 'r':
			#if dev
				start();
			#end
			case ' ':
				firstPerson = !firstPerson;
			default: console.log('key ${e.key}');
		}
	});

	eventManager.onKeyDown((e, _) -> {
		switch e.key {
			case 'ArrowLeft': leftDown = true;
			case 'ArrowRight': rightDown = true;
		}
	});
	eventManager.onKeyUp((e, _) -> {
		switch e.key {
			case 'ArrowLeft': leftDown = false;
			case 'ArrowRight': rightDown = false;
		}
	});

	// begin frame loop
	animationFrame(window.performance.now());

	start();
}

function start() {
	aliveTime = 0;
	coin.pos2D.set(vortexRadius(0) - 0.2, 0);
	coin.vel2D.copyFrom(initialVelocity);
}

function gameOver() {
	start();
}

final vortexDelta = 0.3;
final vortexHeight = 3;
inline function vortexRadius(y: Float) {
	return abs(1/(y - vortexDelta));
}
inline function vortexY(r: Float) {
	return -abs((1/r) - vortexDelta);
}
inline function vortexGradient(r: Float) {
	return 1/(r*r);
}

var animator = new Animator();
var camPosX = animator.createSpring(0, 0, Critical(0.005));
var camPosY = animator.createSpring(0, 0, Critical(0.005));
var camPosZ = animator.createSpring(0, 0, Critical(0.005));

function update(t_s: Float, dt_s: Float) {
	aliveTime += dt_s;
	timer.innerHTML = Math.round(aliveTime) + ' s';
	// physics
	// correspondence between 2D gravitational potential?
	var r = length(coin.pos2D);

	// attract to center
	var n = normalize(coin.pos2D);
	var a = -G/(r*r);
	coin.vel2D += a * n;

	// drag
	coin.vel2D += -coin.vel2D * drag * dt_s;

	// control
	var vnorm = normalize(coin.vel2D);
	var c = (leftDown ? -1 : 0) + (rightDown ? 1 : 0);
	coin.vel2D += vec2(-vnorm.y, vnorm.x) * control * c * dt_s;

	coin.pos2D += coin.vel2D * dt_s;
	
	// clamp position
	var l = coin.pos2D.length();
	var R0 = vortexRadius(0);
	if (l >= R0) {
		coin.vel2D *= 0.9;
		coin.pos2D.copyFrom(coin.pos2D.normalize() * R0);
	}
	// coin.pos2D.copyFrom(coin.pos2D.normalize() * clamp(l, 0, vortexRadius(0)));

	// pose coin in 3D
	var y = vortexY(r);
	var g = vortexGradient(length(coin.pos2D));
	var slope = atan(g);
	var direction = atan2(coin.vel2D.y, -coin.vel2D.x) + 0.01;

	coin.rotation.set(0, 0, 0);
	coin.rotateX(-slope);
	coin.rotateOnWorldAxis(new Vector3(0, 1, 0), direction);
	
	coin.position.set(
		Math.isFinite(coin.pos2D.x) ? coin.pos2D.x : 0,
		Math.isFinite(y) ? y : 0,
		Math.isFinite(coin.pos2D.y) ? coin.pos2D.y : 0
	);

	if (coin.position.y < -(vortexHeight + vortexDelta)) {
		gameOver();
	}

	// position camera
	var coinCenter = coin.position.clone().add(new Vector3(0, Coin.coinScale * 0.5, 0.));
	var x = new Vector3(0.2, 0, 0);
	x.applyQuaternion(coin.quaternion);
	var y = new Vector3(0.0, 0.05, 0);
	y.applyQuaternion(coin.quaternion);
	var camPos = coinCenter.clone().add(x);
	camPos.add(y);

	camPosY.target = isFinite(camPos.y) ? camPos.y : coin.position.y;
	camPosX.target = isFinite(camPos.x) ? camPos.x : coin.position.x;
	camPosZ.target = isFinite(camPos.z) ? camPos.z : coin.position.z;

	animator.step(dt_s);

	camera.position.set(camPosX.value, camPosY.value, camPosZ.value);
	camera.lookAt(coinCenter);
	camera.rotateOnWorldAxis(x.normalize(), -slope);

	// arcBallControl.target.copyFrom(coin.position);
	if (!firstPerson) {
		arcBallControl.update(camera, dt_s);
	}
}

private var animationFrame_lastTime_ms = -1.0;
function animationFrame(time_ms: Float) {
	var time_s = time_ms / 1000;
	var dt_ms = animationFrame_lastTime_ms > 0 ? (time_ms - animationFrame_lastTime_ms) : 0.0;
	dt_ms = clamp(dt_ms, 1, 1000 / 30); // limit dt
	var dt_s = dt_ms / 1000;
	animationFrame_lastTime_ms = time_ms;

	uTime_s.value = time_s;

	var gl = renderer.getContext();

	// handle if canvas has resized since the last frame
	{
		var targetSize = floor(vec2(window.innerWidth, window.innerHeight) * pixelRatio);
			
		// resize canvas and camera projection aspect if needed
		if (targetSize != vec2(gl.drawingBufferWidth, gl.drawingBufferHeight)) {
			canvas.width = floor(targetSize.x);
			canvas.height = floor(targetSize.y);
		}

		var viewportSize = vec2(targetSize.x, targetSize.y);

		var newAspect = viewportSize.x / viewportSize.y;
		if (camera.aspect != newAspect) {
			camera.aspect = newAspect;
			camera.updateProjectionMatrix();
		}
	}

	// update world state for this frame
	update(time_s, dt_s);

	// render to canvas	
	renderer.setRenderTarget(null);
	renderer.setViewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);	
	renderer.clear(true, true, true);
	renderer.render(scene, camera);

	window.requestAnimationFrame(animationFrame);
}

function initDevUI() {
	var gui = new DevUI({
		closed: false,
	});

	gui.domElement.style.userSelect = 'none';
	gui.domElement.parentElement.style.zIndex = '1000';
	
	{	// Rendering pipeline
		var g = gui.addFolder('Rendering');
		g.add(pixelRatio, 0.1, 4).name('resolution');
		g.add(camera.fov, 1, 200).onChange(_ -> camera.updateProjectionMatrix());

		var renderer = renderer;
		g.add(renderer.toneMapping).onChange(v -> {
			// little three.js workaround: force shader rebuild: change encoding for 1 frame
			var outputEncoding = renderer.outputEncoding;
			renderer.outputEncoding = outputEncoding != LinearEncoding ? LinearEncoding : GammaEncoding;
			window.requestAnimationFrame(t -> renderer.outputEncoding = outputEncoding);
		});

		g.add(renderer.outputEncoding);
		g.add(renderer.toneMappingExposure, 0, 4);
		g.add(renderer.shadowMap.enabled).name('Shadows');
		g.addDropdown(environmentManager.environmentPath, CompileTime.getPathsInDirectory('assets/env', ~/(\.rgbd\.png|\.hdr)$/igm));
		g.add(background.roughness, 0, 1).name('Background Blur');

		g.addFunction(() -> environmentManager.downloadPmremEnvironmentMap()).name("Download Processed HDR");
	}

	{	// Controls
		var g = gui.addFolder('Controls');
		var c = arcBallControl;
		g.add(c.dragSpeed, 0, 15);
		g.add(c.zoomSpeed, 0, 20);
		g.add(c.strength, 0, 1000);
		g.add(c.damping, 0, 200);
	}

	return gui;
}