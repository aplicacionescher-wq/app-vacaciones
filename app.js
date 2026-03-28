import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";

import { 
  getFirestore, collection, addDoc, getDocs, updateDoc, doc 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import { 
  getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";


// 🔥 CONFIG FIREBASE (TUYA)
const firebaseConfig = {
  apiKey: "AIzaSyCrFSplvyoXZy_mgkVzG7e1VuPCPXM3gcs",
  authDomain: "vacaciones-app-7353a.firebaseapp.com",
  projectId: "vacaciones-app-7353a",
  storageBucket: "vacaciones-app-7353a.firebasestorage.app",
  messagingSenderId: "829112426227",
  appId: "1:829112426227:web:064a78429796e888d9a186"
};


// 🔥 INIT
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

console.log("🔥 Firebase conectado");


// 🔐 LOGIN
window.login = async () => {
  try {
    const email = document.getElementById("email").value;
    const pass = document.getElementById("password").value;

    await signInWithEmailAndPassword(auth, email, pass);

  } catch (error) {
    alert(error.message);
  }
};


// 🔐 LOGOUT
window.logout = async () => {
  await signOut(auth);
};


// 👤 CONTROL DE SESIÓN
onAuthStateChanged(auth, user => {

  // RESET UI
  document.getElementById("login").style.display = "block";
  document.getElementById("formulario").style.display = "none";
  document.getElementById("adminPanel").style.display = "none";

  if (user) {
    document.getElementById("login").style.display = "none";

    if (user.email === "admin@empresa.com") {
      document.getElementById("adminPanel").style.display = "block";
      cargarAdmin({ estado: "pendiente" });
    } else {
      document.getElementById("formulario").style.display = "block";
    }
  }
});


// 📩 ENVIAR SOLICITUD
window.enviarSolicitud = async () => {
  await addDoc(collection(db, "vacaciones"), {
    nombre: document.getElementById("nombre").value,
    usuario: auth.currentUser.email,
    inicio: document.getElementById("inicio").value,
    fin: document.getElementById("fin").value,
    periodo: document.getElementById("periodo").value,
    area: document.getElementById("area").value,
    estado: "en proceso"
  });

  alert("Solicitud enviada");
};


// 📊 ADMIN
async function cargarAdmin(filtros = {}) {
  const cont = document.getElementById("solicitudes");
  cont.innerHTML = "";

  cont.innerHTML = `
    <div class="fila header">
      <div>Nombre</div>
      <div>Correo</div>
      <div>Inicio</div>
      <div>Fin</div>
      <div>Periodo</div>
      <div>Estado</div>
      <div>Acciones</div>
    </div>
  `;

  const data = await getDocs(collection(db, "vacaciones"));

  data.forEach(d => {
    const v = d.data();

    if (filtros.estado && filtros.estado !== "todas") {
      if (filtros.estado === "pendiente" && v.estado !== "en proceso") return;
      if (filtros.estado === "aprobada" && v.estado !== "aprobada") return;
      if (filtros.estado === "cancelada" && v.estado !== "cancelada") return;
    }

    if (filtros.inicio && v.inicio < filtros.inicio) return;
    if (filtros.fin && v.fin > filtros.fin) return;

    const estadoClase =
      v.estado === "en proceso" ? "pendiente" : v.estado;

    cont.innerHTML += `
      <div class="fila">
        <div>${v.nombre}</div>
        <div>${v.usuario}</div>
        <div>${v.inicio}</div>
        <div>${v.fin}</div>
        <div>${v.periodo}</div>
        <div class="${estadoClase}">${v.estado}</div>
        <div>
          <button onclick="autorizar('${d.id}')">✔</button>
          <button onclick="cancelar('${d.id}')">✖</button>
        </div>
      </div>
    `;
  });
}


// 🎛️ FILTROS
window.aplicarFiltros = () => {
  const inicio = document.getElementById("filtroInicio").value;
  const fin = document.getElementById("filtroFin").value;
  const estado = document.getElementById("filtroEstado").value;

  cargarAdmin({ inicio, fin, estado });
};


// ✅ APROBAR
window.autorizar = async (id) => {
  await updateDoc(doc(db, "vacaciones", id), {
    estado: "aprobada"
  });
  aplicarFiltros();
};


// ❌ CANCELAR
window.cancelar = async (id) => {
  await updateDoc(doc(db, "vacaciones", id), {
    estado: "cancelada"
  });
  aplicarFiltros();
};
