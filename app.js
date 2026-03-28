import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";

import {
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// CONFIG FIREBASE
const firebaseConfig = {
  apiKey: "AIzaSyCrFSplvyoXZy_mgkVzG7e1VuPCPXM3gcs",
  authDomain: "vacaciones-app-7353a.firebaseapp.com",
  projectId: "vacaciones-app-7353a",
  storageBucket: "vacaciones-app-7353a.firebasestorage.app",
  messagingSenderId: "829112426227",
  appId: "1:829112426227:web:064a78429796e888d9a186"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// 🔐 ROLES AUTOMÁTICOS
const admins = ["admin@empresa.com"];

// LOGIN
window.login = async () => {
  const email = document.getElementById("correo").value;
  const pass = document.getElementById("password").value;

  await signInWithEmailAndPassword(auth, email, pass);
};

// LOGOUT
window.logout = async () => {
  await signOut(auth);
  location.reload();
};

// SESIÓN
onAuthStateChanged(auth, user => {
  if (user) {
    document.getElementById("login").style.display = "none";

    if (admins.includes(user.email)) {
      document.getElementById("adminPanel").style.display = "block";
      cargarSolicitudes();
    } else {
      document.getElementById("formulario").style.display = "block";
      cargarMisSolicitudes();
    }
  }
});

// ENVIAR SOLICITUD
window.enviarSolicitud = async () => {
  await addDoc(collection(db, "vacaciones"), {
    nombre: document.getElementById("nombre").value,
    usuario: auth.currentUser.email,
    inicio: document.getElementById("inicio").value,
    fin: document.getElementById("fin").value,
    periodo: document.getElementById("periodo").value,
    empresa: document.getElementById("empresa").checked,
    area: document.getElementById("area").value,
    estado: "en proceso"
  });

  alert("Solicitud enviada");
  cargarMisSolicitudes();
};

// EMPLEADO
async function cargarMisSolicitudes() {
  const cont = document.getElementById("misSolicitudes");
  cont.innerHTML = "";

  const data = await getDocs(collection(db, "vacaciones"));

  data.forEach(d => {
    const v = d.data();

    if (v.usuario !== auth.currentUser.email) return;

    let clase = "pendiente";
    let mensaje = "⏳ Pendiente";

    if (v.estado === "aprobada") {
      clase = "aprobada";
      mensaje = "✅ Aprobada";
    }

    if (v.estado === "cancelada") {
      clase = "cancelada";
      mensaje = "❌ Cancelada";
    }

    cont.innerHTML += `
      <div class="fila ${clase}">
        <div>${v.inicio}</div>
        <div>${v.fin}</div>
        <div>${v.periodo}</div>
        <div>${v.estado}</div>
        <div>${mensaje}</div>
      </div>
    `;
  });
}

// ADMIN
window.cargarSolicitudes = async () => {
  const cont = document.getElementById("solicitudes");
  cont.innerHTML = "";

  const inicioFiltro = document.getElementById("filtroInicio").value;
  const finFiltro = document.getElementById("filtroFin").value;
  const estadoFiltro = document.getElementById("filtroEstado").value;

  const data = await getDocs(collection(db, "vacaciones"));

  data.forEach(d => {
    const v = d.data();

    if (estadoFiltro !== "todas" && v.estado !== estadoFiltro) return;
    if (inicioFiltro && v.inicio < inicioFiltro) return;
    if (finFiltro && v.fin > finFiltro) return;

    let clase = "pendiente";
    if (v.estado === "aprobada") clase = "aprobada";
    if (v.estado === "cancelada") clase = "cancelada";

    cont.innerHTML += `
      <div class="fila ${clase}">
        <div>${v.nombre}</div>
        <div>${v.usuario}</div>
        <div>${v.inicio}</div>
        <div>${v.fin}</div>
        <div>${v.periodo}</div>
        <div>${v.estado}</div>
        <div>
          <button onclick="aprobar('${d.id}')">Aprobar</button>
          <button onclick="cancelar('${d.id}')">Cancelar</button>
        </div>
      </div>
    `;
  });
};

// APROBAR
window.aprobar = async (id) => {
  await updateDoc(doc(db, "vacaciones", id), {
    estado: "aprobada"
  });
  cargarSolicitudes();
};

// CANCELAR
window.cancelar = async (id) => {
  await updateDoc(doc(db, "vacaciones", id), {
    estado: "cancelada"
  });
  cargarSolicitudes();
};
