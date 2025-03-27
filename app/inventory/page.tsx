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
  createdAt: any
  updatedAt: any
}

export default function InventoryPage() {
  const { t } = useI18n()
  const { db } = useFirebase()
  const { toast } = useToast()
  const [items, setItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    quantity: 0,
    unit: "",
    minQuantity: 0,
    price: 0,
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
        title: "Error",
        description: "Failed to fetch inventory items",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: name === "quantity" || name === "minQuantity" || name === "price" ? Number.parseFloat(value) : value,
    })
  }

  const handleAddItem = async () => {
    if (!db) return

    try {
      const newItem = {
        ...formData,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const docRef = await addDoc(collection(db, "inventory"), newItem)

      // Update local state
      setItems([
        ...items,
        {
          id: docRef.id,
          ...newItem,
        } as InventoryItem,
      ])

      toast({
        title: "Item Added",
        description: `${formData.name} has been added to inventory`,
      })

      // Reset form and close dialog
      setFormData({
        name: "",
        category: "",
        quantity: 0,
        unit: "",
        minQuantity: 0,
        price: 0,
      })
      setIsAddDialogOpen(false)
    } catch (error) {
      console.error("Error adding inventory item:", error)
      toast({
        title: "Error",
        description: "Failed to add inventory item",
        variant: "destructive",
      })
    }
  }

  const handleEditItem = async () => {
    if (!db || !selectedItem) return

    try {
      const itemRef = doc(db, "inventory", selectedItem.id)
      await updateDoc(itemRef, {
        ...formData,
        updatedAt: new Date(),
      })

      // Update local state
      setItems(
        items.map((item) => (item.id === selectedItem.id ? { ...item, ...formData, updatedAt: new Date() } : item)),
      )

      toast({
        title: "Item Updated",
        description: `${formData.name} has been updated`,
      })

      setIsEditDialogOpen(false)
    } catch (error) {
      console.error("Error updating inventory item:", error)
      toast({
        title: "Error",
        description: "Failed to update inventory item",
        variant: "destructive",
      })
    }
  }

  const handleDeleteItem = async (id: string) => {
    if (!db) return

    try {
      const itemRef = doc(db, "inventory", id)
      await deleteDoc(itemRef)

      // Update local state
      setItems(items.filter((item) => item.id !== id))

      toast({
        title: "Item Deleted",
        description: "Inventory item has been deleted",
      })
    } catch (error) {
      console.error("Error deleting inventory item:", error)
      toast({
        title: "Error",
        description: "Failed to delete inventory item",
        variant: "destructive",
      })
    }
  }

  const openEditDialog = (item: InventoryItem) => {
    setSelectedItem(item)
    setFormData({
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      unit: item.unit,
      minQuantity: item.minQuantity,
      price: item.price,
    })
    setIsEditDialogOpen(true)
  }

  const filteredItems = items.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const lowStockItems = filteredItems.filter((item) => item.quantity <= item.minQuantity)

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t("inventory")}</h1>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          {t("addItem")}
        </Button>
      </div>

      {lowStockItems.length > 0 && (
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="p-4">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
              <span className="font-medium text-amber-800">
                {lowStockItems.length} {lowStockItems.length === 1 ? "item" : "items"} with low stock
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search inventory..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("inventory")}</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Loading...</div>
          ) : filteredItems.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Min. Quantity</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
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
                    <TableCell>${item.price.toFixed(2)}</TableCell>
                    <TableCell>
                      {item.quantity <= item.minQuantity ? (
                        <Badge className="bg-red-100 text-red-800 border-red-200">Low Stock</Badge>
                      ) : (
                        <Badge className="bg-green-100 text-green-800 border-green-200">In Stock</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => openEditDialog(item)}>
                          Edit
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDeleteItem(item.id)}>
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-4">No inventory items found</div>
          )}
        </CardContent>
      </Card>

      {/* Add Item Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("addItem")}</DialogTitle>
            <DialogDescription>Add a new item to your inventory</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input id="category" name="category" value={formData.category} onChange={handleInputChange} required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  name="quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit">Unit</Label>
                <Input id="unit" name="unit" value={formData.unit} onChange={handleInputChange} required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minQuantity">Minimum Quantity</Label>
                <Input
                  id="minQuantity"
                  name="minQuantity"
                  type="number"
                  value={formData.minQuantity}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Price</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddItem}>Add Item</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Item Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Item</DialogTitle>
            <DialogDescription>Update inventory item details</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Name</Label>
                <Input id="edit-name" name="name" value={formData.name} onChange={handleInputChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-category">Category</Label>
                <Input
                  id="edit-category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-quantity">Quantity</Label>
                <Input
                  id="edit-quantity"
                  name="quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-unit">Unit</Label>
                <Input id="edit-unit" name="unit" value={formData.unit} onChange={handleInputChange} required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-minQuantity">Minimum Quantity</Label>
                <Input
                  id="edit-minQuantity"
                  name="minQuantity"
                  type="number"
                  value={formData.minQuantity}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-price">Price</Label>
                <Input
                  id="edit-price"
                  name="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditItem}>Update Item</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

