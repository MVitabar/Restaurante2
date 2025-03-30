"use client"

import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useI18n } from "@/components/i18n-provider"
import { Badge } from "@/components/ui/badge"
import { Edit } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Order {
  id: string
  status: string
  tableId: string
  items: Array<{
    name: string
    quantity: number
    price: number
  }>
  total: number
  createdAt: Date
}

interface OrderDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  order: Order | null
  table: {
    number: number
  }
  onEditOrder?: (order: Order) => void
}

export function OrderDetailsDialog({ 
  open, 
  onOpenChange, 
  order, 
  table,
  onEditOrder 
}: OrderDetailsDialogProps) {
  const { t } = useI18n()

  const descriptionId = `order-details-description-${table.number}`

  // DEBUGGING: Log all relevant information
  React.useEffect(() => {
    console.group('OrderDetailsDialog Debug')
    console.log('Open:', open)
    console.log('Order:', order)
    console.log('Table:', table)
    console.log('onEditOrder:', onEditOrder)
    console.log('Order Status:', order?.status)
    console.groupEnd()
  }, [open, order, table, onEditOrder])

  // Determine if the order can be edited based on its status
  const canEditOrder = 
    order?.status === 'pending' || 
    order?.status === 'ordering' || 
    order?.status === 'preparing' ||
    order?.status === 'ready' ||
    order?.status === 'served'

  // If no order, return null
  if (!order) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        aria-describedby={descriptionId}
        className="sm:max-w-[600px]"
      >
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle>
              {t("orderDetails")} - {t("table")} {table.number}
            </DialogTitle>
            
            {/* DEBUGGING: Explicit conditional rendering */}
            {(() => {
              console.log('Edit Button Conditions:', {
                canEditOrder,
                onEditOrderExists: !!onEditOrder,
                orderStatus: order.status
              })
              
              return canEditOrder && onEditOrder ? (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    console.log('Edit Order Button Clicked', order)
                    onEditOrder(order)
                  }}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  {t("editOrder")}
                </Button>
              ) : null
            })()}
          </div>
          
          <p id={descriptionId} className="sr-only">
            {t("orderDetailsDescription", { 
              tableNumber: table.number, 
              orderStatus: t(order.status) 
            })}
          </p>
        </DialogHeader>


        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span>{t("orderStatus")}:</span>
            <Badge variant={
              order.status === "delivered" ? "default" : 
              order.status === "preparing" ? "secondary" : 
              "outline"
            }>
              {t(order.status)}
            </Badge>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">{t("orderItems")}</h3>
            <div className="border rounded-md">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="p-2 text-left">{t("item")}</th>
                    <th className="p-2 text-right">{t("quantity")}</th>
                    <th className="p-2 text-right">{t("price")}</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item, index) => (
                    <tr key={index} className="border-b last:border-b-0">
                      <td className="p-2">{item.name}</td>
                      <td className="p-2 text-right">{item.quantity}</td>
                      <td className="p-2 text-right">
                        {new Intl.NumberFormat('es-AR', { 
                          style: 'currency', 
                          currency: 'ARS' 
                        }).format(item.price * item.quantity)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={2} className="p-2 text-right font-semibold">
                      {t("total")}:
                    </td>
                    <td className="p-2 text-right font-semibold">
                      {new Intl.NumberFormat('es-AR', { 
                        style: 'currency', 
                        currency: 'ARS' 
                      }).format(order.total)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      </DialogContent>
      
    </Dialog>
  )
}