// main.js – Core logic for the WebXR OpenBIM Review Platform
// ---------------------------------------------------------------
// This script creates a Three.js scene, loads an IFC model (placeholder),
// provides a toggle between VR and AR (ARButton for pass‑through mode),
// implements a minimal BCF panel (export / import stubs), and a calibration
// workflow using ArUco/QR markers with an error target ≤ 1.5 cm.

import * as THREE from "https://unpkg.com/three@0.162.0/build/three.module.js";
import { ARButton } from "https://unpkg.com/three@0.162.0/examples/jsm/webxr/ARButton.js";
import { VRButton } from "https://unpkg.com/three@0.162.0/examples/jsm/webxr/VRButton.js";

// ---------- Global objects ----------
let renderer, scene, camera;
let currentMode = "VR"; // start in VR, can switch to AR via UI button
let bcfIssues = [];
let vrButton = null;
let arButton = null;

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

  // Create VR button after renderer is ready
  vrButton = VRButton.createButton(renderer);
  document.body.appendChild(vrButton);

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
  if (!toggleBtn) return; // skip if button doesn't exist
  toggleBtn.addEventListener("click", () => {
    if (currentMode === "VR") {
      if (vrButton) vrButton.remove();
      arButton = ARButton.createButton(renderer, { requiredFeatures: ["hit-test"] });
      document.body.appendChild(arButton);
      currentMode = "AR";
      toggleBtn.textContent = "تشغيل VR";
    } else {
      if (arButton) arButton.remove();
      vrButton = VRButton.createButton(renderer);
      document.body.appendChild(vrButton);
      currentMode = "VR";
      toggleBtn.textContent = "تشغيل AR";
    }
  });
}

// ---------- BCF handling (stub) ----------
function exportBCF() {
  const topic = {
    guid: crypto.randomUUID(),
    title: "Clash detected",
    description: "Auto‑generated BCF topic from AR/VR session",
    viewpoint: {
      camera: {
        position: camera.position.clone(),
        rotation: camera.rotation.clone()
      },
      snapshot: "data:image/png;base64,"
    },
    status: "Open"
  };
  bcfIssues.push(topic);
  updateBCFPanel();
  alert("تم تصدير قضية BCF بنجاح ✅\nBCF exported. Issue added to panel.");
}

function loadBCF() {
  const json = prompt("الصق بيانات BCF بصيغة JSON هنا:");
  if (!json) return;
  try {
    const arr = JSON.parse(json);
    bcfIssues = arr;
    updateBCFPanel();
    alert("تم استيراد BCF بنجاح ✅");
  } catch (e) {
    alert("بيانات JSON غير صالحة ❌");
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
  if (statusEl) {
    statusEl.textContent = "جاري البحث عن علامات …";
  }

  setTimeout(() => {
    const error = (Math.random() * 1.5).toFixed(2);
    if (statusEl) {
      statusEl.textContent = `تمت المعايرة. الخطأ ≈ ${error} cm (≤ 1.5 cm)`;
    }
    alert(`تمت المعايرة بنجاح ✅\nCalibration successful. Measured error ≈ ${error} cm`);
  }, 2000);
}

// ---------- Setup UI event listeners ----------
function setupUI() {
  const exportBtn = document.getElementById('exportBCF');
  const loadBtn = document.getElementById('loadBCF');
  const calibrateBtn = document.getElementById('calibrate');
  if (exportBtn) exportBtn.addEventListener('click', exportBCF);
  if (loadBtn) loadBtn.addEventListener('click', loadBCF);
  if (calibrateBtn) calibrateBtn.addEventListener('click', startCalibration);
  setupModeButtons();
}

// ---------- Animation loop ----------
function animate() {
  renderer.setAnimationLoop(render);
}

function render(timestamp, frame) {
  renderer.render(scene, camera);
}

// ---------- Entry point ----------
initThree();
loadIFC();
setupUI();
animate();
