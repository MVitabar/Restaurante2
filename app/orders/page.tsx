"use client"

import { useState, useEffect } from "react"
import { useI18n } from "@/components/i18n-provider"
import { useFirebase } from "@/components/firebase-provider"
import { collection, query, orderBy, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, MoreHorizontal, Edit, Trash } from "lucide-react"
import Link from "next/link"
import { TFunction } from 'i18next';

// Order status types
type OrderStatus = "pending" | "preparing" | "ready" | "delivered" | "cancelled"

// Order interface
interface Order {
  id: string
  table: number
  waiter: string
  status: OrderStatus
  items: Array<{
    id: string
    name: string
    quantity: number
    price: number
  }>
  total: number
  createdAt: any
  updatedAt: any
}

// Language codes
type LanguageCode = 'en' | 'es' | 'pt';

// Status Translation Type
type StatusTranslation = {
  [key in LanguageCode]: string;
};

// Comprehensive Status Translation Mapping
const STATUS_TRANSLATIONS: Record<OrderStatus, StatusTranslation> = {
  "pending": {
    en: "Pending",
    es: "Pendiente", 
    pt: "Pendente"
  },
  "preparing": {
    en: "In Preparation",
    es: "En preparación", 
    pt: "Em Preparação"
  },
  "ready": {
    en: "Ready to Serve",
    es: "Listo para servir", 
    pt: "Pronto para Servir"
  },
  "delivered": {
    en: "Delivered",
    es: "Entregado", 
    pt: "Entregue"
  },
  "cancelled": {
    en: "Cancelled",
    es: "Cancelado", 
    pt: "Cancelado"
  }
};

// Translation Utility
const translateStatus = (
  status: string | OrderStatus, 
  language: LanguageCode = 'en'
): string => {
  // Check if status is a valid OrderStatus
  const validStatus = Object.keys(STATUS_TRANSLATIONS).includes(status as OrderStatus)
    ? status as OrderStatus
    : undefined;

  // Look up translation, with fallback to the input status
  return validStatus 
    ? STATUS_TRANSLATIONS[validStatus][language]
    : status.toString();
};

export default function OrdersPage() {
  const { t, i18n }: { t: TFunction, i18n: any } = useI18n()
  const { db } = useFirebase()
  const { toast } = useToast()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false)
  const [newStatus, setNewStatus] = useState<OrderStatus>("pending")

  useEffect(() => {
    fetchOrders()
  }, [db])

  const fetchOrders = async () => {
    if (!db) return

    setLoading(true)
    try {
      const ordersRef = collection(db, "orders")
      const q = query(ordersRef, orderBy("createdAt", "desc"))
      const querySnapshot = await getDocs(q)

      const fetchedOrders = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Order[]

      setOrders(fetchedOrders)
    } catch (error) {
      console.error("Error fetching orders:", error)
      toast({
        title: t("commons.error"),
        description: t("orders.error.fetchFailed"),
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async () => {
    if (!db || !selectedOrder) return

    try {
      const orderRef = doc(db, "orders", selectedOrder.id)
      await updateDoc(orderRef, {
        status: newStatus,
        updatedAt: new Date(),
      })

      // Update local state
      setOrders(
        orders.map((order) =>
          order.id === selectedOrder.id ? { ...order, status: newStatus, updatedAt: new Date() } : order,
        ),
      )

      toast({
        title: t("orders.success.statusUpdated"),
        description: `${t("orders.table.id")} #${selectedOrder.id.substring(0, 6)} ${t("orders.action.updateStatus")} ${translateStatus(newStatus, i18n?.language)}`,
      })

      setIsStatusDialogOpen(false)
    } catch (error) {
      console.error("Error updating order status:", error)
      toast({
        title: t("commons.error"),
        description: t("orders.error.updateStatusFailed"),
        variant: "destructive",
      })
    }
  }

  const handleDeleteOrder = async () => {
    if (!db || !selectedOrder) return

    try {
      const orderRef = doc(db, "orders", selectedOrder.id)
      await deleteDoc(orderRef)

      // Update local state
      setOrders(orders.filter((order) => order.id !== selectedOrder.id))

      toast({
        title: t("orders.success.orderDeleted"),
        description: `${t("orders.table.id")} #${selectedOrder.id.substring(0, 6)} ${t("orders.action.delete")}`,
      })

      setIsDeleteDialogOpen(false)
    } catch (error) {
      console.error("Error deleting order:", error)
      toast({
        title: t("commons.error"),
        description: t("orders.error.deleteFailed"),
        variant: "destructive",
      })
    }
  }

  const getStatusBadgeVariant = (status: OrderStatus) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "preparing":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "ready":
        return "bg-green-100 text-green-800 border-green-200"
      case "delivered":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return ""
    }
  }

  const filteredOrders = orders.filter(
    (order) =>
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.table.toString().includes(searchQuery) ||
      order.waiter.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.status.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t("ordersPage.orders")}</h1>
        <Link href="/orders/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            {t("ordersPage.newOrder")}
          </Button>
        </Link>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder={t("ordersPage.search.placeholder")}
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select defaultValue="all">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={t("ordersPage.filter.allStatuses")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("ordersPage.filter.allStatuses")}</SelectItem>
            {Object.keys(STATUS_TRANSLATIONS).map((status) => (
              <SelectItem key={status} value={status}>
                {translateStatus(status, i18n?.language)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("ordersPage.orders")}</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">{t("commons.loading")}</div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-4">{t("ordersPage.noOrdersFound")}</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("ordersPage.table.id")}</TableHead>
                  <TableHead>{t("ordersPage.table.table")}</TableHead>
                  <TableHead>{t("ordersPage.table.waiter")}</TableHead>
                  <TableHead>{t("ordersPage.table.items")}</TableHead>
                  <TableHead>{t("ordersPage.table.status")}</TableHead>
                  <TableHead>{t("ordersPage.table.total")}</TableHead>
                  <TableHead>{t("ordersPage.table.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>#{order.id.substring(0, 6)}</TableCell>
                    <TableCell>{order.table}</TableCell>
                    <TableCell>{order.waiter}</TableCell>
                    <TableCell>
                      {order.items.map((item) => `${item.name} (${item.quantity})`).join(", ")}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline" 
                        className={getStatusBadgeVariant(order.status)}
                      >
                        {translateStatus(order.status, i18n?.language)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {t("commons.currency", { 
                        value: order.total.toLocaleString(i18n.language, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        }) 
                      })}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem 
                            onSelect={() => {
                              setSelectedOrder(order)
                              setIsStatusDialogOpen(true)
                            }}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            {t("ordersPage.action.updateStatus")}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onSelect={() => {
                              setSelectedOrder(order)
                              setIsDeleteDialogOpen(true)
                            }}
                            className="text-destructive"
                          >
                            <Trash className="mr-2 h-4 w-4" />
                            {t("ordersPage.action.delete")}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Status Update Dialog */}
      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("ordersPage.action.updateStatus")}</DialogTitle>
            <DialogDescription>
              {t("ordersPage.action.updateStatusDescription", { 
                orderId: selectedOrder ? `#${selectedOrder.id.substring(0, 6)}` : '' 
              })}
            </DialogDescription>
          </DialogHeader>
          <Select 
            value={newStatus} 
            onValueChange={(value: OrderStatus) => setNewStatus(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder={t("ordersPage.action.selectStatus")} />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(STATUS_TRANSLATIONS).map((status) => (
                <SelectItem key={status} value={status}>
                  {translateStatus(status, i18n?.language)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsStatusDialogOpen(false)}
            >
              {t("commons.button.cancel")}
            </Button>
            <Button onClick={handleUpdateStatus}>
              {t("commons.button.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("ordersPage.action.deleteOrder")}</DialogTitle>
            <DialogDescription>
              {t("ordersPage.action.deleteOrderConfirmation", { 
                orderId: selectedOrder ? `#${selectedOrder.id.substring(0, 6)}` : '' 
              })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              {t("commons.cancel")}
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteOrder}
            >
              {t("commons.delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
