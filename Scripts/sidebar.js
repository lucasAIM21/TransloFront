// ==================== SIDEBAR MENU SCRIPT ====================
// Este script maneja la funcionalidad del menú desplegable
// Se reutiliza en todas las vistas

document.addEventListener("DOMContentLoaded", function() {
    // Elementos del DOM
    const btnHamburger = document.getElementById("btnHamburger");
    const sidebar = document.getElementById("sidebar");
    const menuOverlay = document.getElementById("menuOverlay");
    const sidebarLinks = document.querySelectorAll(".sidebar-link");

    // Abrir menú con botón hamburguesa
    if (btnHamburger) {
        btnHamburger.addEventListener("click", function() {
            if (sidebar.classList.contains("active") && menuOverlay.classList.contains("active")) {
                sidebar.classList.remove("active");
                menuOverlay.classList.remove("active");
            } else {
                sidebar.classList.add("active");
                menuOverlay.classList.add("active");
            }
        });
    }

    // Cerrar menú al hacer clic en overlay
    if (menuOverlay) {
        menuOverlay.addEventListener("click", function() {
            sidebar.classList.remove("active");
            menuOverlay.classList.remove("active");
        });
    }

    // Cerrar menú al hacer clic en un link (opcional)
    sidebarLinks.forEach(link => {
        link.addEventListener("click", function() {
            sidebar.classList.remove("active");
            menuOverlay.classList.remove("active");
        });
    });

    // Validación de permisos
    ValidarPermisosUsuario();
});

// ==================== VALIDACIÓN DE PERMISOS ====================
function ValidarPermisosUsuario() {
    try {
        const usuario = JSON.parse(localStorage.getItem("usuario"));
        
        // Verificar si el usuario tiene rol de Admin
        if (usuario && usuario.role === "Admin") {
            // Mostrar la opción de Usuarios en el sidebar
            const sidebarUsuarios = document.getElementById("sidebarUsuarios");
            if (sidebarUsuarios) {
                sidebarUsuarios.style.display = "block";
            }
        } else {
            // Asegurar que el elemento está oculto si no es Admin
            const sidebarUsuarios = document.getElementById("sidebarUsuarios");
            if (sidebarUsuarios) {
                sidebarUsuarios.style.display = "none";
            }
        }
    } catch (error) {
        console.error("Error al validar permisos:", error);
        // Si hay error, mantener oculto el elemento de Usuarios
        const sidebarUsuarios = document.getElementById("sidebarUsuarios");
        if (sidebarUsuarios) {
            sidebarUsuarios.style.display = "none";
        }
    }
}
