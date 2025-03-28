export const esTranslations = {
  // Commons Translations
  "commons": {
    "button": {
      "add": "Agregar",
      "edit": "Editar",
      "delete": "Eliminar",
      "cancel": "Cancelar",
      "submit": "Enviar",
      "loading": "Cargando...",
      "sending": "Enviando..."
    },
    "status": {
      "lowStock": "Bajo Stock",
      "inStock": "En Stock",
      "outOfStock": "Sin Stock"
    },
    "table": {
      "headers": {
        "name": "Nombre",
        "category": "Categoría",
        "quantity": "Cantidad",
        "unit": "Unidad",
        "minQuantity": "Cant. Mínima",
        "price": "Precio",
        "status": "Estado",
        "actions": "Acciones"
      }
    },
    "error": {
      "generic": "Ha ocurrido un error",
      "required": "Este campo es obligatorio",
      "invalid": "Entrada inválida",
      "configurationError": "Error de configuración de Firebase. Por favor, contacte al soporte",
      "serviceUnavailable": "Servicio de autenticación no disponible. Inténtelo de nuevo más tarde"
    },
    "loading": "Cargando...",
    "noItemsFound": "No se encontraron artículos",
    "searchPlaceholder": "Buscar...",
    "lowStockWarning": "{{count}} {{count, plural, one {artículo} other {artículos}}} con stock bajo",
    "confirmDelete": "¿Está seguro de que desea eliminar este elemento? Esta acción no se puede deshacer.",
    "validation": {
      "minLength": "Debe tener al menos {min} caracteres",
      "passwordRequirements": "La contraseña debe incluir mayúsculas, minúsculas y números"
    },
    "success": {
      "generic": "Operación exitosa"
    },
    "terms": {
      "accept": "Acepto los Términos y Condiciones",
      "required": "Debe aceptar los términos y condiciones"
    }
  },

  // Dashboard Translations
  "dashboard": {
    "title": "Panel Principal",
    "overview": {
      "sales": "Ventas",
      "orders": "Pedidos",
      "inventory": "Inventario",
      "revenue": "Ingresos",
      "expenses": "Gastos"
    },
    "quickActions": {
      "title": "Acciones Rápidas",
      "newOrder": "Nuevo Pedido",
      "addInventoryItem": "Agregar Artículo",
      "createReport": "Crear Informe"
    },
    "recentActivity": {
      "title": "Actividad Reciente",
      "noActivity": "No hay actividad reciente",
      "viewAll": "Ver Todo"
    },
    "performanceMetrics": {
      "title": "Métricas de Rendimiento",
      "averageOrderValue": "Valor Promedio de Pedido",
      "topSellingItems": "Artículos Más Vendidos",
      "salesTrend": "Tendencia de Ventas"
    },
    "alerts": {
      "lowStock": "Artículos con Bajo Stock",
      "outOfStock": "Artículos Sin Stock"
    },
    "buttons": {
      "export": "Exportar",
      "import": "Importar"
    },
    "errors": {
      "fetchFailed": "Error al cargar datos",
      "noData": "No hay datos disponibles"
    },
    "salesOverview": "Resumen de Ventas",
    "topSellingItems": "Artículos Más Vendidos",
    "stockLevel": "Nivel de Inventario",
    "recentOrders": "Pedidos Recientes",
    "salesTrend": "Tendencia de Ventas"
  },

  // Inventory Translations
  "inventory": {
    "pageTitle": "Gestión de Inventario",
    "searchPlaceholder": "Buscar en inventario...",
    "noItemsFound": "No se encontraron artículos en el inventario",
    "headers": {
      "name": "Nombre",
      "category": "Categoría", 
      "quantity": "Cantidad",
      "unit": "Unidad",
      "minQuantity": "Cant. Mínima",
      "price": "Precio",
      "actions": "Acciones",
      "status": "Estado"
    },
    "addItem": {
      "title": "Agregar Artículo",
      "description": "Agregar un nuevo artículo al inventario",
      "successToast": "{{itemName}} ha sido agregado al inventario",
      "errorToast": "Error al agregar el artículo de inventario"
    },
    "editItem": {
      "title": "Editar Artículo",
      "description": "Actualizar detalles del artículo de inventario",
      "successToast": "{{itemName}} ha sido actualizado",
      "errorToast": "Error al actualizar el artículo de inventario"
    },
    "deleteItem": {
      "successToast": "El artículo de inventario ha sido eliminado",
      "errorToast": "Error al eliminar el artículo de inventario"
    },
    "buttons": {
      "addItem": "Agregar Artículo",
      "editItem": "Editar Artículo",
      "cancel": "Cancelar",
      "export": "Exportar Inventario",
      "import": "Importar Inventario"
    },
    "errors": {
      "fetchItems": "Error al recuperar artículos de inventario",
      "addItem": "Error al agregar artículo de inventario",
      "deleteItem": "Error al eliminar artículo de inventario",
      "lowStock": "Algunos artículos tienen stock bajo",
      "outOfStock": "Algunos artículos están agotados"
    },
    "alerts": {
      "lowStock": "Artículos con stock bajo",
      "outOfStock": "Artículos agotados"
    }
  },

  // Settings Translations
  "settings": {
    "title": "Configuraciones",
    "profile": {
      "title": "Perfil",
      "description": "Administrar información personal",
      "username": "Nombre de usuario",
      "email": "Correo electrónico",
      "phoneNumber": "Número de teléfono",
      "position": "Puesto",
      "positionPlaceholder": "p. ej. Camarero principal, Barman",
      "role": "Rol",
      "selectRole": "Seleccionar un rol",
      "uploadPhoto": "Subir foto",
      "emailCannotBeChanged": "El correo electrónico no puede ser modificado",
      "saveChanges": "Guardar cambios",
      "saving": "Guardando...",
      "profileUpdated": "Perfil actualizado",
      "profileUpdateSuccess": "Su perfil ha sido actualizado con éxito",
      "profileUpdateFailed": "Actualización de perfil fallida",
      "profileUpdateError": "Hubo un error al actualizar su perfil"
    },
    "notifications": {
      "title": "Notificaciones",
      "description": "Configurar cómo recibe notificaciones",
      "email": "Notificaciones por correo electrónico",
      "push": "Notificaciones push",
      "sms": "Notificaciones por SMS"
    },
    "language": {
      "title": "Idioma",
      "description": "Elija su idioma preferido",
      "current": "Idioma actual",
      "options": {
        "spanish": "Español",
        "portuguese": "Portugués",
        "english": "Inglés"
      }
    },
    "appearance": {
      "title": "Apariencia",
      "description": "Personalizar la apariencia de la aplicación",
      "theme": {
        "light": "Tema Claro",
        "dark": "Tema Oscuro",
        "system": "Tema del Sistema"
      },
      "fontSize": "Tamaño de Fuente",
      "color": "Esquema de Color"
    },
    "tableMaps": {
      "title": "Mapas de Mesas",
      "description": "Crear y administrar diseños de mesas del restaurante",
      "addNew": "Agregar Nuevo Mapa",
      "edit": "Editar Mapa",
      "delete": "Eliminar Mapa"
    },
    "system": {
      "title": "Sistema",
      "description": "Configurar ajustes generales del sistema",
      "version": "Versión de la Aplicación",
      "updates": "Buscar Actualizaciones",
      "backup": "Realizar Copia de Seguridad",
      "restore": "Restaurar Configuración"
    }
  },

  // Login Page Translations
  "login": "Iniciar Sesión",
  "login.title": "Iniciar Sesión",
  "login.description": "Ingrese sus credenciales para acceder a su cuenta",
  
  // Form Labels
  "password": "Contraseña",
  
  // Form Validation
  "emailRequired": "El correo electrónico es obligatorio",
  "passwordRequired": "La contraseña es obligatoria",
  
  // Login Errors
  "login.error.invalidCredentials": "Correo electrónico o contraseña inválidos",
  "login.error.tooManyAttempts": "Demasiados intentos fallidos. Inténtelo de nuevo más tarde.",
  "login.error.unknown": "Ocurrió un error desconocido",
  
  // Login Button States
  "login.button.loggingIn": "Iniciando Sesión",
  
  // Password Visibility
  "password.show": "Mostrar Contraseña",
  "password.hide": "Ocultar Contraseña",
  
  // Footer Links
  "forgotPassword": "Recuperar Contraseña",
  "register": "Registrarse",
  "register.prompt": "¿No tiene una cuenta? Regístrese",
  
  // Authentication Service Errors
  "auth.serviceUnavailable": "Servicio de autenticación no disponible",

  // Registration Page Translations
  "createAccountDescription": "Crear una nueva cuenta para acceder al sistema de gestión de restaurantes",
  
  // Form Labels
 
  "confirmPassword": "Confirmar Contraseña",
  
  // Validation Messages
  "usernameRequired": "El nombre de usuario es obligatorio",
  "usernameMinLength": "El nombre de usuario debe tener al menos 3 caracteres",
  "emailInvalid": "El correo electrónico no es válido",
  "passwordMinLength": "La contraseña debe tener al menos 8 caracteres",
  "passwordRequirements": "La contraseña debe incluir mayúsculas, minúsculas y números",
  "passwordsDoNotMatch": "Las contraseñas no coinciden",
  
  // Terms and Conditions
  "acceptTerms": "Acepto los Términos y Condiciones",
  "acceptTermsRequired": "Debe aceptar los términos y condiciones",
  
  // Registration Outcomes
  "registrationSuccessful": "Registro Exitoso",
  "accountCreated": "Su cuenta ha sido creada con éxito",
  "registrationFailed": "Fallo en el Registro",
  
  // Firebase Error Translations
  "emailAlreadyInUse": "El correo electrónico ya está en uso",
  "passwordTooWeak": "La contraseña es demasiado débil",
  
  // Password Visibility
  
  // Generic Errors
  "unknownError": "Ocurrió un error desconocido",
  
  // Authentication Service Errors
  "auth.configurationError": "Error de configuración de Firebase. Por favor, contacte al soporte",

  // Forgot Password Page Translations
  "forgotPassword.title": "Recuperar Contraseña",
  "forgotPassword.description.initial": "Ingrese su correo electrónico para recibir instrucciones de restablecimiento de contraseña",
  "forgotPassword.description.emailSent": "Revise su correo electrónico para obtener instrucciones de restablecimiento de contraseña",
  
  // Form Labels
  
  // Button Texts
  "forgotPassword.button.sendInstructions": "Enviar Instrucciones",
  "forgotPassword.button.sending": "Enviando...",
  "forgotPassword.button.tryAnotherEmail": "Probar con otro correo",
  
  // Error Messages
  "forgotPassword.error.emailRequired": "El correo electrónico es obligatorio",
  "forgotPassword.error.authServiceUnavailable": "Servicio de autenticación no disponible",
  "forgotPassword.error.userNotFound": "No se encontró ninguna cuenta con esta dirección de correo electrónico",
  
  // Success Messages
  "forgotPassword.success.emailSent": "Instrucciones de restablecimiento de contraseña enviadas",
  
  // Email Sent Texts
  "forgotPassword.emailSent.checkSpam": "Si no ve el correo electrónico, revise su carpeta de spam",
  
  // Footer Texts
  "forgotPassword.loginReminder": "¿Recordó su contraseña?",
  "forgotPassword.loginLink": "Iniciar Sesión",

  // Orders Page Translations
  "orders": "Pedidos",
  "newOrder": "Nuevo Pedido",
  
  "orderStatus.pending": "Pendiente",
  "orderStatus.preparing": "Preparando",
  "orderStatus.ready": "Listo",
  "orderStatus.delivered": "Entregado",
  "orderStatus.cancelled": "Cancelado",
  
  "orders.table.id": "ID",
  "orders.table.table": "Mesa",
  "orders.table.waiter": "Mesero",
  "orders.table.status": "Estado",
  "orders.table.total": "Total",
  "orders.table.actions": "Acciones",
  
  "orders.action.updateStatus": "Actualizar Estado",
  "orders.action.delete": "Eliminar Pedido",
  
  "orders.statusDialog.title": "Cambiar Estado del Pedido",
  "orders.statusDialog.description": "Seleccione el nuevo estado para el pedido",
  
  "orders.search.placeholder": "Buscar pedidos...",
  "orders.filter.allStatuses": "Todos los Estados",
  
  "orders.error.fetchFailed": "No se pudieron cargar los pedidos",
  "orders.error.updateStatusFailed": "No se pudo actualizar el estado del pedido",
  "orders.error.deleteFailed": "No se pudo eliminar el pedido",
  
  "orders.success.statusUpdated": "Estado del pedido actualizado",
  "orders.success.orderDeleted": "Pedido eliminado",

  // Firebase Test page
  "firebaseTest.pageTitle": "Prueba de Configuración de Firebase",
  "firebaseTest.pageDescription": "Pruebe su configuración de Firebase para asegurarse de que todo funcione correctamente",
  "firebaseTest.firebaseInitialized": "Firebase Inicializado",
  "firebaseTest.firebaseApp": "Aplicación Firebase",
  "firebaseTest.firebaseAuth": "Autenticación Firebase",
  "firebaseTest.firebaseFirestore": "Firestore Firebase",
  "firebaseTest.runTests": "Ejecutar Pruebas",
  "firebaseTest.configStatus": "Configuración de Firebase",
  "firebaseTest.apiKey": "Clave API",
  "firebaseTest.authDomain": "Dominio de Autenticación",
  "firebaseTest.projectId": "ID de Proyecto",
  "firebaseTest.storageBucket": "Bucket de Almacenamiento",
  "firebaseTest.messagingSenderId": "ID de Remitente de Mensajería",
  "firebaseTest.appId": "ID de Aplicación",
  "firebaseTest.set": "✓ Configurado",
  "firebaseTest.missing": "✗ Faltante",

  // Common
  "save": "Guardar",
  "cancel": "Cancelar",
 
};

export default esTranslations;