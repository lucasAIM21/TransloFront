const API_URL = "https://laimserver.duckdns.org";

const formularioLogin = document.getElementById("formularioLogin");
const inputDNI = document.getElementById("dni");
const inputContrasena = document.getElementById("contrasena");
const checkboxRecordarme = document.getElementById("recordarme");

// Cargar credenciales guardadas si existen
function CargarCredencialesGuardadas() {
    const dniGuardado = localStorage.getItem("dniGuardado");
    const contrasenaGuardada = localStorage.getItem("contrasenaGuardada");
    
    if (dniGuardado && contrasenaGuardada) {
        inputDNI.value = dniGuardado;
        inputContrasena.value = contrasenaGuardada;
        checkboxRecordarme.checked = true;
    }
}

// Manejar el evento submit del formulario
formularioLogin.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const dni = inputDNI.value.trim();
    const contrasena = inputContrasena.value.trim();
    
    // Validar que los campos no estén vacíos
    if (!dni || !contrasena) {
        alert("Por favor completa todos los campos");
        return;
    }
    
    // Guardar credenciales si el checkbox está marcado
    if (checkboxRecordarme.checked) {
        localStorage.setItem("dniGuardado", dni);
        localStorage.setItem("contrasenaGuardada", contrasena);
    } else {
        // Limpiar credenciales guardadas si no está marcado
        localStorage.removeItem("dniGuardado");
        localStorage.removeItem("contrasenaGuardada");
    }
    
    try {
        const response = await fetch(`${API_URL}/api/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                dni: dni,
                password: contrasena
            })
        });
        
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.message || "Error en las credenciales");
        }
        
        // Guardar el token si viene en la respuesta
        if (result.token) {
            localStorage.setItem("token", result.token);
        }
        
        // Guardar datos del usuario si vienen en la respuesta
        if (result.user || result.data) {
            localStorage.setItem("usuario", JSON.stringify(result.user || result.data));
        }
        
        console.log("Login exitoso:", result);
        alert("¡Bienvenido!");
        
        // Redirigir a la página principal
        window.location.href = "views/Principal.html";
        
    } catch (error) {
        console.error("Error en el login:", error.message);
        alert("Error al iniciar sesión: " + error.message);
    }
});

// Cargar credenciales guardadas al cargar la página
window.addEventListener("DOMContentLoaded", CargarCredencialesGuardadas);