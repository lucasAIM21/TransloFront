const API_URL = "https://laimserver.duckdns.org/translo";

let datos = [];

async function CargarDatos() {
    try{
        const response = await fetch(`${API_URL}/api/datos`);
        datos = await response.json();
        console.log("Datos cargados:", datos);


    }catch(error){
        console.error("Error fetching data:", error);
    }
}

async function init(){
    await CargarDatos();
}

init();