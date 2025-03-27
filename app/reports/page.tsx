"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { useFirebase } from "@/components/firebase-provider"
import { useI18n } from "@/components/i18n-provider"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { collection, query, where, orderBy, getDocs } from "firebase/firestore"
import { Loader2, Download, Calendar, Filter, Search, BarChart, PieChart, LineChart } from "lucide-react"

interface Order {
  id: string
  mapId: string
  tableId: string
  tableNumber: number
  status: string
  items: OrderItem[]
  subtotal: number
  tax?: number
  discount?: number
  total: number
  waiter: string
  waiterId: string
  createdAt: any
  updatedAt: any
  closedAt?: any
  specialRequests?: string
  dietaryRestrictions?: string[]
  payment?: PaymentInfo
}

interface OrderItem {
  id: string
  name: string
  quantity: number
  price: number
  category?: string
  notes?: string
  dietaryRestrictions?: string[]
}

interface PaymentInfo {
  method: string
  amount: number
  tip?: number
  reference?: string
  processedAt: any
}

export default function ReportsPage() {
  const { user } = useAuth()
  const { db } = useFirebase()
  const { t } = useI18n()
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // Last 7 days
    end: new Date().toISOString().split("T")[0],
  })
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("orders")

  // Calculated metrics
  const [metrics, setMetrics] = useState({
    totalSales: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    totalTips: 0,
    topSellingItems: [] as { name: string; quantity: number; revenue: number }[],
    salesByCategory: [] as { category: string; revenue: number; percentage: number }[],
    salesByPaymentMethod: [] as { method: string; revenue: number; percentage: number }[],
  })

  useEffect(() => {
    if (db) {
      fetchOrders()
    }
  }, [db])

  useEffect(() => {
    if (orders.length > 0) {
      applyFilters()
    }
  }, [orders, dateRange, searchQuery])

  useEffect(() => {
    if (filteredOrders.length > 0) {
      calculateMetrics()
    }
  }, [filteredOrders])

  const fetchOrders = async () => {
    if (!db) return

    setLoading(true)
    try {
      const ordersRef = collection(db, "orders")
      const q = query(ordersRef, where("status", "==", "closed"), orderBy("closedAt", "desc"))

      const querySnapshot = await getDocs(q)

      const fetchedOrders: Order[] = []
      querySnapshot.forEach((doc) => {
        fetchedOrders.push({ id: doc.id, ...doc.data() } as Order)
      })

      setOrders(fetchedOrders)
      setFilteredOrders(fetchedOrders)
    } catch (error) {
      console.error("Error fetching orders:", error)
      toast({
        title: "Error",
        description: "Failed to fetch order data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...orders]

    // Apply date range filter
    if (dateRange.start && dateRange.end) {
      const startDate = new Date(dateRange.start)
      startDate.setHours(0, 0, 0, 0)

      const endDate = new Date(dateRange.end)
      endDate.setHours(23, 59, 59, 999)

      filtered = filtered.filter((order) => {
        if (!order.closedAt) return false

        const orderDate = order.closedAt.toDate ? order.closedAt.toDate() : new Date(order.closedAt)
        return orderDate >= startDate && orderDate <= endDate
      })
    }

    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (order) =>
          order.waiter.toLowerCase().includes(query) ||
          order.tableNumber.toString().includes(query) ||
          order.id.toLowerCase().includes(query) ||
          order.items.some((item) => item.name.toLowerCase().includes(query)),
      )
    }

    setFilteredOrders(filtered)
  }

  const calculateMetrics = () => {
    // Total sales
    const totalSales = filteredOrders.reduce((sum, order) => sum + order.total, 0)

    // Total orders
    const totalOrders = filteredOrders.length

    // Average order value
    const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0

    // Total tips
    const totalTips = filteredOrders.reduce((sum, order) => {
      return sum + (order.payment?.tip || 0)
    }, 0)

    // Top selling items
    const itemSales: Record<string, { name: string; quantity: number; revenue: number }> = {}
    filteredOrders.forEach((order) => {
      order.items.forEach((item) => {
        if (!itemSales[item.name]) {
          itemSales[item.name] = {
            name: item.name,
            quantity: 0,
            revenue: 0,
          }
        }
        itemSales[item.name].quantity += item.quantity
        itemSales[item.name].revenue += item.price * item.quantity
      })
    })

    const topSellingItems = Object.values(itemSales)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10)

    // Sales by category
    const categorySales: Record<string, number> = {}
    filteredOrders.forEach((order) => {
      order.items.forEach((item) => {
        const category = item.category || "Uncategorized"
        if (!categorySales[category]) {
          categorySales[category] = 0
        }
        categorySales[category] += item.price * item.quantity
      })
    })

    const totalRevenue = Object.values(categorySales).reduce((sum, revenue) => sum + revenue, 0)
    const salesByCategory = Object.entries(categorySales)
      .map(([category, revenue]) => ({
        category,
        revenue,
        percentage: totalRevenue > 0 ? (revenue / totalRevenue) * 100 : 0,
      }))
      .sort((a, b) => b.revenue - a.revenue)

    // Sales by payment method
    const paymentMethodSales: Record<string, number> = {}
    filteredOrders.forEach((order) => {
      const method = order.payment?.method || "unknown"
      if (!paymentMethodSales[method]) {
        paymentMethodSales[method] = 0
      }
      paymentMethodSales[method] += order.total
    })

    const salesByPaymentMethod = Object.entries(paymentMethodSales)
      .map(([method, revenue]) => ({
        method,
        revenue,
        percentage: totalRevenue > 0 ? (revenue / totalRevenue) * 100 : 0,
      }))
      .sort((a, b) => b.revenue - a.revenue)

    setMetrics({
      totalSales,
      totalOrders,
      averageOrderValue,
      totalTips,
      topSellingItems,
      salesByCategory,
      salesByPaymentMethod,
    })
  }

  const exportToCSV = () => {
    if (filteredOrders.length === 0) return

    // Create CSV content
    let csvContent = "data:text/csv;charset=utf-8,"

    // Headers
    csvContent += "Order ID,Table,Waiter,Date,Time,Items,Subtotal,Tax,Discount,Total,Payment Method,Tip\n"

    // Data rows
    filteredOrders.forEach((order) => {
      const date = order.closedAt?.toDate
        ? order.closedAt.toDate().toLocaleDateString()
        : new Date(order.closedAt).toLocaleDateString()

      const time = order.closedAt?.toDate
        ? order.closedAt.toDate().toLocaleTimeString()
        : new Date(order.closedAt).toLocaleTimeString()

      const items = order.items.map((item) => `${item.quantity}x ${item.name}`).join("; ")

      csvContent +=
        [
          `"${order.id}"`,
          order.tableNumber,
          `"${order.waiter}"`,
          date,
          time,
          `"${items}"`,
          order.subtotal.toFixed(2),
          (order.tax || 0).toFixed(2),
          (order.discount || 0).toFixed(2),
          order.total.toFixed(2),
          order.payment?.method || "N/A",
          (order.payment?.tip || 0).toFixed(2),
        ].join(",") + "\n"
    })

    // Create download link
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `orders_report_${dateRange.start}_to_${dateRange.end}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t("reports")}</h1>
        <Button onClick={exportToCSV} disabled={filteredOrders.length === 0}>
          <Download className="mr-2 h-4 w-4" />
          {t("exportToCSV")}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("filterOptions")}</CardTitle>
          <CardDescription>{t("filterDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">{t("startDate")}</Label>
              <div className="flex items-center">
                <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="startDate"
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">{t("endDate")}</Label>
              <div className="flex items-center">
                <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="endDate"
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="search">{t("search")}</Label>
              <div className="flex items-center">
                <Search className="mr-2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  type="text"
                  placeholder={t("searchPlaceholder")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">{t("totalSales")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${metrics.totalSales.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">
                  {filteredOrders.length} {t("orders")}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">{t("averageOrderValue")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${metrics.averageOrderValue.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">{t("perOrder")}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">{t("totalTips")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${metrics.totalTips.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">
                  {(metrics.totalSales > 0 ? (metrics.totalTips / metrics.totalSales) * 100 : 0).toFixed(1)}%{" "}
                  {t("ofSales")}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">{t("totalOrders")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.totalOrders}</div>
                <p className="text-xs text-muted-foreground">{t("closedOrders")}</p>
              </CardContent>
            </Card>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="orders">
                <Filter className="mr-2 h-4 w-4" />
                {t("ordersList")}
              </TabsTrigger>
              <TabsTrigger value="items">
                <BarChart className="mr-2 h-4 w-4" />
                {t("topSellingItems")}
              </TabsTrigger>
              <TabsTrigger value="categories">
                <PieChart className="mr-2 h-4 w-4" />
                {t("salesByCategory")}
              </TabsTrigger>
              <TabsTrigger value="payment">
                <LineChart className="mr-2 h-4 w-4" />
                {t("salesByPaymentMethod")}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="orders" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>{t("ordersList")}</CardTitle>
                  <CardDescription>
                    {t("showing")} {filteredOrders.length} {t("of")} {orders.length} {t("orders")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {filteredOrders.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t("orderId")}</TableHead>
                          <TableHead>{t("table")}</TableHead>
                          <TableHead>{t("waiter")}</TableHead>
                          <TableHead>{t("date")}</TableHead>
                          <TableHead>{t("items")}</TableHead>
                          <TableHead className="text-right">{t("total")}</TableHead>
                          <TableHead className="text-right">{t("payment")}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredOrders.slice(0, 20).map((order) => (
                          <TableRow key={order.id}>
                            <TableCell className="font-medium">{order.id.substring(0, 8)}</TableCell>
                            <TableCell>{order.tableNumber}</TableCell>
                            <TableCell>{order.waiter}</TableCell>
                            <TableCell>
                              {order.closedAt?.toDate
                                ? new Date(order.closedAt.toDate()).toLocaleString()
                                : new Date(order.closedAt).toLocaleString()}
                            </TableCell>
                            <TableCell>{order.items.reduce((sum, item) => sum + item.quantity, 0)}</TableCell>
                            <TableCell className="text-right">${order.total.toFixed(2)}</TableCell>
                            <TableCell className="text-right">
                              <Badge variant="outline">{t(order.payment?.method || "unknown")}</Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">{t("noOrdersFound")}</div>
                  )}

                  {filteredOrders.length > 20 && (
                    <div className="text-center mt-4 text-sm text-muted-foreground">
                      {t("showingFirst")} 20 {t("of")} {filteredOrders.length} {t("orders")}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="items" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>{t("topSellingItems")}</CardTitle>
                  <CardDescription>{t("topSellingItemsDescription")}</CardDescription>
                </CardHeader>
                <CardContent>
                  {metrics.topSellingItems.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t("item")}</TableHead>
                          <TableHead className="text-right">{t("quantity")}</TableHead>
                          <TableHead className="text-right">{t("revenue")}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {metrics.topSellingItems.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{item.name}</TableCell>
                            <TableCell className="text-right">{item.quantity}</TableCell>
                            <TableCell className="text-right">${item.revenue.toFixed(2)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">{t("noDataAvailable")}</div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="categories" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>{t("salesByCategory")}</CardTitle>
                  <CardDescription>{t("salesByCategoryDescription")}</CardDescription>
                </CardHeader>
                <CardContent>
                  {metrics.salesByCategory.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t("category")}</TableHead>
                          <TableHead className="text-right">{t("revenue")}</TableHead>
                          <TableHead className="text-right">{t("percentage")}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {metrics.salesByCategory.map((category, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{category.category}</TableCell>
                            <TableCell className="text-right">${category.revenue.toFixed(2)}</TableCell>
                            <TableCell className="text-right">{category.percentage.toFixed(1)}%</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">{t("noDataAvailable")}</div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="payment" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>{t("salesByPaymentMethod")}</CardTitle>
                  <CardDescription>{t("salesByPaymentMethodDescription")}</CardDescription>
                </CardHeader>
                <CardContent>
                  {metrics.salesByPaymentMethod.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t("paymentMethod")}</TableHead>
                          <TableHead className="text-right">{t("revenue")}</TableHead>
                          <TableHead className="text-right">{t("percentage")}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {metrics.salesByPaymentMethod.map((method, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{t(method.method)}</TableCell>
                            <TableCell className="text-right">${method.revenue.toFixed(2)}</TableCell>
                            <TableCell className="text-right">{method.percentage.toFixed(1)}%</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">{t("noDataAvailable")}</div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  )
}

