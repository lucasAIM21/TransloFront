const API_URL = "https://laimserver.duckdns.org";

let usuarios = [];
let roles = [];
let empresas = [];
let usuarioIdActual = null;

const btnAgregarUsuario = document.getElementById('btnAgregarUsuario');
const modalRegistro = document.getElementById('modalRegistroUsuario');
const btnCerrarModal = document.getElementById('btnCerrarModalRegistro');
const btnCancelarRegistro = document.getElementById('btnCancelarRegistro');
const formularioRegistro = document.getElementById('formularioRegistro');
const btnBuscar = document.getElementById('btnBuscar');
const inputBuscar = document.getElementById('inputBuscar');
const btnGuardarUsuario = document.getElementById('btnGuardarUsuario');
const btnEditarUsuario = document.getElementById('btnEditarUsuario');


async function CargarUsuarios() {
    try {
        const response = await fetch(`${API_URL}/api/users`);
        const Usuarios = await response.json();
        usuarios = Usuarios.data;
        console.log("Usuarios cargados:", usuarios);
    } catch (error) {
        console.error("Error fetching users:", error);
    }
}

async function CargarRoles() {
    try {
        const response = await fetch(`${API_URL}/api/users/Roles`);
        const respRoles = await response.json();
        roles = respRoles.data || respRoles;
        console.log("Roles cargados:", roles);
        PoblarSelectRoles();
    } catch (error) {
        console.error("Error fetching roles:", error);
    }
}

async function CargarEmpresas() {
    try {
        const response = await fetch(`${API_URL}/api/empresas`);
        const respEmpresas = await response.json();
        empresas = respEmpresas.data || respEmpresas;
        console.log("Empresas cargadas:", empresas);
        PoblarSelectEmpresas();
    } catch (error) {
        console.error("Error fetching empresas:", error);
    }
}

function PoblarSelectRoles() {
    const selectRol = document.getElementById('rol');
    if (!selectRol) return;
    
    // Limpiar opciones excepto la primera
    while (selectRol.options.length > 1) {
        selectRol.remove(1);
    }
    
    roles.forEach(rol => {
        const option = document.createElement('option');
        option.value = rol.RoleId || rol.id;
        option.textContent = rol.Nombre || rol.name || rol.RoleName;
        selectRol.appendChild(option);
    });
}

function PoblarSelectEmpresas() {
    const selectEmpresa = document.getElementById('empresa');
    if (!selectEmpresa) return;
    
    // Limpiar opciones excepto la primera
    while (selectEmpresa.options.length > 1) {
        selectEmpresa.remove(1);
    }
    
    empresas.forEach(empresa => {
        const option = document.createElement('option');
        option.value = empresa.EmpresaId || empresa.id;
        option.textContent = empresa.Nombre || empresa.name || empresa.NombreEmpresa;
        selectEmpresa.appendChild(option);
    });
}

function ObtenerDatosFormulario() {
    const nombre = document.getElementById('nombre').value.trim();
    const apellido = document.getElementById('apellido').value.trim();
    const dni = document.getElementById('dni').value.trim();
    const contrasena = document.getElementById('contrasena').value.trim();
    const rol = document.getElementById('rol').value;
    const empresa = document.getElementById('empresa').value;

    return {
        Nombre: nombre,
        Apellido: apellido,
        Dni: dni,
        Password: contrasena,
        RoleId: rol,
        EmpresaId: empresa
    };
}

function ValidarCampos() {
    const nombre = document.getElementById('nombre').value.trim();
    const apellido = document.getElementById('apellido').value.trim();
    const dni = document.getElementById('dni').value.trim();
    const contrasena = document.getElementById('contrasena').value.trim();
    const rol = document.getElementById('rol').value;
    const empresa = document.getElementById('empresa').value;

    if (!nombre || !apellido || !dni || !contrasena || !rol || !empresa) {
        alert('Por favor completa todos los campos');
        return false;
    }

    if (contrasena.length < 6) {
        alert('La contraseña debe tener al menos 6 caracteres');
        return false;
    }

    return true;
}

// POST de Usuarios:
formularioRegistro.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!ValidarCampos()) {
        return;
    }

    const nuevoUsuario = ObtenerDatosFormulario();
    
    try {
        const response = await fetch(`${API_URL}/api/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nuevoUsuario)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Error en la petición');
        }
    } catch (error) {
        console.error('Error:', error.message);
        alert('Error al registrar: ' + error.message);
    }

    console.log('Nuevo usuario registrado:', nuevoUsuario);

    RellenarTabla();
});

// Botón Guardar para nuevo usuario
if (btnGuardarUsuario) {
    btnGuardarUsuario.addEventListener('click', () => {
        formularioRegistro.dispatchEvent(new Event('submit'));
        CerrarModal();
        LimpiarFormUsuario();
    });
}

async function AbrirModal() {
    if (modalRegistro) {
        LimpiarFormUsuario();
        modalRegistro.classList.remove('ModalOculto');
        modalRegistro.style.display = 'flex';
    }
    if (formularioRegistro) {
        formularioRegistro.reset();
    }
    
    // Cargar roles y empresas si no están cargados
    if (roles.length === 0) {
        await CargarRoles();
    } else {
        PoblarSelectRoles();
    }
    
    if (empresas.length === 0) {
        await CargarEmpresas();
    } else {
        PoblarSelectEmpresas();
    }
    
    // Mostrar botón guardar, ocultar botón editar
    if (btnGuardarUsuario && btnEditarUsuario) {
        btnGuardarUsuario.classList.remove('ModalOculto');
        btnEditarUsuario.classList.add('ModalOculto');
    }
    // Cambiar título del modal
    const modalTitle = document.querySelector('.modal-registro-header h2');
    if (modalTitle) {
        modalTitle.textContent = 'Registrar Nuevo Usuario';
    }
}

function CerrarModal() {
    if (modalRegistro) {
        modalRegistro.classList.add('ModalOculto');
        modalRegistro.style.display = 'none';
    }
}

// Función para llenar el formulario con datos del usuario
function RellenarFormUsuario(usuarioId) {
    const usuarioActual = usuarios.find(u => u.UserId === usuarioId);

    if (!usuarioActual) {
        console.error("Usuario no encontrado", usuarioId);
        return;
    }

    document.getElementById('nombre').value = usuarioActual.Nombre;
    document.getElementById('apellido').value = usuarioActual.Apellido;
    document.getElementById('dni').value = usuarioActual.DNI;
    document.getElementById('rol').value = usuarioActual.RoleId;
    document.getElementById('empresa').value = usuarioActual.EmpresaId;
    // No llenar contraseña para edición
}

// Función para limpiar el formulario
function LimpiarFormUsuario() {
    document.getElementById('nombre').value = '';
    document.getElementById('apellido').value = '';
    document.getElementById('dni').value = '';
    document.getElementById('contrasena').value = '';
    document.getElementById('rol').value = '';
    document.getElementById('empresa').value = '';
}

// Función para crear botón editar con lógica
function CrearBotonEditar(usuarioId) {
    const btn = document.createElement("button");
    btn.textContent = "✏️";
    btn.classList.add("btn-compacto");
    btn.addEventListener("click", async () => {
        usuarioIdActual = usuarioId;

        modalRegistro.classList.remove('ModalOculto');
        modalRegistro.style.display = 'flex';
        
        // Cargar roles y empresas si no están cargados
        if (roles.length === 0) {
            await CargarRoles();
        } else {
            PoblarSelectRoles();
        }
        
        if (empresas.length === 0) {
            await CargarEmpresas();
        } else {
            PoblarSelectEmpresas();
        }
        
        // Mostrar botón editar, ocultar botón guardar
        if (btnGuardarUsuario && btnEditarUsuario) {
            btnGuardarUsuario.classList.add('ModalOculto');
            btnEditarUsuario.classList.remove('ModalOculto');
        }

        // Cambiar título del modal
        const modalTitle = document.querySelector('.modal-registro-header h2');
        if (modalTitle) {
            modalTitle.textContent = 'Editar Usuario';
        }

        RellenarFormUsuario(usuarioId);
    });
    return btn;
}

// Event listeners del modal
if (btnAgregarUsuario) {
    btnAgregarUsuario.addEventListener('click', AbrirModal);
}

if (btnCerrarModal) {
    btnCerrarModal.addEventListener('click', CerrarModal);
}

if (btnCancelarRegistro) {
    btnCancelarRegistro.addEventListener('click', CerrarModal);
}

if (modalRegistro) {
    modalRegistro.addEventListener('click', function(event) {
        if (event.target === modalRegistro) {
            CerrarModal();
        }
    });
}

// Botón Editar para actualizar usuario existente
if (btnEditarUsuario) {
    btnEditarUsuario.addEventListener('click', async () => {
        const datosActualizados = ObtenerDatosFormulario();

        try {
            const response = await fetch(`${API_URL}/api/users/${usuarioIdActual}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(datosActualizados)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Error al actualizar');
            }

            console.log('Usuario actualizado:', datosActualizados);
        } catch (error) {
            console.error("Error al actualizar el usuario: ", error);
            alert('Error al actualizar: ' + error.message);
        }

        CerrarModal();
        LimpiarFormUsuario();
        RellenarTabla();
    });
}


function agregarUsuarioATabla(usuario) {
    const tablaBody = document.getElementById('tablaUsuariosBody');

    if (!tablaBody) return;

    const fila = document.createElement('tr');
    fila.innerHTML = `
        <td>${usuario.Nombre} ${usuario.Apellido}</td>
        <td>${usuario.DNI}</td>
        <td>${usuario.Rol}</td>
        <td>${usuario.Empresa}</td>
    `;

    const tdAcciones = document.createElement('td');

    const btnEditar = CrearBotonEditar(usuario.UserId);
    tdAcciones.appendChild(btnEditar);

    const btnEliminar = CrearBotonEliminar(usuario.UserId, usuario.Nombre);
    tdAcciones.appendChild(btnEliminar);

    fila.appendChild(tdAcciones);
    tablaBody.appendChild(fila);
}

function CrearBotonEliminar(usuarioId, nombreUsuario) {
    const btn = document.createElement("button");
    btn.textContent = "🗑️";
    btn.classList.add("btn-compacto");
    btn.addEventListener("click", async () => {
        if (confirm(`¿Estás seguro de que deseas eliminar a ${nombreUsuario}?`)) {
            try {
                const response = await fetch(`${API_URL}/api/users/${usuarioId}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    const error = await response.json();
                    console.error("Error al eliminar el usuario: ", error.message);
                    alert('Error al eliminar: ' + error.message);
                } else {
                    alert('Usuario eliminado exitosamente');
                    RellenarTabla();
                }
            } catch (error) {
                console.error("Error al eliminar el usuario: ", error.message);
            }
        }
    });
    return btn;
}

async function RellenarTabla() {
    await CargarUsuarios();
    const tablaBody = document.getElementById('tablaUsuariosBody');
    if (!tablaBody){
        console.error('No se encontró el elemento con id "tablaUsuariosBody"');
        return;
    }
    tablaBody.innerHTML = '';

    usuarios.forEach(usuario => {
        agregarUsuarioATabla(usuario);
    });
}

function buscarUsuarios(termino) {
    const tablaBody = document.getElementById('tablaUsuariosBody');

    if (!tablaBody) return;

    const filas = tablaBody.querySelectorAll('tr');

    filas.forEach(fila => {
        const textoFila = fila.textContent.toLowerCase();
        if (textoFila.includes(termino.toLowerCase())) {
            fila.style.display = '';
        } else {
            fila.style.display = 'none';
        }
    });
}

// Event listeners de búsqueda
if (btnBuscar && inputBuscar) {
    btnBuscar.addEventListener('click', function(e) {
        e.preventDefault();
        buscarUsuarios(inputBuscar.value);
    });

    inputBuscar.addEventListener('keyup', function() {
        if (this.value === '') {
            const filas = document.querySelectorAll('#tablaUsuariosBody tr');
            filas.forEach(fila => fila.style.display = '');
        } else {
            buscarUsuarios(this.value);
        }
    });
}

async function init() {
    // Cargar roles y empresas al iniciar
    await CargarRoles();
    await CargarEmpresas();
    await RellenarTabla();
}

init();