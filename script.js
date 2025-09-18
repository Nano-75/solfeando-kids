// Navegación entre pantallas
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(div => div.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

// Menú principal
document.getElementById('btn-notas').onclick = () => showScreen('notas');
document.getElementById('btn-oido').onclick = () => showScreen('oido');
document.getElementById('btn-ritmo').onclick = () => showScreen('ritmo');

// Ejemplo: Añadir botón para volver al menú (añádelo en cada módulo cuando lo desarrolles)
function addBackButton(containerId) {
  const btn = document.createElement('button');
  btn.textContent = "Menú Principal";
  btn.onclick = () => showScreen('main-menu');
  document.getElementById(containerId).appendChild(btn);
}

// --- NOTAS MUSICALES ---
function setupNotas() {
  const notasDiv = document.getElementById('notas');
  notasDiv.innerHTML = `
    <h2>Notas Musicales</h2>
    <div id="pentagrama-notas"></div>
    <div id="notas-opciones"></div>
  `;
  addBackButton('notas');
  // Aquí iría la lógica de aprendizaje y test (osmd + sonidos)
}

// --- OÍDO MÁGICO ---
function setupOido() {
  const oidoDiv = document.getElementById('oido');
  oidoDiv.innerHTML = `
    <h2>Oído Mágico</h2>
    <div id="pentagrama-oido"></div>
    <div id="oido-opciones"></div>
  `;
  addBackButton('oido');
  // Aquí iría la lógica de reconocimiento auditivo
}

// --- TALLER DE RITMO ---
function setupRitmo() {
  const ritmoDiv = document.getElementById('ritmo');
  ritmoDiv.innerHTML = `
    <h2>Taller de Ritmo</h2>
    <div id="ritmo-compases"></div>
    <div id="ritmo-herramientas"></div>
  `;
  addBackButton('ritmo');
  // Aquí iría la lógica de arrastrar y soltar para ritmo
}

// Inicialización
setupNotas();
setupOido();
setupRitmo();