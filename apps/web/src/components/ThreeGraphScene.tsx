import { useEffect, useRef } from "react";
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  LineBasicMaterial,
  LineSegments,
  OrthographicCamera,
  Points,
  Scene,
  ShaderMaterial,
  SRGBColorSpace,
  Vector2,
  WebGLRenderer,
} from "three";

export type ThreeGraphNodeRole = "field" | "page" | "selected" | "related";

export interface ThreeGraphNode {
  id: string;
  x: number;
  y: number;
  role: ThreeGraphNodeRole;
  color: string;
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

const pointVertexShader = `
  attribute float aSize;
  attribute float aAlpha;
  attribute float aPhase;
  uniform float uPixelRatio;
  uniform float uTime;
  varying float vAlpha;

  void main() {
    float shimmer = 0.9 + 0.1 * sin(uTime * 0.45 + aPhase);
    vAlpha = aAlpha * shimmer;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = aSize * uPixelRatio;
  }
`;

const pointFragmentShader = `
  uniform vec3 uColor;
  varying float vAlpha;

  void main() {
    float distanceFromCenter = length(gl_PointCoord - vec2(0.5));
    float pointAlpha = smoothstep(0.5, 0.08, distanceFromCenter) * vAlpha;
    gl_FragColor = vec4(uColor, pointAlpha);
  }
`;

const nodeVertexShader = `
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

const nodeFragmentShader = `
  varying float vAlpha;
  varying vec3 vColor;

  void main() {
    float distanceFromCenter = length(gl_PointCoord - vec2(0.5));
    float core = smoothstep(0.18, 0.02, distanceFromCenter);
    float glow = pow(max(0.0, 1.0 - distanceFromCenter * 2.0), 2.5);
    gl_FragColor = vec4(vColor, core * 0.72 + glow * vAlpha);
  }
`;

const roleStyle = (role: ThreeGraphNodeRole): { size: number; alpha: number } => {
  if (role === "field") return { size: 42, alpha: 0.55 };
  if (role === "selected") return { size: 48, alpha: 0.65 };
  if (role === "related") return { size: 24, alpha: 0.42 };
  return { size: 17, alpha: 0.3 };
};

export function ThreeGraphScene({ nodes, edges, variant }: ThreeGraphSceneProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneKey = [
    ...nodes.map((node) => `${node.id}:${node.x}:${node.y}:${node.role}:${node.color}`),
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
    const particleCount = variant === "atlas" ? 150 : 90;
    const dustPositions = new Float32Array(particleCount * 3);
    const dustSizes = new Float32Array(particleCount);
    const dustAlphas = new Float32Array(particleCount);
    const dustPhases = new Float32Array(particleCount);
    for (let index = 0; index < particleCount; index += 1) {
      dustPositions[index * 3] = random() * 108 - 4;
      dustPositions[index * 3 + 1] = random() * 108 - 4;
      dustPositions[index * 3 + 2] = -2;
      dustSizes[index] = 0.5 + random() * 1.1;
      dustAlphas[index] = 0.05 + random() * 0.16;
      dustPhases[index] = random() * Math.PI * 2;
    }

    const dustGeometry = new BufferGeometry();
    dustGeometry.setAttribute("position", new BufferAttribute(dustPositions, 3));
    dustGeometry.setAttribute("aSize", new BufferAttribute(dustSizes, 1));
    dustGeometry.setAttribute("aAlpha", new BufferAttribute(dustAlphas, 1));
    dustGeometry.setAttribute("aPhase", new BufferAttribute(dustPhases, 1));
    const dustUniforms = {
      uColor: { value: new Color("#8d96aa") },
      uPixelRatio: { value: 1 },
      uTime: { value: 0 },
    };
    const dustMaterial = new ShaderMaterial({
      vertexShader: pointVertexShader,
      fragmentShader: pointFragmentShader,
      uniforms: dustUniforms,
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
    });
    const dust = new Points(dustGeometry, dustMaterial);
    scene.add(dust);

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
      color: 0x858ca0,
      transparent: true,
      opacity: variant === "atlas" ? 0.17 : 0.24,
      depthWrite: false,
      blending: AdditiveBlending,
    });
    scene.add(new LineSegments(lineGeometry, lineMaterial));

    const nodePositions = new Float32Array(nodes.length * 3);
    const nodeSizes = new Float32Array(nodes.length);
    const nodeAlphas = new Float32Array(nodes.length);
    const nodeColors = new Float32Array(nodes.length * 3);
    nodes.forEach((node, index) => {
      const style = roleStyle(node.role);
      const color = new Color(node.color);
      nodePositions.set([node.x, node.y, 0.2], index * 3);
      nodeSizes[index] = style.size;
      nodeAlphas[index] = style.alpha;
      nodeColors.set([color.r, color.g, color.b], index * 3);
    });
    const nodeGeometry = new BufferGeometry();
    nodeGeometry.setAttribute("position", new BufferAttribute(nodePositions, 3));
    nodeGeometry.setAttribute("aSize", new BufferAttribute(nodeSizes, 1));
    nodeGeometry.setAttribute("aAlpha", new BufferAttribute(nodeAlphas, 1));
    nodeGeometry.setAttribute("aColor", new BufferAttribute(nodeColors, 3));
    const nodeUniforms = { uPixelRatio: { value: 1 } };
    const nodeMaterial = new ShaderMaterial({
      vertexShader: nodeVertexShader,
      fragmentShader: nodeFragmentShader,
      uniforms: nodeUniforms,
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
    });
    scene.add(new Points(nodeGeometry, nodeMaterial));

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const pointerTarget = new Vector2();
    const pointerCurrent = new Vector2();
    const updatePointer = (event: PointerEvent) => {
      const bounds = canvas.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return;
      pointerTarget.set(
        ((event.clientX - bounds.left) / bounds.width - 0.5) * 0.55,
        ((event.clientY - bounds.top) / bounds.height - 0.5) * 0.4,
      );
    };
    const renderFrame = (elapsedMilliseconds = 0) => {
      pointerCurrent.lerp(pointerTarget, 0.025);
      dust.position.x = pointerCurrent.x;
      dust.position.y = pointerCurrent.y;
      dustUniforms.uTime.value = elapsedMilliseconds / 1000;
      renderer.render(scene, camera);
    };
    const resize = () => {
      const width = Math.max(1, canvas.clientWidth);
      const height = Math.max(1, canvas.clientHeight);
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.75);
      renderer.setPixelRatio(pixelRatio);
      renderer.setSize(width, height, false);
      dustUniforms.uPixelRatio.value = pixelRatio;
      nodeUniforms.uPixelRatio.value = pixelRatio;
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
      dustGeometry.dispose();
      dustMaterial.dispose();
      lineGeometry.dispose();
      lineMaterial.dispose();
      nodeGeometry.dispose();
      nodeMaterial.dispose();
      renderer.dispose();
      delete canvas.dataset.ready;
    };
  }, [sceneKey, variant]);

  return <canvas ref={canvasRef} className="three-graph" aria-hidden="true" />;
}
