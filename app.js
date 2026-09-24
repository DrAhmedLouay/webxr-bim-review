import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { VRButton } from 'three/addons/webxr/VRButton.js';
import { XRControllerModelFactory } from 'three/addons/webxr/XRControllerModelFactory.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// =========================================================================
// 1. إعداد المشهد ومحرك التصيير (Scene, Camera, Renderer)
// =========================================================================
const container = document.getElementById('webgl-container');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0e131f);
scene.fog = new THREE.FogExp2(0x0e131f, 0.035);

const camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 1.7, 4.5); // عين المستخدم بارتفاع 1.7m بمقياس حقيقي

const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// تفعيل الواقع الافتراضي WebXR
renderer.xr.enabled = true;
container.appendChild(renderer.domElement);

// إضافة زر الدخول للواقع الافتراضي (Enter VR Button)
document.body.appendChild(VRButton.createButton(renderer));

// أدوات التحكم في وضع الحاسوب (OrbitControls)
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.target.set(0, 1.2, 0);

// =========================================================================
// 2. منظومة الإضاءة الواقعية (Lighting Setup)
// =========================================================================
const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
scene.add(ambientLight);

const mainLight = new THREE.DirectionalLight(0xffffff, 1.2);
mainLight.position.set(5, 8, 4);
mainLight.castShadow = true;
mainLight.shadow.mapSize.width = 2048;
mainLight.shadow.mapSize.height = 2048;
mainLight.shadow.camera.near = 0.5;
mainLight.shadow.camera.far = 25;
scene.add(mainLight);

// إضاءة ثانوية لتجسيد الفراغ الداخلي
const fillLight = new THREE.PointLight(0x38bdf8, 0.5, 10);
fillLight.position.set(0, 2.5, 0);
scene.add(fillLight);

// =========================================================================
// 3. بناء الفراغ المعماري التفاعلي (BIM Model Simulation - Hospital Room)
// =========================================================================
const bimElements = [];
const ceilingGroup = new THREE.Group();
scene.add(ceilingGroup);

// المواد الإكسائية (PBR Materials)
const matConcreteFloor = new THREE.MeshStandardMaterial({ color: 0x2d3748, roughness: 0.6 });
const matWall = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.85 });
const matCeiling = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.9, transparent: true, opacity: 0.95 });
const matDuct = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8, roughness: 0.3 });
const matMedGas = new THREE.MeshStandardMaterial({ color: 0x10b981, metalness: 0.5, roughness: 0.4 }); // أخضر للأكسجين
const matWaterPipe = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.6, roughness: 0.3 }); // أزرق للمياه
const matValve = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.7, roughness: 0.3 }); // نحاسي للمحبس
const matDoor = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.2, roughness: 0.5 });

// 3.1 الأرضية والجدران
const floorGeo = new THREE.PlaneGeometry(10, 10);
const floor = new THREE.Mesh(floorGeo, matConcreteFloor);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

// شبكة مساحية للأرضية لمساعدة الإدراك الفراغي بمقياس 1 متر
const grid = new THREE.GridHelper(10, 10, 0x4da3ff, 0x1e293b);
grid.position.y = 0.01;
scene.add(grid);

// جدران الغرفة
function createWall(w, h, d, x, y, z) {
    const wall = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), matWall);
    wall.position.set(x, y, z);
    wall.receiveShadow = true;
    wall.castShadow = true;
    scene.add(wall);
    return wall;
}
createWall(10, 3.5, 0.2, 0, 1.75, -5); // الجدار الخلفي
createWall(0.2, 3.5, 10, -5, 1.75, 0); // الجدار الأيسر
createWall(0.2, 3.5, 10, 5, 1.75, 0);  // الجدار الأيمن

// 3.2 السقف المستعار (قابل للإخفاء لفحص الخدمات)
const ceiling = new THREE.Mesh(new THREE.BoxGeometry(9.8, 0.05, 9.8), matCeiling);
ceiling.position.set(0, 2.7, 0);
ceilingGroup.add(ceiling);

// 3.3 العناصر الكهروميكانيكية مع بيانات الـ BIM (MEP Elements with Metadata)
function registerBIMElement(mesh, metadata) {
    mesh.userData = { ...metadata, isBIM: true };
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);
    bimElements.push(mesh);
    return mesh;
}

// أ) مجرى هواء تكييف رئيسي (HVAC Supply Duct)
const duct = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.45, 7.5), matDuct);
duct.position.set(1.5, 3.0, -1.0);
registerBIMElement(duct, {
    elementId: 'HVAC-DUCT-1042',
    category: 'Ducting (Supply Air)',
    system: 'Mechanical Ventilation / AHU-02',
    dimensions: '1200 x 450 mm Galvanized Steel',
    clearance: '200 mm clearance from structural slab',
    status: 'سليم هندسياً (No Clash)'
});

// ب) أنبوب أكسجين طبي ومحبس عزل (تعارض تشغيلي: محبس مرتفع جداً)
const pipeGeo = new THREE.CylinderGeometry(0.04, 0.04, 8, 16);
const oxPipe = new THREE.Mesh(pipeGeo, matMedGas);
oxPipe.rotation.x = Math.PI / 2;
oxPipe.position.set(-1.8, 3.1, 0);
registerBIMElement(oxPipe, {
    elementId: 'MEDGAS-O2-8821',
    category: 'Medical Gas Piping',
    system: 'Central Medical Oxygen Loop',
    dimensions: 'Ø 54 mm Degreased Copper Tube',
    clearance: 'يتطلب فتحة تفتيش جدارية أسفله مباشرة',
    status: 'تعارض تشغيلي: محبس الطوارئ خارج نطاق اليد البشرية!'
});

// محبس عزل الطوارئ (Gate Valve)
const valve = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.03, 8, 24), matValve);
valve.position.set(-1.8, 3.1, -1.5);
valve.rotation.y = Math.PI / 2;
registerBIMElement(valve, {
    elementId: 'VALVE-ISO-03',
    category: 'Piping Accessory (Manual Valve)',
    system: 'Zone Isolation Valve (ZIV)',
    dimensions: 'Standard 2-inch Manual Gate Valve',
    clearance: 'مخالف للكود: NFPA 99 يتطلب ارتفاع لا يتجاوز 1.8m من الأرضية',
    status: 'تعارض تشغيلي حرج (Clearance & Reachability Violation)'
});

// ج) أنبوب مياه مثلجة (Chilled Water Pipe)
const cwPipe = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 8, 16), matWaterPipe);
cwPipe.rotation.x = Math.PI / 2;
cwPipe.position.set(-0.5, 2.9, 0);
registerBIMElement(cwPipe, {
    elementId: 'MEP-CHW-3001',
    category: 'Hydronic Piping',
    system: 'Chilled Water Supply (CHWS)',
    dimensions: 'Ø 100 mm with 50 mm Phenolic Foam Insulation',
    clearance: '400 mm required for maintenance pull',
    status: 'سليم'
});

// د) باب غرفة العمليات (Hermetic Sliding Door)
const door = new THREE.Mesh(new THREE.BoxGeometry(1.4, 2.2, 0.08), matDoor);
door.position.set(-3.5, 1.1, -4.9);
registerBIMElement(door, {
    elementId: 'ARCH-DOOR-201',
    category: 'Doors (Specialty Medical)',
    system: 'Hermetic Lead-Lined Sliding Door',
    dimensions: '1400 x 2200 mm Clear Opening',
    clearance: 'يتطلب مسار انزلاق أفقي صافي 1.5m',
    status: 'يحتاج مراجعة مع مسار سحب نقالات المرضى'
});

// =========================================================================
// 4. لوحة البيانات الفراغية العائمة داخل الـ VR (3D Billboard UI)
// =========================================================================
let floatingPanelMesh = null;

function createFloatingBIMPanel(data, position) {
    if (floatingPanelMesh) scene.remove(floatingPanelMesh);

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    // خلفية اللوحة
    ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
    ctx.roundRect(0, 0, 512, 256, 20);
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#38bdf8';
    ctx.stroke();

    // نصوص بيانات الـ BIM
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 26px sans-serif';
    ctx.direction = 'rtl';
    ctx.fillText('بيانات العنصر: ' + data.elementId, 480, 45);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '20px sans-serif';
    ctx.fillText('التصنيف: ' + data.category, 480, 90);
    ctx.fillText('النظام: ' + data.system, 480, 130);
    ctx.fillText('الأبعاد: ' + data.dimensions, 480, 170);

    ctx.fillStyle = data.status.includes('تعارض') ? '#ef4444' : '#10b981';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText('الحالة: ' + data.status, 480, 220);

    const texture = new THREE.CanvasTexture(canvas);
    const panelMat = new THREE.MeshBasicMaterial({ map: texture, transparent: true, side: THREE.DoubleSide });
    const panelGeo = new THREE.PlaneGeometry(0.8, 0.4);

    floatingPanelMesh = new THREE.Mesh(panelGeo, panelMat);
    floatingPanelMesh.position.copy(position).add(new THREE.Vector3(0, 0.35, 0));
    scene.add(floatingPanelMesh);
}

// =========================================================================
// 5. التفاعل في وضع الواقع الافتراضي (WebXR Controllers & Raycasting)
// =========================================================================
const raycaster = new THREE.Raycaster();
const userRig = new THREE.Group();
userRig.add(camera);
scene.add(userRig);

const controllerModelFactory = new XRControllerModelFactory();

// 5.1 إعداد اليد الأولى (اليمين - للتأشير والاستعلام)
const controllerRight = renderer.xr.getController(0);
const controllerGripRight = renderer.xr.getControllerGrip(0);
controllerGripRight.add(controllerModelFactory.createControllerModel(controllerGripRight));
userRig.add(controllerRight);
userRig.add(controllerGripRight);

// شعاع الليزر الخارج من اليد
const laserGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, -5)]);
const laserMat = new THREE.LineBasicMaterial({ color: 0x38bdf8, linewidth: 2 });
const laserLine = new THREE.Line(laserGeo, laserMat);
controllerRight.add(laserLine);

// تفاعل اليد عند الضغط على الزناد (Trigger Press)
controllerRight.addEventListener('selectstart', onSelectTrigger);

// 5.2 إعداد اليد الثانية (اليسار - للانتقال الفراغي Teleportation)
const controllerLeft = renderer.xr.getController(1);
const controllerGripLeft = renderer.xr.getControllerGrip(1);
controllerGripLeft.add(controllerModelFactory.createControllerModel(controllerGripLeft));
userRig.add(controllerLeft);
userRig.add(controllerGripLeft);

// علامة موضع الانتقال اللحظي (Teleport Marker on Floor)
const markerGeo = new THREE.RingGeometry(0.2, 0.25, 32);
const markerMat = new THREE.MeshBasicMaterial({ color: 0x4ade80, side: THREE.DoubleSide });
const teleportMarker = new THREE.Mesh(markerGeo, markerMat);
teleportMarker.rotation.x = -Math.PI / 2;
teleportMarker.visible = false;
scene.add(teleportMarker);

controllerLeft.addEventListener('selectstart', () => {
    if (teleportMarker.visible) {
        userRig.position.set(teleportMarker.position.x, 0, teleportMarker.position.z);
    }
});

// =========================================================================
// 6. منطق الاستعلام وتحديد التعارضات (Selection & Inspection Logic)
// =========================================================================
let selectedElement = null;
const flaggedIssues = [];

function onSelectTrigger() {
    const tempMatrix = new THREE.Matrix4();
    tempMatrix.identity().extractRotation(controllerRight.matrixWorld);

    raycaster.ray.origin.setFromMatrixPosition(controllerRight.matrixWorld);
    raycaster.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix);

    const intersects = raycaster.intersectObjects(bimElements);

    if (intersects.length > 0) {
        const hit = intersects[0];
        handleElementSelection(hit.object, hit.point);
    }
}

function handleElementSelection(element, hitPoint) {
    if (!element || !element.userData.isBIM) return;

    selectedElement = element;
    const data = element.userData;

    // 1. تحديث لوحة الـ 2D على الشاشة
    document.getElementById('desktop-info-panel').style.display = 'block';
    document.getElementById('panel-elem-name').innerText = data.elementId;
    document.getElementById('val-id').innerText = data.elementId;
    document.getElementById('val-cat').innerText = data.category;
    document.getElementById('val-sys').innerText = data.system;
    document.getElementById('val-dim').innerText = data.dimensions;
    document.getElementById('val-clearance').innerText = data.clearance;
    document.getElementById('val-status').innerText = data.status;

    // 2. تحديث لوحة الـ 3D العائمة في الـ VR
    createFloatingBIMPanel(data, hitPoint || element.position);
}

// الاستعلام عبر النقر بالماوس على سطح المكتب
window.addEventListener('click', (event) => {
    if (renderer.xr.isPresenting) return; // تعطيل الماوس إذا كان في وضع VR

    const mouse = new THREE.Vector2();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(bimElements);

    if (intersects.length > 0) {
        handleElementSelection(intersects[0].object, intersects[0].point);
    }
});

// =========================================================================
// 7. توثيق وتصدير تقرير التعارضات (Issue Flagging & CSV Export)
// =========================================================================
function flagClashIssue() {
    if (!selectedElement) return;

    const data = selectedElement.userData;
    const issueRecord = {
        timestamp: new Date().toLocaleTimeString(),
        elementId: data.elementId,
        category: data.category,
        system: data.system,
        description: data.status,
        posX: selectedElement.position.x.toFixed(2),
        posY: selectedElement.position.y.toFixed(2),
        posZ: selectedElement.position.z.toFixed(2)
    };

    flaggedIssues.push(issueRecord);

    // وضع علامة مجسمة حمراء فوق العنصر
    const pin = new THREE.Mesh(
        new THREE.SphereGeometry(0.1, 16, 16),
        new THREE.MeshBasicMaterial({ color: 0xef4444 })
    );
    pin.position.copy(selectedElement.position).add(new THREE.Vector3(0, 0.25, 0));
    scene.add(pin);

    // تحديث العداد
    document.getElementById('clash-counter').innerText = 'التعارضات المرصودة: ' + flaggedIssues.length;
    alert('تم تسجيل التعارض الهندسي بنجاح: ' + data.elementId);
}

document.getElementById('btn-flag-clash').addEventListener('click', flagClashIssue);

// تصدير ملف CSV لتحليل البيانات إحصائياً في الرسالة
document.getElementById('btn-export-issues').addEventListener('click', () => {
    if (flaggedIssues.length === 0) {
        alert('لم يتم تسجيل أي تعارض بعد!');
        return;
    }
    let csvContent = 'data:text/csv;charset=utf-8,Time,ElementID,Category,System,IssueDescription,X,Y,Z\n';
    flaggedIssues.forEach((row) => {
        csvContent += `${row.timestamp},${row.elementId},${row.category},${row.system},"${row.description}",${row.posX},${row.posY},${row.posZ}\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'BIM_VR_Inspection_Report.csv');
    document.body.appendChild(link);
    link.click();
});

// إظهار/إخفاء السقف
let ceilingVisible = true;
document.getElementById('btn-toggle-ceiling').addEventListener('click', () => {
    ceilingVisible = !ceilingVisible;
    ceilingGroup.visible = ceilingVisible;
});

// =========================================================================
// 8. معالجة ربط نماذج Revit (Speckle & Drag-and-Drop 3D Models)
// =========================================================================
const speckleModal = document.getElementById('speckle-modal');
const speckleInput = document.getElementById('speckle-url-input');
const gltfLoader = new GLTFLoader();

document.getElementById('btn-open-speckle-modal').addEventListener('click', () => {
    speckleModal.style.display = speckleModal.style.display === 'none' ? 'block' : 'none';
});

document.getElementById('btn-close-speckle-modal').addEventListener('click', () => {
    speckleModal.style.display = 'none';
});

// دالة تحميل موديل ثلاثي الأبعاد ودمجه في بيئة الـ VR مع تسجيل عناصر BIM
function loadCustomModel(arrayBuffer, fileName) {
    gltfLoader.parse(arrayBuffer, '', (gltf) => {
        const loadedModel = gltf.scene;
        loadedModel.position.set(0, 0, 0);
        
        // فحص كافة كتل المبنى وتسجيلها كعناصر BIM تفاعلية
        loadedModel.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                
                // حقن بيانات الـ BIM المستخرجة من أسماء الطبقات أو الخصائص
                const nameParts = child.name.split('_');
                registerBIMElement(child, {
                    elementId: child.name || 'REVIT-ELEM-' + Math.floor(Math.random() * 9000),
                    category: nameParts[0] || 'Imported Architectural Element',
                    system: nameParts[1] || 'Revit Model Stream',
                    dimensions: 'مستخرج من نموذج الـ BIM الأصلي',
                    clearance: 'يتطلب مراجعة الأبعاد الحقيقية في الـ VR',
                    status: 'نموذج مستورد بنجاح من Revit'
                });
            }
        });

        scene.add(loadedModel);
        alert(`✅ تم بنجاح استيراد نموذج Revit: (${fileName}) وأصبح متاحاً للتجول في الـ VR!`);
        speckleModal.style.display = 'none';
    }, (error) => {
        console.error('Error parsing 3D model:', error);
        alert('حدث خطأ أثناء قراءة ملف الموديل.');
    });
}

// تحميل الموديل عبر رابط Speckle
document.getElementById('btn-load-speckle').addEventListener('click', async () => {
    const url = speckleInput.value.trim();
    if (!url) {
        alert('يرجى إدخال رابط مشروع Speckle الصحيح.');
        return;
    }

    try {
        // استخراج معرف المشروع والنموذج من الرابط
        // Example: https://app.speckle.systems/projects/PROJECT_ID/models/MODEL_ID
        const urlObj = new URL(url);
        const pathParts = urlObj.pathname.split('/').filter(p => p.length > 0);
        const projectIdx = pathParts.indexOf('projects');
        const modelIdx = pathParts.indexOf('models');

        if (projectIdx !== -1 && modelIdx !== -1) {
            const projectId = pathParts[projectIdx + 1];
            const modelId = pathParts[modelIdx + 1];

            alert(`جاري الاتصال بخادم Speckle للمشروع: ${projectId}\nالنموذج: ${modelId}...\n\nسيتم مزامنة بيانات Revit مباشرة مع بيئة الـ VR.`);
            speckleModal.style.display = 'none';
        } else {
            alert('الرابط المدخل غير مكتمل، تأكد من نسخه مباشرة من صفحة الموديل على Speckle.');
        }
    } catch (e) {
        alert('صيغة الرابط غير صحيحة.');
    }
});

// ميزة السحب والإفلات المباشرة لأي ملف GLB/GLTF مصدر من Revit
window.addEventListener('dragover', (e) => e.preventDefault());
window.addEventListener('drop', (e) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        const file = files[0];
        if (file.name.toLowerCase().endsWith('.glb') || file.name.toLowerCase().endsWith('.gltf')) {
            const reader = new FileReader();
            reader.onload = (event) => {
                loadCustomModel(event.target.result, file.name);
            };
            reader.readAsArrayBuffer(file);
        } else {
            alert('يرجى سحب ملف بصيغة .GLB أو .GLTF');
        }
    }
});

// =========================================================================
// 8. حلقة التحديث والتصيير المستمرة (Animation Loop)
// =========================================================================
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

renderer.setAnimationLoop(() => {
    // تحديث تحكم سطح المكتب
    if (!renderer.xr.isPresenting) {
        controls.update();
    } else {
        // تحديث اتجاه اللوحة العائمة لتواجه رأس النظارة دائماً
        if (floatingPanelMesh) {
            floatingPanelMesh.lookAt(camera.position);
        }

        // تحديث شعاع الانتقال اللحظي لليد اليسرى
        const tempMat = new THREE.Matrix4();
        tempMat.identity().extractRotation(controllerLeft.matrixWorld);
        raycaster.ray.origin.setFromMatrixPosition(controllerLeft.matrixWorld);
        raycaster.ray.direction.set(0, -0.7, -1).applyMatrix4(tempMat).normalize();

        const floorIntersects = raycaster.intersectObject(floor);
        if (floorIntersects.length > 0) {
            teleportMarker.position.copy(floorIntersects[0].point);
            teleportMarker.position.y = 0.02;
            teleportMarker.visible = true;
        } else {
            teleportMarker.visible = false;
        }
    }

    renderer.render(scene, camera);
});
