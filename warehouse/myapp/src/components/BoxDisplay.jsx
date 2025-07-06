import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { useLocation, useNavigate } from "react-router-dom";
import { BP3D } from "binpackingjs";

const { Bin, Item, Packer } = BP3D;

const BoxDisplay = () => {
  const mountRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { order, boxSize } = location.state || {};

  // Helper to sanitize numbers
  const safeNumber = (val, fallback = 10, max = 100) => {
    const num = Number(val);
    return !isNaN(num) && num > 0 && num <= max ? num : fallback;
  };

  useEffect(() => {
    if (!order || !boxSize || !mountRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#fafffe");

    const camera = new THREE.PerspectiveCamera(
      45,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(boxSize * 1.5, boxSize * 1.5, boxSize * 1.5);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(
      mountRef.current.clientWidth,
      mountRef.current.clientHeight
    );
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambientLight);

    // Box wireframe (container)
    const containerGeometry = new THREE.BoxGeometry(boxSize, boxSize, boxSize);
    const wireframe = new THREE.EdgesGeometry(containerGeometry);
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });
    const container = new THREE.LineSegments(wireframe, lineMaterial);
    scene.add(container);

    // Packing algorithm
    const bin = new Bin("Main Box", boxSize, boxSize, boxSize, 1000);
    const packer = new Packer();

    order.items?.forEach((item, i) => {
      const width = safeNumber(item.width || Math.random() * 20 + 10);
      const height = safeNumber(item.height || Math.random() * 20 + 10);
      const depth = safeNumber(item.depth || Math.random() * 20 + 10);
      const weight = safeNumber(item.weight || Math.random() * 5 + 1, 1);

      packer.addItem(new Item(`Item ${i}`, width, height, depth, weight));
    });

    packer.addBin(bin);
    packer.pack();

    const packedItems = bin.items;
    console.log("Packed Items:", packedItems);

    let index = 0;
    const animateItems = () => {
      if (index >= packedItems.length) return;

      const packed = packedItems[index];
      const cubeGeometry = new THREE.BoxGeometry(
        packed.width,
        packed.height,
        packed.depth
      );
      const cubeMaterial = new THREE.MeshStandardMaterial({
        color: new THREE.Color(Math.random(), Math.random(), Math.random()),
      });

      const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);

      cube.position.set(
        packed.position.x - boxSize / 2 + packed.width / 2,
        packed.position.y - boxSize / 2 + packed.height / 2,
        packed.position.z - boxSize / 2 + packed.depth / 2
      );

      scene.add(cube);
      index++;

      setTimeout(animateItems, 500); // delay for animation effect
    };

    animateItems();

    const animate = () => {
      controls.update();
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };
    animate();

    return () => {
      if (mountRef.current) mountRef.current.removeChild(renderer.domElement);
    };
  }, [order, boxSize]);

  const handleClose = () => navigate(-1);

  if (!order || !boxSize) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500 text-lg">Invalid order data. Please go back.</p>
      </div>
    );
  }

  return (
    <div className="fixed top-0 right-0 h-full w-full bg-[#fafffe] z-50 shadow-xl overflow-hidden">
      <div className="relative w-full h-full">
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 bg-white rounded-full w-10 h-10 flex items-center justify-center shadow hover:bg-gray-100"
        >
          ✕
        </button>

        <div ref={mountRef} className="w-full h-full"></div>

        <div className="absolute bottom-4 left-4 bg-white/80 text-black p-3 text-sm rounded-lg shadow space-y-1 backdrop-blur">
          <p><strong>Box Size:</strong> {boxSize} × {boxSize} × {boxSize} cm</p>
          <p><strong>Items:</strong> {order?.items?.length}</p>
          <p><strong>Total Weight:</strong> {order?.items?.reduce((sum, i) => sum + (i.weight || 1), 0)} kg</p>
        </div>
      </div>
    </div>
  );
};

export default BoxDisplay;





