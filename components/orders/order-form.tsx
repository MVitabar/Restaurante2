"use client"

import { useState, useEffect } from "react"
import { useFirebase } from "@/components/firebase-provider"
import { useI18n } from "@/components/i18n-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"
import { collection, query, orderBy, getDocs, where } from "firebase/firestore"
import { Loader2, Plus, Minus, Trash } from "lucide-react"

interface OrderFormProps {
  onSubmit: (orderData: any) => void
  onCancel: () => void
  initialData?: any
}

// Update the OrderItem interface to include more detailed information
interface OrderItem {
  id: string
  name: string
  quantity: number
  price: number
  originalPrice?: number // For tracking discounted items
  notes?: string
  dietaryRestrictions?: string[]
  category?: string
}

// Update MenuItem interface to match inventory collection
interface MenuItem {
  id: string
  name: string
  price: number
  category: string
  description?: string
  unit?: string
  stock?: number
}

// Add state for order-level discount
export function OrderForm({ onSubmit, onCancel, initialData }: OrderFormProps) {
  const { db } = useFirebase()
  const { t } = useI18n()

  const [loading, setLoading] = useState(true)
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [orderItems, setOrderItems] = useState<OrderItem[]>(initialData?.items || [])
  const [specialRequests, setSpecialRequests] = useState(initialData?.specialRequests || "")
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>(initialData?.dietaryRestrictions || [])
  const [discount, setDiscount] = useState<number>(initialData?.discount || 0)
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">("percentage")

  const [selectedItem, setSelectedItem] = useState<string>(
    menuItems.length > 0 ? menuItems[0].id : ""
  )
  const [quantity, setQuantity] = useState(1)
  const [notes, setNotes] = useState("")
  const [itemDietaryRestrictions, setItemDietaryRestrictions] = useState<string[]>([])

  const [selectedTable, setSelectedTable] = useState<string | null>(null)
  const [tables, setTables] = useState<{id: string, number: number}[]>([])

  useEffect(() => {
    if (db) {
      fetchMenuItems()
      fetchTables()
    }
  }, [db])

  const fetchMenuItems = async () => {
    if (!db) return

    setLoading(true)
    try {
      const inventoryRef = collection(db, "inventory")
      const q = query(
        inventoryRef, 
        where("category", "==", "menu_item"),
        orderBy("name")
      )
      const querySnapshot = await getDocs(q)

      const items: MenuItem[] = []
      querySnapshot.forEach((doc) => {
        const item = { 
          id: doc.id, 
          ...doc.data(),
          price: doc.data().price || 0  // Ensure price exists
        } as MenuItem
        items.push(item)
      })

      setMenuItems(items)
      
      // Automatically select first item if available
      if (items.length > 0) {
        setSelectedItem(items[0].id)
      }
    } catch (error) {
      console.error("Error fetching menu items:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchTables = async () => {
    if (!db) return

    try {
      const tablesRef = collection(db, "tables")
      const q = query(tablesRef, where("status", "==", "available"))
      const querySnapshot = await getDocs(q)

      const availableTables = querySnapshot.docs.map(doc => ({
        id: doc.id,
        number: doc.data().number
      }))

      setTables(availableTables)
      
      // Automatically select first available table if none selected
      if (availableTables.length > 0 && !selectedTable) {
        setSelectedTable(availableTables[0].id)
      }
    } catch (error) {
      console.error("Error fetching tables:", error)
    }
  }

  const handleAddItem = () => {
    const menuItem = menuItems.find((item) => item.id === selectedItem)
    if (!menuItem) return

    const newItem: OrderItem = {
      id: menuItem.id,
      name: menuItem.name,
      quantity,
      price: menuItem.price,
      notes: notes || undefined,
      dietaryRestrictions: itemDietaryRestrictions.length > 0 ? [...itemDietaryRestrictions] : undefined,
    }

    // Check if item already exists in order
    const existingItemIndex = orderItems.findIndex(
      (item) =>
        item.id === menuItem.id &&
        JSON.stringify(item.dietaryRestrictions || []) === JSON.stringify(itemDietaryRestrictions || []) &&
        item.notes === notes,
    )

    if (existingItemIndex >= 0) {
      // Update existing item
      const updatedItems = [...orderItems]
      updatedItems[existingItemIndex].quantity += quantity
      setOrderItems(updatedItems)
    } else {
      // Add new item
      setOrderItems([...orderItems, newItem])
    }

    // Reset form
    setQuantity(1)
    setNotes("")
    setItemDietaryRestrictions([])
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

  // Update the calculateTotal function to account for discounts
  const calculateTotal = () => {
    const subtotal = orderItems.reduce((total, item) => total + item.price * item.quantity, 0)

    if (discount > 0) {
      if (discountType === "percentage") {
        // Cap percentage discount at 100%
        const discountRate = Math.min(discount, 100) / 100
        return subtotal * (1 - discountRate)
      } else {
        // Fixed amount discount, capped at subtotal
        return Math.max(subtotal - discount, 0)
      }
    }

    return subtotal
  }

  // Update the handleSubmit function to include discount information
  const handleSubmit = () => {
    if (orderItems.length === 0) {
      // Show error that order cannot be empty
      return
    }

    if (!selectedTable) {
      // Show error that table must be selected
      return
    }

    const subtotal = orderItems.reduce((total, item) => total + item.price * item.quantity, 0)
    let discountAmount = 0

    if (discount > 0) {
      if (discountType === "percentage") {
        const discountRate = Math.min(discount, 100) / 100
        discountAmount = Number.parseFloat((subtotal * discountRate).toFixed(2))
      } else {
        discountAmount = Math.min(discount, subtotal)
      }
    }

    onSubmit({
      items: orderItems.map((item) => ({
        ...item,
        category: menuItems.find((mi) => mi.id === item.id)?.category || "unknown",
      })),
      table: selectedTable,
      tableNumber: tables.find(t => t.id === selectedTable)?.number,
      subtotal: subtotal,
      discount: discountAmount > 0 ? discountAmount : undefined,
      total: calculateTotal(),
      specialRequests: specialRequests || undefined,
      dietaryRestrictions: dietaryRestrictions.length > 0 ? dietaryRestrictions : undefined,
      status: "ordering", // Initial order status
      createdAt: new Date()
    })
  }

  const filteredMenuItems = menuItems

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl min-h-screen flex flex-col justify-center py-8">
      <div className="bg-background border rounded-lg shadow-lg p-6 overflow-y-auto max-h-[90vh]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column: Item Selection */}
          <div className="space-y-4">
            <div>
              <Label>{t("selectItem")}</Label>
              <Select 
                value={selectedItem} 
                onValueChange={setSelectedItem}
                disabled={menuItems.length === 0}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t("selectItem")} />
                </SelectTrigger>
                <SelectContent>
                  {filteredMenuItems.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name} - ${item.price.toFixed(2)} {item.unit ? `(${item.unit})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {menuItems.length === 0 && (
                <p className="text-destructive text-sm mt-2">
                  {t("noMenuItemsAvailable")}
                </p>
              )}
            </div>

            <div>
              <Label>{t("quantity")}</Label>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="shrink-0"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Number.parseInt(e.target.value) || 1)}
                  className="text-center flex-grow w-20"
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  size="icon" 
                  className="shrink-0"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="notes">{t("itemNotes")}</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t("itemNotesPlaceholder")}
                className="resize-y min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <Label>{t("itemDietaryRestrictions")}</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {/* Dietary Restrictions Checkboxes */}
                {[
                  { id: "gluten-free-item", key: "glutenFree" },
                  { id: "lactose-free-item", key: "lactoseFree" },
                  { id: "vegan-item", key: "vegan" },
                  { id: "vegetarian-item", key: "vegetarian" },
                  { id: "celiac-item", key: "celiacFriendly" }
                ].map(({ id, key }) => (
                  <div key={id} className="flex items-center space-x-2">
                    <Checkbox
                      id={id}
                      checked={itemDietaryRestrictions.includes(key.replace(/([A-Z])/g, '-$1').toLowerCase())}
                      onCheckedChange={(checked) => {
                        const restriction = key.replace(/([A-Z])/g, '-$1').toLowerCase()
                        if (checked) {
                          setItemDietaryRestrictions([...itemDietaryRestrictions, restriction])
                        } else {
                          setItemDietaryRestrictions(itemDietaryRestrictions.filter((r) => r !== restriction))
                        }
                      }}
                    />
                    <Label htmlFor={id}>{t(key)}</Label>
                  </div>
                ))}
              </div>
            </div>

            <Button type="button" onClick={handleAddItem} className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              {t("addToOrder")}
            </Button>
          </div>

          {/* Right Column: Order Summary */}
          <div className="space-y-4 max-h-[70vh] overflow-y-auto">
            <div>
              <h3 className="text-lg font-medium mb-2 sticky top-0 bg-background z-10">{t("orderSummary")}</h3>
              {orderItems.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="sticky top-8 bg-background z-10">
                      <TableRow>
                        <TableHead className="w-1/2">{t("item")}</TableHead>
                        <TableHead className="text-right w-1/4">{t("quantity")}</TableHead>
                        <TableHead className="text-right w-1/4">{t("price")}</TableHead>
                        <TableHead className="w-10"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orderItems.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <div>
                              <div className="font-medium truncate max-w-[150px]">{item.name}</div>
                              {item.notes && <div className="text-xs text-muted-foreground truncate">{item.notes}</div>}
                              {item.dietaryRestrictions && item.dietaryRestrictions.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {item.dietaryRestrictions.map((restriction) => (
                                    <div key={restriction} className="text-xs px-1.5 py-0.5 bg-muted rounded-sm">
                                      {t(restriction)}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => handleQuantityChange(index, item.quantity - 1)}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span>{item.quantity}</span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => handleQuantityChange(index, item.quantity + 1)}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">${(item.price * item.quantity).toFixed(2)}</TableCell>
                          <TableCell>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-red-500"
                              onClick={() => handleRemoveItem(index)}
                            >
                              <Trash className="h-3 w-3" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">{t("emptyOrderMessage")}</p>
              )}
            </div>

            {/* Sticky bottom section for table selection, discount, and submit */}
            <div className="sticky bottom-0 bg-background pt-4 space-y-4 border-t">
              {/* Table Selection */}
              <div className="space-y-2">
                <Label>{t("selectTable")}</Label>
                <Select value={selectedTable || ""} onValueChange={setSelectedTable}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t("selectTablePlaceholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    {tables.map((table) => (
                      <SelectItem key={table.id} value={table.id}>
                        {t("tableNumber", { number: table.number })}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Discount Section */}
              <div className="space-y-2">
                <Label>{t("discount")}</Label>
                <div className="flex items-center gap-2">
                  <Select value={discountType} onValueChange={(value: "percentage" | "fixed") => setDiscountType(value)}>
                    <SelectTrigger className="w-1/3">
                      <SelectValue placeholder={t("discountType")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">{t("percentage")}</SelectItem>
                      <SelectItem value="fixed">{t("fixedAmount")}</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    value={discount}
                    onChange={(e) => setDiscount(Number.parseFloat(e.target.value) || 0)}
                    className="flex-grow"
                    placeholder={t("discountAmount")}
                    min="0"
                    max={discountType === "percentage" ? 100 : undefined}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">{t("order.subtotal")}</span>
                  <span>${calculateTotal().toFixed(2)}</span>
                </div>
                
                <Button 
                  onClick={handleSubmit} 
                  disabled={orderItems.length === 0 || !selectedTable}
                  className="w-full"
                >
                  {t("order.createOrder")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
