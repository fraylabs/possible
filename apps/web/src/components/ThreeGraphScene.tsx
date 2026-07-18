import { useEffect, useRef } from "react";
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  LineBasicMaterial,
  LineSegments,
  MathUtils,
  OrthographicCamera,
  Points,
  Scene,
  ShaderMaterial,
  SRGBColorSpace,
  Vector2,
  WebGLRenderer,
} from "three";

export type ThreeGraphNodeRole = "root" | "branch" | "selected" | "related";

export interface ThreeGraphNode {
  id: string;
  x: number;
  y: number;
  role: ThreeGraphNodeRole;
}

export interface ThreeGraphEdge {
  source: string;
  target: string;
}

interface ThreeGraphSceneProps {
  nodes: ThreeGraphNode[];
  edges: ThreeGraphEdge[];
  variant: "atlas" | "related";
}

const seededRandom = (seed: number) => () => {
  seed = Math.imul(seed ^ (seed >>> 15), seed | 1);
  seed ^= seed + Math.imul(seed ^ (seed >>> 7), seed | 61);
  return ((seed ^ (seed >>> 14)) >>> 0) / 4294967296;
};

const starVertexShader = `
  attribute float aSize;
  attribute float aAlpha;
  attribute float aPhase;
  uniform float uPixelRatio;
  uniform float uTime;
  varying float vAlpha;

  void main() {
    float shimmer = 0.82 + 0.18 * sin(uTime * 0.8 + aPhase);
    vAlpha = aAlpha * shimmer;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = aSize * uPixelRatio;
  }
`;

const starFragmentShader = `
  uniform vec3 uColor;
  varying float vAlpha;

  void main() {
    float distanceFromCenter = length(gl_PointCoord - vec2(0.5));
    float pointAlpha = smoothstep(0.5, 0.08, distanceFromCenter) * vAlpha;
    gl_FragColor = vec4(uColor, pointAlpha);
  }
`;

const haloVertexShader = `
  attribute float aSize;
  attribute float aAlpha;
  attribute vec3 aColor;
  uniform float uPixelRatio;
  varying float vAlpha;
  varying vec3 vColor;

  void main() {
    vAlpha = aAlpha;
    vColor = aColor;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = aSize * uPixelRatio;
  }
`;

const haloFragmentShader = `
  varying float vAlpha;
  varying vec3 vColor;

  void main() {
    float distanceFromCenter = length(gl_PointCoord - vec2(0.5));
    float glow = pow(max(0.0, 1.0 - distanceFromCenter * 2.0), 2.2) * vAlpha;
    gl_FragColor = vec4(vColor, glow);
  }
`;

const roleStyle = (role: ThreeGraphNodeRole): { size: number; alpha: number; color: string } => {
  if (role === "root") return { size: 190, alpha: 0.3, color: "#e7efb8" };
  if (role === "selected") return { size: 164, alpha: 0.27, color: "#dbe6b0" };
  if (role === "branch") return { size: 118, alpha: 0.22, color: "#92c0a0" };
  return { size: 84, alpha: 0.17, color: "#87aa91" };
};

export function ThreeGraphScene({ nodes, edges, variant }: ThreeGraphSceneProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneKey = [
    ...nodes.map((node) => `${node.id}:${node.x}:${node.y}:${node.role}`),
    ...edges.map((edge) => `${edge.source}>${edge.target}`),
  ].join("|");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || typeof WebGL2RenderingContext === "undefined") return undefined;

    const context = canvas.getContext("webgl2", {
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    if (!context) return undefined;

    let renderer: WebGLRenderer;
    try {
      renderer = new WebGLRenderer({ canvas, context, alpha: true, antialias: true });
    } catch {
      return undefined;
    }
    canvas.dataset.ready = "true";

    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = SRGBColorSpace;

    const scene = new Scene();
    const camera = new OrthographicCamera(0, 100, 0, 100, 0.1, 100);
    camera.position.set(0, 0, 10);

    const random = seededRandom(variant === "atlas" ? 1979 : 1997);
    const particleCount = variant === "atlas" ? 320 : 260;
    const starPositions = new Float32Array(particleCount * 3);
    const starSizes = new Float32Array(particleCount);
    const starAlphas = new Float32Array(particleCount);
    const starPhases = new Float32Array(particleCount);

    for (let index = 0; index < particleCount; index += 1) {
      starPositions[index * 3] = random() * 112 - 6;
      starPositions[index * 3 + 1] = random() * 112 - 6;
      starPositions[index * 3 + 2] = random() * 7 - 4;
      starSizes[index] = 0.65 + random() * 1.8;
      starAlphas[index] = 0.12 + random() * 0.44;
      starPhases[index] = random() * Math.PI * 2;
    }

    const starGeometry = new BufferGeometry();
    starGeometry.setAttribute("position", new BufferAttribute(starPositions, 3));
    starGeometry.setAttribute("aSize", new BufferAttribute(starSizes, 1));
    starGeometry.setAttribute("aAlpha", new BufferAttribute(starAlphas, 1));
    starGeometry.setAttribute("aPhase", new BufferAttribute(starPhases, 1));
    const starUniforms = {
      uColor: { value: new Color(variant === "atlas" ? "#b6c9aa" : "#9eb8a4") },
      uPixelRatio: { value: 1 },
      uTime: { value: 0 },
    };
    const starMaterial = new ShaderMaterial({
      vertexShader: starVertexShader,
      fragmentShader: starFragmentShader,
      uniforms: starUniforms,
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
    });
    const stars = new Points(starGeometry, starMaterial);
    stars.position.z = -3;
    scene.add(stars);

    const nodeById = new Map(nodes.map((node) => [node.id, node]));
    const edgePairs = edges.flatMap((edge) => {
      const source = nodeById.get(edge.source);
      const target = nodeById.get(edge.target);
      return source && target ? [{ source, target }] : [];
    });

    const linePositions = new Float32Array(edgePairs.length * 6);
    edgePairs.forEach(({ source, target }, index) => {
      linePositions.set([source.x, source.y, 0, target.x, target.y, 0], index * 6);
    });
    const lineGeometry = new BufferGeometry();
    lineGeometry.setAttribute("position", new BufferAttribute(linePositions, 3));
    const lineMaterial = new LineBasicMaterial({
      color: variant === "atlas" ? 0xdfe8b8 : 0xb7cbb2,
      transparent: true,
      opacity: variant === "atlas" ? 0.3 : 0.22,
      depthWrite: false,
      blending: AdditiveBlending,
    });
    const connections = new LineSegments(lineGeometry, lineMaterial);
    scene.add(connections);

    const haloPositions = new Float32Array(nodes.length * 3);
    const haloSizes = new Float32Array(nodes.length);
    const haloAlphas = new Float32Array(nodes.length);
    const haloColors = new Float32Array(nodes.length * 3);
    nodes.forEach((node, index) => {
      const style = roleStyle(node.role);
      const color = new Color(style.color);
      haloPositions.set([node.x, node.y, 0.1], index * 3);
      haloSizes[index] = style.size;
      haloAlphas[index] = style.alpha;
      haloColors.set([color.r, color.g, color.b], index * 3);
    });
    const haloGeometry = new BufferGeometry();
    haloGeometry.setAttribute("position", new BufferAttribute(haloPositions, 3));
    haloGeometry.setAttribute("aSize", new BufferAttribute(haloSizes, 1));
    haloGeometry.setAttribute("aAlpha", new BufferAttribute(haloAlphas, 1));
    haloGeometry.setAttribute("aColor", new BufferAttribute(haloColors, 3));
    const haloUniforms = { uPixelRatio: { value: 1 } };
    const haloMaterial = new ShaderMaterial({
      vertexShader: haloVertexShader,
      fragmentShader: haloFragmentShader,
      uniforms: haloUniforms,
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
    });
    const halos = new Points(haloGeometry, haloMaterial);
    scene.add(halos);

    const pulseCount = edgePairs.length * 2;
    const pulsePositions = new Float32Array(pulseCount * 3);
    const pulseSizes = new Float32Array(pulseCount).fill(3.6);
    const pulseAlphas = new Float32Array(pulseCount).fill(0.86);
    const pulsePhases = new Float32Array(pulseCount).fill(0);
    const pulseGeometry = new BufferGeometry();
    const pulsePositionAttribute = new BufferAttribute(pulsePositions, 3);
    pulseGeometry.setAttribute("position", pulsePositionAttribute);
    pulseGeometry.setAttribute("aSize", new BufferAttribute(pulseSizes, 1));
    pulseGeometry.setAttribute("aAlpha", new BufferAttribute(pulseAlphas, 1));
    pulseGeometry.setAttribute("aPhase", new BufferAttribute(pulsePhases, 1));
    const pulseUniforms = {
      uColor: { value: new Color("#eff5bb") },
      uPixelRatio: { value: 1 },
      uTime: { value: 0 },
    };
    const pulseMaterial = new ShaderMaterial({
      vertexShader: starVertexShader,
      fragmentShader: starFragmentShader,
      uniforms: pulseUniforms,
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
    });
    const pulses = new Points(pulseGeometry, pulseMaterial);
    scene.add(pulses);

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const pointerTarget = new Vector2();
    const pointerCurrent = new Vector2();
    const updatePointer = (event: PointerEvent) => {
      const bounds = canvas.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return;
      pointerTarget.set(
        ((event.clientX - bounds.left) / bounds.width - 0.5) * 1.8,
        ((event.clientY - bounds.top) / bounds.height - 0.5) * 1.4,
      );
    };

    const updatePulses = (elapsedSeconds: number) => {
      edgePairs.forEach(({ source, target }, edgeIndex) => {
        for (let pulseIndex = 0; pulseIndex < 2; pulseIndex += 1) {
          const positionIndex = edgeIndex * 2 + pulseIndex;
          const progress = reducedMotion
            ? 0.35 + pulseIndex * 0.3
            : (elapsedSeconds * (0.085 + edgeIndex * 0.004) + pulseIndex * 0.5 + edgeIndex * 0.11) % 1;
          pulsePositions[positionIndex * 3] = MathUtils.lerp(source.x, target.x, progress);
          pulsePositions[positionIndex * 3 + 1] = MathUtils.lerp(source.y, target.y, progress);
          pulsePositions[positionIndex * 3 + 2] = 0.2;
        }
      });
      pulsePositionAttribute.needsUpdate = true;
    };

    const renderFrame = (elapsedMilliseconds = 0) => {
      const elapsedSeconds = elapsedMilliseconds / 1000;
      pointerCurrent.lerp(pointerTarget, 0.035);
      stars.position.x = pointerCurrent.x;
      stars.position.y = pointerCurrent.y;
      if (!reducedMotion) {
        stars.rotation.z = Math.sin(elapsedSeconds * 0.055) * 0.006;
      }
      starUniforms.uTime.value = elapsedSeconds;
      pulseUniforms.uTime.value = elapsedSeconds;
      updatePulses(elapsedSeconds);
      renderer.render(scene, camera);
    };

    const resize = () => {
      const width = Math.max(1, canvas.clientWidth);
      const height = Math.max(1, canvas.clientHeight);
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.75);
      renderer.setPixelRatio(pixelRatio);
      renderer.setSize(width, height, false);
      starUniforms.uPixelRatio.value = pixelRatio;
      haloUniforms.uPixelRatio.value = pixelRatio;
      pulseUniforms.uPixelRatio.value = pixelRatio;
      renderFrame();
    };

    let animationFrame = 0;
    const animate = (elapsedMilliseconds: number) => {
      renderFrame(elapsedMilliseconds);
      animationFrame = window.requestAnimationFrame(animate);
    };

    const resizeObserver = typeof ResizeObserver === "undefined" ? undefined : new ResizeObserver(resize);
    resizeObserver?.observe(canvas);
    window.addEventListener("resize", resize, { passive: true });
    resize();
    if (!reducedMotion) {
      window.addEventListener("pointermove", updatePointer, { passive: true });
      animationFrame = window.requestAnimationFrame(animate);
    }

    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", updatePointer);
      window.cancelAnimationFrame(animationFrame);
      starGeometry.dispose();
      starMaterial.dispose();
      lineGeometry.dispose();
      lineMaterial.dispose();
      haloGeometry.dispose();
      haloMaterial.dispose();
      pulseGeometry.dispose();
      pulseMaterial.dispose();
      renderer.dispose();
      delete canvas.dataset.ready;
    };
  }, [sceneKey, variant]);

  return <canvas ref={canvasRef} className="three-graph" aria-hidden="true" />;
}
