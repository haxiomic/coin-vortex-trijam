import environment.EnvironmentManager;
import event.ViewEventManager;
import rendering.BackgroundEnvironment;
import three.AxesHelper;
import three.Scene;
import three.Uniform;
import three.WebGLRenderer;
import ui.DevUI;

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
	radius: 0.2,
	dragSpeed: 4.,
	zoomSpeed: 1.,
	angleAroundY: Math.PI * 0.5,
});

final uTime_s = new Uniform(0.0);

final background = new BackgroundEnvironment();
final environmentManager = new EnvironmentManager(renderer, scene, 'assets/env/paul_lobe_haus_1k.rgbd.png', (env) -> {});

@:keep var devUI = initDevUI();

var coin = new Coin();

function main() {
	document.body.appendChild(canvas);

	// create scene
	// load a hdr environment texture and add the background object
	scene.add(background);

	scene.add(new Vortex());

	scene.add(coin);
	

	#if dev
	var axis = new AxesHelper();
	scene.add(axis);
	#end

	// set camera look-at target
	arcBallControl.target.y = 0.;

	// begin frame loop
	animationFrame(window.performance.now());
}

inline function vortexRadius(y: Float) {
	return abs(1/(y-0.3));
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

function update(time_s: Float, dt_s: Float) {
	coin.position.x = Math.sin(time_s);
	arcBallControl.target.copyFrom(coin.position);
	arcBallControl.update(camera, dt_s);
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