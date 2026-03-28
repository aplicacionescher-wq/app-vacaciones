// 🔥 FIREBASE
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";

import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  query,
  where
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import {
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyCrFSplvyoXZy_mgkVzG7e1VuPCPXM3gcs",
  authDomain: "vacaciones-app-7353a.firebaseapp.com",
  projectId: "vacaciones-app-7353a",
  storageBucket: "vacaciones-app-7353a.firebasestorage.app",
  messagingSenderId: "829112426227",
  appId: "1:829112426227:web:064a78429796e888d9a186"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// LOGIN REAL 🔐
window.login = async () => {
  const email = document.getElementById("usuario").value;
  const pass = prompt("Contraseña:");

  try {
    await signInWithEmailAndPassword(auth, email, pass);
  } catch (error) {
    alert("Error de login");
  }
};

// DETECTAR SESIÓN
onAuthStateChanged(auth, (user) => {
  if (user) {
    iniciarApp(user);
  }
});

// INICIAR APP
function iniciarApp(user) {
  document.getElementById("login").style.display = "none";
  document.getElementById("app").style.display = "block";

  const esAdmin = user.email === "admin@empresa.com";

  if (esAdmin) {
    document.getElementById("titulo").innerText = "Administrador";
    document.getElementById("empleadoPanel").style.display = "none";
    document.getElementById("adminPanel").style.display = "block";
    cargarAdmin();
  } else {
    document.getElementById("titulo").innerText = "Empleado";
    document.getElementById("adminPanel").style.display = "none";
    document.getElementById("empleadoPanel").style.display = "block";
    cargarSolicitudes(user.email);
  }
}

// ENVIAR SOLICITUD
window.enviarSolicitud = async () => {
  const user = auth.currentUser;

  await addDoc(collection(db, "vacaciones"), {
    usuario: user.email,
    nombre: document.getElementById("nombre").value,
    inicio: document.getElementById("inicio").value,
    fin: document.getElementById("fin").value,
    area: document.getElementById("area").value,
    estado: "en proceso"
  });

  alert("Solicitud enviada");
  cargarSolicitudes(user.email);
};

// EMPLEADO SOLO VE LO SUYO
async function cargarSolicitudes(email) {
  const lista = document.getElementById("lista");
  lista.innerHTML = "";

  const q = query(collection(db, "vacaciones"), where("usuario", "==", email));
  const data = await getDocs(q);

  data.forEach(d => {
    const v = d.data();
    lista.innerHTML += `<li>${v.nombre} - ${v.estado}</li>`;
  });
}

// ADMIN VE TODO
async function cargarAdmin() {
  const cont = document.getElementById("solicitudes");
  cont.innerHTML = "";

  const data = await getDocs(collection(db, "vacaciones"));

  data.forEach(d => {
    const v = d.data();

    cont.innerHTML += `
      <div>
        <p>${v.usuario}</p>
        <p>${v.inicio} - ${v.fin}</p>
        <p>${v.estado}</p>
        <button onclick="autorizar('${d.id}')">Autorizar</button>
        <button onclick="cancelar('${d.id}')">Cancelar</button>
      </div>
    `;
  });
}

// ADMIN ACCIONES
window.autorizar = async (id) => {
  await updateDoc(doc(db, "vacaciones", id), { estado: "aprobada" });
  cargarAdmin();
};

window.cancelar = async (id) => {
  await updateDoc(doc(db, "vacaciones", id), { estado: "cancelada" });
  cargarAdmin();
};
