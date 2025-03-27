"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { useFirebase } from "@/components/firebase-provider"
import { useI18n } from "@/components/i18n-provider"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, FileSpreadsheet } from "lucide-react"
import { collection, query, where, orderBy, getDocs } from "firebase/firestore"
import { ExcelReportGenerator } from "@/components/reports/excel-report-generator"

export default function AdvancedReportsPage() {
  const { user } = useAuth()
  const { db } = useFirebase()
  const { t } = useI18n()
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [reportData, setReportData] = useState<any>({})

  useEffect(() => {
    if (db) {
      fetchReportData()
    }
  }, [db])

  const fetchReportData = async () => {
    if (!db) return

    setLoading(true)
    try {
      // Fetch all the data needed for reports
      const data = await fetchAllReportData()
      setReportData(data)
    } catch (error) {
      console.error("Error fetching report data:", error)
      toast({
        title: "Error",
        description: "Failed to fetch report data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchAllReportData = async () => {
    // This would be a comprehensive data fetch from all collections
    // For now, we'll create sample data for demonstration

    // 1. Sales data
    const salesData = await fetchSalesData()

    // 2. Orders data
    const ordersData = await fetchOrdersData()

    // 3. Inventory data
    const inventoryData = await fetchInventoryData()

    // 4. Financial data
    const financialData = generateFinancialData()

    // 5. Staff data
    const staffData = generateStaffData()

    // 6. Customers data
    const customersData = generateCustomersData()

    // 7. Reservations data
    const reservationsData = generateReservationsData()

    return {
      sales: salesData,
      orders: ordersData,
      inventory: inventoryData,
      financial: financialData,
      staff: staffData,
      customers: customersData,
      reservations: reservationsData,
    }
  }

  const fetchSalesData = async () => {
    try {
      if (!db) return generateSampleSalesData()

      const ordersRef = collection(db, "orders")
      const q = query(ordersRef, where("status", "==", "closed"), orderBy("closedAt", "desc"))

      const querySnapshot = await getDocs(q)

      if (querySnapshot.empty) {
        return generateSampleSalesData()
      }

      const orders = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))

      // Calculate total sales
      const totalSales = orders.reduce((sum, order) => sum + (order.total || 0), 0)

      // Calculate average ticket
      const avgTicket = orders.length > 0 ? totalSales / orders.length : 0

      // Sales by category
      const salesByCategory: Record<string, number> = {}
      orders.forEach((order) => {
        if (order.items && Array.isArray(order.items)) {
          order.items.forEach((item) => {
            const category = item.category || "Uncategorized"
            if (!salesByCategory[category]) {
              salesByCategory[category] = 0
            }
            salesByCategory[category] += item.price * item.quantity || 0
          })
        }
      })

      // Format data for the report
      const salesTableData = Object.entries(salesByCategory).map(([category, amount]) => ({
        Category: category,
        Amount: `$${amount.toFixed(2)}`,
        Percentage: `${((amount / totalSales) * 100).toFixed(1)}%`,
      }))

      // Add a total row
      salesTableData.push({
        Category: "TOTAL",
        Amount: `$${totalSales.toFixed(2)}`,
        Percentage: "100%",
      })

      return {
        summary: [
          { label: t("totalSales"), value: `$${totalSales.toFixed(2)}` },
          { label: t("averageTicket"), value: `$${avgTicket.toFixed(2)}` },
          { label: t("totalOrders"), value: orders.length },
          { label: t("categories"), value: Object.keys(salesByCategory).length },
        ],
        data: salesTableData,
      }
    } catch (error) {
      console.error("Error fetching sales data:", error)
      return generateSampleSalesData()
    }
  }

  const fetchOrdersData = async () => {
    try {
      if (!db) return generateSampleOrdersData()

      const ordersRef = collection(db, "orders")
      const q = query(ordersRef, orderBy("createdAt", "desc"))

      const querySnapshot = await getDocs(q)

      if (querySnapshot.empty) {
        return generateSampleOrdersData()
      }

      const orders = querySnapshot.docs.map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
          closedAt: data.closedAt?.toDate ? data.closedAt.toDate() : null,
        }
      })

      // Calculate order statistics
      const totalOrders = orders.length
      const completedOrders = orders.filter((order) => order.status === "closed").length
      const pendingOrders = orders.filter((order) => ["pending", "preparing", "ready"].includes(order.status)).length
      const cancelledOrders = orders.filter((order) => order.status === "cancelled").length

      // Calculate average service time (from creation to closure)
      let totalServiceTime = 0
      let ordersWithServiceTime = 0

      orders.forEach((order) => {
        if (order.createdAt && order.closedAt) {
          const serviceTime = order.closedAt.getTime() - order.createdAt.getTime()
          totalServiceTime += serviceTime
          ordersWithServiceTime++
        }
      })

      const avgServiceTime =
        ordersWithServiceTime > 0
          ? totalServiceTime / ordersWithServiceTime / (1000 * 60) // in minutes
          : 0

      // Format data for the report
      const ordersTableData = orders.slice(0, 20).map((order) => ({
        "Order ID": order.id.substring(0, 8),
        Table: order.tableNumber || "N/A",
        Status: order.status,
        Items: order.items?.length || 0,
        Total: `$${order.total?.toFixed(2) || "0.00"}`,
        Created: order.createdAt.toLocaleString(),
        Closed: order.closedAt ? order.closedAt.toLocaleString() : "N/A",
      }))

      return {
        summary: [
          { label: t("totalOrders"), value: totalOrders },
          { label: t("completedOrders"), value: completedOrders },
          { label: t("pendingOrders"), value: pendingOrders },
          { label: t("cancelledOrders"), value: cancelledOrders },
          { label: t("avgServiceTime"), value: `${avgServiceTime.toFixed(1)} ${t("minutes")}` },
        ],
        data: ordersTableData,
      }
    } catch (error) {
      console.error("Error fetching orders data:", error)
      return generateSampleOrdersData()
    }
  }

  const fetchInventoryData = async () => {
    try {
      if (!db) return generateSampleInventoryData()

      const inventoryRef = collection(db, "inventory")
      const q = query(inventoryRef, orderBy("name"))

      const querySnapshot = await getDocs(q)

      if (querySnapshot.empty) {
        return generateSampleInventoryData()
      }

      const items = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))

      // Calculate inventory statistics
      const totalItems = items.length
      const lowStockItems = items.filter((item) => item.quantity <= item.minQuantity).length
      const outOfStockItems = items.filter((item) => item.quantity === 0).length
      const totalValue = items.reduce((sum, item) => sum + item.quantity * item.price, 0)

      // Format data for the report
      const inventoryTableData = items.map((item) => ({
        Item: item.name,
        Category: item.category,
        Quantity: item.quantity,
        "Min Quantity": item.minQuantity,
        Unit: item.unit,
        Price: `$${item.price.toFixed(2)}`,
        Value: `$${(item.quantity * item.price).toFixed(2)}`,
        Status: item.quantity <= item.minQuantity ? "Low Stock" : "In Stock",
      }))

      return {
        summary: [
          { label: t("totalItems"), value: totalItems },
          { label: t("lowStockItems"), value: lowStockItems },
          { label: t("outOfStockItems"), value: outOfStockItems },
          { label: t("totalInventoryValue"), value: `$${totalValue.toFixed(2)}` },
        ],
        data: inventoryTableData,
      }
    } catch (error) {
      console.error("Error fetching inventory data:", error)
      return generateSampleInventoryData()
    }
  }

  // Sample data generators for when real data is not available
  const generateSampleSalesData = () => {
    return {
      summary: [
        { label: t("totalSales"), value: "$12,345.67" },
        { label: t("averageTicket"), value: "$45.78" },
        { label: t("totalOrders"), value: 270 },
        { label: t("categories"), value: 5 },
      ],
      data: [
        { Category: "Main Dishes", Amount: "$5,678.90", Percentage: "46.0%" },
        { Category: "Beverages", Amount: "$2,345.67", Percentage: "19.0%" },
        { Category: "Appetizers", Amount: "$1,987.65", Percentage: "16.1%" },
        { Category: "Desserts", Amount: "$1,456.78", Percentage: "11.8%" },
        { Category: "Others", Amount: "$876.67", Percentage: "7.1%" },
        { Category: "TOTAL", Amount: "$12,345.67", Percentage: "100%" },
      ],
    }
  }

  const generateSampleOrdersData = () => {
    return {
      summary: [
        { label: t("totalOrders"), value: 270 },
        { label: t("completedOrders"), value: 245 },
        { label: t("pendingOrders"), value: 15 },
        { label: t("cancelledOrders"), value: 10 },
        { label: t("avgServiceTime"), value: "32.5 minutes" },
      ],
      data: [
        {
          "Order ID": "ORD-001",
          Table: "5",
          Status: "closed",
          Items: 4,
          Total: "$56.78",
          Created: "2023-03-15 19:30:00",
          Closed: "2023-03-15 20:15:00",
        },
        {
          "Order ID": "ORD-002",
          Table: "3",
          Status: "closed",
          Items: 3,
          Total: "$42.50",
          Created: "2023-03-15 19:45:00",
          Closed: "2023-03-15 20:30:00",
        },
        {
          "Order ID": "ORD-003",
          Table: "7",
          Status: "pending",
          Items: 5,
          Total: "$78.90",
          Created: "2023-03-15 20:00:00",
          Closed: "N/A",
        },
        {
          "Order ID": "ORD-004",
          Table: "2",
          Status: "preparing",
          Items: 2,
          Total: "$34.25",
          Created: "2023-03-15 20:15:00",
          Closed: "N/A",
        },
        {
          "Order ID": "ORD-005",
          Table: "8",
          Status: "closed",
          Items: 6,
          Total: "$92.40",
          Created: "2023-03-15 18:30:00",
          Closed: "2023-03-15 19:45:00",
        },
      ],
    }
  }

  const generateSampleInventoryData = () => {
    return {
      summary: [
        { label: t("totalItems"), value: 120 },
        { label: t("lowStockItems"), value: 8 },
        { label: t("outOfStockItems"), value: 2 },
        { label: t("totalInventoryValue"), value: "$5,678.90" },
      ],
      data: [
        {
          Item: "Tomatoes",
          Category: "Vegetables",
          Quantity: 25,
          "Min Quantity": 10,
          Unit: "kg",
          Price: "$2.50",
          Value: "$62.50",
          Status: "In Stock",
        },
        {
          Item: "Chicken Breast",
          Category: "Meat",
          Quantity: 8,
          "Min Quantity": 10,
          Unit: "kg",
          Price: "$8.90",
          Value: "$71.20",
          Status: "Low Stock",
        },
        {
          Item: "Olive Oil",
          Category: "Oils",
          Quantity: 12,
          "Min Quantity": 5,
          Unit: "bottles",
          Price: "$15.75",
          Value: "$189.00",
          Status: "In Stock",
        },
        {
          Item: "Flour",
          Category: "Dry Goods",
          Quantity: 30,
          "Min Quantity": 15,
          Unit: "kg",
          Price: "$1.20",
          Value: "$36.00",
          Status: "In Stock",
        },
        {
          Item: "Red Wine",
          Category: "Beverages",
          Quantity: 0,
          "Min Quantity": 5,
          Unit: "bottles",
          Price: "$18.50",
          Value: "$0.00",
          Status: "Out of Stock",
        },
      ],
    }
  }

  const generateFinancialData = () => {
    return {
      summary: [
        { label: t("totalRevenue"), value: "$45,678.90" },
        { label: t("totalCosts"), value: "$28,456.70" },
        { label: t("grossProfit"), value: "$17,222.20" },
        { label: t("profitMargin"), value: "37.7%" },
      ],
      data: [
        { Category: "Food Sales", Revenue: "$32,456.78", Costs: "$19,345.67", Profit: "$13,111.11", Margin: "40.4%" },
        { Category: "Beverage Sales", Revenue: "$10,234.56", Costs: "$6,123.45", Profit: "$4,111.11", Margin: "40.2%" },
        { Category: "Catering", Revenue: "$2,987.56", Costs: "$2,987.58", Profit: "$0.00", Margin: "0.0%" },
        { Category: "TOTAL", Revenue: "$45,678.90", Costs: "$28,456.70", Profit: "$17,222.20", Margin: "37.7%" },
      ],
    }
  }

  const generateStaffData = () => {
    return {
      summary: [
        { label: t("totalStaff"), value: 15 },
        { label: t("totalHours"), value: 480 },
        { label: t("ordersPerHour"), value: 2.8 },
        { label: t("avgPerformanceRating"), value: "4.2/5" },
      ],
      data: [
        { Employee: "John Smith", Position: "Waiter", Hours: 40, Orders: 120, "Orders/Hour": 3.0, Rating: "4.5/5" },
        { Employee: "Maria Garcia", Position: "Chef", Hours: 45, Orders: 150, "Orders/Hour": 3.3, Rating: "4.8/5" },
        { Employee: "Robert Johnson", Position: "Waiter", Hours: 35, Orders: 95, "Orders/Hour": 2.7, Rating: "4.0/5" },
        {
          Employee: "Sarah Williams",
          Position: "Bartender",
          Hours: 38,
          Orders: 110,
          "Orders/Hour": 2.9,
          Rating: "4.2/5",
        },
        { Employee: "David Brown", Position: "Host", Hours: 30, Orders: 0, "Orders/Hour": 0.0, Rating: "3.9/5" },
      ],
    }
  }

  const generateCustomersData = () => {
    return {
      summary: [
        { label: t("totalCustomers"), value: 850 },
        { label: t("newCustomers"), value: 120 },
        { label: t("returningCustomers"), value: 730 },
        { label: t("avgSatisfaction"), value: "4.3/5" },
      ],
      data: [
        { Date: "2023-03-01", Customers: 28, New: 5, Returning: 23, "Avg. Spend": "$42.50", Satisfaction: "4.2/5" },
        { Date: "2023-03-02", Customers: 32, New: 7, Returning: 25, "Avg. Spend": "$45.75", Satisfaction: "4.4/5" },
        { Date: "2023-03-03", Customers: 45, New: 12, Returning: 33, "Avg. Spend": "$48.90", Satisfaction: "4.5/5" },
        { Date: "2023-03-04", Customers: 52, New: 15, Returning: 37, "Avg. Spend": "$52.30", Satisfaction: "4.3/5" },
        { Date: "2023-03-05", Customers: 38, New: 8, Returning: 30, "Avg. Spend": "$44.20", Satisfaction: "4.1/5" },
      ],
    }
  }

  const generateReservationsData = () => {
    return {
      summary: [
        { label: t("totalReservations"), value: 180 },
        { label: t("completedReservations"), value: 165 },
        { label: t("cancelledReservations"), value: 10 },
        { label: t("noShows"), value: 5 },
      ],
      data: [
        {
          Date: "2023-03-01",
          Reservations: 12,
          Completed: 11,
          Cancelled: 1,
          "No-Shows": 0,
          "Avg. Party Size": 4.2,
          "Avg. Duration": "1h 45m",
        },
        {
          Date: "2023-03-02",
          Reservations: 15,
          Completed: 14,
          Cancelled: 0,
          "No-Shows": 1,
          "Avg. Party Size": 3.8,
          "Avg. Duration": "1h 30m",
        },
        {
          Date: "2023-03-03",
          Reservations: 22,
          Completed: 20,
          Cancelled: 2,
          "No-Shows": 0,
          "Avg. Party Size": 4.5,
          "Avg. Duration": "2h 00m",
        },
        {
          Date: "2023-03-04",
          Reservations: 28,
          Completed: 25,
          Cancelled: 2,
          "No-Shows": 1,
          "Avg. Party Size": 5.2,
          "Avg. Duration": "2h 15m",
        },
        {
          Date: "2023-03-05",
          Reservations: 18,
          Completed: 16,
          Cancelled: 1,
          "No-Shows": 1,
          "Avg. Party Size": 4.0,
          "Avg. Duration": "1h 50m",
        },
      ],
    }
  }

  if (loading) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">{t("loadingReportData")}</p>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-2">
        <FileSpreadsheet className="h-6 w-6 text-primary" />
        <h1 className="text-3xl font-bold">{t("advancedReports")}</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("restaurantReports")}</CardTitle>
          <CardDescription>{t("restaurantReportsDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <ExcelReportGenerator reportData={reportData} />
        </CardContent>
      </Card>
    </div>
  )
}

