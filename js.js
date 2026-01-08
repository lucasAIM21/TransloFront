const API_URL = "https://laimserver.duckdns.org/translo";

let datos = [];
const form=document.getElementById("formulario");

async function CargarDatos() {
    try{
        const response = await fetch(`${API_URL}/api/datos`);
        datos = await response.json();
        console.log("Datos cargados:", datos);


    }catch(error){
        console.error("Error fetching data:", error);
    }
}

form.addEventListener("submit", async (e)=>{
    e.preventDefault();

    if(!ValidarCampos()){
        alert("Complete todos los campos")
    }

    const data = Object.fromEntries(new FormData(form));

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

 async function RellenarTabla() {
    await CargarDatos();
    const tbody = document.getElementById("tablaDatos");
    tbody.innerHTML = ""; // limpiar tabla

    datos.forEach(dato => {
        const tr = document.createElement("tr");

        // Lista de campos según tu tabla
        const campos = [
            "Fecha",
            "Origen",
            "Destino",
            "Cliente",
            "Carga",
            "Flete",
            "GRR",
            "GRT",
            "Combustible",
            "GastosVarios",
            "Viaticos"
        ];

        campos.forEach(campo => {
            const td = document.createElement("td");
            td.textContent = dato[campo] ?? "";
            tr.appendChild(td);
        });

        tbody.appendChild(tr);
    });
}


async function init(){
    await RellenarTabla();
}

init();