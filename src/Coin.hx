import three.Vector3;
import three.Quaternion;
import js.Lib.undefined;
import three.CylinderGeometry;
import three.MeshNormalMaterial;
import three.Material;
import three.BufferGeometry;
import three.Mesh;

class Coin extends Mesh<BufferGeometry, Material> {

	public function new() {
		var geom = new CylinderGeometry(undefined, undefined, 0.1, 40);
		var rot = new Quaternion()
			.setFromAxisAngle(new Vector3(1, 0, 0), Math.PI * 0.5);
		geom.applyQuaternion(rot);
		var scale = 0.05;
		geom.scale(scale, scale, scale);
		var mat = new MeshNormalMaterial();
		super(geom, mat);
	}
	
}