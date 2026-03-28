import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";

import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// TU CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyCrFSplvyoXZy_mgkVzG7e1VuPCPXM3gcs",
  authDomain: "vacaciones-app-7353a.firebaseapp.com",
  projectId: "vacaciones-app-7353a",
  storageBucket: "vacaciones-app-7353a.firebasestorage.app",
  messagingSenderId: "829112426227",
  appId: "1:829112426227:web:064a78429796e888d9a186"
};

// INICIALIZAR
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
window.login = () => {
  rolActual = document.getElementById("rol").value;
  document.getElementById("login").style.display = "none";
  document.getElementById("app").style.display = "block";

  if (rolActual === "admin") {
    document.getElementById("titulo").innerText = "Panel Administrador";
    document.getElementById("empleadoPanel").style.display = "none";
    document.getElementById("adminPanel").style.display = "block";
    cargarAdmin();
  } else {
    document.getElementById("titulo").innerText = "Empleado";
    cargarSolicitudes();
  }
};

// ENVIAR SOLICITUD
window.enviarSolicitud = async () => {
  const nombre = document.getElementById("nombre").value;
  const inicio = document.getElementById("inicio").value;
  const fin = document.getElementById("fin").value;
  const periodo = document.getElementById("periodo").value;
  const area = document.getElementById("area").value;

  await addDoc(collection(db, "vacaciones"), {
    nombre,
    inicio,
    fin,
    periodo,
    area,
    estado: "en proceso"
  });

  alert("Solicitud enviada");
  cargarSolicitudes();
};

// EMPLEADO VE ESTADO
async function cargarSolicitudes() {
  const lista = document.getElementById("lista");
  if (!lista) return;

  lista.innerHTML = "";

  const data = await getDocs(collection(db, "vacaciones"));

  data.forEach(d => {
    const v = d.data();
    lista.innerHTML += `<li>${v.nombre} - ${v.estado}</li>`;
  });
}

// ADMIN VE TODO
async function cargarAdmin() {
  const cont = document.getElementById("solicitudes");
  if (!cont) return;

  cont.innerHTML = "";

  const data = await getDocs(collection(db, "vacaciones"));

  data.forEach(d => {
    const v = d.data();

    cont.innerHTML += `
      <div>
        <p>${v.nombre}</p>
        <p>${v.inicio} a ${v.fin}</p>
        <p>${v.estado}</p>
        <button onclick="autorizar('${d.id}')">Autorizar</button>
        <button onclick="cancelar('${d.id}')">Cancelar</button>
      </div>
    `;
  });
}

// ACCIONES ADMIN
window.autorizar = async (id) => {
  await updateDoc(doc(db, "vacaciones", id), { estado: "aprobada" });
  cargarAdmin();
};

window.cancelar = async (id) => {
  await updateDoc(doc(db, "vacaciones", id), { estado: "cancelada" });
  cargarAdmin();
};
