"use client";

import { useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import * as THREE from "three";

type GamePhase = "ready" | "playing" | "paused" | "gameover";
type GameApi = { reset: () => void; setPhase: (phase: GamePhase) => void };

function createPaperPlane() {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute([
    0, 0.12, -1.25, -1.05, 0, 0.65, 0, 0.05, 0.25,
    0, 0.12, -1.25, 0, 0.05, 0.25, 1.05, 0, 0.65,
    0, 0.12, -1.25, 0, 0.05, 0.25, 0, 0.52, 0.72,
  ], 3));
  geometry.computeVertexNormals();
  const material = new THREE.MeshStandardMaterial({ color: 0xf4efe2, roughness: 0.52, metalness: 0.05, side: THREE.DoubleSide });
  const plane = new THREE.Mesh(geometry, material);
  plane.rotation.x = -0.08;
  return plane;
}

export default function PaperPlaneGame() {
  const mountRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<GameApi | null>(null);
  const audioRef = useRef<AudioContext | null>(null);
  const mutedRef = useRef(false);
  const targetRef = useRef({ x: 0, y: 0 });
  const [phase, setPhase] = useState<GamePhase>("ready");
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [muted, setMuted] = useState(false);
  const [renderError, setRenderError] = useState(false);

  const playTone = (frequency: number, duration: number, volume = 0.05) => {
    if (mutedRef.current) return;
    const context = audioRef.current ?? new AudioContext();
    audioRef.current = context;
    if (context.state === "suspended") void context.resume();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = "triangle";
    oscillator.frequency.setValueAtTime(frequency, context.currentTime);
    gain.gain.setValueAtTime(volume, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + duration);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + duration);
  };

  useEffect(() => {
    apiRef.current?.setPhase(phase);
  }, [phase]);

  useEffect(() => {
    mutedRef.current = muted;
  }, [muted]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
    } catch {
      setRenderError(true);
      return;
    }

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x10171f);
    scene.fog = new THREE.FogExp2(0x10171f, 0.028);
    const camera = new THREE.PerspectiveCamera(58, 1, 0.1, 90);
    camera.position.set(0, 2.2, 7.5);
    camera.lookAt(0, 0.2, -14);

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);

    scene.add(new THREE.HemisphereLight(0xc9e8ff, 0x26313a, 2.1));
    const keyLight = new THREE.DirectionalLight(0xff8a57, 4.4);
    keyLight.position.set(-4, 7, 4);
    scene.add(keyLight);

    const plane = createPaperPlane();
    plane.position.set(0, 0.1, 0);
    scene.add(plane);

    const gateMaterial = new THREE.MeshStandardMaterial({ color: 0xff5a1f, emissive: 0x6e1700, emissiveIntensity: 1.5, roughness: 0.28 });
    const gates = Array.from({ length: 5 }, (_, index) => {
      const mesh = new THREE.Mesh(new THREE.TorusGeometry(1.65, 0.22, 8, 40), gateMaterial);
      mesh.position.set((Math.random() - 0.5) * 5, (Math.random() - 0.5) * 2.8, -12 - index * 9);
      mesh.rotation.z = (Math.random() - 0.5) * 0.3;
      scene.add(mesh);
      return { mesh, passed: false };
    });

    const cloudMaterial = new THREE.MeshStandardMaterial({ color: 0x2a3540, roughness: 0.96, flatShading: true });
    const clouds = Array.from({ length: reducedMotion ? 16 : 32 }, (_, index) => {
      const mesh = new THREE.Mesh(new THREE.IcosahedronGeometry(0.7 + Math.random() * 1.1, 1), cloudMaterial);
      const side = index % 2 === 0 ? -1 : 1;
      mesh.position.set(side * (4.5 + Math.random() * 5), -1 + Math.random() * 5.5, -Math.random() * 70);
      mesh.scale.set(1.8, 0.75, 1);
      scene.add(mesh);
      return mesh;
    });

    const rainCount = reducedMotion ? 80 : 260;
    const rainPositions = new Float32Array(rainCount * 6);
    for (let index = 0; index < rainCount; index += 1) {
      const offset = index * 6;
      const x = (Math.random() - 0.5) * 20;
      const y = (Math.random() - 0.5) * 11;
      const z = -Math.random() * 55;
      rainPositions.set([x, y, z, x - 0.08, y - 0.55, z + 0.45], offset);
    }
    const rainGeometry = new THREE.BufferGeometry();
    rainGeometry.setAttribute("position", new THREE.BufferAttribute(rainPositions, 3));
    const rain = new THREE.LineSegments(rainGeometry, new THREE.LineBasicMaterial({ color: 0x7897ac, transparent: true, opacity: 0.32 }));
    scene.add(rain);

    let currentPhase: GamePhase = "ready";
    let currentScore = 0;
    let speed = 7.2;
    let animationFrame = 0;
    let lastTime = performance.now();

    const placeGate = (gate: { mesh: THREE.Mesh; passed: boolean }, z: number) => {
      gate.mesh.position.set((Math.random() - 0.5) * 5.4, (Math.random() - 0.5) * 2.9, z);
      gate.mesh.rotation.z = (Math.random() - 0.5) * 0.35;
      gate.passed = false;
    };

    const reset = () => {
      currentScore = 0;
      speed = 7.2;
      targetRef.current = { x: 0, y: 0 };
      plane.position.set(0, 0.1, 0);
      gates.forEach((gate, index) => placeGate(gate, -12 - index * 9));
      setScore(0);
    };

    apiRef.current = {
      reset,
      setPhase: (nextPhase) => { currentPhase = nextPhase; },
    };

    const resize = () => {
      const { width, height } = mount.getBoundingClientRect();
      renderer.setSize(Math.max(width, 1), Math.max(height, 1), false);
      camera.aspect = Math.max(width, 1) / Math.max(height, 1);
      camera.updateProjectionMatrix();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(mount);
    resize();

    const animate = (now: number) => {
      const delta = Math.min((now - lastTime) / 1000, 0.04);
      lastTime = now;
      const activeDelta = currentPhase === "playing" ? delta : delta * 0.15;

      plane.position.x = THREE.MathUtils.damp(plane.position.x, targetRef.current.x * 4.1, 7.5, delta);
      plane.position.y = THREE.MathUtils.damp(plane.position.y, targetRef.current.y * 2.15 + 0.2, 7.5, delta);
      plane.rotation.z = THREE.MathUtils.damp(plane.rotation.z, -targetRef.current.x * 0.34, 6, delta);
      plane.rotation.x = THREE.MathUtils.damp(plane.rotation.x, targetRef.current.y * 0.18 - 0.08, 6, delta);

      rain.position.z += activeDelta * speed * 1.7;
      if (rain.position.z > 18) rain.position.z = 0;
      clouds.forEach((cloud) => {
        cloud.position.z += activeDelta * speed * 0.55;
        if (cloud.position.z > 10) cloud.position.z = -60 - Math.random() * 12;
      });

      if (currentPhase === "playing") {
        speed = Math.min(12.8, speed + delta * 0.09);
        for (const gate of gates) {
          gate.mesh.position.z += speed * delta;
          gate.mesh.rotation.z += delta * 0.12;
          if (!gate.passed && gate.mesh.position.z >= -0.05) {
            gate.passed = true;
            const distance = Math.hypot(plane.position.x - gate.mesh.position.x, plane.position.y - gate.mesh.position.y);
            if (distance > 1.38) {
              playTone(105, 0.42, 0.08);
              currentPhase = "gameover";
              setPhase("gameover");
              setBest((value) => Math.max(value, currentScore));
              break;
            }
            currentScore += 1;
            playTone(620 + Math.min(currentScore, 8) * 36, 0.11);
            setScore(currentScore);
          }
          if (gate.mesh.position.z > 7) {
            const farthest = Math.min(...gates.map((candidate) => candidate.mesh.position.z));
            placeGate(gate, farthest - 9 - Math.random() * 3);
          }
        }
      }

      camera.position.x = THREE.MathUtils.damp(camera.position.x, plane.position.x * 0.13, 3, delta);
      camera.position.y = THREE.MathUtils.damp(camera.position.y, 2.2 + plane.position.y * 0.08, 3, delta);
      renderer.render(scene, camera);
      animationFrame = requestAnimationFrame(animate);
    };
    animationFrame = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrame);
      observer.disconnect();
      apiRef.current = null;
      renderer.dispose();
      rainGeometry.dispose();
      plane.geometry.dispose();
      (plane.material as THREE.Material).dispose();
      gates.forEach(({ mesh }) => mesh.geometry.dispose());
      cloudMaterial.dispose();
      gateMaterial.dispose();
      if (audioRef.current) void audioRef.current.close();
      audioRef.current = null;
      mount.removeChild(renderer.domElement);
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (["arrowleft", "arrowright", "arrowup", "arrowdown", "w", "a", "s", "d", " ", "p"].includes(key)) event.preventDefault();
      if (key === " " && (phase === "ready" || phase === "gameover")) {
        apiRef.current?.reset();
        setPhase("playing");
      }
      if (key === "p" && (phase === "playing" || phase === "paused")) setPhase((value) => value === "playing" ? "paused" : "playing");
      const horizontal = key === "arrowleft" || key === "a" ? -0.18 : key === "arrowright" || key === "d" ? 0.18 : 0;
      const vertical = key === "arrowup" || key === "w" ? 0.18 : key === "arrowdown" || key === "s" ? -0.18 : 0;
      if (horizontal || vertical) targetRef.current = {
        x: THREE.MathUtils.clamp(targetRef.current.x + horizontal, -1, 1),
        y: THREE.MathUtils.clamp(targetRef.current.y + vertical, -1, 1),
      };
    };
    window.addEventListener("keydown", onKeyDown, { passive: false });
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [phase]);

  const start = () => {
    if (!mutedRef.current && !audioRef.current) audioRef.current = new AudioContext();
    playTone(330, 0.08, 0.035);
    apiRef.current?.reset();
    setPhase("playing");
  };

  const pointPlane = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (phase !== "playing") return;
    const bounds = event.currentTarget.getBoundingClientRect();
    targetRef.current = {
      x: THREE.MathUtils.clamp(((event.clientX - bounds.left) / bounds.width) * 2 - 1, -1, 1),
      y: THREE.MathUtils.clamp(-(((event.clientY - bounds.top) / bounds.height) * 2 - 1), -1, 1),
    };
  };

  return (
    <main className="plane-game-shell">
      <div className="plane-game" onPointerMove={pointPlane} onPointerDown={pointPlane}>
        <div className="plane-game-canvas" ref={mountRef} aria-hidden="true" />
        <header className="plane-game-hud">
          <a href="/demo/game"><strong>FOLD / 01</strong><span>EXIT DEMO ↗</span></a>
          <p><span>GATES</span><strong>{String(score).padStart(2, "0")}</strong></p>
          <p><span>BEST</span><strong>{String(best).padStart(2, "0")}</strong></p>
          <button type="button" onClick={() => setMuted((value) => !value)}>{muted ? "SOUND OFF" : "SOUND ON"}</button>
          <button type="button" onClick={() => setPhase((value) => value === "playing" ? "paused" : "playing")} disabled={phase === "ready" || phase === "gameover"}>{phase === "paused" ? "RESUME" : "PAUSE"}</button>
        </header>

        {renderError ? <section className="plane-game-overlay"><span>WEBGL UNAVAILABLE</span><h1>This flight needs<br />a WebGL browser.</h1><a href="/demo/game">Return to the pack proof →</a></section> : null}
        {!renderError && phase === "ready" ? <section className="plane-game-overlay">
          <span>ONE PLANE / ONE STORM / ONE RULE</span>
          <h1>Thread the<br /><em>orange.</em></h1>
          <p>Guide the paper plane through every storm gate. Move with your pointer, touch, or arrow keys.</p>
          <button type="button" onClick={start}>START FLIGHT <i>→</i></button>
        </section> : null}
        {phase === "paused" ? <section className="plane-game-overlay plane-game-overlay--compact"><span>FLIGHT PAUSED</span><h1>Hold that line.</h1><button type="button" onClick={() => setPhase("playing")}>RESUME <i>→</i></button></section> : null}
        {phase === "gameover" ? <section className="plane-game-overlay plane-game-overlay--compact"><span>THE STORM WON / {score} GATES</span><h1>Fold again.</h1><button type="button" onClick={start}>RETRY FLIGHT <i>→</i></button></section> : null}

        <footer className="plane-game-controls"><span>POINTER / TOUCH</span><strong>MOVE TO STEER</strong><span>WASD / ARROWS</span><strong>P TO PAUSE</strong></footer>
      </div>
    </main>
  );
}
