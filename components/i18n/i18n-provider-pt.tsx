export const ptTranslations = {
  // Commons Translations
  "commons": {
    "button": {
      "add": "Adicionar",
      "edit": "Editar",
      "delete": "Excluir",
      "cancel": "Cancelar",
      "submit": "Enviar",
      "loading": "Carregando...",
      "sending": "Enviando..."
    },
    "status": {
      "lowStock": "Estoque Baixo",
      "inStock": "Em Estoque",
      "outOfStock": "Fora de Estoque"
    },
    "table": {
      "headers": {
        "name": "Nome",
        "category": "Categoria",
        "quantity": "Quantidade",
        "unit": "Unidade",
        "minQuantity": "Qtd. Mínima",
        "price": "Preço",
        "status": "Status",
        "actions": "Ações"
      }
    },
    "error": {
      "generic": "Ocorreu um erro",
      "required": "Este campo é obrigatório",
      "invalid": "Entrada inválida"
    },
    "loading": "Carregando...",
    "noItemsFound": "Nenhum item encontrado",
    "searchPlaceholder": "Buscar...",
    "lowStockWarning": "{{count}} {{count, plural, one {item} other {itens}}} com estoque baixo",
    "confirmDelete": "Tem certeza de que deseja excluir este item? Esta ação não pode ser desfeita.",
    "email": "E-mail",
    "password": "Senha",
    "username": "Nome de Usuário",
    "auth.serviceUnavailable": "Serviço de autenticação indisponível. Tente novamente mais tarde",
    "auth.configurationError": "Erro de configuração do Firebase. Por favor, entre em contato com o suporte",
    "validation.minLength": "Deve ter pelo menos {min} caracteres",
    "validation.passwordRequirements": "A senha deve incluir maiúsculas, minúsculas e números",
    "success.generic": "Operação bem-sucedida",
    "terms.accept": "Aceito os Termos e Condições",
    "terms.required": "Você deve aceitar os termos e condições"
  },

  // Inventory Translations
  "inventory": {
    "pageTitle": "Gestão de Estoque",
    "searchPlaceholder": "Buscar no estoque...",
    "noItemsFound": "Nenhum item de estoque encontrado",
    "headers": {
      "name": "Nome",
      "category": "Categoria", 
      "quantity": "Quantidade",
      "unit": "Unidade",
      "minQuantity": "Qtd. Mínima",
      "price": "Preço",
      "actions": "Ações"
    },
    "addItem": {
      "title": "Adicionar Item",
      "description": "Adicionar um novo item ao estoque",
      "successToast": "{{itemName}} foi adicionado ao estoque",
      "errorToast": "Falha ao adicionar item de estoque"
    },
    "editItem": {
      "title": "Editar Item",
      "description": "Atualizar detalhes do item de estoque",
      "successToast": "{{itemName}} foi atualizado",
      "errorToast": "Falha ao atualizar item de estoque"
    },
    "deleteItem": {
      "successToast": "Item de estoque foi excluído",
      "errorToast": "Falha ao excluir item de estoque"
    },
    "buttons": {
      "addItem": "Adicionar Item",
      "editItem": "Editar Item",
      "cancel": "Cancelar"
    },
    "errors": {
      "fetchItems": "Falha ao buscar itens de estoque",
      "addItem": "Falha ao adicionar item de estoque",
      "deleteItem": "Falha ao excluir item de estoque"
    }
  },

  // Settings
  "profile": "Perfil",
  "profileSettingsDescription": "Gerenciar suas informações pessoais e configurações de conta",
  "notifications": "Notificações",
  "notificationSettingsDescription": "Configurar como você recebe notificações",
  "language": "Idioma",
  "languageSettingsDescription": "Escolha seu idioma preferido",
  "appearance": "Aparência",
  "appearanceSettingsDescription": "Personalizar a aparência do aplicativo",
  "tableMaps": "Mapas de Mesas",
  "tableMapSettingsDescription": "Criar e gerenciar layouts de mesas do restaurante",
  "system": "Sistema",
  "systemSettingsDescription": "Configurar configurações gerais do sistema",

  // Profile
  "username": "Nome de usuário",
  "email": "E-mail",
  "phoneNumber": "Número de telefone",
  "position": "Cargo",
  "positionPlaceholder": "p. ex. Garçom Chefe, Barman",
  "role": "Função",
  "selectRole": "Selecionar uma função",
  "uploadPhoto": "Carregar foto",
  "emailCannotBeChanged": "O e-mail não pode ser alterado",
  "saveChanges": "Salvar alterações",
  "saving": "Salvando...",
  "profileUpdated": "Perfil atualizado",
  "profileUpdateSuccess": "Seu perfil foi atualizado com sucesso",
  "profileUpdateFailed": "Falha na atualização do perfil",
  "profileUpdateError": "Ocorreu um erro ao atualizar seu perfil",

  // Login Page Translations
  "login": "Entrar",
  "login.title": "Entrar",
  "login.description": "Insira suas credenciais para acessar sua conta",
  
  // Form Labels
  "password": "Senha",
  
  // Form Validation
  "emailRequired": "O e-mail é obrigatório",
  "passwordRequired": "A senha é obrigatória",
  
  // Login Errors
  "login.error.invalidCredentials": "E-mail ou senha inválidos",
  "login.error.tooManyAttempts": "Muitas tentativas de login. Tente novamente mais tarde.",
  "login.error.unknown": "Ocorreu um erro desconhecido",
  
  // Login Button States
  "login.button.loggingIn": "Entrando",
  
  // Password Visibility
  "password.show": "Mostrar Senha",
  "password.hide": "Ocultar Senha",
  
  // Footer Links
  "forgotPassword": "Recuperar Senha",
  "register": "Registrar",
  "register.prompt": "Não tem uma conta? Registre-se",
  
  // Authentication Service Errors
  "auth.serviceUnavailable": "Serviço de autenticação indisponível",

  // Registration Page Translations
  "createAccountDescription": "Criar uma nova conta para acessar o sistema de gestão de restaurantes",
  
  // Form Labels
  
  "confirmPassword": "Confirmar Senha",
  
  // Validation Messages
  "usernameRequired": "O nome de usuário é obrigatório",
  "usernameMinLength": "O nome de usuário deve ter pelo menos 3 caracteres",
  "emailInvalid": "O e-mail não é válido",
  "passwordMinLength": "A senha deve ter pelo menos 8 caracteres",
  "passwordRequirements": "A senha deve incluir maiúsculas, minúsculas e números",
  "passwordsDoNotMatch": "As senhas não coincidem",
  
  // Terms and Conditions
  "acceptTerms": "Aceito os Termos e Condições",
  "acceptTermsRequired": "Você deve aceitar os termos e condições",
  
  // Registration Outcomes
  "registrationSuccessful": "Registro Bem-Sucedido",
  "accountCreated": "Sua conta foi criada com sucesso",
  "registrationFailed": "Falha no Registro",
  
  // Firebase Error Translations
  "emailAlreadyInUse": "O e-mail já está em uso",
  "passwordTooWeak": "A senha é muito fraca",
  
  // Password Visibility
  
  // Generic Errors
  "unknownError": "Ocorreu um erro desconhecido",
  
  // Authentication Service Errors
  "auth.configurationError": "Erro de configuração do Firebase. Por favor, entre em contato com o suporte",

  // Forgot Password Page Translations
  "forgotPassword.title": "Recuperar Senha",
  "forgotPassword.description.initial": "Insira seu e-mail para receber instruções de redefinição de senha",
  "forgotPassword.description.emailSent": "Verifique seu e-mail para obter instruções de redefinição de senha",
  
  // Form Labels
  
  // Button Texts
  "forgotPassword.button.sendInstructions": "Enviar Instruções",
  "forgotPassword.button.sending": "Enviando...",
  "forgotPassword.button.tryAnotherEmail": "Tentar outro e-mail",
  
  // Error Messages
  "forgotPassword.error.emailRequired": "O e-mail é obrigatório",
  "forgotPassword.error.authServiceUnavailable": "Serviço de autenticação indisponível",
  "forgotPassword.error.userNotFound": "Nenhuma conta encontrada com este endereço de e-mail",
  "forgotPassword.error.generic": "Falha ao enviar e-mail de redefinição",
  
  // Success Messages
  "forgotPassword.success.emailSent": "Instruções de redefinição de senha enviadas",
  
  // Email Sent Texts
  "forgotPassword.emailSent.checkSpam": "Se não vir o e-mail, verifique sua pasta de spam",
  
  // Footer Texts
  "forgotPassword.loginReminder": "Lembrou sua senha?",
  "forgotPassword.loginLink": "Entrar",

  // Dashboard Translations
  "dashboard": {
    "title": "Painel Principal",
    "salesOverview": "Resumo de Vendas",
    "topSellingItems": "Itens Mais Vendidos",
    "stockLevel": "Nível de Estoque",
    "recentOrders": "Pedidos Recentes",
    "salesTrend": "Tendência de Vendas"
  },

  // Orders Page Translations
  "orders": "Pedidos",
  "newOrder": "Novo Pedido",
  
  "orderStatus.pending": "Pendente",
  "orderStatus.preparing": "Preparando",
  "orderStatus.ready": "Pronto",
  "orderStatus.delivered": "Entregue",
  "orderStatus.cancelled": "Cancelado",
  
  "orders.table.id": "ID",
  "orders.table.table": "Mesa",
  "orders.table.waiter": "Garçom",
  "orders.table.status": "Estado",
  "orders.table.total": "Total",
  "orders.table.actions": "Ações",
  
  "orders.action.updateStatus": "Atualizar Estado",
  "orders.action.delete": "Excluir Pedido",
  
  "orders.statusDialog.title": "Alterar Estado do Pedido",
  "orders.statusDialog.description": "Selecione o novo estado para o pedido",
  
  "orders.search.placeholder": "Buscar pedidos...",
  "orders.filter.allStatuses": "Todos os Estados",
  
  "orders.error.fetchFailed": "Não foi possível carregar os pedidos",
  "orders.error.updateStatusFailed": "Não foi possível atualizar o estado do pedido",
  "orders.error.deleteFailed": "Não foi possível excluir o pedido",
  
  "orders.success.statusUpdated": "Estado do pedido atualizado",
  "orders.success.orderDeleted": "Pedido excluído",

  // Firebase Test page
  "firebaseTest.pageTitle": "Teste de Configuração do Firebase",
  "firebaseTest.pageDescription": "Teste sua configuração do Firebase para garantir que tudo esteja funcionando corretamente",
  "firebaseTest.firebaseInitialized": "Firebase Inicializado",
  "firebaseTest.firebaseApp": "Aplicativo Firebase",
  "firebaseTest.firebaseAuth": "Autenticação Firebase",
  "firebaseTest.firebaseFirestore": "Firestore Firebase",
  "firebaseTest.runTests": "Executar Testes",
  "firebaseTest.configStatus": "Configuração do Firebase",
  "firebaseTest.apiKey": "Chave API",
  "firebaseTest.authDomain": "Domínio de Autenticação",
  "firebaseTest.projectId": "ID do Projeto",
  "firebaseTest.storageBucket": "Bucket de Armazenamento",
  "firebaseTest.messagingSenderId": "ID do Remetente de Mensagens",
  "firebaseTest.appId": "ID do Aplicativo",
  "firebaseTest.set": "✓ Configurado",
  "firebaseTest.missing": "✗ Ausente",

  // Common
  "save": "Salvar",
  "cancel": "Cancelar",
  
  "error": "Erro"
};

export default ptTranslations;