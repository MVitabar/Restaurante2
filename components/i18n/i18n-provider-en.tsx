export const enTranslations = {
  // Commons Translations
  "commons": {
    "button": {
      "add": "Add",
      "edit": "Edit",
      "delete": "Delete",
      "cancel": "Cancel",
      "save": "Save",
      "submit": "Submit"
    },
    "status": {
      "lowStock": "Low Stock",
      "inStock": "In Stock"
    },
    "table": {
      "headers": {
        "name": "Name",
        "category": "Category",
        "quantity": "Quantity",
        "unit": "Unit",
        "minQuantity": "Min. Quantity",
        "price": "Price",
        "status": "Status",
        "actions": "Actions"
      }
    },
    "error": "Error",
    "loading": "Loading...",
    "noItemsFound": "No items found",
    "searchPlaceholder": "Search...",
    "confirmDelete": "Are you sure you want to delete this item? This action cannot be undone."
  },

  // Inventory Translations
  "inventory": {
    "pageTitle": "Inventory Management",
    "searchPlaceholder": "Search inventory...",
    "noItemsFound": "No inventory items found",
    "headers": {
      "name": "Name",
      "category": "Category",
      "quantity": "Quantity",
      "unit": "Unit",
      "minQuantity": "Min Quantity",
      "price": "Price",
      "actions": "Actions"
    },
    "addItem": {
      "title": "Add Item",
      "description": "Add a new item to your inventory",
      "successToast": "{{itemName}} has been added to inventory",
      "errorToast": "Failed to add inventory item"
    },
    "editItem": {
      "title": "Edit Item",
      "description": "Update inventory item details",
      "successToast": "{{itemName}} has been updated",
      "errorToast": "Failed to update inventory item"
    },
    "deleteItem": {
      "successToast": "Inventory item has been deleted",
      "errorToast": "Failed to delete inventory item"
    },
    "formLabels": {
      "name": "Name",
      "category": "Category",
      "quantity": "Quantity",
      "unit": "Unit",
      "minQuantity": "Minimum Quantity",
      "price": "Price"
    },
    "buttons": {
      "addItem": "Add Item",
      "editItem": "Edit Item",
      "updateItem": "Update Item",
      "cancel": "Cancel"
    },
    "errors": {
      "fetchItems": "Failed to fetch inventory items"
    }
  },

  // Inventory Page Translations
  "inventoryPage": {
    "inventory": "Inventory",
    "addItem": "Add Item",
    "edit": "Edit",
    "delete": "Delete",
    "cancel": "Cancel"
  },

  // Inventory Table Headers
  "tableHeaders": {
    "name": "Name",
    "category": "Category",
    "quantity": "Quantity",
    "unit": "Unit",
    "minQuantity": "Min. Quantity",
    "price": "Price",
    "status": "Status",
    "actions": "Actions"
  },

  // Inventory Item Status
  "inventoryItemStatus": {
    "lowStock": {
      "title": "Low Stock",
      "description": "Item is running low and needs restocking",
      "actionRequired": "Restock soon"
    },
    "inStock": {
      "title": "In Stock",
      "description": "Sufficient quantity available",
      "status": "Good"
    },
    "outOfStock": {
      "title": "Out of Stock",
      "description": "Item is currently unavailable",
      "actionRequired": "Order immediately"
    }
  },

  // Inventory Search
  "inventorySearch": {
    "searchPlaceholder": "Search inventory...",
    "filters": {
      "category": "Filter by Category",
      "status": "Filter by Status",
      "lowStock": "Low Stock Items",
      "allItems": "All Items"
    },
    "sorting": {
      "name": "Sort by Name",
      "quantity": "Sort by Quantity",
      "price": "Sort by Price"
    }
  },

  // Inventory Dialogs
  "inventoryDialogs": {
    "addItem": {
      "title": "Add New Inventory Item",
      "description": "Enter details for the new inventory item",
      "successMessage": "Item successfully added to inventory",
      "errorMessage": "Failed to add item to inventory"
    },
    "editItem": {
      "title": "Edit Inventory Item",
      "description": "Update the details of the inventory item",
      "successMessage": "Item details updated successfully",
      "errorMessage": "Failed to update item details"
    },
    "deleteItem": {
      "title": "Delete Inventory Item",
      "description": "Are you sure you want to delete this item?",
      "confirmButton": "Yes, Delete",
      "cancelButton": "Cancel",
      "successMessage": "Item deleted successfully",
      "errorMessage": "Failed to delete item"
    }
  },

  // Inventory Validation Messages
  "inventoryValidation": {
    "name": {
      "required": "Item name is required",
      "minLength": "Item name must be at least 2 characters",
      "maxLength": "Item name cannot exceed 50 characters"
    },
    "category": {
      "required": "Category is required",
      "invalid": "Invalid category selected"
    },
    "quantity": {
      "required": "Quantity is required",
      "positive": "Quantity must be a positive number",
      "max": "Quantity cannot exceed 10000"
    },
    "unit": {
      "required": "Unit of measurement is required"
    },
    "minQuantity": {
      "required": "Minimum quantity is required",
      "positive": "Minimum quantity must be a positive number"
    },
    "price": {
      "required": "Price is required",
      "positive": "Price must be a positive number",
      "max": "Price cannot exceed 100000"
    }
  },

  // Inventory Reporting and Analytics
  "inventoryReporting": {
    "overview": {
      "title": "Inventory Overview",
      "totalItems": "Total Items",
      "totalValue": "Total Inventory Value",
      "lowStockItems": "Low Stock Items",
      "outOfStockItems": "Out of Stock Items"
    },
    "stockTrends": {
      "title": "Stock Trends",
      "lastUpdated": "Last Updated",
      "consumptionRate": "Consumption Rate",
      "restockFrequency": "Restock Frequency"
    },
    "costAnalysis": {
      "title": "Cost Analysis",
      "averageItemCost": "Average Item Cost",
      "highestValueItems": "Highest Value Items",
      "lowestValueItems": "Lowest Value Items"
    }
  },

  // Inventory Alerts and Notifications
  "inventoryAlerts": {
    "lowStock": {
      "title": "Low Stock Alert",
      "description": "One or more items are running low",
      "actionButton": "View Low Stock Items"
    },
    "outOfStock": {
      "title": "Out of Stock Alert",
      "description": "Critical items are currently unavailable",
      "actionButton": "Restock Immediately"
    },
    "expirationSoon": {
      "title": "Expiration Warning",
      "description": "Some items are approaching their expiration date",
      "actionButton": "Review Expiring Items"
    }
  },

  // Inventory Import/Export
  "inventoryImportExport": {
    "import": {
      "title": "Import Inventory",
      "description": "Upload a CSV or Excel file to update inventory",
      "supportedFormats": "Supported Formats: CSV, XLSX",
      "instructions": "Ensure your file matches the required template",
      "templateDownload": "Download Template",
      "successMessage": "Inventory successfully imported",
      "errorMessage": "Failed to import inventory"
    },
    "export": {
      "title": "Export Inventory",
      "description": "Download current inventory data",
      "formats": {
        "csv": "Export as CSV",
        "xlsx": "Export as Excel",
        "pdf": "Export as PDF"
      },
      "successMessage": "Inventory exported successfully",
      "errorMessage": "Failed to export inventory"
    }
  },

  // Inventory Bulk Actions
  "inventoryBulkActions": {
    "title": "Bulk Actions",
    "selectAction": "Select Bulk Action",
    "actions": {
      "updatePrice": "Update Prices",
      "updateQuantity": "Adjust Quantities",
      "changeCategory": "Change Category",
      "markDiscontinued": "Mark as Discontinued"
    },
    "confirmation": {
      "title": "Confirm Bulk Action",
      "description": "Are you sure you want to apply this action to selected items?",
      "successMessage": "Bulk action completed successfully",
      "errorMessage": "Failed to complete bulk action"
    }
  },

  // Settings
  "settings": {
    "profile": "Profile",
    "profileSettingsDescription": "Manage your personal information and account settings",
    "notifications": "Notifications",
    "notificationSettingsDescription": "Configure how you receive notifications",
    "language": "Language",
    "languageSettingsDescription": "Choose your preferred language",
    "appearance": "Appearance",
    "appearanceSettingsDescription": "Customize the look and feel of the application",
    "tableMaps": "Table Maps",
    "tableMapSettingsDescription": "Create and manage restaurant table layouts",
    "system": "System",
    "systemSettingsDescription": "Configure system-wide settings"
  },

  // Profile
  "profile": {
    "username": "Username",
    "email": "Email",
    "phoneNumber": "Phone Number",
    "position": "Position",
    "positionPlaceholder": "e.g. Head Waiter, Bartender",
    "role": "Role",
    "selectRole": "Select a role",
    "uploadPhoto": "Upload Photo",
    "emailCannotBeChanged": "Email cannot be changed",
    "saveChanges": "Save Changes",
    "saving": "Saving...",
    "profileUpdated": "Profile Updated",
    "profileUpdateSuccess": "Your profile has been updated successfully",
    "profileUpdateFailed": "Profile Update Failed",
    "profileUpdateError": "There was an error updating your profile"
  },

  // Login Page Translations
  "loginPage": {
    "login": "Login",
    "emailRequired": "Email is required",
    "passwordRequired": "Password is required",
    "forgotPassword": "Forgot Password",
    "register": "Register"
  },

  // Registration Page Translations
  "registrationPage": {
    "createAccountDescription": "Create a new account to access the restaurant management system",
    "usernameRequired": "Username is required",
    "usernameMinLength": "Username must be at least 3 characters long",
    "confirmPassword": "Confirm Password",
    "passwordsDoNotMatch": "Passwords do not match",
    "passwordRequirements": "Password must include uppercase, lowercase, and number",
    "passwordMinLength": "Password must be at least 8 characters long",
    "acceptTerms": "I accept the Terms and Conditions",
    "acceptTermsRequired": "You must accept the terms and conditions",
    "registrationSuccessful": "Registration Successful",
    "accountCreated": "Your account has been created successfully",
    "registrationFailed": "Registration Failed",
    "emailAlreadyInUse": "Email is already in use",
    "passwordTooWeak": "Password is too weak"
  },

  // Forgot Password Page
  "forgotPasswordPage": {
    "pageTitle": "Forgot Password",
    "emailInstructions": {
      "initial": "Enter your email to receive password reset instructions",
      "sent": "Check your email for password reset instructions"
    },
    "emailSentMessage": {
      "main": "We've sent password reset instructions to {{email}}",
      "spam": "If you don't see the email, check your spam folder"
    },
    "buttons": {
      "sendInstructions": "Send Reset Instructions",
      "tryAnotherEmail": "Try another email",
      "sending": "Sending..."
    },
    "errors": {
      "emailRequired": "Email is required",
      "authServiceUnavailable": "Authentication service not available",
      "userNotFound": "No account found with this email address",
      "generic": "Failed to send password reset email"
    },
    "loginReminder": {
      "text": "Remember your password?",
      "link": "Login"
    }
  },

  // Dashboard Translations
  "dashboard": {
    "title": "Main Dashboard",
    "dashboard": "Dashboard",
    "salesOverview": "Sales Overview",
    "topSellingItems": "Top Selling Items",
    "stockLevel": "Inventory Level",
    "recentOrders": "Recent Orders",
    "salesTrend": "Sales Trend",
    "dailySalesOverview": "Daily sales overview",
    "mostPopularItems": "Most popular items",
    "inventoryStatus": "Inventory status",
    "tableNumber": "Table",
    "noRecentOrders": "No recent orders found",
    "comparedToLastMonth": "+{{percentage}}% from last month",
    "lowStockItems": "{{count}} items with low stock",
    "categoriesSales": "Sales by category",
    "salesDataPeriod": "Sales data for the current period",
    "categories": "Categories"
  },

  // Orders Page Translations
  "ordersPage": {
    "orders": "Orders",
    "newOrder": "New Order",
    "orderStatus": {
      "pending": "Pending",
      "preparing": "Preparing",
      "ready": "Ready",
      "delivered": "Delivered",
      "cancelled": "Cancelled"
    },
    "table": {
      "id": "ID",
      "table": "Table",
      "waiter": "Waiter",
      "items": "Items",
      "status": "Status",
      "total": "Total",
      "actions": "Actions"
    },
    "action": {
      "updateStatus": "Update Status",
      "delete": "Delete Order"
    },
    "statusDialog": {
      "title": "Update Order Status",
      "description": "Select the new status for the order"
    },
    "search": {
      "placeholder": "Search orders..."
    },
    "filter": {
      "allStatuses": "All Statuses"
    },
    "error": {
      "fetchFailed": "Failed to load orders",
      "updateStatusFailed": "Failed to update order status",
      "deleteFailed": "Failed to delete order"
    },
    "success": {
      "statusUpdated": "Order status updated",
      "orderDeleted": "Order deleted"
    }
  },

  // Firebase Test page
  "firebaseTestPage": {
    "pageTitle": "Firebase Configuration Test",
    "pageDescription": "Test your Firebase configuration to ensure everything is working correctly",
    "firebaseInitialized": "Firebase Initialized",
    "firebaseApp": "Firebase App",
    "firebaseAuth": "Firebase Auth",
    "firebaseFirestore": "Firebase Firestore",
    "runTests": "Run Tests",
    "configStatus": "Firebase Config",
    "apiKey": "API Key",
    "authDomain": "Auth Domain",
    "projectId": "Project ID",
    "storageBucket": "Storage Bucket",
    "messagingSenderId": "Messaging Sender ID",
    "appId": "App ID",
    "set": "✓ Set",
    "missing": "✗ Missing"
  }
};

export default enTranslations;