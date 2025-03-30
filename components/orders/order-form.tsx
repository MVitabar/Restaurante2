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
import { doc, collection, getDocs, query, orderBy } from "firebase/firestore"
import { Loader2, Plus, Minus, Trash } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface OrderFormProps {
  onSubmit: (orderData: any) => void
  onCancel: () => void
  initialData?: any
  initialTable?: {
    id: string
    number: number
    mapId: string
  }
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
export function OrderForm({ 
  onSubmit, 
  onCancel, 
  initialData, 
  initialTable 
}: OrderFormProps) {
  const { db } = useFirebase()
  const { t } = useI18n()

  const [loading, setLoading] = useState(true)
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('entradas')
  const [orderItems, setOrderItems] = useState<OrderItem[]>(initialData?.items || [])
  const [specialRequests, setSpecialRequests] = useState(initialData?.specialRequests || "")
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>(initialData?.dietaryRestrictions || [])
  const [discount, setDiscount] = useState(initialData?.discount || 0)
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">("percentage")

  const [selectedTable, setSelectedTable] = useState<{
    id: string
    mapId: string
    number: number
  } | null>(
    initialTable ? {
      id: initialTable.id,
      mapId: initialTable.mapId,
      number: initialTable.number
    } : null
  )
  const [tables, setTables] = useState<{id: string, mapId: string, number: number}[]>([])

  const [selectedItem, setSelectedItem] = useState<string>(
    menuItems.length > 0 ? menuItems[0].id : ""
  )
  const [quantity, setQuantity] = useState(1)
  const [notes, setNotes] = useState("")
  const [itemDietaryRestrictions, setItemDietaryRestrictions] = useState<string[]>([])

  const filteredMenuItems = menuItems.filter(
    item => item.category === selectedCategory
  )

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

  // Fetch menu items from Firestore
  const fetchMenuItems = async () => {
    if (!db) return;

    try {
      setLoading(true)
      const menuItems: MenuItem[] = []

      // List of categories to fetch
      const categories = [
        'entradas', 
        'pratosPrincipais', 
        'saladas', 
        'bebidas', 
        'sobremesas', 
        'porcoesExtras'
      ]

      // Fetch items from each category
      for (const category of categories) {
        const categoryRef = doc(db, 'inventory', category)
        const itemsRef = collection(categoryRef, 'items')
        const itemsSnapshot = await getDocs(itemsRef)

        const categoryItems = itemsSnapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name,
          price: doc.data().price,
          category: category,
          description: doc.data().description,
          unit: doc.data().unit,
          stock: doc.data().quantity
        }))

        menuItems.push(...categoryItems)
      }

      setMenuItems(menuItems)
      setLoading(false)
    } catch (error) {
      console.error("Error fetching menu items:", error)
      setLoading(false)
    }
  }

  // Fetch menu items when component mounts
  useEffect(() => {
    if (db) {
      fetchMenuItems()
      fetchTables()
    }
  }, [db])

  // Fetch tables
  const fetchTables = async () => {
    if (!db) return

    try {
      const tablesRef = collection(db, "tables")
      const q = query(tablesRef, orderBy("number"))
      const querySnapshot = await getDocs(q)

      const availableTables = querySnapshot.docs.map(doc => ({
        id: doc.id,
        mapId: doc.data().mapId,
        number: doc.data().number as number
      }))

      setTables(availableTables)
      
      if (availableTables.length > 0 && !selectedTable) {
        setSelectedTable(availableTables[0])
      }
    } catch (error) {
      console.error("Error fetching tables:", error)
    }
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
    const subtotal = orderItems.reduce((total, item) => total + item.price * item.quantity, 0)

    if (discount > 0) {
      if (discountType === "percentage") {
        const discountRate = Math.min(discount, 100) / 100
        return subtotal * (1 - discountRate)
      } else {
        return Math.max(subtotal - discount, 0)
      }
    }

    return subtotal
  }

  const handleSubmit = async () => {
    // Validate order items
    if (orderItems.length === 0) {
      toast({
        title: "Pedido Vazio",
        description: "Adicione itens ao pedido antes de continuar",
        variant: "destructive"
      })
      return
    }

    // Validate table selection
    if (!selectedTable) {
      toast({
        title: "Mesa Não Selecionada",
        description: "Por favor, selecione uma mesa para o pedido",
        variant: "destructive"
      })
      return
    }

    // Validate order details
    try {
      // Prepare order data
      const orderData = {
        items: orderItems.map(item => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          notes: item.notes,
          dietaryRestrictions: item.dietaryRestrictions
        })),
        tableId: selectedTable.id,
        tableNumber: selectedTable.number,
        tableMapId: selectedTable.mapId,
        total: calculateTotal(),
        subtotal: orderItems.reduce((total, item) => total + item.price * item.quantity, 0),
        discount: {
          type: discountType,
          amount: discount
        },
        specialRequests: specialRequests || undefined,
        dietaryRestrictions: dietaryRestrictions.length > 0 ? dietaryRestrictions : undefined,
        status: "ordering",
        createdAt: new Date()
      }

      // Call onSubmit prop with order data
      await onSubmit(orderData)

      // Reset form after successful submission
      setOrderItems([])
      setSpecialRequests("")
      setDietaryRestrictions([])
      setDiscount(0)
      setDiscountType("percentage")
      setSelectedTable(null)

      // Show success toast
      toast({
        title: "Pedido Criado",
        description: "Seu pedido foi criado com sucesso",
        variant: "default"
      })
    } catch (error) {
      // Handle submission errors
      console.error("Order submission error:", error)
      toast({
        title: "Erro ao Criar Pedido",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive"
      })
    }
  }

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
              <Label>{t("selectCategory")}</Label>
              <Select 
                value={selectedCategory} 
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t("selectCategory")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="entradas">Entradas</SelectItem>
                  <SelectItem value="pratosPrincipais">Pratos Principais</SelectItem>
                  <SelectItem value="saladas">Saladas</SelectItem>
                  <SelectItem value="bebidas">Bebidas</SelectItem>
                  <SelectItem value="sobremesas">Sobremesas</SelectItem>
                  <SelectItem value="porcoesExtras">Porções Extras</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>{t("selectItem")}</Label>
              <Select 
                value={selectedItem} 
                onValueChange={setSelectedItem}
                disabled={filteredMenuItems.length === 0}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t("selectItem")} />
                </SelectTrigger>
                <SelectContent>
                  {filteredMenuItems.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name} - R$ {item.price.toFixed(2)} {item.unit ? `(${item.unit})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {filteredMenuItems.length === 0 && (
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
          <div className="space-y-4 bg-muted/50 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">{t("orderSummary")}</h2>
              {orderItems.length > 0 && (
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={() => setOrderItems([])}
                  className="text-xs"
                >
                  <Trash className="mr-2 h-4 w-4" />
                  {t("clearOrder")}
                </Button>
              )}
            </div>

            {orderItems.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <p>{t("noItemsInOrder")}</p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="max-h-[50vh] overflow-y-auto">
                  <Table>
                    <TableHeader className="sticky top-0 bg-background">
                      <TableRow>
                        <TableHead className="w-[40%]">{t("item")}</TableHead>
                        <TableHead className="w-[20%] text-center">{t("quantity")}</TableHead>
                        <TableHead className="w-[20%] text-right">{t("price")}</TableHead>
                        <TableHead className="w-[20%] text-right">{t("total")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orderItems.map((item, index) => (
                        <TableRow key={`${item.id}-${index}`}>
                          <TableCell className="font-medium">
                            <div className="flex flex-col">
                              <span>{item.name}</span>
                              {item.notes && (
                                <span className="text-xs text-muted-foreground">
                                  {item.notes}
                                </span>
                              )}
                              {item.dietaryRestrictions && item.dietaryRestrictions.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {item.dietaryRestrictions.map(restriction => (
                                    <span 
                                      key={restriction} 
                                      className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded"
                                    >
                                      {t(restriction)}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => {
                                  const updatedItems = [...orderItems]
                                  updatedItems[index].quantity = Math.max(1, item.quantity - 1)
                                  setOrderItems(updatedItems)
                                }}
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              <span>{item.quantity}</span>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => {
                                  const updatedItems = [...orderItems]
                                  updatedItems[index].quantity += 1
                                  setOrderItems(updatedItems)
                                }}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            R$ {item.price.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            R$ {(item.price * item.quantity).toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                const updatedItems = orderItems.filter((_, i) => i !== index)
                                setOrderItems(updatedItems)
                              }}
                            >
                              <Trash className="h-4 w-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <Separator className="my-4" />

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>{t("subtotal")}</span>
                    <span className="font-semibold">
                      R$ {orderItems.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>{t("discount")}</Label>
                    <div className="flex items-center gap-2">
                      <Select 
                        value={discountType} 
                        onValueChange={(value: "percentage" | "fixed") => setDiscountType(value)}
                      >
                        <SelectTrigger className="w-[100px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="percentage">%</SelectItem>
                          <SelectItem value="fixed">R$</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        type="number"
                        value={discount}
                        onChange={(e) => setDiscount(Number(e.target.value))}
                        min="0"
                        className="w-[100px]"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <span>{t("total")}</span>
                    <span className="text-xl font-bold">
                      R$ {calculateTotal().toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <Button 
              onClick={handleSubmit} 
              className="w-full" 
              disabled={orderItems.length === 0 || !selectedTable}
            >
              {t("createOrder")}
            </Button>
            {orderItems.length === 0 && (
              <p className="text-sm text-red-500 mt-2">
                {t("errors.noItemsInOrder")}
              </p>
            )}
            {!selectedTable && (
              <p className="text-sm text-red-500 mt-2">
                {t("errors.noTableSelected")}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
