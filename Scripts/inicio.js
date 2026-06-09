// ==================== INICIO PAGE SCRIPT ====================
// Carga y muestra los datos del usuario

document.addEventListener("DOMContentLoaded", function() {
    CargarDatosUsuario();
    ConfigurarLogout();
});

// ==================== CARGAR DATOS DEL USUARIO ====================
function CargarDatosUsuario() {
    try {
        const usuarioJSON = localStorage.getItem("usuario");
        
        if (!usuarioJSON) {
            console.error("No hay datos de usuario en localStorage");
            // Redirigir a login si no hay usuario
            window.location.href = "../index.html";
            return;
        }

        const usuario = JSON.parse(usuarioJSON);

        // Validar que tenga los datos necesarios
        if (!usuario) {
            console.error("Datos de usuario inválidos");
            window.location.href = "../index.html";
            return;
        }

        // Rellenar la tarjeta de perfil
        const nombre = usuario.nombre || "-";
        const apellido = usuario.apellido || "-";
        const dni = usuario.dni || "-";
        const role = usuario.role || "-";
        const empresa = usuario.empresa || "-";

        // Nombre completo (Nombre y Apellido)
        const nombreCompleto = `${nombre} ${apellido}`.trim() || "-";

        // Actualizar elementos del DOM
        document.getElementById("userName").textContent = nombreCompleto;
        document.getElementById("userDni").textContent = `DNI: ${dni}`;
        
        // Detalles
        document.getElementById("detailNombre").textContent = nombre;
        document.getElementById("detailApellido").textContent = apellido;
        document.getElementById("detailDni").textContent = dni;
        document.getElementById("detailRole").textContent = role;
        document.getElementById("detailEmpresa").textContent = empresa;

        console.log("Datos del usuario cargados correctamente:", usuario);

    } catch (error) {
        console.error("Error al cargar los datos del usuario:", error);
        alert("Error al cargar los datos del usuario");
    }
}

// ==================== CONFIGURAR BOTÓN LOGOUT ====================
function ConfigurarLogout() {
    const btnLogout = document.getElementById("btnLogout");
    
    if (btnLogout) {
        btnLogout.addEventListener("click", function() {
            // Limpiar localStorage
            localStorage.removeItem("token");
            localStorage.removeItem("usuario");
            
            // Redirigir a login
            window.location.href = "../index.html";
        });
    }
}
