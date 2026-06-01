const API_URL = "https://laimserver.duckdns.org";

// ==================== VARIABLES GLOBALES ====================
let datos = [];
let datosAgrupados = {}; // { "2025-01": { datos: [...], diasConViajes: {...} } }
let viajeActualSeleccionado = null;
let modoEdicion = false; // Controlar si estamos en modo edición
const token = localStorage.getItem("token");

const form = document.getElementById("formulario");
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

let DatoIdActual = null;


async function CargarDatos() {
    try {
        const response = await fetch(`${API_URL}/api/datos`);
        datos = await response.json();
        console.log("Datos cargados:", datos);
        AgruparDatosPorMes();
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}

// ==================== AGRUPAR DATOS POR MES/AÑO ====================
function AgruparDatosPorMes() {
    datosAgrupados = {};
    
    // Ordenar datos por fecha
    const datosOrdenados = [...datos].sort((a, b) => new Date(a.Fecha) - new Date(b.Fecha));
    
    datosOrdenados.forEach(viaje => {
        const fecha = new Date(viaje.Fecha);
        const mesAño = fecha.toISOString().slice(0, 7); // "2025-01"
        const dia = fecha.getDate();
        
        if (!datosAgrupados[mesAño]) {
            datosAgrupados[mesAño] = {
                mes: fecha.getMonth(),
                año: fecha.getFullYear(),
                viajes: [],
                diasConViajes: {}
            };
        }
        
        datosAgrupados[mesAño].viajes.push(viaje);
        
        // Guardar el viaje en el día correspondiente
        if (!datosAgrupados[mesAño].diasConViajes[dia]) {
            datosAgrupados[mesAño].diasConViajes[dia] = [];
        }
        datosAgrupados[mesAño].diasConViajes[dia].push(viaje);
    });
}

// ==================== RENDERIZAR ACORDEONES ====================
function RenderizarAcordeones() {
    const contenedor = document.getElementById("acordeonesContenedor");
    contenedor.innerHTML = "";
    
    const meses = Object.keys(datosAgrupados).sort();
    
    meses.forEach(mesAño => {
        const grupo = datosAgrupados[mesAño];
        const fecha = new Date(grupo.año, grupo.mes, 1);
        const nombreMes = fecha.toLocaleDateString("es-PE", { month: "long", year: "numeric" });
        
        // Crear acordeón
        const acordeon = document.createElement("div");
        acordeon.className = "acordeon";
        
        // Header del acordeón
        const header = document.createElement("div");
        header.className = "acordeon-header";
        header.textContent = nombreMes.charAt(0).toUpperCase() + nombreMes.slice(1);
        header.addEventListener("click", () => {
            const contenido = acordeon.querySelector(".acordeon-contenido");
            const esAbierto = contenido.classList.contains("abierto");
            
            // Cerrar todos los demás acordeones
            document.querySelectorAll(".acordeon-contenido.abierto").forEach(c => {
                if (c !== contenido) {
                    c.classList.remove("abierto");
                }
            });
            
            // Abrir/cerrar este acordeón
            contenido.classList.toggle("abierto");
            header.classList.toggle("activo");
        });
        
        // Contenido del acordeón (calendario)
        const contenido = document.createElement("div");
        contenido.className = "acordeon-contenido";
        contenido.innerHTML = GenerarCalendario(mesAño, grupo);
        
        acordeon.appendChild(header);
        acordeon.appendChild(contenido);
        contenedor.appendChild(acordeon);
    });
}

// ==================== GENERAR CALENDARIO ====================
function GenerarCalendario(mesAño, grupo) {
    const [año, mes] = mesAño.split("-").map(Number);
    
    // Primer día del mes y número de días
    const primerDia = new Date(año, mes - 1, 1);
    const ultimoDia = new Date(año, mes, 0);
    const diasDelMes = ultimoDia.getDate();
    const diaDelSemanaPrimer = primerDia.getDay();
    
    let html = '<div class="calendario-grid">';
    
    // Encabezados de días de la semana
    const diasSemana = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
    diasSemana.forEach(dia => {
        html += `<div class="calendario-encabezado">${dia}</div>`;
    });
    
    // Casillas vacías antes del primer día
    for (let i = 0; i < diaDelSemanaPrimer; i++) {
        html += '<div class="calendario-celda vacia"></div>';
    }
    
    // Casillas de días
    for (let dia = 1; dia <= diasDelMes; dia++) {
        const tienViaje = grupo.diasConViajes[dia];
        const clase = tienViaje ? "calendario-celda activa" : "calendario-celda inactiva";
        const dataId = tienViaje ? `data-viaje-id="${tienViaje[0].DatoId}"` : "";
        const onclick = tienViaje ? `onclick="AbrirModalVisualizacion(${tienViaje[0].DatoId})"` : "";
        
        html += `<div class="${clase}" ${dataId} ${onclick}>${dia}</div>`;
    }
    
    html += '</div>';
    return html;
}

// ==================== MODAL DE VISUALIZACIÓN ====================
function AbrirModalVisualizacion(datoId) {
    viajeActualSeleccionado = datoId;
    modoEdicion = false;
    
    // Mostrar el modal
    const modal = document.getElementById("modalVisualizacion");
    modal.classList.remove("ModalOculto");
    
    // Resetear a la primera pestaña (Datos)
    MostrarPestana("datos");
    
    // Llenar las secciones
    LlenarSeccionDatos(datoId);
    LlenarSeccionGuias(datoId);
    LlenarSeccionGastos(datoId);
}

// ==================== EDITAR VIAJE DESDE MODAL DE ACCIONES ====================
function EditarViajeDesdeModal(datoId) {
    // Cerrar modal de visualización
    document.getElementById("modalVisualizacion").classList.add("ModalOculto");
    
    // Establecer modo edición
    modoEdicion = true;
    DatoIdActual = datoId;
    
    // Limpiar y rellenar formulario
    LimpiarForm();
    GRRs = datos.find(d => d.DatoId === datoId).GRR;
    GRTs = datos.find(d => d.DatoId === datoId).GRT;
    Peajes = datos.find(d => d.DatoId === datoId).Peajes;
    Gastos = datos.find(d => d.DatoId === datoId).GastosImprevistos;
    
    document.getElementById("TablaGRR").innerHTML="";
    document.getElementById("TablaGRT").innerHTML="";
    document.getElementById("TablaPeajes").innerHTML="";
    document.getElementById("TablaGastosVarios").innerHTML="";
    
    RellenarForm(datoId);
    
    // Mostrar formulario en modo edición
    document.getElementById("ModalDatos").classList.remove("ModalOculto");
    CambiarModoFormulario("edicion");
}

// ==================== ELIMINAR VIAJE CON CONFIRMACIÓN ====================
async function EliminarViajeDesdeModal(datoId) {
    // Mostrar confirmación
    const confirmacion = confirm("¿Está seguro que desea eliminar este viaje? Esta acción no se puede deshacer.");
    
    if (!confirmacion) {
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/api/datos/${datoId}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            console.log("Viaje eliminado exitosamente");
            
            // Cerrar modal de visualización
            document.getElementById("modalVisualizacion").classList.add("ModalOculto");
            
            // Actualizar datos
            await CargarDatos();
            RenderizarAcordeones();
            
            // Mostrar mensaje de éxito
            alert("Viaje eliminado exitosamente");
        } else {
            const error = await response.json();
            console.error("Error al eliminar el viaje:", error.message);
            alert("Error al eliminar el viaje: " + (error.message || "Intente nuevamente"));
        }
    } catch (error) {
        console.error("Error al eliminar el viaje:", error);
        alert("Error al eliminar el viaje. Intente nuevamente.");
    }
}

function LlenarSeccionDatos(datoId) {
    const dato = datos.find(d => d.DatoId === datoId);
    if (!dato) return;
    
    const fechaFormateada = new Date(dato.Fecha).toLocaleDateString("es-PE");
    
    document.getElementById("vizFecha").textContent = fechaFormateada;
    document.getElementById("vizOrigen").textContent = dato.Origen;
    document.getElementById("vizDestino").textContent = dato.Destino;
    document.getElementById("vizCliente").textContent = dato.Cliente;
    document.getElementById("vizCarga").textContent = dato.Carga;
    document.getElementById("vizFlete").textContent = `S/ ${dato.Flete}`;
    document.getElementById("vizViaticos").textContent = `S/ ${dato.Viatico}`;
}

function LlenarSeccionGuias(datoId) {
    const dato = datos.find(d => d.DatoId === datoId);
    if (!dato) return;
    
    const ulGRR = document.getElementById("vizListaGRR");
    const ulGRT = document.getElementById("vizListaGRT");
    
    ulGRR.innerHTML = "";
    ulGRT.innerHTML = "";
    
    dato.GRR.forEach(grr => {
        const li = document.createElement("li");
        li.textContent = grr;
        ulGRR.appendChild(li);
    });
    
    dato.GRT.forEach(grt => {
        const li = document.createElement("li");
        li.textContent = grt;
        ulGRT.appendChild(li);
    });
}

function LlenarSeccionGastos(datoId) {
    const dato = datos.find(d => d.DatoId === datoId);
    if (!dato) return;
    
    // Combustible
    document.getElementById("vizGalones").textContent = dato.Combustible.galones;
    document.getElementById("vizPrecioUnit").textContent = `S/ ${dato.Combustible.PrecioGalon}`;
    const precioTotal = (parseFloat(dato.Combustible.galones) * parseFloat(dato.Combustible.PrecioGalon)).toFixed(2);
    document.getElementById("vizPagoTotal").textContent = `S/ ${precioTotal}`;
    
    // Peajes
    const ulPeajes = document.getElementById("vizListaPeaje");
    ulPeajes.innerHTML = "";
    dato.Peajes.forEach(p => {
        const li = document.createElement("li");
        li.textContent = `S/ ${p.Costo} - ${p.Ubicacion}`;
        ulPeajes.appendChild(li);
    });
    
    // Gastos Varios
    const ulGastos = document.getElementById("vizListaGastosVarios");
    ulGastos.innerHTML = "";
    dato.GastosImprevistos.forEach(g => {
        const li = document.createElement("li");
        li.textContent = `S/ ${g.Monto} - ${g.Descripcion}`;
        ulGastos.appendChild(li);
    });
}

// ==================== NAVEGACIÓN DE TABS CON SWIPE ====================
let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;
let touchEndY = 0;

function MostrarPestana(nombrPestana) {
    // Ocultar todas las pestañas
    document.querySelectorAll(".modal-tab-content").forEach(tab => {
        tab.classList.remove("modal-tab-activo");
    });
    
    // Desactivar todos los botones
    document.querySelectorAll(".modal-tab-btn").forEach(btn => {
        btn.classList.remove("modal-tab-activo");
    });
    
    // Mostrar la pestaña seleccionada
    document.querySelector(`.modal-tab-content[data-tab="${nombrPestana}"]`).classList.add("modal-tab-activo");
    document.querySelector(`.modal-tab-btn[data-tab="${nombrPestana}"]`).classList.add("modal-tab-activo");
}

function ConfigurarSwipeModal() {
    const swipeContainer = document.querySelector(".modal-swipe-container");
    
    swipeContainer.addEventListener("touchstart", e => {
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
    }, false);
    
    swipeContainer.addEventListener("touchend", e => {
        touchEndX = e.changedTouches[0].screenX;
        touchEndY = e.changedTouches[0].screenY;
        
        // Calcular diferencia y detectar dirección
        const diffX = touchEndX - touchStartX;
        const diffY = Math.abs(touchEndY - touchStartY);
        
        // Ignorar si el movimiento es principalmente vertical
        if (Math.abs(diffX) < 50 || diffY > Math.abs(diffX)) {
            return;
        }
        
        // Obtener pestañas en orden
        const tabs = ["datos", "guias", "gastos"];
        const pestanaActual = document.querySelector(".modal-tab-btn.modal-tab-activo").dataset.tab;
        const indexActual = tabs.indexOf(pestanaActual);
        
        if (diffX > 0) {
            // Swipe derecha -> pestaña anterior
            if (indexActual > 0) {
                MostrarPestana(tabs[indexActual - 1]);
            }
        } else {
            // Swipe izquierda -> pestaña siguiente
            if (indexActual < tabs.length - 1) {
                MostrarPestana(tabs[indexActual + 1]);
            }
        }
    }, false);
}

// ==================== EVENTOS DE BOTONES TAB ====================
function ConfigurarBotonesTab() {
    document.querySelectorAll(".modal-tab-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            MostrarPestana(btn.dataset.tab);
        });
    });
}

// ==================== CONTROLAR MODO DEL FORMULARIO ====================
function CambiarModoFormulario(modo) {
    const divBtnGuardar = document.getElementById("DivBtnGuardar");
    const divBtnEditar = document.getElementById("DivBtnEditar");
    
    if (modo === "agregar") {
        // Modo Agregar: mostrar Guardar y Cancelar, ocultar Editar
        divBtnGuardar.classList.remove("ModalOculto");
        divBtnEditar.classList.add("ModalOculto");
        document.getElementById("ModalDatos").querySelector("h2").textContent = "Agregar Viaje";
        modoEdicion = false;
    } else if (modo === "edicion") {
        // Modo Edición: mostrar Editar y Cancelar, ocultar Guardar
        divBtnGuardar.classList.add("ModalOculto");
        divBtnEditar.classList.remove("ModalOculto");
        document.getElementById("ModalDatos").querySelector("h2").textContent = "Editar Viaje";
        modoEdicion = true;
    }
}

function ObtenerDatosFormulario(){
    
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

    return data;
}

//POST de Datos:
form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const data = ObtenerDatosFormulario();

    console.log("Datos a enviar:", data);
    try {
        await fetch(`${API_URL}/api/datos`, {
            method: "POST",
            headers: {
                "content-type": "application/json",
                "Authorization": `Bearer ${token}`
                },
            body: JSON.stringify(data)
        });
    } catch (error) {
        console.error("Error al subir los datos: ", error)
    }
    document.getElementById("ModalDatos").classList.add("ModalOculto");
    await CargarDatos();
    RenderizarAcordeones();
});

function ValidarCampos() {
    const inputs = form.querySelectorAll("input");

    for (let input of inputs) {
        if (input.value.trim() === "") {
            console.warn(`El campo ${input.name} está vacío.`);
            return false;
        }
    }

    return true;
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

    datoActual.Peajes.forEach(p => {
        CrearFilaPeaje(p.Costo, p.Ubicacion);
    });

    datoActual.GastosImprevistos.forEach(g => {
        CrearFilaGasto(g.Monto, g.Descripcion);
    });

    document.getElementById("Galones").value = datoActual.Combustible.galones;
    document.getElementById("PrecioGalon").value = datoActual.Combustible.PrecioGalon;

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
    document.getElementById("TablaPeajes").innerHTML="";
    document.getElementById("TablaGastosVarios").innerHTML="";

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
    btn.classList.add("btn-compacto");
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
    const tdGRT = document.createElement("td");
    const actionTd = document.createElement("td");

    tdGRT.textContent = valor ? valor : document.getElementById("txtGRT").value;
    tr.appendChild(tdGRT);

    const deleteBtn = CrearBotonEliminarGuia(document.getElementById("txtGRT").value, "GRT",tr);
    actionTd.appendChild(deleteBtn);

    tr.appendChild(actionTd);
    TGRT.appendChild(tr);

    if(!valor){
        GRTs.push(document.getElementById("txtGRT").value);
    }
    document.getElementById("txtGRT").value = "";
}

function CrearFilaPeaje(Costo, Ubicacion){
    const TPeajes = document.getElementById("TablaPeajes");
    const tr = document.createElement("tr");
    const tdCosto = document.createElement("td");
    const tdUbicacion = document.createElement("td");
    const actionTd = document.createElement("td");

    tdCosto.textContent = Costo ? Costo : document.getElementById("Costo").value;
    tdUbicacion.textContent = Ubicacion ? Ubicacion : document.getElementById("Ubicacion").value;

    tr.appendChild(tdUbicacion);
    tr.appendChild(tdCosto);

    const deleteBtn = CrearBotonEliminarPeaje_Gasto(document.getElementById("Costo").value, document.getElementById("Ubicacion").value, tr,"Peaje");
    actionTd.appendChild(deleteBtn);
    tr.appendChild(actionTd);

    TPeajes.appendChild(tr);

    if(!Costo && !Ubicacion){
        Peajes.push({
            Costo: document.getElementById("Costo").value,
            Ubicacion: document.getElementById("Ubicacion").value
        });
    }
    document.getElementById("Costo").value = "";
    document.getElementById("Ubicacion").value = "";
    console.log(Peajes);

}

function CrearFilaGasto(Monto, Descripcion){
    const TGastos = document.getElementById("TablaGastosVarios");
    const tr = document.createElement("tr");
    const tdMonto = document.createElement("td");
    const tdDescripcion = document.createElement("td");
    const actionTd = document.createElement("td");

    tdMonto.textContent = Monto ? Monto : document.getElementById("Monto").value;
    tdDescripcion.textContent = Descripcion ? Descripcion : document.getElementById("Descripcion").value;

    tr.appendChild(tdDescripcion);
    tr.appendChild(tdMonto);

    const deleteBtn = CrearBotonEliminarPeaje_Gasto(document.getElementById("Monto").value, document.getElementById("Descripcion").value, tr,"Gasto");
    actionTd.appendChild(deleteBtn);
    tr.appendChild(actionTd);

    TGastos.appendChild(tr);

    if(!Monto && !Descripcion){
        Gastos.push({
            Monto: document.getElementById("Monto").value,
            Descripcion: document.getElementById("Descripcion").value
        });
    }
    document.getElementById("Monto").value = "";
    document.getElementById("Descripcion").value = "";
    console.log(Gastos);

}

function CrearBotonEliminar(DatoId){
    const btn = document.createElement("button");
    btn.textContent = "🗑️";
    btn.classList.add("btn-compacto");
    btn.addEventListener("click", async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${API_URL}/api/datos/${DatoId}`, {
                method: "DELETE"
            });

            if (response.ok) {
                const result = await response.json();
                console.log(result.message);
                await CargarDatos();
                RenderizarAcordeones();
            } else {
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
    btn.classList.add("btn-compacto");
    btn.addEventListener("click", () => {

        DatoIdActual = DatoId;

        document.getElementById("ModalDatos").classList.remove("ModalOculto");
        document.getElementById("DivBtnEditar").classList.remove("ModalOculto");
        document.getElementById("DivBtnGuardar").classList.add("ModalOculto");
        GRRs = datos.find(d => d.DatoId === DatoId).GRR;
        GRTs = datos.find(d => d.DatoId === DatoId).GRT;
        Peajes = datos.find(d => d.DatoId === DatoId).Peajes;
        Gastos = datos.find(d => d.DatoId === DatoId).Gastos;

        document.getElementById("TablaGRR").innerHTML="";
        document.getElementById("TablaGRT").innerHTML="";
        document.getElementById("TablaPeajes").innerHTML="";
        document.getElementById("TablaGastosVarios").innerHTML="";

        RellenarForm(DatoId);

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

function CrearBotonEliminarPeaje_Gasto(Costo, Ubicacion, fila, tipo){
    const btn = document.createElement("button");
    btn.textContent = "🗑️";
    btn.classList.add("btn-compacto");
    if(tipo === "Peaje"){
        btn.addEventListener("click", () => {
            Peajes.splice(Peajes.indexOf({ Costo, Ubicacion }), 1);
            fila.remove();
        });
    }else if(tipo === "Gasto"){
        btn.addEventListener("click", () => {
            Gastos.splice(Gastos.indexOf({ Monto: Costo, Descripcion: Ubicacion }), 1);
            fila.remove();
        });
    }
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
    modoEdicion = false;
    DatoIdActual = null;

    const modal = document.getElementById("ModalDatos");
    CambiarModoFormulario("agregar");
    modal.classList.remove("ModalOculto");

});

btnEditar.addEventListener("click", async () => {
    const data = ObtenerDatosFormulario();

    console.log("Datos a actualizar:", data);
    
    try {
        const response = await fetch(`${API_URL}/api/datos/${DatoIdActual}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });
        
        if (response.ok) {
            console.log("Viaje actualizado exitosamente");
            alert("Viaje actualizado exitosamente");
            
            // Limpiar y cerrar
            LimpiarForm();
            document.getElementById("ModalDatos").classList.add("ModalOculto");
            modoEdicion = false;
            
            // Actualizar datos
            await CargarDatos();
            RenderizarAcordeones();
        } else {
            const error = await response.json();
            console.error("Error al actualizar el viaje:", error);
            alert("Error al actualizar el viaje: " + (error.message || "Intente nuevamente"));
        }
    } catch (error) {
        console.error("Error al actualizar el viaje:", error);
        alert("Error al actualizar el viaje. Intente nuevamente.");
    }
});

btnCancelar.addEventListener("click", () => {
    LimpiarForm();
    modoEdicion = false;
    DatoIdActual = null;
    const modal = document.getElementById("ModalDatos");
    modal.classList.add("ModalOculto");
});

document.querySelectorAll(".btnCerrar").forEach(btn => {
    btn.addEventListener("click", () => {
        const modal = btn.closest(".ModalDatos, .modal-visualizacion");
        if (modal) {
            modal.classList.add("ModalOculto");
        }
    });
});

// ==================== EVENTOS PARA BOTONES DE ACCIONES ====================
document.getElementById("btnAccionesEditar").addEventListener("click", () => {
    if (viajeActualSeleccionado) {
        EditarViajeDesdeModal(viajeActualSeleccionado);
    }
});

document.getElementById("btnAccionesEliminar").addEventListener("click", () => {
    if (viajeActualSeleccionado) {
        EliminarViajeDesdeModal(viajeActualSeleccionado);
    }
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
    CrearFilaPeaje(null, null);
});

btnAgregarGasto.addEventListener("click", () => {
    CrearFilaGasto(null, null);
});

// ==================== INICIALIZACIÓN ====================
async function init() {
    await CargarDatos();
    RenderizarAcordeones();
    BotonesDelForm();
    ConfigurarBotonesTab();
    ConfigurarSwipeModal();
}

document.addEventListener("DOMContentLoaded", init);