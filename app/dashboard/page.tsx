"use client"

import { useEffect, useState } from "react"
import { useI18n } from "@/components/i18n-provider"
import { useFirebase } from "@/components/firebase-provider"
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, LineChart, PieChart } from "lucide-react"

// Define types for our dashboard data
type SalesData = {
  date: Date
  amount: number
}

type TopSellingItem = {
  id: string
  name: string
  orders: number
}

type InventoryData = {
  level: number
  lowStockItems?: string[]
}

export default function DashboardPage() {
  const { t, i18n } = useI18n()
  const { db } = useFirebase()
  const [recentOrders, setRecentOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  // Properly typed state variables
  const [totalSales, setTotalSales] = useState<number>(0)
  const [salesGrowthPercentage, setSalesGrowthPercentage] = useState<number>(0)
  const [salesTrend, setSalesTrend] = useState<number[]>([])
  const [topSellingItems, setTopSellingItems] = useState<TopSellingItem[]>([])
  const [inventoryLevel, setInventoryLevel] = useState<number>(0)
  const [lowStockItems, setLowStockItems] = useState<string[]>([])

  useEffect(() => {
    const fetchRecentOrders = async () => {
      if (!db) {
        console.warn("Firestore database is not initialized")
        return
      }

      try {
        const ordersRef = collection(db!, "orders")
        const q = query(ordersRef, orderBy("createdAt", "desc"), limit(5))
        const querySnapshot = await getDocs(q)

        const fetchedOrders = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))

        setRecentOrders(fetchedOrders)
      } catch (error) {
        console.error("Error fetching recent orders:", error)
      } finally {
        setLoading(false)
      }
    }

    const fetchSalesData = async () => {
      if (!db) {
        console.warn("Firestore database is not initialized")
        return
      }

      try {
        const salesRef = collection(db!, "sales")
        const q = query(salesRef, orderBy("date", "desc"), limit(30))
        const querySnapshot = await getDocs(q)

        const salesData: SalesData[] = querySnapshot.docs.map((doc) => ({
          date: doc.data().date.toDate(),
          amount: doc.data().amount,
        }))

        const totalSales = salesData.reduce((acc, curr) => acc + curr.amount, 0)
        const salesGrowthPercentage = salesData.length > 1 
          ? ((totalSales / salesData[0].amount) - 1) * 100 
          : 0
        const salesTrend = salesData.map((sale) => sale.amount)

        setTotalSales(totalSales)
        setSalesGrowthPercentage(salesGrowthPercentage)
        setSalesTrend(salesTrend)
      } catch (error) {
        console.error("Error fetching sales data:", error)
      }
    }

    const fetchTopSellingItems = async () => {
      if (!db) {
        console.warn("Firestore database is not initialized")
        return
      }

      try {
        const itemsRef = collection(db!, "items")
        const q = query(itemsRef, orderBy("orders", "desc"), limit(5))
        const querySnapshot = await getDocs(q)

        const topSellingItems: TopSellingItem[] = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name,
          orders: doc.data().orders,
        }))

        setTopSellingItems(topSellingItems)
      } catch (error) {
        console.error("Error fetching top selling items:", error)
      }
    }

    const fetchInventoryData = async () => {
      if (!db) {
        console.warn("Firestore database is not initialized")
        return
      }

      try {
        const inventoryRef = collection(db!, "inventory")
        const q = query(inventoryRef, orderBy("level", "desc"), limit(1))
        const querySnapshot = await getDocs(q)
        
        // Log the query snapshot for debugging
        console.log("Inventory Query Snapshot:", {
          empty: querySnapshot.empty,
          docs: querySnapshot.docs.length,
          firstDocData: querySnapshot.docs.length > 0 ? querySnapshot.docs[0].data() : null
        })

        // Handle empty query result
        if (querySnapshot.empty) {
          console.warn("No inventory data found")
          setInventoryLevel(0)
          setLowStockItems([])
          return
        }

        // Safely access the first document
        const firstDoc = querySnapshot.docs[0]
        if (!firstDoc) {
          console.warn("No first document in inventory query")
          setInventoryLevel(0)
          setLowStockItems([])
          return
        }

        // Safely get document data
        const docData = firstDoc.data()
        if (!docData) {
          console.warn("Document data is undefined")
          setInventoryLevel(0)
          setLowStockItems([])
          return
        }

        // Type assertion with additional checks
        const inventoryData = docData as InventoryData

        // Set state with fallback values
        setInventoryLevel(inventoryData.level || 0)
        setLowStockItems(inventoryData.lowStockItems || [])
      } catch (error) {
        console.error("Error fetching inventory data:", error)
      }
    }

    fetchRecentOrders()
    fetchSalesData()
    fetchTopSellingItems()
    fetchInventoryData()
  }, [db, i18n.language])

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">{t("dashboard.title")}</h1>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t("dashboard.salesOverview.title")}</CardTitle>
            <CardDescription>{t("dashboard.salesOverview.description")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {t("dashboard.salesOverview.totalSales", { 
                amount: t("commons.currency", { 
                  value: totalSales.toLocaleString(i18n.language, { 
                    minimumFractionDigits: 2, 
                    maximumFractionDigits: 2 
                  }) 
                }) 
              })}
            </div>
            <p className="text-xs text-muted-foreground">
              {t("dashboard.salesOverview.monthlyGrowth", { 
                percentage: salesGrowthPercentage.toLocaleString(i18n.language, {
                  minimumFractionDigits: 1,
                  maximumFractionDigits: 1
                }) 
              })}
            </p>
            {salesTrend.length > 0 && (
              <div className="mt-4 h-[60px]">
                <LineChart className="w-full h-full" />
                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                  {salesTrend.map((amount, index) => (
                    <span key={index}>
                      {t("dashboard.salesOverview.dailySalesTrendFormat", {
                        day: index + 1,
                        amount: t("commons.currency", { 
                          value: amount.toLocaleString(i18n.language, { 
                            minimumFractionDigits: 2, 
                            maximumFractionDigits: 2 
                          }) 
                        })
                      })}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t("dashboard.topSellingItems.title")}</CardTitle>
            <CardDescription>{t("dashboard.topSellingItems.description")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {topSellingItems.map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span>{t(`menu.items.${item.id}`, { defaultValue: item.name })}</span>
                  <span className="text-sm text-muted-foreground">
                    {t("dashboard.topSellingItems.orderCount", { 
                      count: item.orders 
                    })}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t("dashboard.stockLevel.title")}</CardTitle>
            <CardDescription>{t("dashboard.stockLevel.description")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-[120px]">
              <div className="relative w-32 h-32">
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl font-bold">
                    {t("dashboard.stockLevel.percentage", { 
                      percentage: inventoryLevel.toLocaleString(i18n.language, { 
                        minimumFractionDigits: 0, 
                        maximumFractionDigits: 0 
                      }) 
                    })}
                  </span>
                </div>
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  <circle
                    className="text-muted stroke-current"
                    strokeWidth="10"
                    fill="transparent"
                    r="40"
                    cx="50"
                    cy="50"
                  />
                  <circle
                    className="text-primary stroke-current"
                    strokeWidth="10"
                    fill="transparent"
                    r="40"
                    cx="50"
                    cy="50"
                    strokeDasharray="251.2"
                    strokeDashoffset={`${251.2 * (1 - inventoryLevel / 100)}`}
                  />
                </svg>
              </div>
            </div>
            <div className="mt-2 text-center text-sm text-muted-foreground">
              {t("dashboard.stockLevel.lowStockItems", { 
                count: Number(lowStockItems.length)
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="recent">
        <TabsList>
          <TabsTrigger value="recent">
            <LineChart className="h-4 w-4 mr-2" />
            {t("dashboard.recentOrders")}
          </TabsTrigger>
          <TabsTrigger value="sales">
            <BarChart className="h-4 w-4 mr-2" />
            {t("dashboard.salesOverview.title")}
          </TabsTrigger>
          <TabsTrigger value="categories">
            <PieChart className="h-4 w-4 mr-2" />
            Categories
          </TabsTrigger>
        </TabsList>

        <TabsContent value="recent" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("dashboard.recentOrders")}</CardTitle>
              <CardDescription>Latest orders from customers</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-4">Loading...</div>
              ) : recentOrders.length > 0 ? (
                <div className="space-y-4">
                  {recentOrders.map((order, index) => (
                    <div key={order.id} className="flex items-center justify-between border-b pb-2">
                      <div>
                        <div className="font-medium">Order #{order.id.substring(0, 6)}</div>
                        <div className="text-sm text-muted-foreground">
                          Table {order.table || "N/A"} • {order.items?.length || 0} items
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">${order.total?.toFixed(2) || "0.00"}</div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(order.createdAt?.toDate()).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">No recent orders found</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sales" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("dashboard.salesOverview.title")}</CardTitle>
              <CardDescription>Sales data for the current period</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-end justify-between">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, i) => (
                  <div key={day} className="flex flex-col items-center gap-2">
                    <div
                      className="w-12 bg-primary rounded-sm"
                      style={{ height: `${Math.floor(Math.random() * 200) + 50}px` }}
                    />
                    <span className="text-sm">{day}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Categories</CardTitle>
              <CardDescription>Sales by category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center py-4">
                <div className="w-[300px] h-[300px] relative">
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    {[
                      { color: "hsl(var(--primary))", start: 0, size: 25 },
                      { color: "hsl(var(--primary) / 0.8)", start: 25, size: 20 },
                      { color: "hsl(var(--primary) / 0.6)", start: 45, size: 15 },
                      { color: "hsl(var(--primary) / 0.4)", start: 60, size: 10 },
                      { color: "hsl(var(--primary) / 0.2)", start: 70, size: 30 },
                    ].map((segment, i) => {
                      const startAngle = (segment.start / 100) * 360
                      const endAngle = ((segment.start + segment.size) / 100) * 360

                      const x1 = 50 + 40 * Math.cos((startAngle - 90) * (Math.PI / 180))
                      const y1 = 50 + 40 * Math.sin((startAngle - 90) * (Math.PI / 180))
                      const x2 = 50 + 40 * Math.cos((endAngle - 90) * (Math.PI / 180))
                      const y2 = 50 + 40 * Math.sin((endAngle - 90) * (Math.PI / 180))

                      const largeArcFlag = segment.size > 50 ? 1 : 0

                      return (
                        <path
                          key={i}
                          d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
                          fill={segment.color}
                        />
                      )
                    })}
                    <circle cx="50" cy="50" r="25" fill="hsl(var(--background))" />
                  </svg>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-primary mr-2" />
                  <span>Main Dishes (25%)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-primary/80 mr-2" />
                  <span>Appetizers (20%)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-primary/60 mr-2" />
                  <span>Desserts (15%)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-primary/40 mr-2" />
                  <span>Drinks (10%)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-primary/20 mr-2" />
                  <span>Others (30%)</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
