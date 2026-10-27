"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function PortfolioScene({ onReady }: { onReady: () => void }) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let alive = true, visible = !document.hidden, inView = true, frame = 0;
    const pointer = new THREE.Vector2(), easedPointer = new THREE.Vector2();
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, .1, 100);
    camera.position.set(0, 0, 8.3);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    mount.appendChild(renderer.domElement);

    const count = window.innerWidth < 700 ? 1800 : 4200;
    const scattered = new Float32Array(count * 3), connected = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const j = i * 3, r = 1.65 + Math.random() * 1.5, theta = Math.random() * Math.PI * 2, phi = Math.acos(2 * Math.random() - 1);
      scattered[j] = (Math.random() - .5) * 10; scattered[j + 1] = (Math.random() - .5) * 7; scattered[j + 2] = (Math.random() - .5) * 5;
      connected[j] = r * Math.sin(phi) * Math.cos(theta) * 1.42; connected[j + 1] = r * Math.sin(phi) * Math.sin(theta) * .68; connected[j + 2] = r * Math.cos(phi) * .72;
    }
    const pointGeometry = new THREE.BufferGeometry();
    pointGeometry.setAttribute("position", new THREE.BufferAttribute(scattered, 3));
    pointGeometry.setAttribute("aTarget", new THREE.BufferAttribute(connected, 3));
    const pointMaterial = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      uniforms: { uTime: { value: 0 }, uProgress: { value: .08 }, uColor: { value: new THREE.Color("#1977ff") } },
      vertexShader: `uniform float uTime;uniform float uProgress;attribute vec3 aTarget;varying float vAlpha;void main(){float p=smoothstep(0.,1.,uProgress);vec3 pos=mix(position,aTarget,p);pos.x+=sin(pos.y*1.8+uTime*.55)*.08*p;pos.y+=cos(pos.x*1.4+uTime*.4)*.06*p;vec4 mv=modelViewMatrix*vec4(pos,1.);gl_PointSize=(1.4+2.5*p)*(8./-mv.z);gl_Position=projectionMatrix*mv;vAlpha=.32+.68*p;}`,
      fragmentShader: `uniform vec3 uColor;varying float vAlpha;void main(){float d=distance(gl_PointCoord,vec2(.5));float a=smoothstep(.5,.05,d)*vAlpha;gl_FragColor=vec4(uColor,a);}`,
    });
    const points = new THREE.Points(pointGeometry, pointMaterial); scene.add(points);
    const metal = new THREE.MeshPhysicalMaterial({ color: "#d9dde2", metalness: .92, roughness: .22, clearcoat: 1, clearcoatRoughness: .16 });
    const darkMetal = new THREE.MeshPhysicalMaterial({ color: "#161a20", metalness: .82, roughness: .28, clearcoat: .7 });
    const sculpture = new THREE.Group();
    const knot = new THREE.Mesh(new THREE.TorusKnotGeometry(1.35, .17, 220, 22, 2, 3), metal);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(2.18, .055, 14, 220), darkMetal); ring.rotation.set(.72, .2, .22);
    const ringTwo = ring.clone(); ringTwo.scale.setScalar(.72); ringTwo.rotation.set(-.45, .8, -.25);
    sculpture.add(knot, ring, ringTwo); scene.add(sculpture);
    scene.add(new THREE.HemisphereLight("#eef6ff", "#11151b", 2.2));
    const key = new THREE.PointLight("#4b9aff", 36, 16); key.position.set(3, 3, 4); scene.add(key);
    const rim = new THREE.PointLight("#ffffff", 22, 14); rim.position.set(-4, -2, 2); scene.add(rim);

    const resize = () => { const { clientWidth, clientHeight } = mount; renderer.setSize(clientWidth, clientHeight, false); camera.aspect = clientWidth / Math.max(clientHeight, 1); camera.updateProjectionMatrix(); };
    const move = (event: PointerEvent) => pointer.set((event.clientX / innerWidth - .5) * 2, (event.clientY / innerHeight - .5) * 2);
    const visibility = () => { visible = !document.hidden; };
    const observer = new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; }, { threshold: .01 }); observer.observe(mount);
    addEventListener("resize", resize); addEventListener("pointermove", move); document.addEventListener("visibilitychange", visibility); resize(); onReady();
    const startedAt = performance.now();
    const draw = () => {
      if (!alive) return; frame = requestAnimationFrame(draw); if (!visible || !inView) return;
      const t = (performance.now() - startedAt) / 1000, progress = Math.min(scrollY / Math.max(innerHeight * 2.4, 1), 1);
      easedPointer.lerp(pointer, reduceMotion ? 0 : .045); pointMaterial.uniforms.uTime.value = t;
      pointMaterial.uniforms.uProgress.value += (progress - pointMaterial.uniforms.uProgress.value) * .035;
      sculpture.rotation.y = t * (reduceMotion ? 0 : .08) + easedPointer.x * .22 + progress * 1.15;
      sculpture.rotation.x = -.1 + easedPointer.y * .15 + progress * .52; points.rotation.y = -t * (reduceMotion ? 0 : .025) - progress * .4;
      camera.position.z = 8.3 - progress * 1.35; camera.position.x = easedPointer.x * .28 + progress * .65; camera.lookAt(0, 0, 0); renderer.render(scene, camera);
    };
    draw();
    return () => { alive = false; cancelAnimationFrame(frame); observer.disconnect(); removeEventListener("resize", resize); removeEventListener("pointermove", move); document.removeEventListener("visibilitychange", visibility); pointGeometry.dispose(); pointMaterial.dispose(); knot.geometry.dispose(); ring.geometry.dispose(); metal.dispose(); darkMetal.dispose(); renderer.dispose(); renderer.domElement.remove(); };
  }, [onReady]);

  return <div className="nf-scene" ref={mountRef} aria-hidden="true"><div className="nf-sceneFallback"/></div>;
}
