import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, updateDoc, doc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_DOMINIO",
  projectId: "TU_PROJECT_ID",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let rolActual = "";

window.login = () => {
  rolActual = document.getElementById("rol").value;
  document.getElementById("login").style.display = "none";
  document.getElementById("app").style.display = "block";

  if(rolActual === "admin"){
    document.getElementById("titulo").innerText = "Panel Administrador";
    document.getElementById("empleadoPanel").style.display = "none";
    document.getElementById("adminPanel").style.display = "block";
    cargarAdmin();
  } else {
    document.getElementById("titulo").innerText = "Empleado";
    cargarSolicitudes();
  }
};

window.enviarSolicitud = async () => {
  const nombre = document.getElementById("nombre").value;
  const inicio = document.getElementById("inicio").value;
  const fin = document.getElementById("fin").value;
  const periodo = document.getElementById("periodo").value;
  const area = document.getElementById("area").value;

  await addDoc(collection(db, "vacaciones"), {
    nombre,inicio,fin,periodo,area,estado:"en proceso"
  });

  alert("Enviado");
  cargarSolicitudes();
};

async function cargarSolicitudes(){
  const lista = document.getElementById("lista");
  if(!lista) return;

  lista.innerHTML="";
  const data = await getDocs(collection(db,"vacaciones"));

  data.forEach(d=>{
    const v = d.data();
    lista.innerHTML += `<li class="${v.estado.replace(" ","")}">${v.nombre} - ${v.estado}</li>`;
  });
}

async function cargarAdmin(){
  const cont = document.getElementById("solicitudes");
  if(!cont) return;

  cont.innerHTML="";
  const data = await getDocs(collection(db,"vacaciones"));

  data.forEach(d=>{
    const v = d.data();

    cont.innerHTML += `
    <div class="card">
      <p>${v.nombre}</p>
      <p>${v.inicio} a ${v.fin}</p>
      <p class="${v.estado.replace(" ","")}">${v.estado}</p>
      <button onclick="autorizar('${d.id}')">Autorizar</button>
      <button onclick="cancelar('${d.id}')">Cancelar</button>
    </div>`;
  });
}

window.autorizar = async (id)=>{
  await updateDoc(doc(db,"vacaciones",id),{estado:"aprobada"});
  cargarAdmin();
}

window.cancelar = async (id)=>{
  await updateDoc(doc(db,"vacaciones",id),{estado:"cancelada"});
  cargarAdmin();
}
