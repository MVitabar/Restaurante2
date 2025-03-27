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
import { collection, query, orderBy, getDocs } from "firebase/firestore"
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

interface MenuItem {
  id: string
  name: string
  category: string
  price: number
  description?: string
}

// Add state for order-level discount
export function OrderForm({ onSubmit, onCancel, initialData }: OrderFormProps) {
  const { db } = useFirebase()
  const { t } = useI18n()

  const [loading, setLoading] = useState(true)
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [orderItems, setOrderItems] = useState<OrderItem[]>(initialData?.items || [])
  const [specialRequests, setSpecialRequests] = useState(initialData?.specialRequests || "")
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>(initialData?.dietaryRestrictions || [])
  const [discount, setDiscount] = useState<number>(initialData?.discount || 0)
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">("percentage")

  const [selectedItem, setSelectedItem] = useState<string>("")
  const [quantity, setQuantity] = useState(1)
  const [notes, setNotes] = useState("")
  const [itemDietaryRestrictions, setItemDietaryRestrictions] = useState<string[]>([])

  useEffect(() => {
    if (db) {
      fetchMenuItems()
    }
  }, [db])

  const fetchMenuItems = async () => {
    if (!db) return

    setLoading(true)
    try {
      const menuRef = collection(db, "menuItems")
      const q = query(menuRef, orderBy("category"), orderBy("name"))
      const querySnapshot = await getDocs(q)

      const items: MenuItem[] = []
      const uniqueCategories = new Set<string>()

      querySnapshot.forEach((doc) => {
        const item = { id: doc.id, ...doc.data() } as MenuItem
        items.push(item)
        uniqueCategories.add(item.category)
      })

      setMenuItems(items)
      setCategories(Array.from(uniqueCategories))

      if (items.length > 0) {
        setSelectedItem(items[0].id)
      }
    } catch (error) {
      console.error("Error fetching menu items:", error)
    } finally {
      setLoading(false)
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
    if (orderItems.length === 0) return

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
        // Store category information with each item for better reporting
        category: menuItems.find((mi) => mi.id === item.id)?.category || "unknown",
      })),
      subtotal: subtotal,
      discount: discountAmount > 0 ? discountAmount : undefined,
      total: calculateTotal(),
      specialRequests: specialRequests || undefined,
      dietaryRestrictions: dietaryRestrictions.length > 0 ? dietaryRestrictions : undefined,
    })
  }

  const filteredMenuItems =
    selectedCategory === "all" ? menuItems : menuItems.filter((item) => item.category === selectedCategory)

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6 py-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Label>{t("category")}</Label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder={t("selectCategory")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("allCategories")}</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>{t("menuItem")}</Label>
            <Select value={selectedItem} onValueChange={setSelectedItem}>
              <SelectTrigger>
                <SelectValue placeholder={t("selectMenuItem")} />
              </SelectTrigger>
              <SelectContent>
                {filteredMenuItems.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name} - ${item.price.toFixed(2)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>{t("quantity")}</Label>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Number.parseInt(e.target.value) || 1)}
                className="text-center"
              />
              <Button type="button" variant="outline" size="icon" onClick={() => setQuantity(quantity + 1)}>
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
              className="resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label>{t("itemDietaryRestrictions")}</Label>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="gluten-free-item"
                  checked={itemDietaryRestrictions.includes("gluten-free")}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setItemDietaryRestrictions([...itemDietaryRestrictions, "gluten-free"])
                    } else {
                      setItemDietaryRestrictions(itemDietaryRestrictions.filter((r) => r !== "gluten-free"))
                    }
                  }}
                />
                <Label htmlFor="gluten-free-item">{t("glutenFree")}</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="lactose-free-item"
                  checked={itemDietaryRestrictions.includes("lactose-free")}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setItemDietaryRestrictions([...itemDietaryRestrictions, "lactose-free"])
                    } else {
                      setItemDietaryRestrictions(itemDietaryRestrictions.filter((r) => r !== "lactose-free"))
                    }
                  }}
                />
                <Label htmlFor="lactose-free-item">{t("lactoseFree")}</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="vegan-item"
                  checked={itemDietaryRestrictions.includes("vegan")}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setItemDietaryRestrictions([...itemDietaryRestrictions, "vegan"])
                    } else {
                      setItemDietaryRestrictions(itemDietaryRestrictions.filter((r) => r !== "vegan"))
                    }
                  }}
                />
                <Label htmlFor="vegan-item">{t("vegan")}</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="vegetarian-item"
                  checked={itemDietaryRestrictions.includes("vegetarian")}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setItemDietaryRestrictions([...itemDietaryRestrictions, "vegetarian"])
                    } else {
                      setItemDietaryRestrictions(itemDietaryRestrictions.filter((r) => r !== "vegetarian"))
                    }
                  }}
                />
                <Label htmlFor="vegetarian-item">{t("vegetarian")}</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="celiac-item"
                  checked={itemDietaryRestrictions.includes("celiac-friendly")}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setItemDietaryRestrictions([...itemDietaryRestrictions, "celiac-friendly"])
                    } else {
                      setItemDietaryRestrictions(itemDietaryRestrictions.filter((r) => r !== "celiac-friendly"))
                    }
                  }}
                />
                <Label htmlFor="celiac-item">{t("celiacFriendly")}</Label>
              </div>
            </div>
          </div>

          <Button type="button" onClick={handleAddItem} className="w-full">
            <Plus className="mr-2 h-4 w-4" />
            {t("addToOrder")}
          </Button>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium mb-2">{t("orderSummary")}</h3>
            {orderItems.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("item")}</TableHead>
                    <TableHead className="text-right">{t("quantity")}</TableHead>
                    <TableHead className="text-right">{t("price")}</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orderItems.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{item.name}</div>
                          {item.notes && <div className="text-xs text-muted-foreground">{item.notes}</div>}
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
            ) : (
              <div className="text-center py-8 text-muted-foreground">{t("noItemsInOrder")}</div>
            )}

            {/* Add discount UI elements to the order summary section */}
            {/* Add this after the order items table and before the total display: */}

            <div className="space-y-4 mt-4">
              <div className="flex justify-between items-center">
                <Label htmlFor="discount">{t("discount")}</Label>
                <div className="flex items-center space-x-2">
                  <select
                    id="discountType"
                    className="rounded-md border border-input bg-background px-2 py-1 text-sm"
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as "percentage" | "fixed")}
                  >
                    <option value="percentage">%</option>
                    <option value="fixed">$</option>
                  </select>
                  <Input
                    id="discount"
                    type="number"
                    min="0"
                    step={discountType === "percentage" ? "1" : "0.01"}
                    max={discountType === "percentage" ? "100" : undefined}
                    value={discount}
                    onChange={(e) => setDiscount(Number.parseFloat(e.target.value) || 0)}
                    className="w-20"
                  />
                </div>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span>{t("subtotal")}</span>
                  <span>${orderItems.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2)}</span>
                </div>
              )}

              {discount > 0 && (
                <div className="flex justify-between text-sm text-red-500">
                  <span>{t("discountAmount")}</span>
                  <span>
                    -$
                    {(discountType === "percentage"
                      ? orderItems.reduce((total, item) => total + item.price * item.quantity, 0) *
                        (Math.min(discount, 100) / 100)
                      : Math.min(
                          discount,
                          orderItems.reduce((total, item) => total + item.price * item.quantity, 0),
                        )
                    ).toFixed(2)}
                  </span>
                </div>
              )}
            </div>

            {orderItems.length > 0 && (
              <div className="flex justify-between font-bold text-lg border-t pt-4">
                <span>{t("total")}</span>
                <span>${calculateTotal().toFixed(2)}</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="specialRequests">{t("specialRequests")}</Label>
            <Textarea
              id="specialRequests"
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
              placeholder={t("specialRequestsPlaceholder")}
              className="resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label>{t("orderDietaryRestrictions")}</Label>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="gluten-free"
                  checked={dietaryRestrictions.includes("gluten-free")}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setDietaryRestrictions([...dietaryRestrictions, "gluten-free"])
                    } else {
                      setDietaryRestrictions(dietaryRestrictions.filter((r) => r !== "gluten-free"))
                    }
                  }}
                />
                <Label htmlFor="gluten-free">{t("glutenFree")}</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="lactose-free"
                  checked={dietaryRestrictions.includes("lactose-free")}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setDietaryRestrictions([...dietaryRestrictions, "lactose-free"])
                    } else {
                      setDietaryRestrictions(dietaryRestrictions.filter((r) => r !== "lactose-free"))
                    }
                  }}
                />
                <Label htmlFor="lactose-free">{t("lactoseFree")}</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="vegan"
                  checked={dietaryRestrictions.includes("vegan")}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setDietaryRestrictions([...dietaryRestrictions, "vegan"])
                    } else {
                      setDietaryRestrictions(dietaryRestrictions.filter((r) => r !== "vegan"))
                    }
                  }}
                />
                <Label htmlFor="vegan">{t("vegan")}</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="vegetarian"
                  checked={dietaryRestrictions.includes("vegetarian")}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setDietaryRestrictions([...dietaryRestrictions, "vegetarian"])
                    } else {
                      setDietaryRestrictions(dietaryRestrictions.filter((r) => r !== "vegetarian"))
                    }
                  }}
                />
                <Label htmlFor="vegetarian">{t("vegetarian")}</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="celiac"
                  checked={dietaryRestrictions.includes("celiac-friendly")}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setDietaryRestrictions([...dietaryRestrictions, "celiac-friendly"])
                    } else {
                      setDietaryRestrictions(dietaryRestrictions.filter((r) => r !== "celiac-friendly"))
                    }
                  }}
                />
                <Label htmlFor="celiac">{t("celiacFriendly")}</Label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Separator />

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          {t("cancel")}
        </Button>
        <Button type="button" onClick={handleSubmit} disabled={orderItems.length === 0}>
          {t("submitOrder")}
        </Button>
      </div>
    </div>
  )
}

