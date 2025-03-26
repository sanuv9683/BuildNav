// threeD.js

// Import Three.js from a CDN (using ES6 modules)
import * as THREE from 'https://cdn.skypack.dev/three@0.128.0';

let scene, camera, renderer, coverageMesh;

/**
 * Initializes the Three.js scene and renderer.
 * @param {HTMLCanvasElement} canvas - The canvas element to render the 3D scene.
 * @returns {THREE.Scene} The initialized Three.js scene.
 */
export function initThreeScene(canvas) {
    // Create a new scene
    scene = new THREE.Scene();

    // Setup a perspective camera
    const fov = 75;  // Field of view
    const aspect = canvas.clientWidth / canvas.clientHeight;
    const near = 0.1;
    const far = 1000;
    camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.set(0, 0, 20);  // Position the camera away from the origin

    // Create the WebGL renderer with transparency support
    renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);

    // Add ambient lighting to the scene
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    // Add directional lighting for better depth and contrast
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    // Start the animation/render loop
    animate();
    return scene;
}

/**
 * The animation loop that continuously renders the scene.
 */
function animate() {
    requestAnimationFrame(animate);
    if (renderer && scene && camera) {
        renderer.render(scene, camera);
    }
}

/**
 * Updates or creates the sensor coverage visualization.
 * @param {THREE.Scene} scene - The Three.js scene.
 * @param {Object} sensorMetrics - Metrics for the sensor (range and angle).
 * @param {Object} sensorPosition - The 2D sensor position from the video (x, y).
 */
export function updateSensorCoverage(scene, sensorMetrics, sensorPosition) {
    // Remove the old sensor coverage mesh if it exists
    if (coverageMesh) {
        scene.remove(coverageMesh);
    }

    // Destructure sensor metrics (e.g., range and angle)
    const { range, angle } = sensorMetrics;

    // Compute the radius of the cone's base using trigonometry
    // (Half of the coverage angle converted to radians)
    const radius = range * Math.tan(THREE.MathUtils.degToRad(angle / 2));

    // Create a cone geometry: height equals the sensor's range, base radius calculated above
    const geometry = new THREE.ConeGeometry(radius, range, 32, 1, true);

    // Create a semi-transparent material for the coverage visualization
    const material = new THREE.MeshBasicMaterial({
        color: 0x00ff00,
        opacity: 0.5,
        transparent: true,
        side: THREE.DoubleSide
    });

    // Create the mesh for the sensor coverage area
    coverageMesh = new THREE.Mesh(geometry, material);

    // Convert the 2D click position into 3D scene coordinates.
    // This example maps the click position relative to the window dimensions.
    // In a real calibration scenario, use proper conversion based on camera intrinsics.
    const sceneX = (sensorPosition.x / window.innerWidth - 0.5) * 20;
    const sceneY = -(sensorPosition.y / window.innerHeight - 0.5) * 20;
    coverageMesh.position.set(sceneX, sceneY, 0);

    // Rotate the cone so that its tip points forward (adjust as needed)
    coverageMesh.rotation.x = Math.PI; // Flip the cone to point in the desired direction

    // Add the sensor coverage mesh to the scene
    scene.add(coverageMesh);

    // (Optional) Future updates: Animate or adjust sensor coverage dynamically here.
}
