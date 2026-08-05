"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export default function RobotSnakeViewer() {
  const hostRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rotatingRef = useRef(true);
  const [status, setStatus] = useState("Static CAD view · Interactive preview loads when supported");
  const [ready, setReady] = useState(false);
  const [rotating, setRotating] = useState(true);

  useEffect(() => {
    rotatingRef.current = rotating;
    if (controlsRef.current) controlsRef.current.autoRotate = rotating && !document.hidden;
  }, [rotating]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    if (process.env.NODE_ENV === "test") return;

    const probe = document.createElement("canvas");
    const webgl = probe.getContext("webgl2") ?? probe.getContext("webgl");
    if (!webgl) {
      setStatus("Static CAD view · WebGL unavailable; download GLB below");
      return;
    }
    setStatus("Static CAD view · Preparing interactive preview…");

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xe9edf3);

    const camera = new THREE.PerspectiveCamera(34, 1, 0.01, 100);
    camera.position.set(1.55, 1.1, 1.25);
    cameraRef.current = camera;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    } catch {
      setStatus("Static CAD view · WebGL unavailable; download GLB below");
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    const controls = new OrbitControls(camera, renderer.domElement);
    controlsRef.current = controls;
    controls.enableDamping = true;
    controls.enablePan = false;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reducedMotion.matches) {
      rotatingRef.current = false;
      setRotating(false);
    }
    controls.autoRotate = rotatingRef.current && !document.hidden;
    controls.autoRotateSpeed = 0.65;
    controls.target.set(0, 0, 0);

    scene.add(new THREE.HemisphereLight(0xffffff, 0x47505b, 2.6));
    const key = new THREE.DirectionalLight(0xffffff, 3.5);
    key.position.set(3, 4, 2);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0xff6a2a, 2.2);
    rim.position.set(-3, 1, -2);
    scene.add(rim);

    const grid = new THREE.GridHelper(4, 32, 0x88929e, 0xcbd1d8);
    grid.position.y = -0.168;
    scene.add(grid);
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(4, 4),
      new THREE.MeshStandardMaterial({ color: 0xe1e6eb, roughness: 1 }),
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.17;
    floor.receiveShadow = true;
    scene.add(floor);

    let disposed = false;
    let loadFailed = false;
    let frame = 0;

    const resize = () => {
      const { clientWidth, clientHeight } = host;
      if (!clientWidth || !clientHeight) return;
      renderer.setSize(clientWidth, clientHeight, false);
      camera.aspect = clientWidth / clientHeight;
      camera.updateProjectionMatrix();
    };

    new GLTFLoader().load(
      "/demo/robot-snake/cad/robot-snake.glb",
      (gltf) => {
        if (disposed) return;
        const model = gltf.scene;
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        model.position.sub(center);
        model.rotation.x = -Math.PI / 2;
        model.rotation.z = Math.PI / 8;
        const longest = Math.max(size.x, size.y, size.z) || 1;
        model.scale.setScalar(1.55 / longest);
        model.traverse((child) => {
          if (!(child instanceof THREE.Mesh)) return;
          child.castShadow = true;
          child.receiveShadow = true;
        });
        scene.add(model);
        host.appendChild(renderer.domElement);
        setReady(true);
        setStatus("Drag to inspect · Scroll to zoom");
      },
      undefined,
      () => {
        loadFailed = true;
        window.cancelAnimationFrame(frame);
        setStatus("Static CAD view · Interactive GLB unavailable; download below");
      },
    );

    const animate = () => {
      if (disposed || loadFailed) return;
      controls.update();
      renderer.render(scene, camera);
      frame = window.requestAnimationFrame(animate);
    };

    const syncMotion = () => {
      controls.autoRotate = rotatingRef.current && !document.hidden && !reducedMotion.matches;
    };

    resize();
    animate();
    const observer = new ResizeObserver(resize);
    observer.observe(host);
    document.addEventListener("visibilitychange", syncMotion);
    reducedMotion.addEventListener("change", syncMotion);

    return () => {
      disposed = true;
      observer.disconnect();
      document.removeEventListener("visibilitychange", syncMotion);
      reducedMotion.removeEventListener("change", syncMotion);
      window.cancelAnimationFrame(frame);
      controls.dispose();
      controlsRef.current = null;
      cameraRef.current = null;
      renderer.dispose();
      scene.traverse((child) => {
        if (!(child instanceof THREE.Mesh)) return;
        child.geometry.dispose();
        const materials = Array.isArray(child.material) ? child.material : [child.material];
        materials.forEach((material) => material.dispose());
      });
      renderer.domElement.remove();
    };
  }, []);

  function rotateCamera(direction: -1 | 1) {
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (!camera || !controls) return;
    camera.position.applyAxisAngle(new THREE.Vector3(0, 1, 0), direction * Math.PI / 10);
    controls.update();
    setRotating(false);
  }

  function resetCamera() {
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (!camera || !controls) return;
    camera.position.set(1.55, 1.1, 1.25);
    controls.target.set(0, 0, 0);
    controls.update();
    setRotating(false);
  }

  return (
    <div className="robot-model-viewer" ref={hostRef} role="group" aria-label="Interactive static CAD viewer">
      <img className={ready ? "is-hidden" : undefined} src="/demo/robot-snake/cad/iso.png" alt="Isometric CAD view of the ten-link robot snake digital prototype" />
      <p aria-live="polite">{status}</p>
      <span>STATIC CAD / GLB</span>
      {ready ? <div className="robot-model-controls" aria-label="CAD view controls">
        <button type="button" onClick={() => rotateCamera(-1)} aria-label="Rotate CAD left">←</button>
        <button type="button" onClick={() => setRotating((value) => !value)}>{rotating ? "PAUSE" : "ROTATE"}</button>
        <button type="button" onClick={() => rotateCamera(1)} aria-label="Rotate CAD right">→</button>
        <button type="button" onClick={resetCamera}>RESET</button>
      </div> : null}
    </div>
  );
}
