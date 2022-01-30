import Main.vortexRadius;
import material.CustomPhysicalMaterial;
import three.SphereGeometry;
import three.Mesh;
import three.MeshPhysicalMaterial;
import Main.devUI;

class Vortex extends Mesh<three.BufferGeometry, VortexMaterial> {

	public function new() {
		var vortexMaterial = new VortexMaterial({
			side: DoubleSide
		});
		var m = vortexMaterial;
		m.visible = true;
		m.transparent = false;
		m.opacity = 1;
		m.colorWrite = true;
		m.depthWrite = true;
		m.depthTest = true;
		m.flatShading = false;
		m.roughness = 0.24711356195071515;
		m.metalness = 0.1037394451145959;
		m.emissiveIntensity = 0;
		m.color.setHex(0x000105);
		m.emissive.setHex(0x000000);
		m.side = DoubleSide;
		m.envMapIntensity = 1;
		m.aoMapIntensity = 1;
		m.clearcoat = 0;
		m.clearcoatRoughness = 0;
		m.transmission = 0;
		m.ior = 1.4692400482509047;
		m.thickness = 0;
		m.attenuationColor.setHex(0xffffff);
		m.attenuationDistance = 0;
		m.sheen = 0;
		m.sheenRoughness = 1;
		m.sheenColor.setHex(0x000000);
		devUI.add(vortexMaterial);
		
		super(new VortexGeometry(100, 100), vortexMaterial);

		var domeMaterial = new MeshPhysicalMaterial({});
		var m = domeMaterial;
		// domeMaterial :MeshPhysicalMaterial
		m.visible = true;
		m.transparent = false;
		m.opacity = 1;
		m.colorWrite = true;
		m.depthWrite = true;
		m.depthTest = true;
		m.flatShading = false;
		m.roughness = 0.07065311046010685;
		m.metalness = 0;
		m.emissiveIntensity = 1;
		m.color.setHex(0xffffff);
		m.emissive.setHex(0x000000);
		m.side = DoubleSide;
		m.envMapIntensity = 1;
		m.aoMapIntensity = 1;
		m.clearcoat = 0.13682577976908494;
		m.clearcoatRoughness = 0;
		m.transmission = 1;
		m.ior = 1.7008443908323283;
		m.thickness = 0.14578666207134242;
		m.attenuationColor.setHex(0x1a389b);
		m.attenuationDistance = 6.6620713424090985;
		m.sheen = 0;
		m.sheenRoughness = 1;
		m.sheenColor.setHex(0x000000);

		devUI.add(domeMaterial);
		var dome = new Mesh(new SphereGeometry(1, 40, 40, 0, Math.PI), domeMaterial);
		dome.rotateX(-Math.PI * 0.5);
		dome.scale.setScalar(vortexRadius(0));
		this.add(dome);
	}

}

class VortexMaterial extends CustomPhysicalMaterial {

	public function new(options: CustomPhysicalMaterialParameters) {
		super(options);
		Reflect.setField(defines, 'USE_UV', '1');

		this.fragmentShader = '
			#define STANDARD
			#ifdef PHYSICAL
				#define IOR
				#define SPECULAR
			#endif
			uniform vec3 diffuse;
			uniform vec3 emissive;
			uniform float roughness;
			uniform float metalness;
			uniform float opacity;
			#ifdef IOR
				uniform float ior;
			#endif
			#ifdef SPECULAR
				uniform float specularIntensity;
				uniform vec3 specularColor;
				#ifdef USE_SPECULARINTENSITYMAP
					uniform sampler2D specularIntensityMap;
				#endif
				#ifdef USE_SPECULARCOLORMAP
					uniform sampler2D specularColorMap;
				#endif
			#endif
			#ifdef USE_CLEARCOAT
				uniform float clearcoat;
				uniform float clearcoatRoughness;
			#endif
			#ifdef USE_SHEEN
				uniform vec3 sheenColor;
				uniform float sheenRoughness;
				#ifdef USE_SHEENCOLORMAP
					uniform sampler2D sheenColorMap;
				#endif
				#ifdef USE_SHEENROUGHNESSMAP
					uniform sampler2D sheenRoughnessMap;
				#endif
			#endif
			varying vec3 vViewPosition;
			#include <common>
			#include <packing>
			#include <dithering_pars_fragment>
			#include <color_pars_fragment>
			#include <uv_pars_fragment>
			#include <uv2_pars_fragment>
			#include <map_pars_fragment>
			#include <alphamap_pars_fragment>
			#include <alphatest_pars_fragment>
			#include <aomap_pars_fragment>
			#include <lightmap_pars_fragment>
			#include <emissivemap_pars_fragment>
			#include <bsdfs>
			#include <cube_uv_reflection_fragment>
			#include <envmap_common_pars_fragment>
			#include <envmap_physical_pars_fragment>
			#include <fog_pars_fragment>
			#include <lights_pars_begin>
			#include <normal_pars_fragment>
			#include <lights_physical_pars_fragment>
			#include <transmission_pars_fragment>
			#include <shadowmap_pars_fragment>
			#include <bumpmap_pars_fragment>
			#include <normalmap_pars_fragment>
			#include <clearcoat_pars_fragment>
			#include <roughnessmap_pars_fragment>
			#include <metalnessmap_pars_fragment>
			#include <logdepthbuf_pars_fragment>
			#include <clipping_planes_pars_fragment>

			float stripes(vec2 p, float w, float i) {
				w *= 0.5;
				float x = fract((p.x - p.y) * 10.);
				float e = 0.034;
				return smoothstep(0.5 - w - e, 0.5-w, x) * smoothstep(0.5 + w + e, 0.5+w, x);
			}

			void main() {
				#include <clipping_planes_fragment>
				vec4 diffuseColor = vec4( diffuse, opacity );

				diffuseColor = vec4(stripes(vUv, 0.5, 10.));

				ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
				vec3 totalEmissiveRadiance = emissive;
				#include <logdepthbuf_fragment>
				#include <map_fragment>
				#include <color_fragment>
				#include <alphamap_fragment>
				#include <alphatest_fragment>
				#include <roughnessmap_fragment>
				#include <metalnessmap_fragment>
				#include <normal_fragment_begin>
				#include <normal_fragment_maps>
				#include <clearcoat_normal_fragment_begin>
				#include <clearcoat_normal_fragment_maps>
				#include <emissivemap_fragment>
				#include <lights_physical_fragment>
				#include <lights_fragment_begin>
				#include <lights_fragment_maps>
				#include <lights_fragment_end>
				#include <aomap_fragment>
				vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
				vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
				#include <transmission_fragment>
				vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
				#ifdef USE_CLEARCOAT
					float dotNVcc = saturate( dot( geometry.clearcoatNormal, geometry.viewDir ) );
					vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
					outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + clearcoatSpecular * material.clearcoat;
				#endif
				#include <output_fragment>
				#include <tonemapping_fragment>
				#include <encodings_fragment>
				#include <fog_fragment>
				#include <premultiplied_alpha_fragment>
				#include <dithering_fragment>
			}
		';
	}
	
}