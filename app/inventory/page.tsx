"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useI18n } from "@/components/i18n-provider"
import { useFirebase } from "@/components/firebase-provider"
import { 
  collection, 
  query, 
  orderBy, 
  getDocs, 
  doc, 
  updateDoc, 
  addDoc, 
  deleteDoc, 
  where, 
  writeBatch
} from "firebase/firestore"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, AlertTriangle } from "lucide-react"

// Inventory item interface
export interface InventoryItem {
  id: string
  name: string
  description?: string
  category: string
  quantity: number
  unit: string
  minQuantity: number
  price: number
  createdAt: Date
  updatedAt: Date
}

export default function InventoryPage() {
  const { t } = useI18n() as { t: (key: string, options?: any) => string }
  const { db } = useFirebase()
  const { toast } = useToast()

  const [items, setItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)

  // Form state
  const [formData, setFormData] = useState<InventoryItem>({
    id: '',
    name: '',
    category: '',
    quantity: 0,
    unit: '',
    minQuantity: 0,
    price: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  })

  // Function to load initial menu items to Firestore if needed
  const loadInitialInventoryItems = async () => {
    if (!db) return;

    try {
      // Check if items already exist
      const inventoryRef = collection(db, 'inventory');
      const inventorySnapshot = await getDocs(inventoryRef);

      if (inventorySnapshot.empty) {
        // Comprehensive list of menu items organized by category
        const menuCategories = {
          entradas: [
            {
              id: "e1",
              name: "Bruschetta de Tomate e Manjericão",
              description: "Fatias de pão italiano grelhado com tomate, manjericão fresco e azeite extra virgem",
              price: 28.9,
            },
            {
              id: "e2",
              name: "Carpaccio de Filé Mignon",
              description: "Finas fatias de filé mignon com molho de alcaparras, mostarda Dijon e lascas de parmesão",
              price: 42.9,
            },
            {
              id: "e3",
              name: "Camarão Empanado",
              description: "Camarões empanados servidos com molho tártaro caseiro",
              price: 54.9,
            },
            {
              id: "e4",
              name: "Bolinho de Bacalhau",
              description: "Bolinhos de bacalhau crocantes por fora e macios por dentro (6 unidades)",
              price: 38.9,
            },
            {
              id: "e5",
              name: "Provolone à Milanesa",
              description: "Queijo provolone empanado e frito, servido com geleia de pimenta",
              price: 36.9,
            },
            {
              id: "e6",
              name: "Ceviche de Peixe Branco",
              description: "Cubos de peixe branco marinados em limão, cebola roxa, pimenta e coentro",
              price: 46.9,
            }
          ],
          pratosPrincipais: [
            {
              id: "p1",
              name: "Filé Mignon ao Molho Madeira",
              description: "Medalhão de filé mignon grelhado, coberto com molho madeira e acompanhado de batata rústica e legumes salteados",
              price: 89.9,
            },
            {
              id: "p2",
              name: "Risoto de Camarão",
              description: "Arroz arbóreo cremoso com camarões, tomate, ervilhas e finalizado com parmesão",
              price: 78.9,
            },
            {
              id: "p3",
              name: "Salmão Grelhado",
              description: "Filé de salmão grelhado com crosta de ervas, purê de batata doce e aspargos",
              price: 82.9,
            },
            {
              id: "p4",
              name: "Fettuccine ao Molho Alfredo",
              description: "Massa fresca com molho cremoso de queijo e cogumelos, finalizado com frango grelhado",
              price: 62.9,
            },
            {
              id: "p5",
              name: "Picanha na Brasa",
              description: "Picanha grelhada na brasa, acompanhada de arroz, feijão tropeiro e vinagrete",
              price: 92.9,
            },
            {
              id: "p6",
              name: "Moqueca de Peixe",
              description: "Tradicional moqueca de peixe com camarões, pimentões, tomate e leite de coco, servida com arroz branco e pirão",
              price: 86.9,
            }
          ],
          saladas: [
            {
              id: "s1",
              name: "Salada Caesar",
              description: "Alface romana, croutons, lascas de parmesão e molho Caesar caseiro. Opção com frango grelhado",
              price: 42.9,
            },
            {
              id: "s2",
              name: "Salada Caprese",
              description: "Tomate, mussarela de búfala, manjericão fresco e redução de balsâmico",
              price: 38.9,
            },
            {
              id: "s3",
              name: "Salada Mediterrânea",
              description: "Mix de folhas, pepino, tomate cereja, azeitonas, queijo feta e molho de iogurte com ervas",
              price: 44.9,
            },
            {
              id: "s4",
              name: "Salada de Quinoa",
              description: "Quinoa, abacate, tomate, pepino, ervilhas e molho de limão com azeite",
              price: 46.9,
            }
          ],
          bebidas: [
            {
              id: "b1",
              name: "Água Mineral (com/sem gás)",
              description: "Garrafa 500ml",
              price: 6.9,
            },
            {
              id: "b2",
              name: "Refrigerante",
              description: "Lata 350ml (Coca-Cola, Guaraná, Sprite, Fanta)",
              price: 7.9,
            },
            {
              id: "b3",
              name: "Suco Natural",
              description: "Copo 300ml (Laranja, Limão, Abacaxi, Maracujá)",
              price: 12.9,
            },
            {
              id: "b4",
              name: "Caipirinha",
              description: "Cachaça, limão, açúcar e gelo",
              price: 24.9,
            },
            {
              id: "b5",
              name: "Cerveja",
              description: "Long neck (Heineken, Stella Artois, Corona)",
              price: 14.9,
            },
            {
              id: "b6",
              name: "Vinho Tinto/Branco",
              description: "Taça 150ml",
              price: 28.9,
            },
            {
              id: "b7",
              name: "Café Espresso",
              description: "Xícara 50ml",
              price: 8.9,
            },
            {
              id: "b8",
              name: "Chá",
              description: "Xícara (Camomila, Hortelã, Frutas Vermelhas)",
              price: 9.9,
            }
          ],
          sobremesas: [
            {
              id: "d1",
              name: "Pudim de Leite Condensado",
              description: "Clássico pudim de leite condensado com calda de caramelo",
              price: 22.9,
            },
            {
              id: "d2",
              name: "Petit Gateau",
              description: "Bolo quente de chocolate com centro derretido, servido com sorvete de creme",
              price: 28.9,
            },
            {
              id: "d3",
              name: "Cheesecake de Frutas Vermelhas",
              description: "Torta cremosa de cream cheese com calda de frutas vermelhas",
              price: 26.9,
            },
            {
              id: "d4",
              name: "Tiramisu",
              description: "Sobremesa italiana com camadas de biscoito champagne, café e creme de mascarpone",
              price: 24.9,
            },
            {
              id: "d5",
              name: "Sorvete Artesanal",
              description: "Duas bolas de sorvete artesanal (Chocolate, Creme, Morango, Pistache)",
              price: 18.9,
            }
          ],
          porcoesExtras: [
            {
              id: "pe1",
              name: "Batata Frita",
              description: "Porção de batatas fritas crocantes",
              price: 32.9,
            },
            {
              id: "pe2",
              name: "Mandioca Frita",
              description: "Mandioca frita crocante com molho especial",
              price: 34.9,
            },
            {
              id: "pe3",
              name: "Polenta Frita",
              description: "Palitos de polenta frita com parmesão ralado",
              price: 30.9,
            },
            {
              id: "pe4",
              name: "Arroz Biro-Biro",
              description: "Arroz com bacon crocante, ovos e batata palha",
              price: 36.9,
            },
            {
              id: "pe5",
              name: "Farofa Especial",
              description: "Farofa caseira com bacon, ovos e temperos especiais",
              price: 24.9,
            },
            {
              id: "pe6",
              name: "Legumes Salteados",
              description: "Mix de legumes da estação salteados na manteiga",
              price: 28.9,
            }
          ]
        };

        // Use batch write for efficiency
        const batch = writeBatch(db);

        // Create category documents and their item subcollections
        for (const [categoryName, items] of Object.entries(menuCategories)) {
          // Create a document for each category
          const categoryDocRef = doc(inventoryRef, categoryName);
          batch.set(categoryDocRef, { 
            name: categoryName, 
            createdAt: new Date(),
            updatedAt: new Date()
          });

          // Add items to the category's subcollection
          items.forEach(item => {
            const itemRef = doc(collection(categoryDocRef, 'items'), item.id);
            batch.set(itemRef, {
              ...item,
              quantity: 10, // Default initial quantity
              unit: 'unidade',
              minQuantity: 5,
              createdAt: new Date(),
              updatedAt: new Date()
            });
          });
        }

        // Commit the batch
        await batch.commit();

        toast({
          title: t("inventory.initialLoad.success"),
          description: t("inventory.initialLoad.description", { count: Object.values(menuCategories).flat().length })
        });
      }
    } catch (error) {
      console.error("Error loading initial inventory items:", error);
      toast({
        title: t("inventory.initialLoad.error"),
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    }
  };

  // Fetch inventory items from Firestore
  const fetchInventory = async () => {
    if (!db) return;

    try {
      // First, attempt to load initial items if needed
      await loadInitialInventoryItems();

      // Then fetch all inventory items
      const inventoryRef = collection(db, 'inventory');
      const inventorySnapshot = await getDocs(inventoryRef);

      const inventoryData = await Promise.all(inventorySnapshot.docs.map(async (categoryDoc) => {
        const categoryData = categoryDoc.data();
        const itemsRef = collection(categoryDoc.ref, 'items');
        const itemsSnapshot = await getDocs(itemsRef);
        const itemsData = itemsSnapshot.docs.map((itemDoc) => {
          const itemData = itemDoc.data();
          return {
            id: itemDoc.id,
            name: itemData.name || '',
            category: categoryData.name || 'uncategorized',
            quantity: itemData.quantity || 0,
            unit: itemData.unit || 'unidade',
            minQuantity: itemData.minQuantity || 5,
            price: itemData.price || 0,
            createdAt: itemData.createdAt?.toDate() || new Date(),
            updatedAt: itemData.updatedAt?.toDate() || new Date()
          } as InventoryItem;
        });

        return itemsData;
      }));

      setItems(inventoryData.flat());
      setLoading(false);
    } catch (error) {
      console.error("Error fetching inventory:", error);
      toast({
        title: t("inventory.errors.fetchItems"),
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
      setLoading(false);
    }
  };

  // Fetch inventory when component mounts or db changes
  useEffect(() => {
    fetchInventory();
  }, [db]);

  // Filter items based on search query
  const filteredItems = searchQuery 
    ? items.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : items;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prevData => ({
      ...prevData,
      [name]: name === 'quantity' || name === 'minQuantity' || name === 'price' 
        ? Number(value) 
        : value
    }))
  }

  const handleAddItem = async () => {
    if (!db) return

    try {
      const categoryRef = doc(db, 'inventory', formData.category);
      const itemRef = await addDoc(collection(categoryRef, 'items'), {
        name: formData.name,
        description: formData.description,
        quantity: formData.quantity,
        unit: formData.unit,
        minQuantity: formData.minQuantity,
        price: formData.price,
        createdAt: new Date(),
        updatedAt: new Date()
      })

      const newItem: InventoryItem = {
        id: itemRef.id,
        name: formData.name,
        category: formData.category,
        quantity: formData.quantity,
        unit: formData.unit,
        minQuantity: formData.minQuantity,
        price: formData.price,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      setItems(prevItems => [...prevItems, newItem])
      setIsAddDialogOpen(false)
      setFormData({
        id: '',
        name: '',
        category: '',
        quantity: 0,
        unit: '',
        minQuantity: 0,
        price: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      })

      toast({
        title: t(`inventory.addItem.successToast.${formData.name}`),
        variant: "default"
      })
    } catch (error) {
      toast({
        title: t("inventory.addItem.errorToast"),
        variant: "destructive"
      })
    }
  }

  const handleEditItem = async () => {
    if (!db || !selectedItem) return

    try {
      const categoryRef = doc(db, 'inventory', selectedItem.category);
      const itemRef = doc(collection(categoryRef, 'items'), selectedItem.id);
      await updateDoc(itemRef, {
        name: formData.name,
        description: formData.description,
        quantity: formData.quantity,
        unit: formData.unit,
        minQuantity: formData.minQuantity,
        price: formData.price,
        updatedAt: new Date()
      })

      setItems(prevItems => 
        prevItems.map(item => 
          item.id === selectedItem.id 
            ? { ...formData, id: selectedItem.id, category: selectedItem.category, updatedAt: new Date() } 
            : item
        )
      )

      setIsEditDialogOpen(false)
      setSelectedItem(null)
      setFormData({
        id: '',
        name: '',
        category: '',
        quantity: 0,
        unit: '',
        minQuantity: 0,
        price: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      })

      toast({
        title: t(`inventory.addItem.successToast.${formData.name}`),
        variant: "default"
      })
    } catch (error) {
      toast({
        title: t("inventory.editItem.errorToast"),
        variant: "destructive"
      })
    }
  }

  const handleDeleteItem = (itemId: string) => {
    const item = items.find(item => item.id === itemId);
    if (!item) return;

    const confirmDelete = confirm(
      t("inventory.deleteItem.description", { 
        itemName: item.name 
      })
    );
    
    if (confirmDelete) {
      deleteInventoryItem(itemId);
    }
  }

  const deleteInventoryItem = async (itemId: string) => {
    if (!db) return;

    try {
      // Find the item's category
      const foundItem = items.find(item => item.id === itemId);
      
      // If item not found, throw an error
      if (!foundItem) {
        toast({
          title: t("inventory.errors.itemNotFound"),
          description: t("inventory.errors.itemNotFoundDescription", { itemId }),
          variant: "destructive"
        });
        return;
      }

      // Reference to the specific item document
      const categoryRef = doc(db, 'inventory', foundItem.category);
      const itemDocRef = doc(collection(categoryRef, 'items'), itemId);

      // Delete the document
      await deleteDoc(itemDocRef);

      // Update local state by filtering out the deleted item
      setItems(prevItems => prevItems.filter(item => item.id !== itemId));

      toast({
        title: t("inventory.deleteItem.success"),
        description: t("inventory.deleteItem.description", { itemName: foundItem.name })
      });
    } catch (error) {
      console.error("Error deleting inventory item:", error);
      toast({
        title: t("inventory.errors.deleteItem"),
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    }
  }

  const openEditDialog = (item: InventoryItem) => {
    setSelectedItem(item)
    setFormData({
      id: item.id,
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      unit: item.unit,
      minQuantity: item.minQuantity,
      price: item.price,
      createdAt: item.createdAt,
      updatedAt: new Date()
    })
    setIsEditDialogOpen(true)
  }

  const renderLowStockWarning = () => {
    const lowStockItems = items.filter(item => item.quantity <= item.minQuantity)
    
    if (lowStockItems.length === 0) return null

    return (
      <Card className="mb-4">
        <CardContent className="pt-4">
          <div className="flex items-center">
            <AlertTriangle className="absolute left-2.5 top-2.5 h-5 w-5 text-amber-500 mr-2" />
            <span className="font-medium text-amber-800">
              {t(`inventory.lowStockWarning.${lowStockItems.length}`)}
            </span>
          </div>
        </CardContent>
      </Card>
    )
  }

  const renderInventoryTable = () => {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("inventory.formLabels.name")}</TableHead>
            <TableHead>{t("inventory.formLabels.category")}</TableHead>
            <TableHead>{t("inventory.formLabels.quantity")}</TableHead>
            <TableHead>{t("inventory.formLabels.unit")}</TableHead>
            <TableHead>{t("inventory.formLabels.minQuantity")}</TableHead>
            <TableHead>{t("inventory.formLabels.price")}</TableHead>
            <TableHead>{t("inventory.formLabels.status")}</TableHead>
            <TableHead className="text-right">{t("inventory.formLabels.actions")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredItems.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center">
                {searchQuery 
                  ? t("inventory.noMatchingItems") 
                  : t("inventory.noItems")
                }
              </TableCell>
            </TableRow>
          ) : (
            filteredItems.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>{t(`inventory.categories.${item.category.toLowerCase()}`)}</TableCell>
                <TableCell>{item.quantity}</TableCell>
                <TableCell>{item.unit}</TableCell>
                <TableCell>{item.minQuantity}</TableCell>
                <TableCell>{item.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</TableCell>
                <TableCell>
                  {item.quantity <= item.minQuantity ? (
                    <Badge className="bg-red-100 text-red-800 border-red-200">
                      {t("inventory.status.lowStock")}
                    </Badge>
                  ) : (
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      {t("inventory.status.inStock")}
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => openEditDialog(item)}
                    >
                      {t("inventory.actions.edit")}
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={() => handleDeleteItem(item.id)}
                    >
                      {t("inventory.actions.delete")}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    )
  }

  // Render loading state if items are still loading
  if (loading) {
    return <div>{t("commons.loading")}</div>
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t("inventory.pageTitle")}</h1>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          {t("inventory.addItem.title")}
        </Button>
      </div>

      {renderLowStockWarning()}

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder={t("inventory.searchPlaceholder")}
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("inventory.pageTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          {renderInventoryTable()}
        </CardContent>
      </Card>

      {/* Add Item Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto no-scrollbar sm:max-w-[380px] p-6">
          <DialogHeader className="mb-4 text-center">
            <DialogTitle className="text-lg">{t("inventory.addItem.title")}</DialogTitle>
            <DialogDescription className="text-sm">{t("inventory.addItem.description")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm">{t("inventory.addItem.namePlaceholder")}</Label>
                <Input 
                  id="name" 
                  name="name" 
                  className="w-full max-w-[300px] self-center"
                  placeholder={t("inventory.addItem.namePlaceholder")}
                  value={formData.name} 
                  onChange={handleInputChange} 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category" className="text-sm">{t("inventory.addItem.categoryPlaceholder")}</Label>
                <Input 
                  id="category" 
                  name="category" 
                  className="w-full max-w-[300px] self-center"
                  placeholder={t("inventory.addItem.categoryPlaceholder")}
                  value={formData.category} 
                  onChange={handleInputChange} 
                  required 
                />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3">
              <div className="space-y-2">
                <Label htmlFor="quantity" className="text-sm">{t("inventory.addItem.quantityPlaceholder")}</Label>
                <Input
                  id="quantity"
                  name="quantity"
                  type="number"
                  className="w-full max-w-[300px] self-center"
                  placeholder={t("inventory.addItem.quantityPlaceholder")}
                  value={formData.quantity}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit" className="text-sm">{t("inventory.addItem.unitPlaceholder")}</Label>
                <Input 
                  id="unit" 
                  name="unit" 
                  className="w-full max-w-[300px] self-center"
                  placeholder={t("inventory.addItem.unitPlaceholder")}
                  value={formData.unit} 
                  onChange={handleInputChange} 
                  required 
                />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3">
              <div className="space-y-2">
                <Label htmlFor="minQuantity" className="text-sm">{t("inventory.addItem.minQuantityPlaceholder")}</Label>
                <Input
                  id="minQuantity"
                  name="minQuantity"
                  type="number"
                  className="w-full max-w-[300px] self-center"
                  placeholder={t("inventory.addItem.minQuantityPlaceholder")}
                  value={formData.minQuantity}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price" className="text-sm">{t("inventory.addItem.pricePlaceholder")}</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  className="w-full max-w-[300px] self-center"
                  placeholder={t("inventory.addItem.pricePlaceholder")}
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
          </div>
          <DialogFooter className="mt-6 flex justify-center space-x-2">
            <Button 
              variant="outline" 
              className="w-[120px]"
              onClick={() => setIsAddDialogOpen(false)}
            >
              {t("inventory.addItem.cancel")}
            </Button>
            <Button 
              className="w-[120px]"
              onClick={handleAddItem}
            >
              {t("inventory.addItem.title")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Item Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto no-scrollbar sm:max-w-[380px] p-6">
          <DialogHeader className="mb-4 text-center">
            <DialogTitle className="text-lg">{t("inventory.editItem.title")}</DialogTitle>
            <DialogDescription className="text-sm">{t("inventory.editItem.description")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3">
              <div className="space-y-2">
                <Label htmlFor="edit-name" className="text-sm">{t("inventory.addItem.namePlaceholder")}</Label>
                <Input 
                  id="edit-name" 
                  name="name" 
                  className="w-full max-w-[300px] self-center"
                  placeholder={t("inventory.addItem.namePlaceholder")}
                  value={formData.name} 
                  onChange={handleInputChange} 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-category" className="text-sm">{t("inventory.addItem.categoryPlaceholder")}</Label>
                <Input
                  id="edit-category"
                  name="category"
                  className="w-full max-w-[300px] self-center"
                  placeholder={t("inventory.addItem.categoryPlaceholder")}
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3">
              <div className="space-y-2">
                <Label htmlFor="edit-quantity" className="text-sm">{t("inventory.addItem.quantityPlaceholder")}</Label>
                <Input
                  id="edit-quantity"
                  name="quantity"
                  type="number"
                  className="w-full max-w-[300px] self-center"
                  placeholder={t("inventory.addItem.quantityPlaceholder")}
                  value={formData.quantity}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-unit" className="text-sm">{t("inventory.addItem.unitPlaceholder")}</Label>
                <Input 
                  id="edit-unit" 
                  name="unit" 
                  className="w-full max-w-[300px] self-center"
                  placeholder={t("inventory.addItem.unitPlaceholder")}
                  value={formData.unit} 
                  onChange={handleInputChange} 
                  required 
                />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3">
              <div className="space-y-2">
                <Label htmlFor="edit-minQuantity" className="text-sm">{t("inventory.addItem.minQuantityPlaceholder")}</Label>
                <Input
                  id="edit-minQuantity"
                  name="minQuantity"
                  type="number"
                  className="w-full max-w-[300px] self-center"
                  placeholder={t("inventory.addItem.minQuantityPlaceholder")}
                  value={formData.minQuantity}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-price" className="text-sm">{t("inventory.addItem.pricePlaceholder")}</Label>
                <Input
                  id="edit-price"
                  name="price"
                  type="number"
                  step="0.01"
                  className="w-full max-w-[300px] self-center"
                  placeholder={t("inventory.addItem.pricePlaceholder")}
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
          </div>
          <DialogFooter className="mt-6 flex justify-center space-x-2">
            <Button 
              variant="outline" 
              className="w-[120px]"
              onClick={() => setIsEditDialogOpen(false)}
            >
              {t("inventory.editItem.cancel")}
            </Button>
            <Button 
              className="w-[120px]"
              onClick={handleEditItem}
            >
              {t("inventory.editItem.title")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
