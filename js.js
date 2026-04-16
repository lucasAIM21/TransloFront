const API_URL = "http://laimserver.duckdns.org";

let datos = [];
const form=document.getElementById("formulario");
const btnAgregar=document.getElementById("btnAgregar");
const btnEditar=document.getElementById("btnEditar");
const btnCancelar=document.getElementById("btnCancelar");
const btnAgregarGRR=document.getElementById("btnAgregarGRR");
const btnAgregarGRT=document.getElementById("btnAgregarGRT");
const txtGRR=document.getElementById("txtGRR");
const txtGRT=document.getElementById("txtGRT");
const btnAgregarPeaje=document.getElementById("btnAgregarPeaje");
const btnAgregarGasto=document.getElementById("btnAgregarGasto");



let GRRs = [];
let GRTs = [];
let Peajes = [];
let Gastos = [];


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
    
    /*if(!ValidarCampos()){
        alert("Complete todos los campos")
        return;
    }*/
    
    const data = Object.fromEntries(new FormData(form));

    const Galones = document.getElementById("Galones").value;
    const PrecioGalon = document.getElementById("PrecioGalon").value;

    data.Combustible = {
        Galones: Galones,
        PrecioGalon: PrecioGalon
    };

    data.GRR = GRRs;
    data.GRT = GRTs;
    data.Peajes = Peajes;
    data.GastosImprevistos = Gastos;

    console.log("Datos a enviar:", data);
    try {
        await fetch(`${API_URL}/api/datos`, {
            method: "POST",
            headers: {"content-type":"application/json"},
            body: JSON.stringify(data)
        });
    } catch (error) {
        console.error("Error al subir los datos: ",error)
    }
    OcultarForms();
    RellenarTabla();
});

function ValidarCampos() {
    const form = document.querySelector(".formulario");
    const inputs = form.querySelectorAll("input");
    
    for (let input of inputs) {
        if (input.value.trim() === "") {
            console.warn(`El campo ${input.name} está vacío.`);
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
            const btn = CrearBotonVista(dato.DatoId, Nombre, `Contenedor${Nombre}`);
            td.appendChild(btn);
            tr.appendChild(td);
        });
        
        const tdAcciones = document.createElement("td");

        const btnEditar = CrearBotonEditar(dato.DatoId);
        tdAcciones.appendChild(btnEditar);

        const btnEliminar = CrearBotonEliminar(dato.DatoId);
        tdAcciones.appendChild(btnEliminar);

        tr.appendChild(tdAcciones);

        tbody.appendChild(tr);
    });
}

function RellenarForm(id){
    const datoActual = datos.find(d => d.DatoId === id);

    document.getElementById("Fecha").value = new Date(datoActual.Fecha).toISOString().slice(0,16);
    document.getElementById("Origen").value = datoActual.Origen;
    document.getElementById("Destino").value = datoActual.Destino;
    document.getElementById("Cliente").value = datoActual.Cliente;
    document.getElementById("Carga").value = datoActual.Carga;
    document.getElementById("Flete").value = datoActual.Flete;
    document.getElementById("Viatico").value = datoActual.Viatico;

    datoActual.GRR.forEach(grr => {
        CrearFilaGRR(grr);
    });

    datoActual.GRT.forEach(grt => {
        CrearFilaGRT(grt);
    });

}

function LimpiarForm(){
    document.getElementById("Fecha").value = "";
    document.getElementById("Origen").value = "";
    document.getElementById("Destino").value = "";
    document.getElementById("Cliente").value = "";
    document.getElementById("Carga").value = "";
    document.getElementById("Flete").value = "";
    document.getElementById("Viatico").value = "";

    GRRs = [];
    GRTs = [];
    Peajes = [];
    Gastos = [];

    document.getElementById("TablaGRR").innerHTML="";
    document.getElementById("TablaGRT").innerHTML="";
    document.getElementById("ListaPeajesPOST").innerHTML="";
    document.getElementById("ListaGastosPOST").innerHTML="";

    document.getElementById("Galones").value = "";
    document.getElementById("PrecioGalon").value = "";

    document.getElementById("Costo").value = "";
    document.getElementById("Ubicacion").value = "";

    document.getElementById("Monto").value = "";
    document.getElementById("Descripcion").value = "";
}


//Rellenar campos de Vista (3 funciones):

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
        console.log(li.textContent);
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
    ulP.innerHTML="";
    dato.Peajes.forEach(p=>{
        const liCostoUbi = document.createElement("li");
        liCostoUbi.textContent=`S/ ${p.Costo} - ${p.Ubicacion}`;

        ulP.appendChild(liCostoUbi);
    });

    //GASTOS VARIOS
    const ulV = document.getElementById("ListaGV"); 
    ulV.innerHTML="";
    dato.GastosImprevistos.forEach(g=>{
        const liCostoDesc = document.createElement("li");
        liCostoDesc.textContent=`S/ ${g.Monto} - ${g.Descripcion}`;
        ulV.appendChild(liCostoDesc);
    });
    
}


function CrearBotonVista(DatoId, texto,modal){
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

function CrearFilaGRR(valor){
    const TGRR = document.getElementById("TablaGRR");
    const tr = document.createElement("tr");
    const td = document.createElement("td");
    const actionTd = document.createElement("td");

    td.textContent = valor ? valor : document.getElementById("txtGRR").value;
    tr.appendChild(td);

    const deleteBtn = CrearBotonEliminarGuia(document.getElementById("txtGRR").value, "GRR",tr);
    actionTd.appendChild(deleteBtn);


    tr.appendChild(actionTd);
    TGRR.appendChild(tr);

    if(!valor){
        GRRs.push(document.getElementById("txtGRR").value);
    }
    document.getElementById("txtGRR").value = "";

}

function CrearFilaGRT(valor){
    const TGRT = document.getElementById("TablaGRT");
    const tr = document.createElement("tr");
    const td = document.createElement("td");
    const actionTd = document.createElement("td");

    td.textContent = valor ? valor : document.getElementById("txtGRT").value;
    tr.appendChild(td);

    const deleteBtn = CrearBotonEliminarGuia(document.getElementById("txtGRT").value, "GRT",tr);
    actionTd.appendChild(deleteBtn);

    tr.appendChild(actionTd);
    TGRT.appendChild(tr);

    if(!valor){
        GRTs.push(document.getElementById("txtGRT").value);
    }
    document.getElementById("txtGRT").value = "";
}

function CrearBotonEliminar(DatoId){
    const btn = document.createElement("button");
    btn.textContent = "🗑️";
    btn.addEventListener("click", async () => {
        try {
            const response = await fetch(`${API_URL}/api/datos/${DatoId}`, {
                method: "DELETE"
            });

            if (response.ok) {
                const result = await response.json();
                console.log(result.message);
                console.log(`Dato con ID ${DatoId} eliminado.`);
            }else{
                const error = await response.json();
                console.error("Error al eliminar el dato: ", error.message);
            }

        } catch (error) {
            console.error("Error al eliminar el dato: ", error.message);
        }
    });
    return btn;
}

function CrearBotonEditar(DatoId){
    const btn = document.createElement("button");
    btn.textContent = "✏️";
    btn.addEventListener("click", () => {
        document.getElementById("ModalDatos").classList.remove("ModalOculto");
        document.getElementById("DivBtnGuardar").classList.add("ModalOculto");
        document.getElementById("DivBtnEditar").classList.remove("ModalOculto");
        GRRs = datos.find(d => d.DatoId === DatoId).GRR;
        GRTs = datos.find(d => d.DatoId === DatoId).GRT;
        
        const TGRR = document.getElementById("TablaGRR");
        const TGRT = document.getElementById("TablaGRT");
        TGRR.innerHTML="";
        TGRT.innerHTML="";

        RellenarForm(DatoId);

        console.log(GRRs);

    });

    return btn;
}

function CrearBotonEliminarGuia(valor, tipo, fila){
    const btn = document.createElement("button");
    btn.textContent = "🗑️";
    btn.classList.add("btn-compacto");
    btn.addEventListener("click", () => {
        if(tipo === "GRR"){
            GRRs.splice(GRRs.indexOf(valor), 1);
            fila.remove();
        }else if(tipo === "GRT"){
            GRTs.splice(GRTs.indexOf(valor), 1);
            fila.remove();
        }
    });
    return btn;
}

function OcultarForms(){
    document.getElementById("DatosForm").classList.add("ModalOculto");
    document.getElementById("GuiasForm").classList.add("ModalOculto");
    document.getElementById("GastosForm").classList.add("ModalOculto");
}


//Agregar eventos a botones:

btnAgregar.addEventListener("click", () =>{

    LimpiarForm();

    const modal = document.getElementById("ModalDatos");
    document.getElementById("DivBtnGuardar").classList.remove("ModalOculto");
    document.getElementById("DivBtnEditar").classList.add("ModalOculto");
    modal.classList.remove("ModalOculto");
});

btnEditar.addEventListener("click", () => {
    
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
            
            OcultarForms();

            document.getElementById(`${xd}Form`).classList.remove("ModalOculto");
        });
    });
}

btnAgregarGRR.addEventListener("click", () => {
    CrearFilaGRR(null);
});

btnAgregarGRT.addEventListener("click", () => {
    CrearFilaGRT(null);
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

btnAgregarPeaje.addEventListener("click", () => {
    const peaje = {
        Costo: document.getElementById("Costo").value,
        Ubicacion: document.getElementById("Ubicacion").value
    };
    Peajes.push(peaje);
    
    const ul = document.getElementById("ListaPeajesPOST");
    const li = document.createElement("li");
    li.textContent = `S/ ${peaje.Costo} - ${peaje.Ubicacion}`;
    console.log(li.textContent);
    ul.appendChild(li);
    document.getElementById("Costo").value = "";
    document.getElementById("Ubicacion").value = "";
});

btnAgregarGasto.addEventListener("click", () => {
    const gasto = {
        Monto: document.getElementById("Monto").value,
        Descripcion: document.getElementById("Descripcion").value
    };
    Gastos.push(gasto);

    const ul = document.getElementById("ListaGastosPOST");
    const li = document.createElement("li");
    li.textContent = `S/ ${gasto.Monto} - ${gasto.Descripcion}`;
    ul.appendChild(li);
    document.getElementById("Monto").value = "";
    document.getElementById("Descripcion").value = "";
});

async function init(){
    await RellenarTabla();
    BotonesDelForm();
}

init();