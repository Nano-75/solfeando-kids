const notasNombres = ["Do", "Re", "Mi", "Fa", "Sol", "La", "Si"];
const notasSol = ["c/4", "d/4", "e/4", "f/4", "g/4", "a/4", "b/4", "c/5"];
const notasFa  = ["c/3", "d/3", "e/3", "f/3", "g/3", "a/3", "b/3", "c/4"];
const sonidos = {
  "Do": "sounds/do.mp3",
  "Re": "sounds/re.mp3",
  "Mi": "sounds/mi.mp3",
  "Fa": "sounds/fa.mp3",
  "Sol": "sounds/sol.mp3",
  "La": "sounds/la.mp3",
  "Si": "sounds/si.mp3",
  "success": "sounds/success.mp3",
  "fail": "sounds/fail.mp3"
};
const howls = {};
function playSound(name) {
  if (!sonidos[name]) return;
  if (!howls[name]) howls[name] = new Howl({src:[sonidos[name]], volume: 0.8});
  howls[name].play();
}
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(div => div.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}
function splashFeedback(msg, type="") {
  const fb = document.getElementById("feedback-global");
  fb.innerHTML = `<span class="feedback-splash">${msg}</span>`;
  setTimeout(()=>{ fb.innerHTML=""; }, 1300);
}
document.getElementById('btn-notas').onclick = () => { setupNotas(); showScreen('notas'); };
document.getElementById('btn-oido').onclick = () => { setupOido(); showScreen('oido'); };
document.getElementById('btn-ritmo').onclick = () => { setupRitmo(); showScreen('ritmo'); };
// BOTÓN DE MENÚ PRINCIPAL
function menuBtnHtml() {
  return `<button class="menu-btn" onclick="location.reload()">Menú Principal</button>`;
}

// ===== 1. NOTAS MUSICALES =====
let claveActual = "sol";
let testNotas = [];
let pregunta = 0, aciertos = 0;
window.setupNotas = function setupNotas() {
  const d = document.getElementById("notas");
  d.innerHTML = `
    <h2>Notas Musicales</h2>
    <div style="margin-bottom:1rem">¿En qué clave quieres aprender?</div>
    <div style="display:flex;gap:1.5rem;justify-content:center;">
      <button class="menu-btn" id="clave-sol">Clave de Sol</button>
      <button class="menu-btn" id="clave-fa">Clave de Fa</button>
    </div>
    <div id="aprende-notas"></div>
    <div id="jugar-test"></div>
    ${menuBtnHtml()}
  `;
  document.getElementById("clave-sol").onclick = ()=>mostrarNotas("sol");
  document.getElementById("clave-fa").onclick = ()=>mostrarNotas("fa");
};
function mostrarNotas(clave) {
  claveActual = clave;
  const notas = clave === "sol" ? notasSol : notasFa;
  let html = `<h3>Repasa las notas (${clave === "sol" ? "Clave de Sol" : "Clave de Fa"})</h3>
  <div style="display:flex;flex-wrap:wrap;gap:1.2rem;justify-content:center;margin-bottom:1.5rem;">`;
  notas.forEach((n, i) => {
    html += `<div style="text-align:center;">
      <div id="osmd-nota-${i}" style="width:70px;height:80px;margin:auto;cursor:pointer;"></div>
      <div style="font-weight:bold;margin-top:0.3rem;">${notasNombres[i%7]}</div>
    </div>`;
  });
  html += `</div>
  <button class="menu-btn" id="btn-jugar-notas" style="background:#ffd600;color:#000;">¡A Jugar!</button>`;
  document.getElementById("aprende-notas").innerHTML = html;
  notas.forEach((n, i) => {
    renderPentagrama(`osmd-nota-${i}`, n, clave);
    document.getElementById(`osmd-nota-${i}`).onclick = () => {
      playSound(notasNombres[i%7]);
      splashFeedback(`¡${notasNombres[i%7]}!`, "success");
    };
  });
  document.getElementById("btn-jugar-notas").onclick = iniciarTestNotas;
}
function iniciarTestNotas() {
  testNotas = [];
  pregunta = 0;
  aciertos = 0;
  for(let i=0; i<10; i++) {
    let idx = Math.floor(Math.random()*7);
    testNotas.push(idx);
  }
  mostrarPreguntaNotas();
}
function mostrarPreguntaNotas() {
  if (pregunta>=10) return mostrarResultadosNotas();
  const notas = claveActual === "sol" ? notasSol : notasFa;
  const idx = testNotas[pregunta];
  let html = `
    <div style="margin:0.7rem 0;"><b>Pregunta ${pregunta+1}/10</b></div>
    <div id="osmd-test-nota" style="width:110px;height:100px;margin:auto;"></div>
    <div id="notas-opciones"></div>
    <div class="stars">${"★".repeat(aciertos)}${"☆".repeat(10-aciertos)}</div>
  `;
  document.getElementById("jugar-test").innerHTML = html;
  renderPentagrama("osmd-test-nota", notas[idx], claveActual);
  let opts = [...Array(7).keys()];
  opts = shuffle(opts).slice(0,3);
  if (!opts.includes(idx)) opts[0]=idx;
  opts = shuffle(opts);
  let btns = "";
  opts.forEach(i=>{
    btns += `<button class="nota-btn" data-i="${i}">${notasNombres[i]}</button>`;
  });
  document.getElementById("notas-opciones").innerHTML = btns;
  document.querySelectorAll(".nota-btn").forEach(btn=>{
    btn.onclick = ()=>{
      if(Number(btn.dataset.i) === idx) {
        btn.classList.add("success");
        playSound("success");
        aciertos++;
        splashFeedback("¡Correcto! ⭐", "success");
      } else {
        btn.classList.add("fail");
        playSound("fail");
        splashFeedback("¡Casi!", "fail");
        setTimeout(()=>{
          document.querySelector(`.nota-btn[data-i='${idx}']`).classList.add("success");
        }, 600);
      }
      document.querySelectorAll(".nota-btn").forEach(b=>b.disabled=true);
      setTimeout(()=>{
        pregunta++;
        mostrarPreguntaNotas();
      }, 1100);
    };
  });
}
function mostrarResultadosNotas() {
  document.getElementById("jugar-test").innerHTML = `
    <h3>🎉 ¡Terminaste!</h3>
    <div style="font-size:1.5rem;margin:1rem 0;">¡Has acertado ${aciertos} de 10 notas!</div>
    <div class="stars">${"★".repeat(aciertos)}${"☆".repeat(10-aciertos)}</div>
    <button class="menu-btn" onclick="iniciarTestNotas()">Repetir</button>
    <button class="menu-btn" onclick="setupNotas()">Cambiar Clave</button>
    ${menuBtnHtml()}
  `;
}

// ===== 2. OÍDO MÁGICO =====
let oidoPregs = [], oidoIdx = 0, oidoAciertos = 0;
window.setupOido = function setupOido() {
  const d = document.getElementById("oido");
  d.innerHTML = `
    <h2>Oído Mágico</h2>
    <div id="pentagrama-oido"></div>
    <div id="oido-opciones"></div>
    <div class="stars" id="oido-stars"></div>
    <button class="menu-btn" id="btn-jugar-oido" style="background:#ffd600;color:#000;">¡Empezar!</button>
    ${menuBtnHtml()}
  `;
  document.getElementById("btn-jugar-oido").onclick = iniciarTestOido;
};
function iniciarTestOido() {
  oidoPregs = [];
  oidoIdx = 0;
  oidoAciertos = 0;
  for(let i=0;i<10;i++) {
    oidoPregs.push(Math.floor(Math.random()*7));
  }
  mostrarPreguntaOido();
}
function mostrarPreguntaOido() {
  if (oidoIdx>=10) return mostrarResultadosOido();
  let html = `<div style="margin:0.7rem 0;"><b>Pregunta ${oidoIdx+1}/10</b></div>
    <div id="pentagrama-oido-nota" style="width:110px;height:100px;margin:auto;"></div>
    <div id="oido-opciones"></div>
    <div class="stars">${"★".repeat(oidoAciertos)}${"☆".repeat(10-oidoAciertos)}</div>
    <button class="menu-btn" id="btn-escuchar-oido" style="background:#fffbe0;color:#237afc;">🔊 Escuchar</button>
  `;
  document.getElementById("pentagrama-oido").innerHTML = html;
  let opts = shuffle([...Array(7).keys()]).slice(0,3);
  if (!opts.includes(oidoPregs[oidoIdx])) opts[0]=oidoPregs[oidoIdx];
  opts = shuffle(opts);
  let btns = "";
  opts.forEach(i=>{
    btns += `<button class="nota-btn" data-i="${i}">${notasNombres[i]}</button>`;
  });
  document.getElementById("oido-opciones").innerHTML = btns;
  document.getElementById("btn-escuchar-oido").onclick = ()=>{
    playSound("Do");
    setTimeout(()=>playSound(notasNombres[oidoPregs[oidoIdx]]), 900);
  };
  // Render notas fantasmas
  renderPentagramaOido("pentagrama-oido-nota", oidoPregs[oidoIdx]);
  // Respuesta
  document.querySelectorAll("#oido-opciones .nota-btn").forEach(btn=>{
    btn.onclick = ()=>{
      if(Number(btn.dataset.i) === oidoPregs[oidoIdx]) {
        btn.classList.add("success");
        playSound("success");
        oidoAciertos++;
        splashFeedback("¡Bien!", "success");
      } else {
        btn.classList.add("fail");
        playSound("fail");
        splashFeedback("¡Vuelve a intentarlo!", "fail");
        setTimeout(()=>{
          document.querySelector(`#oido-opciones .nota-btn[data-i='${oidoPregs[oidoIdx]}']`).classList.add("success");
        }, 600);
      }
      document.querySelectorAll("#oido-opciones .nota-btn").forEach(b=>b.disabled=true);
      setTimeout(()=>{
        oidoIdx++;
        mostrarPreguntaOido();
      }, 1100);
    };
  });
}
function mostrarResultadosOido() {
  document.getElementById("pentagrama-oido").innerHTML = `
    <h3>🎉 ¡Juego terminado!</h3>
    <div style="font-size:1.5rem;margin:1rem 0;">¡Has identificado ${oidoAciertos} de 10 notas</div>
    <div class="stars">${"★".repeat(oidoAciertos)}${"☆".repeat(10-oidoAciertos)}</div>
    <button class="menu-btn" onclick="iniciarTestOido()">Volver a jugar</button>
    ${menuBtnHtml()}
  `;
  document.getElementById("oido-opciones").innerHTML = "";
}
// Renderiza notas fantasmas (todas translúcidas, la del challenge se resalta al acertar)
function renderPentagramaOido(elid, idx) {
  let xml = xmlNotasFantasmas(idx);
  const osmd = new opensheetmusicdisplay.OpenSheetMusicDisplay(elid, {drawTitle: false});
  osmd.load(xml).then(()=>osmd.render());
}
function xmlNotasFantasmas(idx) {
  let notes = "";
  for (let i = 0; i < 7; i++) {
    if (i == idx) {
      // Nota sólida (la pregunta)
      notes += `<note default-x="${i*30}">
        <pitch><step>${notasNombres[i][0].toUpperCase()}</step><octave>4</octave></pitch>
        <duration>4</duration><type>quarter</type>
      </note>`;
    } else {
      // Notas fantasma translúcidas
      notes += `<note default-x="${i*30}">
        <pitch><step>${notasNombres[i][0].toUpperCase()}</step><octave>4</octave></pitch>
        <duration>4</duration><type>quarter</type>
        <notations>
          <articulations><accent/></articulations>
          <ornaments><tremolo type="single" default-y="-10"/></ornaments>
          <other-notation color="#bbbbbb"/>
        </notations>
      </note>`;
    }
  }
  return `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
  <score-partwise version="3.1">
    <part-list><score-part id="P1"><part-name>Music</part-name></score-part></part-list>
    <part id="P1"><measure number="1">
      <attributes>
        <divisions>1</divisions><key><fifths>0</fifths></key>
        <time><beats>4</beats><beat-type>4</beat-type></time>
        <clef><sign>G</sign><line>2</line></clef>
      </attributes>
      ${notes}
    </measure></part>
  </score-partwise>`;
}

// ===== 3. TALLER DE RITMO =====
// Figuras: negra (1), blanca (2), corchea (0.5), silencio negra (1)
const figurasRitmo = [
  {nombre:"Negra", valor:1, simbolo:"♩"},
  {nombre:"Blanca", valor:2, simbolo:"𝅗𝅥"},
  {nombre:"Corchea", valor:0.5, simbolo:"♪"},
  {nombre:"Silencio", valor:1, simbolo:"𝄽"}
];
window.setupRitmo = function setupRitmo() {
  const d = document.getElementById("ritmo");
  d.innerHTML = `
    <h2>Taller de Ritmo</h2>
    <div id="ritmo-compases"></div>
    <div id="ritmo-herramientas"></div>
    <button class="menu-btn" onclick="setupRitmo()">Nuevo Ritmo</button>
    ${menuBtnHtml()}
  `;
  crearEjercicioRitmo();
};
function crearEjercicioRitmo() {
  const compases = ['2/4','3/4','4/4'];
  const compas = compases[Math.floor(Math.random()*compases.length)];
  let html = `<div style="margin-bottom:1rem;"><b>Compás:</b> ${compas}</div>`;
  let ritmos = [];
  for(let i=0;i<3;i++) {
    let t = Number(compas[0]);
    let c = [], txt = "";
    while(t>0.1) {
      let posibles = figurasRitmo.filter(f=>f.valor<=t);
      let f = posibles[Math.floor(Math.random()*posibles.length)];
      c.push({...f});
      t-=f.valor;
    }
    // Quitamos uno aleatorio para el hueco (excepto si solo una figura)
    let huecoIdx = c.length>1?Math.floor(Math.random()*c.length):0;
    let huecoVal = c[huecoIdx].valor;
    c[huecoIdx] = null;
    ritmos.push({c,huecoVal});
    // Render
    txt += `<div>`;
    c.forEach((f,ix)=>{
      if(f) txt += `<span class="figura-ritmica" style="opacity:0.9;cursor:default;">${f.simbolo}</span>`;
      else txt += `<span class="hueco-ritmo" data-compas="${i}" data-v="${huecoVal}"></span>`;
    });
    txt += `</div>`;
    html += txt;
  }
  document.getElementById("ritmo-compases").innerHTML = html;
  // Herramientas
  let htm = "";
  figurasRitmo.forEach(f=>{
    htm += `<div class="figura-ritmica" draggable="true" data-valor="${f.valor}" data-simbolo="${f.simbolo}" title="${f.nombre}">${f.simbolo}</div>`;
  });
  document.getElementById("ritmo-herramientas").innerHTML = htm;
  // Drag&Drop
  initDragRitmo();
}
function initDragRitmo() {
  document.querySelectorAll('.figura-ritmica').forEach(el=>{
    el.ondragstart = e=>{
      el.classList.add("dragging");
      e.dataTransfer.setData("valor",el.dataset.valor);
      e.dataTransfer.setData("simbolo",el.dataset.simbolo);
    };
    el.ondragend = ()=>el.classList.remove("dragging");
  });
  document.querySelectorAll('.hueco-ritmo').forEach(h=>{
    h.ondragover = e=>{e.preventDefault();};
    h.ondrop = e=>{
      e.preventDefault();
      let val = Number(e.dataTransfer.getData("valor"));
      let simb = e.dataTransfer.getData("simbolo");
      let esperado = Number(h.dataset.v);
      if(val===esperado) {
        h.textContent = simb;
        h.classList.add("filled");
        playSound("success");
        h.ondragover = null; h.ondrop = null;
        verificarRitmo();
      } else {
        splashFeedback("¡No encaja!", "fail");
        playSound("fail");
        h.style.animation = "shake 0.4s";
        setTimeout(()=>h.style.animation = "",400);
      }
    };
  });
}
function verificarRitmo() {
  let ok = Array.from(document.querySelectorAll('.hueco-ritmo')).every(h=>h.classList.contains("filled"));
  if(ok) {
    setTimeout(()=>{
      splashFeedback("¡Ritmo completado! 🥁","success");
      playSound("success");
    }, 700);
  }
}

// ==== Utilidades ====
function shuffle(arr) {
  let a = arr.slice();
  for(let i=a.length-1;i>0;i--) {
    let j = Math.floor(Math.random()*(i+1));
    [a[i],a[j]]=[a[j],a[i]];
  }
  return a;
}

// === OSMD pentagrama simple ===
async function renderPentagrama(elid, note="c/4", clave="sol") {
  const el = document.getElementById(elid);
  el.innerHTML = "";
  const osmd = new opensheetmusicdisplay.OpenSheetMusicDisplay(elid, {drawTitle: false});
  let clef = clave==="sol" ? "G" : "F";
  let octave = note.includes("/") ? note.split("/")[1] : (clave==="sol"?4:3);
  let step = note[0].toUpperCase();
  let xml = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
  <score-partwise version="3.1">
    <part-list><score-part id="P1"><part-name>Music</part-name></score-part></part-list>
    <part id="P1"><measure number="1">
      <attributes>
        <divisions>1</divisions><key><fifths>0</fifths></key>
        <time><beats>4</beats><beat-type>4</beat-type></time>
        <clef><sign>${clef}</sign><line>${clef==="G"?"2":"4"}</line></clef>
      </attributes>
      <note>
        <pitch><step>${step}</step><octave>${octave}</octave></pitch>
        <duration>4</duration><type>quarter</type>
      </note>
    </measure></part>
  </score-partwise>`;
  await osmd.load(xml);
  osmd.render();
}
