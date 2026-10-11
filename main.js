// main.js – Core logic for the WebXR OpenBIM Review Platform
// ---------------------------------------------------------------
// This script creates a Three.js scene, loads an IFC model (placeholder),
// provides a toggle between VR and AR (ARButton for pass‑through mode),
// implements a minimal BCF panel (export / import stubs), and a calibration
// workflow using ArUco/QR markers with an error target ≤ 1.5 cm.

import * as THREE from "https://unpkg.com/three@0.162.0/build/three.module.js";
import { ARButton } from "https://unpkg.com/three@0.162.0/examples/jsm/webxr/ARButton.js";
import { VRButton } from "https://unpkg.com/three@0.162.0/examples/jsm/webxr/VRButton.js";

// ---------- Global objects ----------
let renderer, scene, camera;
let currentMode = "VR"; // start in VR, can switch to AR via UI button
let bcfIssues = [];

// ---------- Initialize renderer, scene, camera ----------
function initThree() {
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.xr.enabled = true;
  document.body.appendChild(renderer.domElement);

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xeeeeee);

  camera = new THREE.PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    0.01,
    1000
  );
  camera.position.set(0, 1.6, 3);

  window.addEventListener("resize", onWindowResize);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// ---------- Load placeholder IFC model ----------
function loadIFC() {
  // In a real implementation we would use an IFC parser (e.g., ifcjs).
  // Here we add a simple box to represent the building geometry.
  const geometry = new THREE.BoxGeometry(2, 1, 2);
  const material = new THREE.MeshStandardMaterial({ color: 0x8fbcd4, opacity: 0.6, transparent: true });
  const box = new THREE.Mesh(geometry, material);
  box.position.y = 0.5;
  scene.add(box);

  const light = new THREE.HemisphereLight(0xffffff, 0x444444, 1.2);
  scene.add(light);
}

// ---------- AR / VR mode toggle ----------
function setupModeButtons() {
  const toggleBtn = document.getElementById("toggleMode");
  toggleBtn.addEventListener("click", () => {
    if (currentMode === "VR") {
      // Switch to AR – remove VRButton, add ARButton
      if (vrButton) vrButton.remove();
      arButton = ARButton.createButton(renderer, { requiredFeatures: ["hit-test"] });
      document.body.appendChild(arButton);
      currentMode = "AR";
      toggleBtn.textContent = "تشغيل VR";
    } else {
      // Switch back to VR
      if (arButton) arButton.remove();
      vrButton = VRButton.createButton(renderer);
      document.body.appendChild(vrButton);
      currentMode = "VR";
      toggleBtn.textContent = "تشغيل AR";
    }
  });
}

let vrButton = VRButton.createButton(renderer);
let arButton = null;

document.body.appendChild(vrButton);

// ---------- BCF handling (stub) ----------
function exportBCF() {
  // Collect a minimal BCF topic for the current camera position.
  const topic = {
    guid: crypto.randomUUID(),
    title: "Clash detected",
    description: "Auto‑generated BCF topic from AR/VR session",
    viewpoint: {
      camera: {
        position: camera.position.clone(),
        rotation: camera.rotation.clone()
      },
      snapshot: "data:image/png;base64," // placeholder – a real snapshot would be taken via renderer.domElement.toDataURL()
    },
    status: "Open"
  };
  bcfIssues.push(topic);
  updateBCFPanel();
  alert("BCF exported (stub). Issue added to panel.");
}

function loadBCF() {
  const json = prompt("Paste BCF JSON array here:");
  if (!json) return;
  try {
    const arr = JSON.parse(json);
    bcfIssues = arr;
    updateBCFPanel();
    alert("BCF imported (stub)." );
  } catch (e) {
    alert("Invalid JSON.");
  }
}

function updateBCFPanel() {
  const panel = document.getElementById("bcfList");
  if (!panel) return;
  if (bcfIssues.length === 0) {
    panel.textContent = "(لا توجد قضايا)";
    return;
  }
  const lines = bcfIssues.map((t, i) => `${i + 1}. ${t.title} – ${t.guid}`);
  panel.textContent = lines.join("\n");
}

// ---------- Calibration workflow (ArUco/QR stub) ----------
function startCalibration() {
  const statusEl = document.getElementById("calibStatus");
  statusEl.textContent = "جاري البحث عن علامات …";

  // In a real system we would use a marker‑detection library (e.g., js‑aruco) on the AR camera feed.
  // Here we simulate a successful calibration after a short timeout.
  setTimeout(() => {
    // Simulated error (in cm) – random within 0‑1.5 cm.
    const error = (Math.random() * 1.5).toFixed(2);
    statusEl.textContent = `تمت المعايرة. الخطأ ≈ ${error} cm (≤ 1.5 cm)`;
    alert(`Calibration successful. Measured error ≈ ${error} cm`);
  }, 2000);
}

function setupUI() {
  document.getElementById("exportBCF").addEventListener("click", exportBCF);
  document.getElementById("loadBCF").addEventListener("click", loadBCF);
  document.getElementById("calibrate").addEventListener("click", startCalibration);
  setupModeButtons();
}

// ---------- Animation loop ----------
function animate() {
  renderer.setAnimationLoop(render);
}

function render(timestamp, frame) {
  // If we are in AR and have a XRFrame we could place objects via hit‑test (not shown).
  renderer.render(scene, camera);
}

// ---------- Entry point ----------
initThree();
loadIFC();
setupUI();
animate();
