"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useI18n } from "@/components/i18n-provider"
import { useFirebase } from "@/components/firebase-provider"
import { collection, query, orderBy, getDocs, doc, updateDoc, addDoc, deleteDoc } from "firebase/firestore"
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
interface InventoryItem {
  id: string
  name: string
  category: string
  quantity: number
  unit: string
  minQuantity: number
  price: number
  createdAt: Date
  updatedAt: Date
}

export default function InventoryPage() {
  const { t } = useI18n() as { t: (key: string) => string }
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

  useEffect(() => {
    fetchInventory()
  }, [db])

  const fetchInventory = async () => {
    if (!db) return

    setLoading(true)
    try {
      const inventoryRef = collection(db, "inventory")
      const q = query(inventoryRef, orderBy("name"))
      const querySnapshot = await getDocs(q)

      const fetchedItems = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as InventoryItem[]

      setItems(fetchedItems)
    } catch (error) {
      console.error("Error fetching inventory:", error)
      toast({
        title: t("commons.error"),
        description: t("commons.error.fetchItems"),
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

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
      const newItemRef = await addDoc(collection(db, 'inventory'), {
        name: formData.name,
        category: formData.category,
        quantity: formData.quantity,
        unit: formData.unit,
        minQuantity: formData.minQuantity,
        price: formData.price,
        createdAt: new Date(),
        updatedAt: new Date()
      })

      const newItem: InventoryItem = {
        id: newItemRef.id,
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
      const itemRef = doc(db, 'inventory', selectedItem.id)
      await updateDoc(itemRef, {
        name: formData.name,
        category: formData.category,
        quantity: formData.quantity,
        unit: formData.unit,
        minQuantity: formData.minQuantity,
        price: formData.price,
        updatedAt: new Date()
      })

      setItems(prevItems => 
        prevItems.map(item => 
          item.id === selectedItem.id 
            ? { ...formData, id: selectedItem.id, updatedAt: new Date() } 
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

  const handleDeleteItem = async (itemId: string) => {
    if (!db) return

    try {
      const itemRef = doc(db, 'inventory', itemId)
      await deleteDoc(itemRef)

      setItems(prevItems => prevItems.filter(item => item.id !== itemId))

      toast({
        title: t("inventory.deleteItem.successToast"),
        variant: "default"
      })
    } catch (error) {
      toast({
        title: t("inventory.deleteItem.errorToast"),
        variant: "destructive"
      })
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
    const filteredItems = items.filter(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("inventory.headers.name")}</TableHead>
            <TableHead>{t("inventory.headers.category")}</TableHead>
            <TableHead>{t("inventory.headers.quantity")}</TableHead>
            <TableHead>{t("inventory.headers.unit")}</TableHead>
            <TableHead>{t("inventory.headers.minQuantity")}</TableHead>
            <TableHead>{t("inventory.headers.price")}</TableHead>
            <TableHead>{t("inventory.headers.status")}</TableHead>
            <TableHead className="text-right">{t("inventory.headers.actions")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredItems.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">{item.name}</TableCell>
              <TableCell>{item.category}</TableCell>
              <TableCell>{item.quantity}</TableCell>
              <TableCell>{item.unit}</TableCell>
              <TableCell>{item.minQuantity}</TableCell>
              <TableCell>{t(`commons.currency.${item.price}`)}</TableCell>
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
          ))}
        </TableBody>
      </Table>
    )
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
          {loading ? (
            <div className="text-center py-4">{t("commons.loading")}</div>
          ) : (
            renderInventoryTable()
          )}
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
