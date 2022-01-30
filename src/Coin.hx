import Main.devUI;
import three.MeshPhysicalMaterial;
import three.Vector3;
import three.Quaternion;
import js.Lib.undefined;
import three.CylinderGeometry;
import three.MeshNormalMaterial;
import three.Material;
import three.BufferGeometry;
import three.Mesh;

class Coin extends Mesh<BufferGeometry, Material> {

	public final vel2D: Vec2;
	public final pos2D: Vec2;
	public final mass_kg = 7.12 / 1000;
	static public inline final coinScale: Float = 0.05; 

	public function new() {
		var geom = new CylinderGeometry(undefined, undefined, 0.1, 40);
		var rot = new Quaternion()
			.setFromAxisAngle(new Vector3(1, 0, 0), Math.PI * 0.5);
		geom.applyQuaternion(rot);
		geom.translate(0, 1., 0.);
		geom.scale(coinScale, coinScale, coinScale);

		var coinMaterial = new MeshPhysicalMaterial();
		devUI.add(coinMaterial);
		// coinMaterial :MeshPhysicalMaterial
		var m = coinMaterial;
		m.visible = true;
		m.transparent = false;
		m.opacity = 1;
		m.colorWrite = true;
		m.depthWrite = true;
		m.depthTest = true;
		m.flatShading = false;
		m.roughness = 0.26917111838704116;
		m.metalness = 1;
		m.emissiveIntensity = 1;
		m.color.setHex(0x5c2e0e);
		m.emissive.setHex(0x000000);
		m.side = FrontSide;
		m.envMapIntensity = 1;
		m.aoMapIntensity = 1;
		m.clearcoat = 0;
		m.clearcoatRoughness = 0;
		m.transmission = 0;
		m.ior = 1.3699810442874376;
		m.thickness = 0;
		m.attenuationColor.setHex(0xffffff);
		m.attenuationDistance = 0;
		m.sheen = 0;
		m.sheenRoughness = 1;
		m.sheenColor.setHex(0x000000);
		super(geom, coinMaterial);

		vel2D = vec2(0.);
		pos2D = vec2(0.);
	}
	
}