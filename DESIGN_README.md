# Diseño Independiente - Translogística

## 📋 Descripción

Este proyecto ha sido rediseñado para funcionar **completamente sin conexión a internet**. No contiene dependencias externas de CDN, fuentes, iconografía o recursos alojados remotamente.

## 🎨 Componentes del Diseño Local

### Sistema de Iconos SVG
Los iconos están almacenados localmente en `/assets/icons/` como archivos SVG puros:

- **plus.svg** - Icono de agregar/suma
- **search.svg** - Icono de búsqueda/lupa
- **edit.svg** - Icono de editar
- **delete.svg** - Icono de eliminar
- **close.svg** - Icono de cerrar
- **logout.svg** - Icono de cerrar sesión

### Tipografía
Se utilizan fuentes del sistema operativo para máxima compatibilidad y rendimiento:
- **Fuente principal:** System fonts (San Francisco, Segoe UI, Roboto, Ubuntu, etc.)
- No requiere descarga de fuentes externas

### Estilos CSS Locales
- `/styles/styles_principal.css` - Estilos base y componentes generales
- `/styles/login_styles.css` - Estilos de la página de login
- `/styles/usuarios_styles.css` - Estilos de la página de usuarios
- `/styles/icons.css` - Sistema de iconos y clases de botones con iconos
- `/styles/principal_styles.css` - Estilos específicos de la página principal

## 🔧 Características de Diseño

### Animaciones CSS Locales
- Transiciones suaves (0.3s ease)
- Animaciones de entrada (fadeIn, slideIn)
- Efectos hover mejorados

### Responsividad
- Diseño mobile-first
- Media queries para pantallas pequeñas (max-width: 768px)
- Elementos flexibles y adaptables

### Accesibilidad
- Bordes visibles en inputs al enfoque
- Contraste adecuado de colores
- Iconos descriptivos con SVG inline
- Focus states claros para navegación por teclado

### Paleta de Colores
- **Primario:** #667eea (Azul)
- **Secundario:** #764ba2 (Púrpura)
- **Éxito:** #4caf50 (Verde)
- **Peligro:** #f44336 (Rojo)
- **Información:** #2196f3 (Azul claro)

## 📁 Estructura de Carpetas

```
Front/
├── index.html                    # Página de login
├── assets/
│   ├── icons/                   # Iconos SVG locales
│   │   ├── plus.svg
│   │   ├── search.svg
│   │   ├── edit.svg
│   │   ├── delete.svg
│   │   ├── close.svg
│   │   └── logout.svg
│   └── fonts/                   # Reservado para fuentes personalizadas futuras
├── styles/
│   ├── styles_principal.css      # Estilos base
│   ├── login_styles.css          # Estilos del login
│   ├── usuarios_styles.css       # Estilos de usuarios
│   ├── principal_styles.css      # Estilos de principal
│   └── icons.css                 # Sistema de iconos
├── views/
│   ├── Principal.html
│   └── Usuarios.html
└── Scripts/
    ├── js.js
    ├── login.js
    └── Usuarios.js
```

## 🚀 Ventajas

✅ **Funciona sin internet** - Todos los recursos son locales  
✅ **Rendimiento mejorado** - Sin latencia de red  
✅ **Portabilidad** - Se puede usar en cualquier equipo  
✅ **Seguridad** - Sin dependencias externas de terceros  
✅ **Mantenibilidad** - Fácil de personalizar y actualizar  

## 🎯 Uso

### Agregar nuevos iconos
1. Crear archivo SVG en `/assets/icons/`
2. Agregar clase en `/styles/icons.css`
3. Usar en HTML con la clase correspondiente

### Modificar colores
Actualizar las variables de color en los archivos CSS específicos:
- **Primarios:** En `styles_principal.css`
- **Secundarios:** En los archivos CSS específicos de cada página

### Responsive
Las pantallas se adaptan automáticamente. Probar con DevTools (F12) en modo responsive.

## ⚠️ Notas Importantes

- La lógica JavaScript **NO ha sido modificada**
- Solo se han actualizado los diseños y estilos
- Los emojis han sido reemplazados por iconos SVG
- Se mantiene la compatibilidad con navegadores modernos

---

**Versión:** 2.0 - Offline Ready  
**Última actualización:** Mayo 2026
