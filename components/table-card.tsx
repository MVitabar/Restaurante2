"use client"

import { useState } from "react"
import { useI18n } from "@/components/i18n-provider"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import {
  Users,
  Square,
  Circle,
  RectangleVerticalIcon as Rectangle,
  Edit,
  Trash,
  ClipboardList,
  CheckCircle,
  Receipt,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Toast } from "@/components/ui/toast"

interface TableItem {
  id: string
  number: number
  seats: number
  shape: "square" | "round" | "rectangle"
  width: number
  height: number
  x: number
  y: number
  status: "available" | "occupied" | "reserved" | "maintenance" | "ordering" | "preparing" | "ready" | "served"
}

interface TableCardProps {
  table: TableItem
  hasActiveOrder?: boolean
  orderStatus?: string
  onEdit?: () => void
  onDelete?: () => void
  onCreateOrder?: () => void
  onViewOrder?: () => void
  onMarkAsServed?: () => void
  onCloseOrder?: () => void
  isEditing?: boolean
}

export function TableCard({
  table,
  hasActiveOrder = false,
  orderStatus = "",
  onEdit,
  onDelete,
  onCreateOrder,
  onViewOrder,
  onMarkAsServed,
  onCloseOrder,
  isEditing = false,
}: TableCardProps) {
  const { t } = useI18n()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-50 border-green-200 text-green-700"
      case "occupied":
        return "bg-red-50 border-red-200 text-red-700"
      case "ordering":
        return "bg-yellow-50 border-yellow-200 text-yellow-700"
      case "preparing":
        return "bg-orange-50 border-orange-200 text-orange-700"
      case "ready":
        return "bg-blue-50 border-blue-200 text-blue-700"
      case "served":
        return "bg-green-50 border-green-200 text-green-700"
      default:
        return "bg-gray-50 border-gray-200 text-gray-700"
    }
  }

  // Get shape icon
  const ShapeIcon = () => {
    switch (table.shape) {
      case "round":
        return <Circle className="h-5 w-5" />
      case "rectangle":
        return <Rectangle className="h-5 w-5" />
      default:
        return <Square className="h-5 w-5" />
    }
  }

  // Comprehensive logging and error checking for onViewOrder
  const safeOnViewOrder = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent any parent event interference
    
    // Extensive logging
    console.group('TableCard View Order Debug')
    console.log('Table Number:', table.number)
    console.log('Has Active Order:', hasActiveOrder)
    console.log('Order Status:', orderStatus)
    console.log('onViewOrder Prop:', typeof onViewOrder)
    console.log('onViewOrder Function:', onViewOrder)
    
    try {
      // Verify onViewOrder is a function before calling
      if (typeof onViewOrder !== 'function') {
        console.error('onViewOrder is not a valid function')
        console.warn('onViewOrder prop is:', onViewOrder)
        
        // Throw an error to trigger catch block
        throw new Error('onViewOrder is not a function')
      }

      // Call the view order function
      onViewOrder()
      
      console.log('onViewOrder called successfully')
    } catch (error) {
      console.error('Error in onViewOrder:', error)
    } finally {
      console.groupEnd()
    }
  }

  // Wrapper functions to add logging and prevent potential event propagation issues
  const safeOnCreateOrder = (e: React.MouseEvent) => {
    e.stopPropagation()
    console.log('Create Order clicked for table', table.number)
    if (onCreateOrder) onCreateOrder()
  }

  const safeOnMarkAsServed = (e: React.MouseEvent) => {
    e.stopPropagation()
    console.log('Mark as Served clicked for table', table.number)
    if (onMarkAsServed) onMarkAsServed()
  }

  const safeOnCloseOrder = (e: React.MouseEvent) => {
    e.stopPropagation()
    console.log('Close Order clicked for table', table.number)
    if (onCloseOrder) onCloseOrder()
  }

  return (
    <>
      <Card 
        className={cn("transition-all hover:shadow-md", getStatusColor(table.status))}
        onClick={() => console.log('Card clicked for table', table.number)}
      >
        <CardHeader className="pb-2">
          <CardTitle className="flex justify-between items-center">
            <span>
              {t("tableCard.label")} {table.number}
            </span>
            <Badge variant="outline" className={cn("font-normal", getStatusColor(table.status))}>
              {t(table.status)}
            </Badge>
          </CardTitle>
        </CardHeader>

        <CardContent className="pb-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>
                {table.seats} {t("tableCard.details.seats")}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <ShapeIcon />
              <span>{t(`tableCard.details.shape.${table.shape}`)}</span>
            </div>
          </div>

          {hasActiveOrder && (
            <div className="mt-2 pt-2 border-t">
              <Badge variant="secondary" className="w-full justify-center">
                {t(orderStatus)}
              </Badge>
            </div>
          )}
        </CardContent>

        <CardFooter className="pt-0">
          {isEditing ? (
            <div className="flex gap-2 w-full">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1" 
                onClick={(e) => {
                  e.stopPropagation()
                  console.log('Edit clicked for table', table.number)
                  if (onEdit) onEdit()
                }}
              >
                <Edit className="h-4 w-4 mr-1" />
                {t("tableCard.actions.edit")}
              </Button>
              <Button 
                variant="destructive" 
                size="sm" 
                className="flex-1" 
                onClick={(e) => {
                  e.stopPropagation()
                  setIsDeleteDialogOpen(true)
                }}
              >
                <Trash className="h-4 w-4 mr-1" />
                {t("tableCard.actions.delete")}
              </Button>
            </div>
          ) : hasActiveOrder ? (
            <div className="flex gap-2 w-full">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1" 
                onClick={safeOnViewOrder}
                disabled={!hasActiveOrder || !onViewOrder}
              >
                <ClipboardList className="h-4 w-4 mr-1" />
                {t("tableCard.actions.viewOrder")}
              </Button>
              {orderStatus === "ready" && (
                <Button 
                  variant="default" 
                  size="sm" 
                  className="flex-1" 
                  onClick={safeOnMarkAsServed}
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  {t("serve")}
                </Button>
              )}
              {orderStatus === "delivered" && (
                <Button 
                  variant="default" 
                  size="sm" 
                  className="flex-1" 
                  onClick={safeOnCloseOrder}
                >
                  <Receipt className="h-4 w-4 mr-1" />
                  {t("close")}
                </Button>
              )}
            </div>
          ) : (
            <Button
              variant="default"
              size="sm"
              className="w-full"
              onClick={safeOnCreateOrder}
              disabled={table.status !== "available"}
            >
              <ClipboardList className="h-4 w-4 mr-1" />
              {t("tableCard.actions.createOrder")}
            </Button>
          )}
        </CardFooter>
      </Card>

      {/* Delete confirmation dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("confirmDelete")}</DialogTitle>
          </DialogHeader>
          <p>{t("deleteTableConfirmation").replace("{table}", table.number.toString())}</p>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={(e) => {
                e.stopPropagation()
                setIsDeleteDialogOpen(false)
              }}
            >
              {t("cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={(e) => {
                e.stopPropagation()
                if (onDelete) onDelete()
                setIsDeleteDialogOpen(false)
              }}
            >
              {t("delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
