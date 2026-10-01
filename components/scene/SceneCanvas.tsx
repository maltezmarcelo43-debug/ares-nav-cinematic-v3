"use client";

import { Line, Preload } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { Bloom, EffectComposer, Noise, Vignette } from "@react-three/postprocessing";
import {
  forwardRef,
  Suspense,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

import { cinematicState, lerp, segment } from "@/lib/cinematic";

const EARTH_TEXTURE =
  "https://assets.science.nasa.gov/dynamicimage/assets/science/cds/3d/resources/image/earth-%28a%29/preview.webp?w=2048";
const MARS_TEXTURE =
  "https://assets.science.nasa.gov/dynamicimage/assets/science/cds/3d/resources/image/mars/preview.webp?w=2048";
const JEZERO_TEXTURE =
  "https://assets.science.nasa.gov/dynamicimage/assets/science/psd/mars/downloadable_items/4/5/45034_PIA23976.png?crop=faces%2Cfocalpoint&fit=clip&h=1100&w=1700";
const MRO_MODEL =
  "https://assets.science.nasa.gov/content/dam/science/cds/3d/resources/model/mars-reconnaissance-orbiter-%28mro%29-%28c%29/Mars%20Reconnaissance%20Orbiter%20%28MRO%29%20%28C%29.glb";
const PERSEVERANCE_MODEL =
  "https://assets.science.nasa.gov/content/dam/science/cds/3d/resources/model/mars-2020-perseverance-rover/Mars%202020%20Perseverance%20Rover.glb";

type OpacityHandle = {
  setOpacity: (opacity: number) => void;
};

const atmosphereVertex = `
  varying vec3 vNormal;
  varying vec3 vPositionNormal;

  void main() {
    vNormal = normalize(normalMatrix * normal);
    vPositionNormal = normalize((modelViewMatrix * vec4(position, 1.0)).xyz);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const atmosphereFragment = `
  uniform vec3 uColor;
  uniform float uOpacity;
  varying vec3 vNormal;
  varying vec3 vPositionNormal;

  void main() {
    float intensity = pow(0.74 - dot(vNormal, vPositionNormal), 2.15);
    gl_FragColor = vec4(uColor, intensity * uOpacity);
  }
`;

const Atmosphere = forwardRef<OpacityHandle, { radius: number; color: string }>(
  function Atmosphere({ radius, color }, ref) {
    const material = useRef<THREE.ShaderMaterial>(null);
    const uniforms = useMemo(
      () => ({
        uColor: { value: new THREE.Color(color) },
        uOpacity: { value: 0.7 },
      }),
      [color],
    );

    useImperativeHandle(
      ref,
      () => ({
        setOpacity: (opacity) => {
          uniforms.uOpacity.value = THREE.MathUtils.clamp(opacity, 0, 1) * 0.7;
        },
      }),
      [uniforms],
    );

    return (
      <mesh scale={1.055} renderOrder={2}>
        <sphereGeometry args={[radius, 96, 96]} />
        <shaderMaterial
          ref={material}
          vertexShader={atmosphereVertex}
          fragmentShader={atmosphereFragment}
          uniforms={uniforms}
          side={THREE.BackSide}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    );
  },
);

type PlanetProps = {
  radius: number;
  textureUrl: string;
  fallbackColor: string;
  atmosphereColor: string;
  clouds?: boolean;
};

const Planet = forwardRef<OpacityHandle, PlanetProps>(function Planet(
  { radius, textureUrl, fallbackColor, atmosphereColor, clouds = false },
  ref,
) {
  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  const surface = useRef<THREE.MeshStandardMaterial>(null);
  const atmosphere = useRef<OpacityHandle>(null);
  const planet = useRef<THREE.Group>(null);

  useImperativeHandle(
    ref,
    () => ({
      setOpacity: (opacity) => {
        const value = THREE.MathUtils.clamp(opacity, 0, 1);
        if (surface.current) {
          surface.current.opacity = value;
          surface.current.transparent = value < 0.999;
          surface.current.depthWrite = value > 0.98;
        }
        atmosphere.current?.setOpacity(value);
      },
    }),
    [],
  );

  useEffect(() => {
    let mounted = true;
    let loadedTexture: THREE.Texture | null = null;
    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin("anonymous");
    loader.load(
      textureUrl,
      (result) => {
        loadedTexture = result;
        result.colorSpace = THREE.SRGBColorSpace;
        result.anisotropy = 8;
        if (mounted) setTexture(result);
        else result.dispose();
      },
      undefined,
      () => mounted && setTexture(null),
    );

    return () => {
      mounted = false;
      loadedTexture?.dispose();
    };
  }, [textureUrl]);

  useFrame((_, delta) => {
    if (planet.current) planet.current.rotation.y += delta * 0.035;
  });

  return (
    <group ref={planet}>
      <mesh rotation={[0.04, -0.8, -0.015]} castShadow receiveShadow>
        <sphereGeometry args={[radius, 128, 128]} />
        <meshStandardMaterial
          ref={surface}
          map={texture ?? undefined}
          color={texture ? "#ffffff" : fallbackColor}
          roughness={0.92}
          metalness={0}
        />
      </mesh>
      {clouds ? (
        <mesh scale={1.008} rotation={[0.02, 0.35, 0]}>
          <sphereGeometry args={[radius, 64, 64]} />
          <meshStandardMaterial
            color="#dceaf0"
            transparent
            opacity={0.08}
            depthWrite={false}
          />
        </mesh>
      ) : null}
      <Atmosphere ref={atmosphere} radius={radius} color={atmosphereColor} />
    </group>
  );
});

function pseudoRandom(seed: number) {
  const value = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return value - Math.floor(value);
}

function StarField({ count = 1700 }: { count?: number }) {
  const points = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const values = new Float32Array(count * 3);
    for (let index = 0; index < count; index += 1) {
      const radius = 24 + pseudoRandom(index + 1) * 65;
      const longitude = pseudoRandom(index + 8) * Math.PI * 2;
      const latitude = Math.acos(pseudoRandom(index + 20) * 2 - 1);
      values[index * 3] = radius * Math.sin(latitude) * Math.cos(longitude);
      values[index * 3 + 1] = radius * Math.cos(latitude);
      values[index * 3 + 2] = radius * Math.sin(latitude) * Math.sin(longitude);
    }
    return values;
  }, [count]);

  useFrame((_, delta) => {
    if (!points.current) return;
    points.current.rotation.y += delta * 0.003;
    points.current.rotation.x = cinematicState.progress * 0.065;
    points.current.rotation.z = cinematicState.progress * -0.035;
  });

  return (
    <points ref={points} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.045}
        color="#cfe4ef"
        transparent
        opacity={0.72}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

type RemoteModelProps = {
  url: string;
  scale: number;
  rotation?: [number, number, number];
  fallback: ReactNode;
};

function RemoteModel({ url, scale, rotation = [0, 0, 0], fallback }: RemoteModelProps) {
  const [model, setModel] = useState<THREE.Object3D | null>(null);

  useEffect(() => {
    let mounted = true;
    const loader = new GLTFLoader();
    loader.setCrossOrigin("anonymous");
    loader.load(
      url,
      (result) => {
        const scene = result.scene.clone(true);
        scene.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });
        if (mounted) setModel(scene);
      },
      undefined,
      () => mounted && setModel(null),
    );

    return () => {
      mounted = false;
    };
  }, [url]);

  return model ? (
    <primitive object={model} scale={scale} rotation={rotation} />
  ) : (
    <>{fallback}</>
  );
}

const JezeroSurface = forwardRef<OpacityHandle>(function JezeroSurface(_, ref) {
  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  const material = useRef<THREE.MeshStandardMaterial>(null);
  const geometry = useMemo(() => {
    const plane = new THREE.PlaneGeometry(22, 14, 150, 100);
    const position = plane.attributes.position;
    for (let index = 0; index < position.count; index += 1) {
      const x = position.getX(index);
      const y = position.getY(index);
      const elevation =
        Math.sin(x * 0.8) * 0.12 +
        Math.cos(y * 1.1) * 0.08 +
        Math.sin((x + y) * 1.7) * 0.045;
      position.setZ(index, elevation);
    }
    position.needsUpdate = true;
    plane.computeVertexNormals();
    return plane;
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      setOpacity: (opacity) => {
        const value = THREE.MathUtils.clamp(opacity, 0, 1);
        if (material.current) {
          material.current.opacity = value;
          material.current.depthWrite = value > 0.98;
        }
      },
    }),
    [],
  );

  useEffect(() => {
    let mounted = true;
    let loadedTexture: THREE.Texture | null = null;
    new THREE.TextureLoader().load(
      JEZERO_TEXTURE,
      (result) => {
        loadedTexture = result;
        result.colorSpace = THREE.SRGBColorSpace;
        if (mounted) setTexture(result);
        else result.dispose();
      },
      undefined,
      () => mounted && setTexture(null),
    );

    return () => {
      mounted = false;
      loadedTexture?.dispose();
      geometry.dispose();
    };
  }, [geometry]);

  return (
    <mesh
      geometry={geometry}
      rotation={[-Math.PI / 2.55, 0, -0.035]}
      position={[0, -4.2, -1.8]}
    >
      <meshStandardMaterial
        ref={material}
        map={texture ?? undefined}
        color={texture ? "#ffffff" : "#7f3927"}
        roughness={1}
        metalness={0}
        transparent
        opacity={0}
      />
    </mesh>
  );
});

function RoverFallback() {
  return (
    <group scale={0.7}>
      <mesh position={[0, 0.15, 0]}>
        <boxGeometry args={[2.2, 0.45, 1.4]} />
        <meshStandardMaterial color="#b9a38a" roughness={0.75} />
      </mesh>
      <mesh position={[0.3, 0.6, 0]}>
        <boxGeometry args={[0.85, 0.55, 0.8]} />
        <meshStandardMaterial color="#dbd1bd" roughness={0.6} />
      </mesh>
      {[-0.8, 0, 0.8].flatMap((x) =>
        [-0.82, 0.82].map((z) => (
          <mesh key={`${x}-${z}`} position={[x, -0.12, z]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.29, 0.29, 0.22, 18]} />
            <meshStandardMaterial color="#17191c" roughness={0.9} />
          </mesh>
        )),
      )}
    </group>
  );
}

function OrbiterFallback() {
  return (
    <group>
      <mesh>
        <boxGeometry args={[1.1, 0.35, 0.45]} />
        <meshStandardMaterial color="#c7c8cc" metalness={0.55} roughness={0.35} />
      </mesh>
      {[-1.2, 1.2].map((x) => (
        <mesh key={x} position={[x, 0, 0]}>
          <boxGeometry args={[1.4, 0.05, 0.7]} />
          <meshStandardMaterial color="#173b62" metalness={0.25} />
        </mesh>
      ))}
    </group>
  );
}

function CinematicScene({ lowPower }: { lowPower: boolean }) {
  const earth = useRef<THREE.Group>(null);
  const mars = useRef<THREE.Group>(null);
  const marsMaterial = useRef<OpacityHandle>(null);
  const orbiter = useRef<THREE.Group>(null);
  const orbitLine = useRef<THREE.Group>(null);
  const rover = useRef<THREE.Group>(null);
  const terrain = useRef<THREE.Group>(null);
  const terrainMaterial = useRef<OpacityHandle>(null);
  const orbitPoints = useMemo(() => {
    const points: [number, number, number][] = [];
    for (let index = 0; index <= 80; index += 1) {
      const angle = (index / 80) * Math.PI * 2;
      points.push([
        Math.cos(angle) * 4.75,
        Math.sin(angle) * 0.95,
        Math.sin(angle) * 3.1,
      ]);
    }
    return points;
  }, []);

  useFrame(({ camera, clock }, delta) => {
    const progress = cinematicState.progress;
    const earthTravel = segment(progress, 0, 0.27);
    const marsArrival = segment(progress, 0.18, 0.48);
    const orbitProgress = segment(progress, 0.43, 0.71);
    const marsZoom = segment(progress, 0.67, 0.9);
    const jezeroArrival = segment(progress, 0.79, 1);
    const marsVisibility = 1 - segment(progress, 0.72, 0.91);
    const terrainVisibility = segment(progress, 0.72, 0.88);

    if (earth.current) {
      earth.current.position.set(
        lerp(0, -7.8, earthTravel),
        lerp(-4.15, -8.6, earthTravel),
        lerp(0, -12, earthTravel),
      );
      earth.current.scale.setScalar(lerp(1, 0.42, earthTravel));
      earth.current.rotation.y += delta * 0.035;
      earth.current.visible = progress < 0.45;
    }

    if (mars.current) {
      mars.current.visible = progress > 0.12 && marsVisibility > 0.01;
      mars.current.position.set(
        lerp(10.5, 0, marsArrival),
        lerp(-4, -3.8, marsArrival),
        lerp(-5.5, -0.7, marsArrival),
      );
      mars.current.scale.setScalar(
        lerp(0.72, 1, marsArrival) * lerp(1, 3, marsZoom),
      );
      mars.current.rotation.y += delta * 0.024;
      marsMaterial.current?.setOpacity(marsVisibility);
    }

    if (orbiter.current) {
      const angle = clock.elapsedTime * 0.22 + orbitProgress * Math.PI * 1.7;
      const radius = lerp(5.2, 4.35, orbitProgress);
      orbiter.current.position.set(
        Math.cos(angle) * radius,
        -3 + Math.sin(angle) * 1.1,
        Math.sin(angle) * 2.8 - 0.4,
      );
      orbiter.current.rotation.set(0.2, -angle + Math.PI / 2, 0.18);
      const visible = progress > 0.31 && progress < 0.76;
      orbiter.current.visible = visible;
      if (orbitLine.current) orbitLine.current.visible = visible;
    }

    if (terrain.current) {
      terrain.current.visible = terrainVisibility > 0.01;
      terrain.current.position.y = lerp(-8.2, -0.9, jezeroArrival);
      terrain.current.position.z = lerp(-8, -2.2, jezeroArrival);
      terrain.current.scale.setScalar(lerp(0.45, 1.05, jezeroArrival));
      terrainMaterial.current?.setOpacity(terrainVisibility);
    }

    if (rover.current) {
      rover.current.visible = progress > 0.81;
      rover.current.position.set(
        lerp(2.8, 1.65, jezeroArrival),
        lerp(-4.5, -1, jezeroArrival),
        lerp(-5.5, -1.2, jezeroArrival),
      );
      rover.current.rotation.y = -0.65 + Math.sin(clock.elapsedTime * 0.14) * 0.03;
      rover.current.scale.setScalar(lerp(0.45, 1, jezeroArrival));
    }

    camera.position.x = Math.sin(progress * Math.PI * 1.15) * lerp(0, 0.75, marsArrival);
    camera.position.y = lerp(0.15, 0.6, marsZoom) + Math.sin(progress * 8) * 0.04;
    camera.position.z = lerp(10.8, 8.7, orbitProgress) + lerp(0, -2.8, marsZoom);
    camera.rotation.z = Math.sin(progress * Math.PI) * -0.028;
    camera.lookAt(0, lerp(-1.2, -0.7, jezeroArrival), lerp(0, -1.5, jezeroArrival));
  });

  return (
    <>
      <StarField count={lowPower ? 850 : 1900} />
      <ambientLight intensity={0.05} />
      <hemisphereLight args={["#8fbfff", "#2a0d06", 0.56]} />
      <directionalLight position={[-5, 2.8, 7]} intensity={4.8} color="#fff8ee" />
      <pointLight position={[5, -2, 5]} intensity={26} distance={22} decay={2} color="#68c9ff" />
      <pointLight position={[-4, -3, -2]} intensity={8} distance={18} color="#ff6b42" />

      <group ref={earth} position={[0, -4.15, 0]}>
        <Planet
          radius={3.05}
          textureUrl={EARTH_TEXTURE}
          fallbackColor="#315c77"
          atmosphereColor="#69c8ff"
          clouds
        />
      </group>

      <group ref={mars} position={[10.5, -4, -5.5]}>
        <Planet
          ref={marsMaterial}
          radius={3.15}
          textureUrl={MARS_TEXTURE}
          fallbackColor="#9c4d34"
          atmosphereColor="#ff7d53"
        />
      </group>

      <group ref={orbiter} visible={false}>
        <RemoteModel
          url={MRO_MODEL}
          scale={0.38}
          rotation={[0.2, -0.5, 0.1]}
          fallback={<OrbiterFallback />}
        />
      </group>
      <group ref={orbitLine} visible={false} rotation={[0.3, 0, 0]}>
        <Line points={orbitPoints} color="#78c9ff" transparent opacity={0.14} lineWidth={0.55} />
      </group>

      <group ref={terrain} visible={false}>
        <JezeroSurface ref={terrainMaterial} />
      </group>

      <group ref={rover} visible={false}>
        <RemoteModel
          url={PERSEVERANCE_MODEL}
          scale={0.42}
          rotation={[0, -1.6, 0]}
          fallback={<RoverFallback />}
        />
      </group>
    </>
  );
}

function SceneEffects({ lowPower }: { lowPower: boolean }) {
  return (
    <>
      <CinematicScene lowPower={lowPower} />
      {!lowPower && (
        <EffectComposer multisampling={0}>
          <Bloom mipmapBlur luminanceThreshold={0.72} intensity={0.65} radius={0.72} />
          <Noise premultiply opacity={0.12} />
          <Vignette eskil={false} offset={0.2} darkness={0.88} />
        </EffectComposer>
      )}
    </>
  );
}

export function SceneCanvas() {
  const [lowPower, setLowPower] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 760px)");
    const update = () => setLowPower(media.matches || navigator.hardwareConcurrency <= 4);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return (
    <div className="webgl-shell" aria-hidden="true">
      <Canvas
        dpr={lowPower ? [1, 1.25] : [1, 1.7]}
        camera={{ fov: 36, near: 0.1, far: 300, position: [0, 0, 10.8] }}
        gl={{ antialias: !lowPower, powerPreference: "high-performance" }}
        onCreated={({ gl, scene }) => {
          gl.outputColorSpace = THREE.SRGBColorSpace;
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.05;
          scene.fog = new THREE.FogExp2("#020406", 0.022);
        }}
      >
        <Suspense fallback={null}>
          <SceneEffects lowPower={lowPower} />
          <Preload all />
        </Suspense>
      </Canvas>
    </div>
  );
}
