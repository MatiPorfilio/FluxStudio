/* 
  PROYECTO: ELECTROZAMB - "FULL SCREEN HERO"
  AUTOR: Matías Porfilio
*/

let projectImages = []; 
let galleryObjects = [];
let particles = [];

// CÁMARA: La alejamos un poco (z=800) para que entren los objetos gigantes
let camX = 0, camY = 0, camZ = 800; 
let targetCamX = 0, targetCamY = 0;

function preload() {
  try {
    projectImages[0] = loadImage('img/foto1.jpg'); 
    projectImages[1] = loadImage('img/foto2.jpg');
    projectImages[2] = loadImage('img/foto3.jpg');
  } catch (e) { console.log("Error loading images"); }
}

function setup() {
  // 1. CAPTURAR EL CONTENEDOR
  let container = document.getElementById('canvas-container');
  
  // 2. USAR EL TAMAÑO REAL DE LA VENTANA (Full Width)
  // Si el contenedor existe, usamos su ancho, si no, toda la ventana.
  let w = container ? container.offsetWidth : windowWidth;
  let h = container ? container.offsetHeight : windowHeight;
  
  let cnv = createCanvas(w, h, WEBGL);
  if(container) cnv.parent('canvas-container');
  
  setAttributes('antialias', true);
  
  // --- COMPOSICIÓN DE PANELES GIGANTES ---
  
  // PANEL CENTRAL (HERO) - ¡ENORME!
  // Ancho: 600px, Alto: 400px
  galleryObjects.push(new GlassPanel(0, 0, 150, 600, 400, 0, true));
  
  // PANEL IZQUIERDO
  // Lo movemos más a la izquierda (-700) para que no tape al central
  galleryObjects.push(new GlassPanel(-700, -80, -150, 500, 320, 1, false));
  
  // PANEL DERECHO
  // Lo movemos más a la derecha (700)
  galleryObjects.push(new GlassPanel(700, 80, -150, 500, 320, 2, false));

  // Partículas para llenar el espacio vacío
  for(let i=0; i<80; i++){
    particles.push(new AmbientParticle());
  }
}

function draw() {
  background(10, 10, 11); // Tu color de fondo

  // --- CÁMARA ---
  // Aumentamos el rango de movimiento del mouse para que se sienta más inmersivo
  targetCamX = map(mouseX, 0, width, 150, -150);
  targetCamY = map(mouseY, 0, height, 80, -80);
  
  camX = lerp(camX, targetCamX, 0.05);
  camY = lerp(camY, targetCamY, 0.05);
  
  camera(camX, camY, camZ, 0, 0, 0, 0, 1, 0);

  // --- LUCES ---
  ambientLight(60);
  directionalLight(255, 230, 200, -0.5, 0.5, -0.5);
  pointLight(0, 180, 255, 800, -400, -500); // Luz azul lateral fuerte
  pointLight(120, 100, 150, -800, 400, 400);

  // --- RENDER ---
  push();
  particles.forEach(p => p.run());
  pop();

  // Ordenar paneles
  galleryObjects.sort((a,b) => (b.z - 800) - (a.z - 800)); 
  
  galleryObjects.forEach(obj => {
    obj.update();
    obj.display();
  });
}

// --- CLASES (Igual que antes, solo ajustando detalles visuales) ---

class GlassPanel {
  constructor(x, y, z, w, h, imgIndex, isHero) {
    this.pos = createVector(x, y, z);
    this.w = w;
    this.h = h;
    this.imgIndex = imgIndex;
    this.isHero = isHero;
    this.floatOffset = random(1000);
    this.floatSpeed = random(0.01, 0.02);
    // Rotación más pronunciada hacia el centro
    this.baseRotY = map(x, -700, 700, 0.3, -0.3);
  }

  update() {
    this.pos.y += sin(frameCount * this.floatSpeed + this.floatOffset) * 0.5;
    this.rotX = map(mouseY, 0, height, 0.05, -0.05);
    this.rotY = map(mouseX, 0, width, -0.05, 0.05);
  }

  display() {
    push();
    translate(this.pos.x, this.pos.y, this.pos.z);
    rotateY(this.baseRotY + this.rotY);
    rotateX(this.rotX);

    // 1. Chasis
    push();
    noStroke();
    specularMaterial(30); 
    shininess(30);
    box(this.w + 6, this.h + 6, 12); 
    pop();

    // 2. Imagen
    push();
    translate(0, 0, 7); 
    let img = projectImages[this.imgIndex];
    if (img && img.width > 1) { 
      texture(img);
      noStroke();
      plane(this.w, this.h);
    } else {
      this.drawPlaceholder();
    }
    pop();

    // 3. Vidrio
    push();
    translate(0, 0, 9); 
    noStroke();
    specularMaterial(255);
    shininess(200); 
    fill(255, 255, 255, 5); 
    plane(this.w, this.h);
    stroke(255, 255, 255, 50);
    strokeWeight(1.5);
    noFill();
    plane(this.w, this.h);
    pop();
    
    // 4. Marca (Hero)
    if(this.isHero) {
      push();
      translate(0, this.h/2 + 25, 0);
      emissiveMaterial(255, 214, 10);
      noStroke();
      box(80, 4, 4);
      pop();
    }
    pop();
  }

  drawPlaceholder() {
    fill(40);
    noStroke();
    plane(this.w, this.h);
  }
}

class AmbientParticle {
  constructor() {
    this.reset();
  }
  reset() {
    // Esparcir partículas por todo el ancho de la pantalla nueva
    this.x = random(-width*1.5, width*1.5);
    this.y = random(height, -height);
    this.z = random(-600, 300);
    this.size = random(2, 5);
    this.speed = random(0.3, 0.8);
  }
  run() {
    this.y -= this.speed;
    if(this.y < -height) this.y = height;
    push();
    translate(this.x, this.y, this.z);
    noStroke();
    emissiveMaterial(255, 255, 255, 100); 
    sphere(this.size);
    pop();
  }
}

function windowResized() {
  // Ajuste automático si cambian el tamaño del navegador
  let container = document.getElementById('canvas-container');
  if (container) {
    resizeCanvas(container.offsetWidth, container.offsetHeight);
  } else {
    resizeCanvas(windowWidth, windowHeight);
  }
}