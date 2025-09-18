// Inicialización
let claveActual = 'sol';
let modoAprendizaje = true;
let preguntaActual = 1;
let puntaje = 0;
let notaActual = '';
let aciertosOido = 0;
let preguntaOido = 0;
let compasActual = '4/4';
let compasesRitmo = [];

// Inicializar Verovio
let verovioToolkit;

// ===== NAVEGACIÓN =====
function irAModulo(modulo) {
  document.querySelectorAll('.pantalla').forEach(p => p.classList.remove('activa'));
  document.getElementById(modulo).classList.add('activa');
}

function volverInicio() {
  irAModulo('inicio');
  resetNotas();
  resetOido();
  resetRitmo();
}

// ===== SONIDOS CON FREESOUND =====
const sonidosFreeSound = {
  'Do': '415351',
  'Re': '415352',
  'Mi': '415353',
  'Fa': '415354',
  'Sol': '415355',
  'La': '415356',
  'Si': '415357',
  'acorde_ascendente': '540634',
  'acorde_descendente': '540635'
};

const howlCache = {};

async function cargarSonido(nombre) {
  if (howlCache[nombre]) return howlCache[nombre];

  const id = sonidosFreeSound[nombre];
  if (!id) return null;

  const url = `https://freesound.org/data/previews/${Math.floor(id / 1000)}/${id}_preview.mp3`;

  return new Promise((resolve) => {
    const sound = new Howl({
      src: [url],
      volume: 0.7,
      onload: () => {
        howlCache[nombre] = sound;
        resolve(sound);
      },
      onloaderror: () => {
        console.warn(`Error cargando sonido: ${nombre}`);
        resolve(null);
      }
    });
  });
}

async function reproducirSonido(nombre) {
  const sound = await cargarSonido(nombre);
  if (sound) sound.play();
}

// ===== MÓDULO 1: NOTAS MUSICALES =====
async function renderizarNotaEnPentagrama(elementoId, nota, clave = 'sol', interactivo = false) {
  const contenedor = document.getElementById(elementoId);
  contenedor.innerHTML = '';

  const mapeoNotas = {
    'Do': 'c', 'Re': 'd', 'Mi': 'e', 'Fa': 'f', 'Sol': 'g', 'La': 'a', 'Si': 'b',
    'Do3': 'c', 'Re3': 'd', 'Mi3': 'e', 'Fa3': 'f', 'Sol3': 'g', 'La3': 'a', 'Si3': 'b',
    'Do5': 'c'
  };

  const octavas = {
    'Do': '4', 'Re': '4', 'Mi': '4', 'Fa': '4', 'Sol': '4', 'La': '4', 'Si': '4',
    'Do3': '3', 'Re3': '3', 'Mi3': '3', 'Fa3': '3', 'Sol3': '3', 'La3': '3', 'Si3': '3',
    'Do5': '5'
  };

  const mei = `
  <mei xmlns="http://www.music-encoding.org/ns/mei" meiversion="4.0.0">
    <music>
      <body>
        <mdiv>
          <score>
            <scoreDef meter.count="4" meter.unit="4" key.sig="0">
              <staffGrp>
                <staffDef n="1" lines="5" clef.shape="${clave === 'sol' ? 'G' : 'F'}" clef.line="${clave === 'sol' ? '2' : '4'}"/>
              </staffGrp>
            </scoreDef>
            <section>
              <measure n="1">
                <staff n="1">
                  <layer n="1">
                    <note pname="${mapeoNotas[nota]}" oct="${octavas[nota]}" dur="4" />
                  </layer>
                </staff>
              </measure>
            </section>
          </score>
        </mdiv>
      </body>
    </music>
  </mei>
  `;

  try {
    if (!verovioToolkit) {
      verovioToolkit = new VerovioToolkit();
    }
    const svg = verovioToolkit.renderData(mei, { format: 'svg', scale: 25 });
    contenedor.innerHTML = svg;

    if (interactivo) {
      const notaElement = contenedor.querySelector('svg');
      if (notaElement) {
        notaElement.style.cursor = 'pointer';
        notaElement.onclick = async () => {
          await reproducirSonido(nota.replace('3', '').replace('5', ''));
          notaElement.style.transform = 'scale(1.1)';
          setTimeout(() => notaElement.style.transform = 'scale(1)', 300);
        };
      }
    }
  } catch (e) {
    console.error("Error renderizando nota:", e);
    contenedor.innerHTML = `<div style="color:red;">Error mostrando nota</div>`;
  }
}

function iniciarModoAprendizaje(clave) {
  claveActual = clave;
  modoAprendizaje = true;
  document.getElementById('selector-clave').style.display = 'none';
  document.getElementById('aprendizaje').style.display = 'block';

  const notas = clave === 'sol' 
    ? ['Do', 'Re', 'Mi', 'Fa', 'Sol', 'La', 'Si', 'Do5']
    : ['Do3', 'Re3', 'Mi3', 'Fa3', 'Sol3', 'La3', 'Si3', 'Do'];

  const pentagramaContainer = document.getElementById('pentagrama-aprendizaje');
  pentagramaContainer.innerHTML = `<h3>Clave de ${clave === 'sol' ? 'Sol' : 'Fa'} - Toca las notas</h3>`;

  const grid = document.createElement('div');
  grid.style.display = 'flex';
  grid.style.flexWrap = 'wrap';
  grid.style.justifyContent = 'center';
  grid.style.gap = '20px';

  (async () => {
    for (const nota of notas) {
      const item = document.createElement('div');
      item.style.textAlign = 'center';

      await renderizarNotaEnPentagramaMini(item, nota, clave);
      
      const nombre = document.createElement('div');
      nombre.textContent = nota.replace('3', '').replace('5', '');
      nombre.style.marginTop = '5px';
      nombre.style.fontWeight = 'bold';
      item.appendChild(nombre);

      grid.appendChild(item);
    }
    pentagramaContainer.appendChild(grid);
  })();
}

async function renderizarNotaEnPentagramaMini(contenedor, nota, clave) {
  const div = document.createElement('div');
  div.style.width = '120px';
  div.style.height = '100px';
  div.style.background = 'white';
  div.style.borderRadius = '10px';
  div.style.padding = '5px';
  div.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
  contenedor.appendChild(div);

  const mapeoNotas = {
    'Do': 'c', 'Re': 'd', 'Mi': 'e', 'Fa': 'f', 'Sol': 'g', 'La': 'a', 'Si': 'b',
    'Do3': 'c', 'Re3': 'd', 'Mi3': 'e', 'Fa3': 'f', 'Sol3': 'g', 'La3': 'a', 'Si3': 'b',
    'Do5': 'c'
  };

  const octavas = {
    'Do': '4', 'Re': '4', 'Mi': '4', 'Fa': '4', 'Sol': '4', 'La': '4', 'Si': '4',
    'Do3': '3', 'Re3': '3', 'Mi3': '3', 'Fa3': '3', 'Sol3': '3', 'La3': '3', 'Si3': '3',
    'Do5': '5'
  };

  const mei = `
  <mei xmlns="http://www.music-encoding.org/ns/mei" meiversion="4.0.0">
    <music>
      <body>
        <mdiv>
          <score>
            <scoreDef meter.count="4" meter.unit="4" key.sig="0">
              <staffGrp>
                <staffDef n="1" lines="5" clef.shape="${clave === 'sol' ? 'G' : 'F'}" clef.line="${clave === 'sol' ? '2' : '4'}"/>
              </staffGrp>
            </scoreDef>
            <section>
              <measure n="1">
                <staff n="1">
                  <layer n="1">
                    <note pname="${mapeoNotas[nota]}" oct="${octavas[nota]}" dur="4" />
                  </layer>
                </staff>
              </measure>
            </section>
          </score>
        </mdiv>
      </body>
    </music>
  </mei>
  `;

  try {
    if (!verovioToolkit) {
      verovioToolkit = new VerovioToolkit();
    }
    const svg = verovioToolkit.renderData(mei, { format: 'svg', scale: 15 });
    div.innerHTML = svg;
  } catch (e) {
    div.innerHTML = `<div style="color:red;">Error</div>`;
  }
}

function iniciarTest() {
  modoAprendizaje = false;
  document.getElementById('aprendizaje').style.display = 'none';
  document.getElementById('test').style.display = 'block';
  preguntaActual = 1;
  puntaje = 0;
  generarPregunta();
}

async function generarPregunta() {
  document.getElementById('contador').textContent = `Pregunta ${preguntaActual}/10`;

  const notas = claveActual === 'sol'
    ? ['Do', 'Re', 'Mi', 'Fa', 'Sol', 'La', 'Si', 'Do5']
    : ['Do3', 'Re3', 'Mi3', 'Fa3', 'Sol3', 'La3', 'Si3', 'Do'];

  notaActual = notas[Math.floor(Math.random() * notas.length)];

  await renderizarNotaEnPentagrama('pentagrama-test', notaActual, claveActual);

  const opciones = [notaActual];
  while (opciones.length < 3) {
    let candidata = notas[Math.floor(Math.random() * notas.length)];
    if (!opciones.includes(candidata)) opciones.push(candidata);
  }

  for (let i = opciones.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [opciones[i], opciones[j]] = [opciones[j], opciones[i]];
  }

  const contenedorOpciones = document.getElementById('opciones-test');
  contenedorOpciones.innerHTML = '';

  opciones.forEach(nota => {
    const nombre = nota.replace('3', '').replace('5', '');
    const btn = document.createElement('button');
    btn.textContent = nombre;
    btn.className = 'opcion';
    btn.onclick = () => verificarRespuesta(nota);
    contenedorOpciones.appendChild(btn);
  });
}

async function verificarRespuesta(respuesta) {
  const botones = document.querySelectorAll('.opcion');
  let correcto = false;

  for (const btn of botones) {
    if (btn.textContent === respuesta.replace('3', '').replace('5', '')) {
      if (respuesta === notaActual) {
        btn.classList.add('correcta');
        puntaje++;
        await reproducirSonido('acorde_ascendente');
        mostrarFeedback('¡Correcto! 🎵', 'correcto');
        correcto = true;
      } else {
        btn.classList.add('incorrecta');
        await reproducirSonido('acorde_descendente');
        mostrarFeedback(`¡Casi! Era ${notaActual.replace('3', '').replace('5', '')} 🎼`, 'error');
      }
    }
  }

  if (!correcto) {
    for (const btn of botones) {
      if (btn.textContent === notaActual.replace('3', '').replace('5', '')) {
        setTimeout(() => {
          btn.classList.add('correcta');
        }, 500);
      }
    }
  }

  setTimeout(() => {
    preguntaActual++;
    if (preguntaActual <= 10) {
      generarPregunta();
    } else {
      mostrarResultados();
    }
  }, 2000);
}

function mostrarFeedback(mensaje, tipo) {
  const contenedor = document.getElementById('pentagrama-test');
  const feedback = document.createElement('div');
  feedback.className = `feedback ${tipo}`;
  feedback.textContent = mensaje;
  contenedor.appendChild(feedback);
  setTimeout(() => {
    if (feedback.parentNode) feedback.remove();
  }, 2000);
}

function mostrarResultados() {
  document.getElementById('test').style.display = 'none';
  document.getElementById('resultados').style.display = 'block';
  document.getElementById('puntuacion-final').textContent = `¡Has acertado ${puntaje} de 10 notas!`;
}

function repetirTest() {
  iniciarTest();
}

function cambiarClave() {
  document.getElementById('resultados').style.display = 'none';
  document.getElementById('selector-clave').style.display = 'block';
}

function resetNotas() {
  document.getElementById('selector-clave').style.display = 'block';
  document.getElementById('aprendizaje').style.display = 'none';
  document.getElementById('test').style.display = 'none';
  document.getElementById('resultados').style.display = 'none';
}

// ===== MÓDULO 2: OÍDO MÁGICO =====
async function reproducirNotaReferencia() {
  document.getElementById('btn-escuchar').style.display = 'none';
  aciertosOido = 0;
  preguntaOido = 0;
  iniciarJuegoOido();
}

async function iniciarJuegoOido() {
  preguntaOido++;
  if (preguntaOido > 10) {
    mostrarResultadosOido();
    return;
  }

  document.getElementById('contador-oido').textContent = `Aciertos: ${aciertosOido}/10`;

  const notas = ['Do', 'Re', 'Mi', 'Fa', 'Sol', 'La', 'Si'];
  notaActual = notas[Math.floor(Math.random() * notas.length)];

  const contenedor = document.getElementById('notas-fantasma');
  contenedor.innerHTML = '';

  for (const nota of notas) {
    const item = document.createElement('div');
    item.className = 'nota-item';
    item.textContent = nota;
    item.onclick = () => verificarNotaOido(nota);
    contenedor.appendChild(item);
  }

  await reproducirSonido('Do');
  setTimeout(async () => {
    await reproducirSonido(notaActual);
  }, 1000);
}

async function verificarNotaOido(notaSeleccionada) {
  const items = document.querySelectorAll('.nota-item');
  let acierto = false;

  for (const item of items) {
    if (item.textContent === notaSeleccionada) {
      if (notaSeleccionada === notaActual) {
        item.classList.add('correcta');
        aciertosOido++;
        await reproducirSonido('acorde_ascendente');
        mostrarFeedbackOido('¡Correcto! 👂', 'correcto');
        acierto = true;
      } else {
        item.classList.add('error');
        await reproducirSonido('acorde_descendente');
        mostrarFeedbackOido(`¡Casi! Era ${notaActual} 🎼`, 'error');
      }
    }
  }

  if (!acierto) {
    for (const item of items) {
      if (item.textContent === notaActual) {
        setTimeout(() => {
          item.classList.add('correcta');
        }, 500);
      }
    }
  }

  setTimeout(() => {
    iniciarJuegoOido();
  }, 2500);
}

function mostrarFeedbackOido(mensaje, tipo) {
  const contenedor = document.getElementById('oido');
  let feedback = document.getElementById('feedback-oido');
  if (!feedback) {
    feedback = document.createElement('div');
    feedback.id = 'feedback-oido';
    feedback.style.textAlign = 'center';
    contenedor.insertBefore(feedback, document.getElementById('contador-oido'));
  }
  feedback.className = `feedback ${tipo}`;
  feedback.textContent = mensaje;
  setTimeout(() => {
    if (feedback.parentNode) feedback.remove();
  }, 2000);
}

function mostrarResultadosOido() {
  document.getElementById('contador-oido').textContent = `¡Juego terminado! Aciertos: ${aciertosOido}/10`;
  document.getElementById('btn-volver-oido').style.display = 'inline-block';
}

function resetOido() {
  document.getElementById('btn-escuchar').style.display = 'inline-block';
  document.getElementById('btn-volver-oido').style.display = 'none';
  document.getElementById('notas-fantasma').innerHTML = '';
  document.getElementById('contador-oido').textContent = 'Aciertos: 0/10';
  const feedback = document.getElementById('feedback-oido');
  if (feedback) feedback.remove();
}

// ===== MÓDULO 3: TALLER DE RITMO =====
function nuevoRitmo() {
  const compases = ['2/4', '3/4', '4/4'];
  compasActual = compases[Math.floor(Math.random() * compases.length)];
  document.getElementById('tipo-compas').textContent = compasActual;

  const tiempos = parseInt(compasActual.split('/')[0]);
  const contenedor = document.getElementById('compases-ritmo');
  contenedor.innerHTML = '';
  compasesRitmo = [];

  for (let i = 0; i < 3; i++) {
    const compas = document.createElement('div');
    compas.className = 'compas-ritmo';
    compas.dataset.tiempoTotal = tiempos;
    compas.dataset.tiempoActual = 0;

    const linea = document.createElement('div');
    linea.className = 'linea-ritmo';
    compas.appendChild(linea);

    const contenido = document.createElement('div');
    contenido.style.display = 'flex';
    contenido.style.justifyContent = 'center';
    contenido.style.position = 'relative';
    contenido.style.top = '-25px';

    let tiempoRestante = tiempos;
    const numHuecos = Math.floor(Math.random() * 2) + 1;

    for (let h = 0; h < numHuecos && tiempoRestante > 0; h++) {
      const valoresPosibles = [0.5, 1, 2].filter(v => v <= tiempoRestante);
      if (valoresPosibles.length === 0) break;
      const valor = valoresPosibles[Math.floor(Math.random() * valoresPosibles.length)];
      
      const hueco = document.createElement('div');
      hueco.className = 'hueco-ritmo';
      hueco.dataset.tiempo = valor;
      contenido.appendChild(hueco);
      
      tiempoRestante -= valor;
    }

    compas.appendChild(contenido);
    contenedor.appendChild(compas);
    compasesRitmo.push(compas);
  }

  document.getElementById('btn-reproducir-ritmo').style.display = 'none';
}

function initDrag() {
  document.addEventListener('dragstart', e => {
    if (e.target.classList.contains('figura-musical')) {
      e.dataTransfer.setData('figuraValor', e.target.dataset.valor);
      e.dataTransfer.setData('figuraSimbolo', e.target.textContent);
    }
  });

  document.addEventListener('dragover', e => e.preventDefault());

  document.addEventListener('drop', e => {
    if (e.target.classList.contains('hueco-ritmo')) {
      const hueco = e.target;
      const valorFigura = parseFloat(e.dataTransfer.getData('figuraValor'));
      const simbolo = e.dataTransfer.getData('figuraSimbolo');

      if (valorFigura === parseFloat(hueco.dataset.tiempo)) {
        hueco.textContent = simbolo;
        hueco.classList.add('hueco-lleno');
        hueco.style.background = '#e8f5e8';

        const todosHuecos = document.querySelectorAll('.hueco-ritmo');
        const todosLlenos = Array.from(todosHuecos).every(h => h.classList.contains('hueco-lleno'));
        if (todosLlenos) {
          document.getElementById('btn-reproducir-ritmo').style.display = 'inline-block';
        }
      } else {
        hueco.style.animation = 'shake 0.5s';
        setTimeout(() => hueco.style.animation = '', 500);
      }
    }
  });
}

function reproducirRitmo() {
  alert("¡Ritmo completado! 🥁");
}

function resetRitmo() {
  document.getElementById('compases-ritmo').innerHTML = '';
  document.getElementById('btn-reproducir-ritmo').style.display = 'none';
}

// ===== INICIALIZAR =====
document.addEventListener('DOMContentLoaded', async () => {
  try {
    if (!verovioToolkit) {
      verovioToolkit = new VerovioToolkit();
    }
    initDrag();
    nuevoRitmo();
  } catch (e) {
    console.error("Error al inicializar Verovio:", e);
    alert("No se pudo cargar Verovio. Por favor, recarga la página.");
  }
});

// ====== EXPONER FUNCIONES GLOBALES PARA HTML ONCLICK ======
window.irAModulo = irAModulo;
window.iniciarModoAprendizaje = iniciarModoAprendizaje;
window.iniciarTest = iniciarTest;
window.verificarRespuesta = verificarRespuesta;
window.repetirTest = repetirTest;
window.cambiarClave = cambiarClave;
window.volverInicio = volverInicio;
window.reproducirNotaReferencia = reproducirNotaReferencia;
window.nuevoRitmo = nuevoRitmo;
window.reproducirRitmo = reproducirRitmo;
