import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
  getFirestore, collection, addDoc, getDocs, updateDoc, doc 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { 
  getAuth, signInWithEmailAndPassword, onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// CONFIG (REEMPLAZA CON LA TUYA)
const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_DOMINIO",
  projectId: "TU_PROJECT_ID",
  storageBucket: "TU_BUCKET",
  messagingSenderId: "TU_ID",
  appId: "TU_APP_ID"
};

// INIT
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// LOGIN
window.login = async () => {
  const email = document.getElementById("email").value;
  const pass = document.getElementById("password").value;

  await signInWithEmailAndPassword(auth, email, pass);
};

// DETECTAR USUARIO
onAuthStateChanged(auth, user => {
  if (user) {
    document.getElementById("login").style.display = "none";

    // ADMIN
    if (user.email === "admin@empresa.com") {
      document.getElementById("adminPanel").style.display = "block";
      cargarAdmin({ estado: "pendiente" });
    } else {
      document.getElementById("formulario").style.display = "block";
    }
  }
});

// ENVIAR SOLICITUD
window.enviarSolicitud = async () => {
  const data = {
    nombre: document.getElementById("nombre").value,
    usuario: auth.currentUser.email,
    inicio: document.getElementById("inicio").value,
    fin: document.getElementById("fin").value,
    periodo: document.getElementById("periodo").value,
    area: document.getElementById("area").value,
    estado: "en proceso"
  };

  await addDoc(collection(db, "vacaciones"), data);

  alert("Solicitud enviada");
};

// CARGAR ADMIN
async function cargarAdmin(filtros = {}) {
  const cont = document.getElementById("solicitudes");
  cont.innerHTML = "";

  // HEADER
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

    // FILTRO ESTADO
    if (filtros.estado && filtros.estado !== "todas") {
      if (filtros.estado === "pendiente" && v.estado !== "en proceso") return;
      if (filtros.estado === "aprobada" && v.estado !== "aprobada") return;
      if (filtros.estado === "cancelada" && v.estado !== "cancelada") return;
    }

    // FILTRO FECHAS
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

// FILTROS
window.aplicarFiltros = () => {
  const inicio = document.getElementById("filtroInicio").value;
  const fin = document.getElementById("filtroFin").value;
  const estado = document.getElementById("filtroEstado").value;

  cargarAdmin({
    inicio,
    fin,
    estado
  });
};

// APROBAR
window.autorizar = async (id) => {
  await updateDoc(doc(db, "vacaciones", id), {
    estado: "aprobada"
  });
  cargarAdmin();
};

// CANCELAR
window.cancelar = async (id) => {
  await updateDoc(doc(db, "vacaciones", id), {
    estado: "cancelada"
  });
  cargarAdmin();
};
