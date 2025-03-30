export const ptTranslations = {
  // Commons Translations
  "commons": {
    "button": {
      "add": "Adicionar",
      "edit": "Editar",
      "delete": "Excluir",
      "cancel": "Cancelar",
      "save": "Salvar",
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
    "terms.required": "Você deve aceitar os termos e condições",
    "currency": "{{value}}"
  },

  // Inventory Translations
  "inventory": {
    "pageTitle": "Gestão de Inventário",
    "searchPlaceholder": "Buscar no inventário...",
    "noItemsFound": "Nenhum item encontrado no inventário",
    "categories": {
      "drinks": "Bebidas",
      "food": "Comida",
      "menu_item": "Item de Menú"
    },
    "formLabels": {
      "name": "Nome",
      "category": "Categoria", 
      "quantity": "Quantidade",
      "unit": "Unidade",
      "minQuantity": "Quantidade Mínima",
      "price": "Preço",
      "actions": "Ações",
      "status": "Status"
    },
    "addItem": {
      "title": "Adicionar Item",
      "description": "Adicionar um novo item ao inventário",
      "namePlaceholder": "Insira o nome do item",
      "categoryPlaceholder": "Selecione a categoria do item",
      "quantityPlaceholder": "Insira a quantidade",
      "unitPlaceholder": "Insira a unidade (ex. kg, pçs)",
      "minQuantityPlaceholder": "Insira a quantidade mínima de estoque",
      "pricePlaceholder": "Insira o preço do item",
      "successToast": "{{itemName}} foi adicionado ao inventário",
      "errorToast": "Falha ao adicionar item de inventário",
      "cancel": "Cancelar"
    },
    "editItem": {
      "title": "Editar Item",
      "description": "Modificar os detalhes de um item de inventário existente",
      "successToast": "{{itemName}} foi atualizado",
      "errorToast": "Falha ao atualizar item de inventário",
      "cancel": "Cancelar"
    },
    "deleteItem": {
      "title": "Excluir Item",
      "description": "Tem certeza de que deseja excluir {{itemName}}? Esta ação não pode ser desfeita.",
      "successToast": "Item de inventário foi excluído",
      "errorToast": "Falha ao excluir item de inventário"
    },
    "status": {
      "lowStock": "Estoque Baixo",
      "inStock": "Em Estoque"
    },
    "buttons": {
      "addItem": "Adicionar Item",
      "editItem": "Editar Item",
      "cancel": "Cancelar"
    },
    "errors": {
      "fetchItems": "Falha ao buscar itens de inventário",
      "addItem": "Falha ao adicionar item de inventário",
      "deleteItem": "Falha ao excluir item de inventário"
    },
    "noItems": "Nenhum item no inventário",
    "noMatchingItems": "Nenhum item encontrado",
    "initialLoad": {
      "success": "Itens do menu carregados com sucesso",
      "description": "{{count}} itens foram adicionados ao inventário",
      "error": "Erro ao carregar itens iniciais"
    }
  },

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
    "title": "Painel de Controle",
    "salesOverview": {
      "title": "Resumo de Vendas",
      "description": "Resumo de vendas diárias",
      "totalSales": "Vendas Totais: {{amount}}",
      "monthlyGrowth": "+{{percentage}}% desde o mês passado",
      "dailySalesTrend": "Vendas do Dia {{day}}: {{amount}}",
      "dailySalesTrendFormat": "Dia {{day}}: {{amount}}"
    },
    "topSellingItems": {
      "title": "Itens Mais Vendidos",
      "description": "Itens mais populares",
      "orderCount": "{{count, number}} pedidos"
    },
    "stockLevel": {
      "title": "Status do Estoque",
      "description": "Níveis de estoque atuais",
      "percentage": "{{percentage}}%",
      "lowStockItems": "{{count, number}} itens com estoque baixo"
    }
  },

  "menu": {
    "items": {
      "pizzaMargherita": "Pizza Margherita",
      "pastaCarbonara": "Pasta Carbonara", 
      "tiramisu": "Tiramisu",
      "caesarSalad": "Salada César",
      "risotto": "Risotto"
    }
  },

  // Orders Page Translations
  "orders": "Pedidos",
  "newOrder": "Novo Pedido",
  
  "orderStatus": {
    "01": "Pendente",
    "02": "Em Preparação",
    "03": "Pronto para Servir",
    "04": "Entregue",
    "05": "Cancelado",
    "06": "Pago",
    "07": "Enviado",
    "08": "Em Trânsito",
    "09": "Concluído",
    "10": "Reembolsado",
    "11": "Aguardando",
    "12": "Agendado",
    "13": "Parcialmente Pago",
    "14": "Erro de Pagamento",
    "15": "Rejeitado",
    "16": "Processando",
    "17": "Confirmado",
    "18": "Preparação Iniciada",
    "19": "Quase Pronto",
    "20": "Aguardando Cliente",
    "21": "Serviço de Mesa",
    "22": "Para Viagem",
    "23": "Entrega",
    "24": "Reserva",
    "25": "Urgente",
    "70": "Status Final"
  },
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

  // Orders Page Translations
  "ordersPage": {
    "orders": "Pedidos",
    "newOrder": "Novo Pedido",
    "search": {
      "placeholder": "Buscar pedidos..."
    },
    "filter": {
      "allStatuses": "Todos os Estados"
    },
    "orderStatus": {
      "01": "Pendente",
      "02": "Em Preparação",
      "03": "Pronto para Servir",
      "04": "Entregue",
      "05": "Cancelado",
      "06": "Pago",
      "07": "Enviado",
      "08": "Em Trânsito",
      "09": "Concluído",
      "10": "Reembolsado",
      "11": "Aguardando",
      "12": "Agendado",
      "13": "Parcialmente Pago",
      "14": "Erro de Pagamento",
      "15": "Rejeitado",
      "16": "Processando",
      "17": "Confirmado",
      "18": "Preparação Iniciada",
      "19": "Quase Pronto",
      "20": "Aguardando Cliente",
      "21": "Serviço de Mesa",
      "22": "Para Viagem",
      "23": "Entrega",
      "24": "Reserva",
      "25": "Urgente",
      "70": "Status Final"
    },
    "table": {
      "id": "ID", 
      "table": "Mesa",
      "waiter": "Garçom",
      "items": "Itens",
      "status": "Status",
      "total": "Total",
      "actions": "Ações"
    },
    "action": {
      "updateStatus": "Atualizar Status",
      "updateStatusDescription": "Atualizar status do pedido {{orderId}}",
      "selectStatus": "Selecionar novo status",
      "delete": "Excluir Pedido",
      "deleteOrder": "Excluir Pedido",
      "deleteOrderConfirmation": "Tem certeza de que deseja excluir o pedido {{orderId}}?"
    },
    "noOrdersFound": "Nenhum pedido encontrado",
    "error": {
      "fetchFailed": "Falha ao carregar pedidos",
      "updateStatusFailed": "Falha ao atualizar o status do pedido",
      "deleteFailed": "Falha ao excluir o pedido"
    },
    "success": {
      "statusUpdated": "Status do pedido atualizado",
      "orderDeleted": "Pedido excluído"
    }
  },

  // New Order Page Translations
  "newOrderPage": {
    "title": "Criar Novo Pedido",
    "orderDetails": "Detalhes do Pedido",
    "currentOrder": "Pedido Atual",
    "tableNumber": "Número da Mesa",
    "tableNumberPlaceholder": "Insira o número da mesa",
    "selectItem": "Selecionar Item",
    "selectItemPlaceholder": "Escolha um item para adicionar",
    "quantity": "Quantidade",
    "notes": "Notas",
    "notesPlaceholder": "Instruções especiais",
    "addToOrder": "Adicionar ao Pedido",
    "noItemsInOrder": "Nenhum item adicionado ao pedido ainda",
    "total": "Total",
    "createOrder": "Enviar Pedido",
    "table": {
      "item": "Item",
      "quantity": "Qtd",
      "price": "Preço",
      "total": "Total",
      "actions": "Ações"
    },
    "error": {
      "title": "Erro",
      "noItem": "Por favor, selecione um item",
      "noTable": "Por favor, insira o número da mesa",
      "noItems": "Por favor, adicione pelo menos um item ao pedido",
      "orderCreationFailed": "Falha ao criar o pedido"
    },
    "success": {
      "orderCreated": "Pedido Criado",
      "orderCreatedDescription": "O pedido para a Mesa {{tableNumber}} foi criado com sucesso"
    }
  },

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
  
  "error": "Erro",
  
  "settings": {
    "language": {
      "title": "Idioma",
      "description": "Selecione seu idioma preferido para o aplicativo",
      "languages": {
        "en": "Inglês",
        "es": "Espanhol",
        "pt": "Português"
      },
      "actions": {
        "saveChanges": "Salvar Alterações",
        "saving": "Salvando...",
        "submit": "Enviar",
        "saved": "Idioma Atualizado",
        "saveSuccess": "Sua preferência de idioma foi atualizada com sucesso."
      }
    },
    "notifications": {
      "title": "Notificações",
      "description": "Configure como você recebe notificações",
      "types": {
        "title": "Tipos de Notificação",
        "newOrders": {
          "label": "Novos Pedidos",
          "description": "Seja notificado quando novos pedidos forem realizados"
        },
        "orderUpdates": {
          "label": "Atualizações de Pedidos", 
          "description": "Receba atualizações sobre mudanças no status dos pedidos"
        },
        "inventoryAlerts": {
          "label": "Alertas de Inventário",
          "description": "Seja informado sobre problemas de estoque ou inventário"
        },
        "systemAnnouncements": {
          "label": "Anúncios do Sistema",
          "description": "Receba notificações importantes do sistema"
        },
        "dailyReports": {
          "label": "Relatórios Diários",
          "description": "Obtenha relatórios de resumo diários"
        }
      },
      "deliveryMethods": {
        "title": "Métodos de Entrega",
        "emailNotifications": {
          "label": "Notificações por E-mail",
          "description": "Receba notificações por e-mail"
        },
        "pushNotifications": {
          "label": "Notificações Push",
          "description": "Receba notificações em tempo real no seu dispositivo"
        },
        "soundAlerts": {
          "label": "Alertas de Som",
          "description": "Reproduzir alertas de som para notificações"
        }
      },
      "frequency": {
        "immediate": "Imediato",
        "daily": "Diário",
        "weekly": "Semanal",
        "never": "Nunca"
      },
      "actions": {
        "save": "Salvar Preferências",
        "saving": "Salvando...",
        "submit": "Enviar",
        "saved": "Preferências de Notificação Atualizadas",
        "saveSuccess": "Suas preferências de notificação foram atualizadas com sucesso.",
        "saveFailed": "Falha ao Atualizar Preferências de Notificação",
        "saveError": "Ocorreu um erro ao atualizar suas preferências de notificação."
      }
    },
    "system": {
      "title": "Sistema",
      "description": "Configurar configurações do sistema"
    },
    "deliveryMethods": {
      "title": "Métodos de Entrega",
      "emailNotifications": {
        "label": "Notificações por E-mail",
        "description": "Receba notificações por e-mail"
      },
      "pushNotifications": {
        "label": "Notificações Push",
        "description": "Receba notificações em tempo real no seu dispositivo"
      },
      "soundAlerts": {
        "label": "Alertas de Som",
        "description": "Reproduzir alertas de som para notificações"
      }
    },
    "appearance": {
      "title": "Aparência",
      "description": "Personalize a aparência e a sensação do aplicativo",
      "modes": {
        "light": {
          "label": "Modo Claro",
          "icon": "sun"
        },
        "dark": {
          "label": "Modo Escuro",
          "icon": "moon"
        },
        "system": {
          "label": "Modo do Sistema",
          "icon": "monitor"
        }
      },
      "actions": {
        "save": "Salvar Alterações",
        "saving": "Salvando...",
        "saved": "Preferências de Aparência Atualizadas",
        "saveSuccess": "Suas preferências de aparência foram atualizadas com sucesso.",
        "saveFailed": "Falha ao Atualizar Preferências de Aparência",
        "saveError": "Ocorreu um erro ao atualizar suas preferências de aparência."
      }
    },
    "profile": {
      "title": "Perfil",
      "description": "Gerencie suas informações pessoais e configurações de conta",
      "fields": {
        "username": "Nome de Usuário",
        "email": {
          "label": "E-mail",
          "cannotBeChanged": "O endereço de e-mail não pode ser alterado"
        },
        "phoneNumber": "Número de Telefone",
        "position": {
          "label": "Cargo",
          "placeholder": "Digite seu cargo de trabalho"
        },
        "role": {
          "label": "Função",
          "placeholder": "Selecione sua função",
          "options": {
            "admin": "Administrador",
            "manager": "Gerente", 
            "chef": "Chef",
            "waiter": "Garçom"
          }
        }
      },
      "actions": {
        "uploadPhoto": "Enviar Foto",
        "submit": "Salvar Alterações",
        "submitting": "Salvando...",
        "profileUpdated": "Perfil Atualizado",
        "profileUpdateSuccess": "Seu perfil foi atualizado com sucesso.",
        "profileUpdateFailed": "Falha ao Atualizar Perfil",
        "profileUpdateError": "Ocorreu um erro ao atualizar seu perfil."
      },
      
    },
      "tableMaps": {
        "title": "Mapas de Mesas",
        "description": "Criar e gerenciar layouts de mesas do restaurante",
        "addNew": "Adicionar Novo Mapa",
        "edit": "Editar Mapa",
        


        "delete": "Excluir Mapa"
      },
      
   
  },
  

  "sidebar": {
    "appName": "Gestão de Restaurante",
    "dashboard": "Painel",
    "inventory": "Inventário",
    "users": "Usuários",
    "settings": "Configurações",
    "logout": "Sair",
    "orders": "Pedidos"
  },
  "tableCard": {
    "label": "Mesa",
    "details": {
      "seats": "Assentos",
      "shape": {
        "square": "Quadrada",
        "rectangle": "Retangular",
        "circle": "Circular"
      }
    },
    "actions": {
      "edit": "Editar",
      "delete": "Excluir"
    }
  },
  
  

  // Rest of the translations continue...
  "users": {
    "pageTitle": "Usuários",
    "userList": "Lista de Usuários",
    "addUser": "Adicionar Usuário",
    "searchPlaceholder": "Pesquisar usuários...",
    "noUsers": "Nenhum usuário encontrado",
    "username": "Nome de Usuário",
    "email": "E-mail",
    "role": "Função",
    "createdAt": "Criado em",
    "lastLogin": "Último login",
    "status": "Status",
    "actions": "Ações",
    "openMenu": "Abrir menu",
    "copyId": "Copiar ID",
    "roles": {
      "admin": "Administrador",
      "manager": "Gerente",
      "chef": "Chef",
      "waiter": "Garçom"
    },
    "userStatus": {
      "active": "Ativo",
      "inactive": "Inativo"
    },
    "errors": {
      "fetchUsers": "Erro ao buscar usuários"
    }
  },
  "orderForm": {
    "title": "Criar Pedido",
    "selectTable": "Selecione a Mesa",
    "selectCategory": "Selecione a Categoria",
    "selectItem": "Selecione o Item",
    "quantity": "Quantidade",
    "notes": "Observações",
    "addItem": "Adicionar Item",
    "orderItems": "Itens do Pedido",
    "noItemsAdded": "Nenhum item adicionado",
    "dietaryRestrictions": {
      "title": "Restrições Dietéticas",
      "vegetarian": "Vegetariano",
      "vegan": "Vegano",
      "glutenFree": "Sem Glúten",
      "lactoseFree": "Sem Lactose"
    },
    "specialInstructions": {
      "label": "Instruções Especiais",
      "hasInstructions": "Tem instruções especiais?"
    }
  },
  "tableMap": {
    "name": "Mapa de Mesas",
    "notFound": {
      "title": "Mapa de Mesas Não Encontrado",
      "description": "O mapa de mesas que você está procurando não existe.",
      "backToSettings": "Voltar para Configurações"
    }
  },
};

export default ptTranslations;