"use client"

import { useState, useEffect } from "react"
import type { 
  DocumentReference, 
  DocumentData, 
  DocumentSnapshot 
} from "firebase/firestore"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { useFirebase } from "@/components/firebase-provider"
import { useI18n } from "@/components/i18n-provider"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { TableMapViewer } from "@/components/table-map/table-map-viewer"
import { TableGridView } from "@/components/table-map/table-grid-view"
import { doc, collection, addDoc, updateDoc, serverTimestamp, getDoc, setDoc } from "firebase/firestore"
import { Timestamp } from "firebase/firestore"
import { query, where, onSnapshot } from "firebase/firestore"

import {
  Loader2,
  ArrowLeft,
  Plus,
  Edit,
  ClipboardList,
  CheckCircle,
  AlertCircle,
  Receipt,
  Grid2X2,
  Map,
} from "lucide-react"
import Link from "next/link"
import { OrderForm } from "@/components/orders/order-form"
import { OrderDetailsDialog } from "@/components/OrderDetailsDialog"

interface TableMap {
  id: string
  name: string
  description: string
  tables: TableItem[]
}

interface TableItem {
  id: string
  number: number
  seats: number
  shape: "square" | "round" | "rectangle"
  width: number
  height: number
  x: number
  y: number
  status: "available" | "occupied" | "ordering" | "preparing" | "ready" | "served"
}

// Add a new interface for payment information
interface PaymentInfo {
  method: "cash" | "credit" | "debit" | "other"
  amount: number
  tip?: number
  reference?: string
  processedAt: Timestamp | Date
}

interface OrderItem {
  id: string
  name: string
  price: number
  quantity: number
  notes?: string
  // Replace string array with boolean flags for specific dietary restrictions
  isVegetarian?: boolean
  isVegan?: boolean
  isGlutenFree?: boolean
  isLactoseFree?: boolean
}

// Update the Order interface to include payment and closure information
interface Order {
  id: string  // Make id a required string
  mapId: string
  tableId: string
  tableNumber: number
  tableMapId: string
  tableMapName: string
  status: "pending" | "preparing" | "ready" | "delivered" | "cancelled" | "closed"
  items: OrderItem[]
  total: number
  subtotal: number
  tax?: number
  waiter: string
  waiterId: string
  createdAt: any
  updatedAt: any
  closedAt?: any
  hasSpecialInstructions: boolean  // New boolean flag
  payment?: PaymentInfo
}

// Type for Firestore order data
type FirestoreOrderData = {
  mapId: string
  tableId: string
  tableNumber: number
  tableMapId: string
  tableMapName: string
  status: "pending" | "preparing" | "ready" | "delivered" | "cancelled" | "closed"
  items: OrderItem[]
  total: number
  subtotal: number
  tax?: number
  waiter: string
  waiterId: string
  createdAt: any
  updatedAt: any
  closedAt?: any
  hasSpecialInstructions: boolean
  payment?: PaymentInfo
  id?: string
}

export default function TableMapPage() {
  const params = useParams<{ mapId: string }>()
  const router = useRouter()
  const { user } = useAuth()
  const { db } = useFirebase()
  const { t } = useI18n()
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [tableMap, setTableMap] = useState<TableMap | null>(null)
  const [activeOrders, setActiveOrders] = useState<Record<string, Order>>({})
  const [selectedTable, setSelectedTable] = useState<TableItem | null>(null)
  const [isCreatingOrder, setIsCreatingOrder] = useState(false)
  const [isViewingOrder, setIsViewingOrder] = useState(false)
  const [viewMode, setViewMode] = useState<"map" | "grid">("map")

  // Add a new state for payment dialog
  const [isClosingOrder, setIsClosingOrder] = useState(false)
  const [paymentInfo, setPaymentInfo] = useState<Partial<PaymentInfo>>({
    method: "cash",
    amount: 0,
    tip: 0,
  })

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false)

  useEffect(() => {
    if (db && params.mapId) {
      fetchTableMap()

      // Set up real-time listener for orders
      const unsubscribe = setupOrdersListener()

      return () => {
        unsubscribe()
      }
    }
  }, [db, params.mapId])

  const fetchTableMap = async () => {
    if (!db || !params.mapId) return

    try {
      const mapDoc = await getDoc(doc(db, "tableMaps", params.mapId))

      if (mapDoc.exists()) {
        setTableMap({
          id: mapDoc.id,
          ...mapDoc.data(),
        } as TableMap)
      } else {
        toast({
          title: "Error",
          description: "Table map not found",
          variant: "destructive",
        })
        router.push("/settings")
      }
    } catch (error) {
      console.error("Error fetching table map:", error)
      toast({
        title: "Error",
        description: "Failed to fetch table map",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Set up real-time listener for orders
  const setupOrdersListener = () => {
    if (!db || !params.mapId) return () => {}

    const ordersRef = collection(db, "orders")
    const q = query(
      ordersRef,
      where("mapId", "==", params.mapId),
      where("status", "in", ["pending", "preparing", "ready", "delivered"]),
    )

    return onSnapshot(
      q,
      (snapshot) => {
        const orders: Record<string, Order> = {}

        snapshot.forEach((doc) => {
          const order = { id: doc.id, ...doc.data() } as Order
          orders[order.tableId] = order

          // Update table status based on order status if we have the tableMap
          if (tableMap) {
            updateTableStatus(order.tableId, getTableStatusFromOrder(order.status))
          }
        })

        setActiveOrders(orders)
      },
      (error) => {
        console.error("Error listening to orders:", error)
      },
    )
  }

  // Helper function to map order status to table status
  const getTableStatusFromOrder = (orderStatus: string): TableItem["status"] => {
    switch (orderStatus) {
      case "pending":
      case "preparing":
        return "preparing"
      case "ready":
        return "ready"
      case "delivered":
        return "served"
      case "cancelled":
        return "available"
      default:
        return "available"
    }
  }

  // Update table status in the database and local state
  const updateTableStatus = async (tableId: string, status: TableItem["status"]) => {
    if (!db) return

    try {
      // Check if the table document exists
      const tableRef = doc(db, "tables", tableId)
      const tableDoc = await getDoc(tableRef)

      if (!tableDoc.exists()) {
        // If the document doesn't exist, create it with the initial status
        await setDoc(tableRef, {
          id: tableId,
          number: selectedTable?.number ?? 0,
          mapId: tableMap?.id ?? '',
          status: status,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        })
      } else {
        // If the document exists, update its status
        await updateDoc(tableRef, {
          status: status,
          updatedAt: serverTimestamp(),
        })
      }
    } catch (error) {
      console.error("Error updating table status:", error)
      toast({
        title: t("commons.error"),
        description: t("tables.error.statusUpdateFailed"),
        variant: "destructive",
      })
    }
  }

  // Enhanced safety methods for order handling
  const getOrderByTableId = (tableId?: string | null): Order | undefined => {
    return tableId && activeOrders && activeOrders[tableId] ? activeOrders[tableId] : undefined
  }

  const hasActiveOrder = (tableId?: string | null): boolean => {
    return !!(tableId && activeOrders && activeOrders[tableId])
  }

  const getOrderId = (tableId?: string | null): string => {
    const order = getOrderByTableId(tableId)
    return order?.id ?? ''
  }

  const getOrderStatus = (tableId?: string | null): string => {
    const order = getOrderByTableId(tableId)
    return order?.status ?? ''
  }

  const getOrderTotal = (tableId?: string | null): number => {
    const order = getOrderByTableId(tableId)
    return order?.total ?? 0
  }

  const getOrderSubtotal = (tableId?: string | null): number => {
    const order = getOrderByTableId(tableId)
    return order?.subtotal ?? 0
  }

  const getOrderTax = (tableId?: string | null): number => {
    const order = getOrderByTableId(tableId)
    return order?.tax ?? 0
  }

  const getOrderWaiter = (tableId?: string | null): string => {
    const order = getOrderByTableId(tableId)
    return order?.waiter ?? ''
  }

  const getOrderCreatedAt = (tableId?: string | null): string => {
    const order = getOrderByTableId(tableId)
    return order?.createdAt?.toDate ? new Date(order.createdAt.toDate()).toLocaleTimeString() : 'N/A'
  }

  const getOrderDietaryRestrictions = (tableId?: string | null): boolean[] => {
    const order = getOrderByTableId(tableId)
    
    // If no order or no items, return an array of false values
    if (!order || !order.items || order.items.length === 0) {
      return [false, false, false, false]
    }

    return [
      Boolean(order.items.some((item) => item.isVegetarian)),
      Boolean(order.items.some((item) => item.isVegan)),
      Boolean(order.items.some((item) => item.isGlutenFree)),
      Boolean(order.items.some((item) => item.isLactoseFree)),
    ]
  }

  const getOrderItems = (tableId?: string | null): OrderItem[] => {
    const order = getOrderByTableId(tableId)
    return order?.items ?? []
  }

  // Helper function to calculate subtotal
  const calculateSubtotal = (items: OrderItem[]): number => {
    return Number(
      items
        .reduce((total, item: OrderItem) => total + (item.price * item.quantity), 0)
        .toFixed(2)
    )
  }

  // Helper function to calculate tax
  const calculateTax = (items: OrderItem[]): number => {
    const subtotal = calculateSubtotal(items)
    const taxRate = 0.1 // 10% tax rate - could be configurable
    return Number((subtotal * taxRate).toFixed(2))
  }

  // Helper function to calculate total
  const calculateTotal = (items: OrderItem[]): number => {
    const subtotal = calculateSubtotal(items)
    const tax = calculateTax(items)
    return Number((subtotal + tax).toFixed(2))
  }

  const handleMarkAsServed = async (orderId?: string, tableId?: string) => {
    if (!db || !tableId || !orderId) return

    try {
      await updateDoc(doc(db, "orders", orderId), {
        status: "delivered",
        updatedAt: serverTimestamp(),
      })

      // Update table status to "served"
      await updateTableStatus(tableId, "served")

      toast({
        title: "Success",
        description: "Order marked as served",
      })
    } catch (error) {
      console.error("Error updating order:", error)
      toast({
        title: "Error",
        description: "Failed to update order",
        variant: "destructive",
      })
    }
  }

  const handleTableClick = (table: TableItem) => {
    // Prevent selecting tables that are not available
    if (table.status !== "available" && table.status !== "occupied") {
      toast({
        title: t("commons.error"),
        description: t("tables.error.tableNotAvailable"),
        variant: "destructive",
      })
      return
    }

    setSelectedTable(table)

    // If table has an active order, show it
    if (hasActiveOrder(table.id)) {
      setIsViewingOrder(true)
    }
  }

  const handleCloseOrder = async (orderId?: string, tableId?: string) => {
    if (!db || !tableMap || !tableId || !orderId) return

    const order = getOrderByTableId(tableId)
    if (!order) return

    // Validate payment amount
    if (!paymentInfo.amount || paymentInfo.amount < order.total) {
      toast({
        title: "Error",
        description: "Payment amount must be at least equal to the order total",
        variant: "destructive",
      })
      return
    }

    try {
      const payment: PaymentInfo = {
        method: paymentInfo.method || "cash",
        amount: paymentInfo.amount,
        tip: paymentInfo.tip || 0,
        reference: paymentInfo.reference,
        processedAt: new Date(),
      }

      // Update order status and add payment info
      await updateDoc(doc(db, "orders", orderId), {
        status: "closed",
        payment: payment,
        closedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })

      // Update table status to "available"
      await updateTableStatus(tableId, "available")

      // Remove from active orders
      const newActiveOrders = { ...activeOrders }
      delete newActiveOrders[tableId]
      setActiveOrders(newActiveOrders)

      setIsClosingOrder(false)
      setIsViewingOrder(false)
      setSelectedTable(null)

      // Reset payment info
      setPaymentInfo({
        method: "cash",
        amount: 0,
        tip: 0,
      })

      toast({
        title: "Success",
        description: "Order closed successfully",
      })
    } catch (error) {
      console.error("Error closing order:", error)
      toast({
        title: "Error",
        description: "Failed to close order",
        variant: "destructive",
      })
    }
  }

  const setActiveOrderForTable = (tableId: string, order: Order) => {
    setActiveOrders(prev => ({
      ...prev,
      [tableId]: {
        ...order,
        id: order.id || '', // Ensure id is always a string
      }
    }))
  }

  const handleCreateOrder = async (initialOrderData: any) => {
    console.log("Selected Table:", selectedTable)
    console.log("Order Data (Raw):", initialOrderData)

    if (!db || !user || !selectedTable || !tableMap) {
      console.error("Missing required data:", {
        db: !!db,
        user: !!user,
        selectedTable: !!selectedTable,
        tableMap: !!tableMap,
      })
      return
    }

    setIsCreatingOrder(true)

    try {
      // Prepare order items with notes, with explicit typing
      const items: OrderItem[] = initialOrderData.items.map((item: Partial<OrderItem>) => ({
        id: item.id || '',
        name: item.name || '',
        price: Number(item.price) || 0,
        quantity: Number(item.quantity) || 0,
        notes: item.notes?.trim() || '',
        isVegetarian: item.isVegetarian || false,
        isVegan: item.isVegan || false,
        isGlutenFree: item.isGlutenFree || false,
        isLactoseFree: item.isLactoseFree || false,
      }))

      // Calculate if there are any special instructions
      const hasSpecialInstructions = items.some(item => 
        item.notes !== undefined && item.notes.trim() !== ''
      )

      // Prepare sanitized order data, removing any undefined fields
      const sanitizedOrderData: Partial<FirestoreOrderData> = {
        mapId: tableMap.id,
        tableId: selectedTable.id,
        tableNumber: selectedTable.number ?? 0,
        tableMapId: tableMap.id,
        tableMapName: tableMap.name, // Add table map name
        status: "pending",
        items: items,
        subtotal: calculateSubtotal(items),
        total: calculateTotal(items),
        tax: calculateTax(items),
        waiter: user.displayName || '',
        waiterId: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        hasSpecialInstructions: hasSpecialInstructions,
        // Remove any fields that might be undefined
        ...(initialOrderData.discount && { discount: initialOrderData.discount }),
        ...(initialOrderData.dietaryRestrictions && { dietaryRestrictions: initialOrderData.dietaryRestrictions }),
      }

      // Remove any undefined values from the order data
      const cleanOrderData = Object.fromEntries(
        Object.entries(sanitizedOrderData)
          .filter(([_, v]) => v !== undefined)
      )

      // Create the order in Firestore
      const orderRef = await addDoc(collection(db, "orders"), cleanOrderData)

      // Update table status
      await updateTableStatus(selectedTable.id, "ordering")

      // Reset order data and close the order creation modal
      setIsCreatingOrder(false)
      setSelectedTable(null)

      // Show success toast
      toast({
        title: t("orderForm.orderCreated"),
        description: t("orderForm.orderCreatedDescription"),
        variant: "default",
      })
    } catch (error) {
      console.error("Error creating order:", error)
      toast({
        title: t("commons.error"),
        description: t("orderForm.errorCreatingOrder"),
        variant: "destructive",
      })
    }
  }

  const handleViewOrder = (table: TableItem) => {
    // Find the order for this table
    const order = activeOrders[table.id]
    setSelectedOrder(order || null)
    setIsOrderDialogOpen(true)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!tableMap) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <AlertCircle className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">{t("tableMap.notFound.title")}</h3>
            <p className="text-sm text-muted-foreground mb-4">{t("tableMap.notFound.description")}</p>
            <Button asChild>
              <Link href="/settings">
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t("tableMap.notFound.backToSettings")}
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/settings">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">{tableMap.name}</h1>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-2">
          <div className="flex  md:flex-row items-center gap-2">
            <Badge variant="outline" className="text-sm">
              {tableMap.tables.filter((t) => t.status === "available").length} {t("tableMap.statuses.available")}
            </Badge>
            <Badge variant="outline" className="text-sm">
              {
                tableMap.tables.filter(
                  (t) =>
                    t.status === "occupied" ||
                    t.status === "ordering" ||
                    t.status === "preparing" ||
                    t.status === "ready" ||
                    t.status === "served",
                ).length
              }{" "}
              {t("tableMap.statuses.occupied")}
            </Badge>
          </div>

          {/* View mode toggle */}
          <div className="  ml-2 border rounded-md overflow-hidden flex ">
            <Button
              variant={viewMode === "map" ? "default" : "ghost"}
              size="sm"
              className="rounded-none flex items-center space-x-1 min-w-[80px] justify-center"
              onClick={() => setViewMode("map")}
            >
              <Map className="h-4 w-4" />
              <span className="hidden md:inline">{t("tableMap.views.map")}</span>
            </Button>
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              className="rounded-none flex items-center space-x-1 min-w-[80px] justify-center"
              onClick={() => setViewMode("grid")}
            >
              <Grid2X2 className="h-4 w-4" />
              <span className="hidden md:inline">{t("tableMap.views.grid")}</span>
            </Button>
          </div>
        </div>
      </div>

      {viewMode === "map" ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Card>
              <CardContent className="p-6">
                <TableMapViewer
                  tables={tableMap.tables}
                  selectedTable={selectedTable}
                  onTableClick={handleTableClick}
                  showControls={true}
                  showLegend={true}
                  autoRefresh={true}
                  refreshInterval={10000}
                />
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="h-full">
              {selectedTable ? (
                <>
                  <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                      <span>
                        {t("tableMap.table.label")} {selectedTable.number}
                      </span>
                      <Badge
                        className={
                          selectedTable.status === "available"
                            ? "bg-green-100 text-green-800 border-green-200"
                            : selectedTable.status === "occupied" ||
                                selectedTable.status === "ordering" ||
                                selectedTable.status === "preparing" ||
                                selectedTable.status === "ready" ||
                                selectedTable.status === "served"
                              ? "bg-red-100 text-red-800 border-red-200"
                              : "bg-gray-100 text-gray-800 border-gray-200"
                        }
                      >
                        {t(selectedTable.status)}
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      {selectedTable.seats} {t("tableMap.table.details.seats")} • {t(selectedTable.shape)}
                    </CardDescription>
                  </CardHeader>

                  <CardContent>
                    {hasActiveOrder(selectedTable.id) ? (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <h3 className="text-lg font-medium">{t("tableMap.table.details.activeOrder")}</h3>
                          <Badge variant="outline">{getOrderStatus(selectedTable.id)}</Badge>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">{t("tableMap.table.details.waiter")}</span>
                            <span>{getOrderWaiter(selectedTable.id)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">{t("tableMap.table.details.orderTime")}</span>
                            <span>
                              {getOrderCreatedAt(selectedTable.id)}
                            </span>
                          </div>

                          {getOrderDietaryRestrictions(selectedTable.id).some((restriction) => restriction) && (
                            <div className="flex flex-col gap-1 text-sm">
                              <span className="text-muted-foreground">{t("tableMap.table.details.dietaryRestrictions")}</span>
                              <div className="flex flex-wrap gap-1">
                                {getOrderDietaryRestrictions(selectedTable.id).map((restriction, index) => (
                                  restriction && (
                                    <Badge key={index} variant="outline" className="text-xs">
                                      {index === 0 ? t("vegetarian") : index === 1 ? t("vegan") : index === 2 ? t("glutenFree") : t("lactoseFree")}
                                    </Badge>
                                  )
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        <Separator />

                        <div>
                          <h4 className="font-medium mb-2">{t("tableMap.table.details.items")}</h4>
                          <ul className="space-y-2">
                            {getOrderItems(selectedTable.id).map((item, index) => (
                              <li key={index} className="flex justify-between">
                                <div>
                                  <div className="font-medium">
                                    {item.quantity}x {item.name}
                                  </div>
                                  {item.notes && <div className="text-xs text-muted-foreground">{item.notes}</div>}
                                  {(item.isVegetarian || item.isVegan || item.isGlutenFree || item.isLactoseFree) && (
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {item.isVegetarian && (
                                        <Badge variant="outline" className="text-xs">
                                          {t("vegetarian")}
                                        </Badge>
                                      )}
                                      {item.isVegan && (
                                        <Badge variant="outline" className="text-xs">
                                          {t("vegan")}
                                        </Badge>
                                      )}
                                      {item.isGlutenFree && (
                                        <Badge variant="outline" className="text-xs">
                                          {t("glutenFree")}
                                        </Badge>
                                      )}
                                      {item.isLactoseFree && (
                                        <Badge variant="outline" className="text-xs">
                                          {t("lactoseFree")}
                                        </Badge>
                                      )}
                                    </div>
                                  )}
                                </div>
                                <div className="text-right">${(item.price * item.quantity).toFixed(2)}</div>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <Separator />

                        <div className="flex justify-between font-bold">
                          <span>{t("tableMap.table.details.total")}</span>
                          <span>${getOrderTotal(selectedTable.id).toFixed(2)}</span>
                        </div>

                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <ClipboardList className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium mb-2">{t("tableMap.table.details.noActiveOrder")}</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          {selectedTable.status === "available"
                            ? t("tableMap.table.descriptions.available")
                            : t("tableMap.table.descriptions.maintenance")}
                        </p>
                      </div>
                    )}
                  </CardContent>

                  <CardFooter className="flex justify-between">
                    <Button variant="outline" onClick={() => setSelectedTable(null)}>
                      {t("tableMap.table.actions.close")}
                    </Button>

                    {hasActiveOrder(selectedTable.id) ? (
                      <div className="flex gap-2">
                        <Button variant="outline" asChild>
                          <Link href={`/orders/${getOrderByTableId(selectedTable.id)?.id}`}>
                            <Edit className="mr-2 h-4 w-4" />
                            {t("tableMap.table.actions.editOrder")}
                          </Link>
                        </Button>

                        {getOrderByTableId(selectedTable.id)?.status === "ready" ? (
                          <Button
                            onClick={() => handleMarkAsServed(getOrderByTableId(selectedTable.id)?.id, selectedTable.id)}
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            {t("tableMap.table.actions.markAsServed")}
                          </Button>
                        ) : getOrderByTableId(selectedTable.id)?.status === "delivered" ? (
                          <Button onClick={() => setIsClosingOrder(true)}>
                            <Receipt className="mr-2 h-4 w-4" />
                            {t("tableMap.table.actions.closeOrder")}
                          </Button>
                        ) : (
                          <Button disabled>{getOrderByTableId(selectedTable.id)?.status}</Button>
                        )}
                      </div>
                    ) : (
                      selectedTable.status === "available" && (
                        <Button onClick={() => setIsCreatingOrder(true)}>
                          <Plus className="mr-2 h-4 w-4" />
                          {t("tableMap.table.actions.createOrder")}
                        </Button>
                      )
                    )}
                  </CardFooter>
                </>
              ) : (
                <CardContent className="flex flex-col items-center justify-center h-full py-12">
                  <ClipboardList className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">{t("tableMap.selectTable")}</h3>
                  <p className="text-sm text-muted-foreground text-center max-w-xs">{t("tableMap.selectTableDescription")}</p>
                </CardContent>
              )}
            </Card>
          </div>
        </div>
      ) : (
        <Card>
          <CardContent className="p-6">
            <TableGridView
              tables={tableMap.tables}
              orders={activeOrders}
              onTableClick={handleTableClick}
              onCreateOrder={(table) => {
                setSelectedTable(table)
                setIsCreatingOrder(true)
              }}
              onViewOrder={handleViewOrder}
              onMarkAsServed={(table, orderId) => handleMarkAsServed(orderId, table.id)}
              onCloseOrder={(table, orderId) => {
                setSelectedTable(table)
                setIsClosingOrder(true)
              }}
            />
          </CardContent>
        </Card>
      )}

      {/* Create Order Dialog */}
      <Dialog open={isCreatingOrder} onOpenChange={setIsCreatingOrder}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {t("tableMap.createOrderForTable")} {selectedTable?.number}
            </DialogTitle>
            <DialogDescription>{t("tableMap.createOrderDescription")}</DialogDescription>
          </DialogHeader>

          <OrderForm 
            onSubmit={handleCreateOrder} 
            onCancel={() => setIsCreatingOrder(false)} 
            initialTable={selectedTable ? {
              id: selectedTable.id,
              number: selectedTable.number,
              mapId: tableMap.id  // Pass the current table map ID
            } : undefined}
          />
        </DialogContent>
      </Dialog>

      {/* Order Closure Dialog */}
      <Dialog open={isClosingOrder} onOpenChange={setIsClosingOrder}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t("tableMap.closeOrderForTable")} {selectedTable?.number}
            </DialogTitle>
            <DialogDescription>{t("tableMap.closeOrderDescription")}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t("tableMap.subtotal")}</span>
              <span>${getOrderSubtotal(selectedTable?.id).toFixed(2) || "0.00"}</span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t("tableMap.tax")}</span>
              <span>${getOrderTax(selectedTable?.id).toFixed(2) || "0.00"}</span>
            </div>

            <Separator />

            <div className="flex justify-between font-bold">
              <span>{t("tableMap.total")}</span>
              <span>${getOrderTotal(selectedTable?.id).toFixed(2) || "0.00"}</span>
            </div>

            <div className="space-y-2 pt-4">
              <Label htmlFor="paymentMethod">{t("tableMap.paymentMethod")}</Label>
              <select
                id="paymentMethod"
                className="w-full rounded-md border border-input bg-background px-3 py-2"
                value={paymentInfo.method}
                onChange={(e) =>
                  setPaymentInfo({ ...paymentInfo, method: e.target.value as "cash" | "credit" | "debit" | "other" })
                }
              >
                <option value="cash">{t("tableMap.cash")}</option>
                <option value="credit">{t("tableMap.creditCard")}</option>
                <option value="debit">{t("tableMap.debitCard")}</option>
                <option value="other">{t("tableMap.otherPayment")}</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentAmount">{t("tableMap.paymentAmount")}</Label>
              <Input
                id="paymentAmount"
                type="number"
                step="0.01"
                min={getOrderTotal(selectedTable?.id) || 0}
                value={paymentInfo.amount || getOrderTotal(selectedTable?.id) || 0}
                onChange={(e) => setPaymentInfo({ ...paymentInfo, amount: Number.parseFloat(e.target.value) })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipAmount">{t("tableMap.tipAmount")}</Label>
              <Input
                id="tipAmount"
                type="number"
                step="0.01"
                min="0"
                value={paymentInfo.tip || 0}
                onChange={(e) => setPaymentInfo({ ...paymentInfo, tip: Number.parseFloat(e.target.value) })}
              />
            </div>

            {(paymentInfo.method === "credit" || paymentInfo.method === "debit") && (
              <div className="space-y-2">
                <Label htmlFor="referenceNumber">{t("tableMap.referenceNumber")}</Label>
                <Input
                  id="referenceNumber"
                  placeholder={t("tableMap.referenceNumberPlaceholder")}
                  value={paymentInfo.reference || ""}
                  onChange={(e) => setPaymentInfo({ ...paymentInfo, reference: e.target.value })}
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsClosingOrder(false)}>
              {t("tableMap.cancel")}
            </Button>
            <Button
              onClick={() =>
                selectedTable &&
                getOrderByTableId(selectedTable.id) &&
                handleCloseOrder(getOrderByTableId(selectedTable.id)?.id, selectedTable.id)
              }
            >
              <Receipt className="mr-2 h-4 w-4" />
              {t("tableMap.completePayment")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <OrderDetailsDialog 
        open={isOrderDialogOpen}
        onOpenChange={setIsOrderDialogOpen}
        order={selectedOrder}
        table={{ number: selectedOrder?.tableNumber || 0 }}
      />
    </div>
  )
}
