"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useI18n } from "@/components/i18n-provider"
import { useFirebase } from "@/components/firebase-provider"
import { useAuth } from "@/components/auth-provider"
import { collection, query, orderBy, getDocs, addDoc, serverTimestamp } from "firebase/firestore"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Minus, Plus, Trash, ArrowLeft } from "lucide-react"

// Inventory item interface
interface InventoryItem {
  id: string
  name: string
  category: string
  quantity: number
  unit: string
  price: number
}

// Order item interface
interface OrderItem {
  id: string
  name: string
  quantity: number
  price: number
  notes: string
}

export default function NewOrderPage() {
  const { t } = useI18n()
  const { db } = useFirebase()
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [tableNumber, setTableNumber] = useState("")
  const [selectedItemId, setSelectedItemId] = useState("")
  const [quantity, setQuantity] = useState(1)
  const [notes, setNotes] = useState("")
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])

  useEffect(() => {
    fetchInventoryItems()
  }, [db])

  const fetchInventoryItems = async () => {
    if (!db) return

    setLoading(true)
    try {
      const inventoryRef = collection(db, "inventory")
      const q = query(inventoryRef, orderBy("name"))
      const querySnapshot = await getDocs(q)

      const items = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as InventoryItem[]

      setInventoryItems(items)
    } catch (error) {
      console.error("Error fetching inventory items:", error)
      toast({
        title: t("newOrderPage.error.title"),
        description: t("newOrderPage.error.noItem"),
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddItem = () => {
    if (!selectedItemId) {
      toast({
        title: t("newOrderPage.error.title"),
        description: t("newOrderPage.error.noItem"),
        variant: "destructive",
      })
      return
    }

    const inventoryItem = inventoryItems.find((item) => item.id === selectedItemId)
    if (!inventoryItem) return

    const newItem: OrderItem = {
      id: inventoryItem.id,
      name: inventoryItem.name,
      quantity,
      price: inventoryItem.price,
      notes,
    }

    // Check if item already exists in order
    const existingItemIndex = orderItems.findIndex((item) => item.id === selectedItemId)

    if (existingItemIndex >= 0) {
      // Update existing item
      const updatedItems = [...orderItems]
      updatedItems[existingItemIndex].quantity += quantity
      updatedItems[existingItemIndex].notes = notes || updatedItems[existingItemIndex].notes
      setOrderItems(updatedItems)
    } else {
      // Add new item
      setOrderItems([...orderItems, newItem])
    }

    // Reset form
    setSelectedItemId("")
    setQuantity(1)
    setNotes("")
  }

  const handleRemoveItem = (index: number) => {
    const updatedItems = [...orderItems]
    updatedItems.splice(index, 1)
    setOrderItems(updatedItems)
  }

  const handleQuantityChange = (index: number, newQuantity: number) => {
    if (newQuantity < 1) return

    const updatedItems = [...orderItems]
    updatedItems[index].quantity = newQuantity
    setOrderItems(updatedItems)
  }

  const calculateTotal = () => {
    return orderItems.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  const handleSubmitOrder = async () => {
    if (!db || !user) return

    if (!tableNumber) {
      toast({
        title: t("newOrderPage.error.title"),
        description: t("newOrderPage.error.noTable"),
        variant: "destructive",
      })
      return
    }

    if (orderItems.length === 0) {
      toast({
        title: t("newOrderPage.error.title"),
        description: t("newOrderPage.error.noItems"),
        variant: "destructive",
      })
      return
    }

    try {
      const newOrder = {
        table: Number.parseInt(tableNumber),
        waiter: user.displayName || user.email,
        items: orderItems,
        total: calculateTotal(),
        status: "pending",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }

      await addDoc(collection(db, "orders"), newOrder)

      toast({
        title: t("newOrderPage.success.orderCreated"),
        description: t("newOrderPage.success.orderCreatedDescription", { tableNumber }),
      })

      router.push("/orders")
    } catch (error) {
      console.error("Error creating order:", error)
      toast({
        title: t("newOrderPage.error.title"),
        description: t("newOrderPage.error.orderCreationFailed"),
        variant: "destructive",
      })
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold">{t("newOrderPage.title")}</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("newOrderPage.orderDetails")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>{t("newOrderPage.tableNumber")}</Label>
              <Input
                type="number"
                placeholder={t("newOrderPage.tableNumberPlaceholder")}
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>{t("newOrderPage.selectItem")}</Label>
              <Select 
                value={selectedItemId} 
                onValueChange={setSelectedItemId}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("newOrderPage.selectItemPlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  {inventoryItems.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name} - {t("commons.currency", { value: item.price })} ({item.quantity} {item.unit})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("newOrderPage.quantity")}</Label>
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input 
                    type="number" 
                    value={quantity} 
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-20 text-center"
                  />
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t("newOrderPage.notes")}</Label>
                <Input
                  placeholder={t("newOrderPage.notesPlaceholder")}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>

            <Button 
              onClick={handleAddItem} 
              disabled={!selectedItemId}
              className="w-full"
            >
              <Plus className="mr-2 h-4 w-4" />
              {t("newOrderPage.addToOrder")}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("newOrderPage.currentOrder")}</CardTitle>
          </CardHeader>
          <CardContent>
            {orderItems.length === 0 ? (
              <div className="text-center text-muted-foreground">
                {t("newOrderPage.noItemsInOrder")}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("newOrderPage.table.item")}</TableHead>
                    <TableHead>{t("newOrderPage.table.quantity")}</TableHead>
                    <TableHead>{t("newOrderPage.table.price")}</TableHead>
                    <TableHead>{t("newOrderPage.table.total")}</TableHead>
                    <TableHead>{t("newOrderPage.table.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orderItems.map((item, index) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button 
                            variant="outline" 
                            size="icon" 
                            onClick={() => handleQuantityChange(index, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span>{item.quantity}</span>
                          <Button 
                            variant="outline" 
                            size="icon" 
                            onClick={() => handleQuantityChange(index, item.quantity + 1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>{t("commons.currency", { value: item.price })}</TableCell>
                      <TableCell>{t("commons.currency", { value: item.price * item.quantity })}</TableCell>
                      <TableCell>
                        <Button 
                          variant="destructive" 
                          size="icon" 
                          onClick={() => handleRemoveItem(index)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            <div className="mt-4 flex justify-between items-center">
              <span className="text-lg font-semibold">{t("newOrderPage.total")}</span>
              <span className="text-xl font-bold">{t("commons.currency", { value: calculateTotal() })}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button 
          onClick={handleSubmitOrder} 
          disabled={orderItems.length === 0 || !tableNumber}
          className="w-full md:w-auto"
        >
          {t("newOrderPage.createOrder")}
        </Button>
      </div>
    </div>
  )
}
