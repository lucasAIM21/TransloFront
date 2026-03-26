const API_URL = "http://laimserver.duckdns.org:3002";

let datos = [];
const form=document.getElementById("formulario");
const btnAgregar=document.getElementById("btnAgregar");
const btnCancelar=document.getElementById("btnCancelar");
const btnAgregarGRR=document.getElementById("btnAgregarGRR");
const btnAgregarGRT=document.getElementById("btnAgregarGRT");
const txtGRR=document.getElementById("txtGRR");
const txtGRT=document.getElementById("txtGRT");

let GRRs = [];
let GRTs = [];


async function CargarDatos() {
    try{
        const response = await fetch(`${API_URL}/api/datos`);
        datos = await response.json();
        console.log("Datos cargados:", datos);
        
        
    }catch(error){
        console.error("Error fetching data:", error);
    }
}

//POST de Datos:
form.addEventListener("submit", async (e)=>{
    e.preventDefault();
    
    if(!ValidarCampos()){
        alert("Complete todos los campos")
        return;
    }
    
    const data = Object.fromEntries(new FormData(form));

    data.GRR = GRRs;
    data.GRT = GRTs;
    
    try {
        await fetch(`${API_URL}/api/datos`, {
            method: "POST",
            headers: {"content-type":"application/json"},
            body: JSON.stringify(data)
        });
    } catch (error) {
        console.error("Error al subir los datos: ",error)
    }
    RellenarTabla();
});

function ValidarCampos() {
    const form = document.querySelector(".formulario");
    const inputs = form.querySelectorAll("input");
    
    for (let input of inputs) {
        if (input.value.trim() === "") {
            return false;
        }
    }
    
    return true;
}

//Rellenar campos de Datos:

async function RellenarTabla() { 
    await CargarDatos();
    const tbody = document.getElementById("tablaDatos");
    tbody.innerHTML = ""; // limpiar tabla
    
    datos.forEach(dato => {
        const tr = document.createElement("tr");
        const td1 = document.createElement("td");
        td1.textContent=new Date(dato.Fecha).toLocaleDateString("es-PE");
        tr.appendChild(td1);
        
        // Lista de campos según tu tabla
        const Botones = [
            "Datos",
            "Guias",
            "Gastos"
        ];
        
        Botones.forEach(Nombre => {
            const td = document.createElement("td");
            const btn = CrearBoton(dato.DatoId, Nombre, `Contenedor${Nombre}`);
            td.appendChild(btn);
            tr.appendChild(td);
        }); 

        tbody.appendChild(tr);
    });
}

function RellenarModalDatos(id) {
    const dato= datos.find(d=> d.DatoId === id);
    
    if(!dato){
        console.error("Dato no encontrado", id);
    }
    
    const fecha =document.getElementById("fecha");
    const origen =document.getElementById("origen");
    const destino =document.getElementById("destino");
    const cliente =document.getElementById("cliente");
    const carga =document.getElementById("carga");
    const flete =document.getElementById("flete");
    const viaticos=document.getElementById("viaticos");
    
    const fechaFormateada = new Date(dato.Fecha).toLocaleDateString("es-PE");
    fecha.textContent= fechaFormateada;
    origen.textContent= dato.Origen;
    destino.textContent= dato.Destino;
    cliente.textContent= dato.Cliente;
    carga.textContent= dato.Carga;
    flete.textContent= `S/ ${dato.Flete}`;
    viaticos.textContent= `S/ ${dato.Viatico}`;
    
}

function RellenarModalGuias(id){
    const dato=datos.find(d=> d.DatoId === id);
    
    if(!dato){
        console.error("Dato no encontrado", id);
        return;
    }
    
    const ulR = document.getElementById("ListaGRR");
    const ulT = document.getElementById("ListaGRT")
    
    ulR.innerHTML="";
    ulT.innerHTML="";
    
    dato.GRR.forEach(grr =>{
        const li = document.createElement("li");
        li.textContent= grr;
        ulR.appendChild(li);
    });
    
    dato.GRT.forEach(grt =>{
        const li = document.createElement("li");
        li.textContent= grt;
        ulT.appendChild(li);
    });
    
    
}

function RellenarModalGastos(id){
    const dato = datos.find(d=> d.DatoId === id);
    
    if(!dato){
        console.error("Dato no encontrado", id);
        return; 
    }
    
    //COMBUSTIBLE
    const galones = document.getElementById("SpanGalones");
    const precio = document.getElementById("SpanPrecioUnit");
    const pago = document.getElementById("SpanPago");
    
    galones.textContent = dato.Combustible.galones;
    precio.textContent = dato.Combustible.PrecioGalon;
    let PrecioFinal = parseFloat(dato.Combustible.galones)*parseFloat(dato.Combustible.PrecioGalon);
    pago.textContent = PrecioFinal.toFixed(2);
    
    //PEAJES
    const ulP = document.getElementById("ListaPeaje");
    dato.Peajes.forEach(p=>{
        const liCostoUbi = document.createElement("li");
        liCostoUbi.textContent=`S/ ${p.Costo} - ${p.Ubicacion}`;

        ulP.appendChild(liCostoUbi);
    });

    //GASTOS VARIOS
    const ulV = document.getElementById("ListaGastosVarios"); 
    dato.GastosImprevistos.forEach(g=>{
        const liCostoDesc = document.createElement("li");
        liCostoDesc.textContent=`S/ ${g.Monto} - ${g.Descripcion}`;
        ulV.appendChild(liCostoDesc);
    });
    
}

function CrearBoton(DatoId, texto,modal){
    const btn = document.createElement("button");
    btn.textContent = texto;
    btn.addEventListener("click", () => {
        if(texto==="Datos"){
            RellenarModalDatos(DatoId);
        }else if(texto==="Guias"){
            RellenarModalGuias(DatoId);
        }else if(texto==="Gastos"){
            RellenarModalGastos(DatoId);
        }
        
        const modalElement = document.getElementById(modal);
        modalElement.classList.remove("ModalOculto");
    });
    
    btn.dataset.id = DatoId;
    return btn;
}

//Envio de Datos:




//Agregar eventos a botones:

btnAgregar.addEventListener("click", () =>{
    const modal = document.getElementById("ModalDatos");
    modal.classList.remove("ModalOculto");
});

btnCancelar.addEventListener("click", () => {
    const modal = document.getElementById("ModalDatos");
    modal.classList.add("ModalOculto");
});

document.querySelectorAll(".btnCerrar").forEach(btn => {
    btn.addEventListener("click", () => {
        const modal = btn.closest(".ModalDatos, .ContenedorDatos, .ContenedorGuias, .ContenedorGastos")
        if(modal){
            modal.classList.add("ModalOculto");
        }
    });
});

function BotonesDelForm(){
    const botones=document.querySelectorAll(".btnForm");

    botones.forEach(boton=>{
        boton.addEventListener("click", function() {
            const xd = this.textContent;
            
            document.getElementById("DatosForm").classList.add("ModalOculto");
            document.getElementById("GuiasForm").classList.add("ModalOculto");
            document.getElementById("GastosForm").classList.add("ModalOculto");

            document.getElementById(`${xd}Form`).classList.remove("ModalOculto");
        });
    });
}

btnAgregarGRR.addEventListener("click", () => {
    const ul = document.getElementById("ListaGRR");
    const li = document.createElement("li");

    li.textContent = document.getElementById("txtGRR").value;
    ul.appendChild(li);
    GRRs.push(document.getElementById("txtGRR").value);
    document.getElementById("txtGRR").value = "";
});

btnAgregarGRT.addEventListener("click", () => {
    const ul = document.getElementById("ListaGRT");
    const li = document.createElement("li");

    li.textContent = document.getElementById("txtGRT").value;
    ul.appendChild(li);
    GRTs.push(document.getElementById("txtGRT").value);
    document.getElementById("txtGRT").value = "";
});

txtGRR.addEventListener("focus", () => {
    const listaGRR=document.getElementById("LGRR");
    const listaGRT=document.getElementById("LGRT");
    
    listaGRT.classList.add("ModalOculto");
    listaGRR.classList.remove("ModalOculto");

});

txtGRT.addEventListener("focus", () => {
    const listaGRR=document.getElementById("LGRR");
    const listaGRT=document.getElementById("LGRT");

    listaGRR.classList.add("ModalOculto");
    listaGRT.classList.remove("ModalOculto");
});


async function init(){
    await RellenarTabla();
    BotonesDelForm();
}

init();