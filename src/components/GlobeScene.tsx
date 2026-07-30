"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture, Stars } from "@react-three/drei";
import * as THREE from "three";

type JourneyEntry = {
  name: string;
  lat: number;
  lon: number;
  accentColor: string;
  glowRgb: string;
};

// Convert Lat/Lon to 3D Sphere Vector3
function latLonToVec3(lat: number, lon: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -(radius * Math.sin(phi) * Math.cos(theta)),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

// Custom Atmosphere Outer Glow Shader
const atmosphereVertexShader = `
varying vec3 vNormal;
void main() {
  vNormal = normalize(normalMatrix * normal);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const atmosphereFragmentShader = `
uniform vec3 uColor;
varying vec3 vNormal;
void main() {
  float intensity = pow(0.65 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.5);
  gl_FragColor = vec4(uColor, 1.0) * intensity;
}
`;

// Realistic Earth Mesh with High-Res Satellite Textures
function EarthPlanet({
  rotRef,
}: {
  rotRef: React.MutableRefObject<number>;
}) {
  const earthRef = useRef<THREE.Mesh>(null!);

  // Load high resolution Earth maps
  const [dayMap, specularMap, bumpMap] = useTexture([
    "/textures/earth_day.jpg",
    "/textures/earth_specular.png",
    "/textures/earth_topology.png",
  ]);

  useFrame(() => {
    if (earthRef.current) {
      earthRef.current.rotation.y = rotRef.current;
    }
  });

  return (
    <mesh ref={earthRef}>
      <sphereGeometry args={[1.5, 96, 96]} />
      <meshPhongMaterial
        map={dayMap}
        specularMap={specularMap}
        bumpMap={bumpMap}
        bumpScale={0.035}
        specular={new THREE.Color(0x336699)}
        shininess={25}
      />
    </mesh>
  );
}

// 3D Spinning Cloud Layer
function CloudLayer({
  rotRef,
}: {
  rotRef: React.MutableRefObject<number>;
}) {
  const cloudRef = useRef<THREE.Mesh>(null!);
  const [cloudsTex] = useTexture(["/textures/earth_clouds.png"]);

  useFrame((_, delta) => {
    if (cloudRef.current) {
      // Cloud layer rotates slightly faster than the earth for dynamic movement
      cloudRef.current.rotation.y = rotRef.current + delta * 0.02;
    }
  });

  return (
    <mesh ref={cloudRef}>
      <sphereGeometry args={[1.525, 64, 64]} />
      <meshStandardMaterial
        map={cloudsTex}
        transparent={true}
        opacity={0.4}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
}

// Outer Atmospheric Halo
function OuterAtmosphere({
  rotRef,
  glowRgb,
}: {
  rotRef: React.MutableRefObject<number>;
  glowRgb: string;
}) {
  const atmosRef = useRef<THREE.Mesh>(null!);
  const matRef = useRef<THREE.ShaderMaterial>(null!);

  const colorVec = new THREE.Color(`rgb(${glowRgb})`);

  useFrame(() => {
    if (atmosRef.current) {
      atmosRef.current.rotation.y = rotRef.current;
    }
    if (matRef.current) {
      matRef.current.uniforms.uColor.value.lerp(colorVec, 0.05);
    }
  });

  return (
    <mesh ref={atmosRef}>
      <sphereGeometry args={[1.6, 64, 64]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={atmosphereVertexShader}
        fragmentShader={atmosphereFragmentShader}
        uniforms={{ uColor: { value: colorVec } }}
        side={THREE.BackSide}
        transparent={true}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
}

// Interactive Country Pins & Beacons
function CountryMarkers({
  journey,
  activeStep,
  rotRef,
}: {
  journey: JourneyEntry[];
  activeStep: number;
  rotRef: React.MutableRefObject<number>;
}) {
  const groupRef = useRef<THREE.Group>(null!);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y = rotRef.current;
    }
  });

  return (
    <group ref={groupRef}>
      {journey.map((c, i) => {
        const isSelected = i === activeStep;
        const pos = latLonToVec3(c.lat, c.lon, 1.54);

        return (
          <group key={c.name} position={pos}>
            {/* Core Glowing Dot */}
            <mesh>
              <sphereGeometry args={[isSelected ? 0.04 : 0.022, 16, 16]} />
              <meshBasicMaterial color={isSelected ? "#D4AF37" : "#FFC107"} />
            </mesh>

            {/* Glowing Pulsing Ring */}
            {isSelected && (
              <mesh>
                <ringGeometry args={[0.055, 0.075, 32]} />
                <meshBasicMaterial
                  color="#D4AF37"
                  transparent={true}
                  opacity={0.85}
                  side={THREE.DoubleSide}
                />
              </mesh>
            )}

            {/* Light Beacon Beam for active country */}
            {isSelected && (
              <mesh position={[0, 0.15, 0]}>
                <cylinderGeometry args={[0.01, 0.04, 0.3, 16]} />
                <meshBasicMaterial
                  color={c.accentColor}
                  transparent={true}
                  opacity={0.4}
                />
              </mesh>
            )}
          </group>
        );
      })}
    </group>
  );
}

export function GlobeScene({
  journey,
  activeStep,
}: {
  journey: JourneyEntry[];
  activeStep: number;
}) {
  const rotRef = useRef(1.2);

  // Rotate globe smoothly to target longitude for active country
  useFrame(() => {
    const target = -(journey[activeStep].lon * Math.PI) / 180 + Math.PI;
    let diff = target - rotRef.current;

    while (diff > Math.PI) diff -= 2 * Math.PI;
    while (diff < -Math.PI) diff += 2 * Math.PI;

    rotRef.current += diff * 0.035;
  });

  return (
    <>
      {/* Cinematic Studio & Sun Lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[6, 3, 5]}
        intensity={2.2}
        color="#FFF9EA"
      />
      <directionalLight
        position={[-5, -2, -4]}
        intensity={0.4}
        color="#4A75A0"
      />
      <pointLight position={[0, 5, 5]} intensity={0.5} color="#FAF9F6" />

      {/* Cosmic Stars Background */}
      <Stars
        radius={100}
        depth={50}
        count={5000}
        factor={4}
        saturation={0}
        fade={true}
        speed={0.5}
      />

      {/* 3D Earth Layers */}
      <EarthPlanet rotRef={rotRef} />
      <CloudLayer rotRef={rotRef} />
      <OuterAtmosphere
        rotRef={rotRef}
        glowRgb={journey[activeStep].glowRgb}
      />

      {/* 3D Country Markers */}
      <CountryMarkers
        journey={journey}
        activeStep={activeStep}
        rotRef={rotRef}
      />
    </>
  );
}
