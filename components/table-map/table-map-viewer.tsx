"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useI18n } from "@/components/i18n-provider"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ZoomIn, ZoomOut, Move, RefreshCw } from "lucide-react"

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

interface TableMapViewerProps {
  tables: TableItem[]
  selectedTable?: TableItem | null
  onTableClick?: (table: TableItem) => void
  autoRefresh?: boolean
  refreshInterval?: number
  showControls?: boolean
  showLegend?: boolean
  minZoom?: number
  maxZoom?: number
  initialZoom?: number
}

export function TableMapViewer({
  tables,
  selectedTable,
  onTableClick,
  autoRefresh = false,
  refreshInterval = 30000, // 30 seconds
  showControls = true,
  showLegend = true,
  minZoom = 0.5,
  maxZoom = 2,
  initialZoom = 1,
}: TableMapViewerProps) {
  const { t } = useI18n()
  const containerRef = useRef<HTMLDivElement>(null)
  const [zoom, setZoom] = useState(initialZoom)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 })
  const [mapSize, setMapSize] = useState({ width: 0, height: 0 })
  const [lastRefresh, setLastRefresh] = useState(new Date())

  // Calculate the map boundaries based on table positions
  useEffect(() => {
    if (tables.length === 0) return

    let minX = Number.POSITIVE_INFINITY
    let minY = Number.POSITIVE_INFINITY
    let maxX = Number.NEGATIVE_INFINITY
    let maxY = Number.NEGATIVE_INFINITY

    tables.forEach((table) => {
      const tableRight = table.x + table.width
      const tableBottom = table.y + (table.shape === "rectangle" ? table.height : table.width)

      minX = Math.min(minX, table.x)
      minY = Math.min(minY, table.y)
      maxX = Math.max(maxX, tableRight)
      maxY = Math.max(maxY, tableBottom)
    })

    // Add padding
    const padding = 50
    minX = Math.max(0, minX - padding)
    minY = Math.max(0, minY - padding)
    maxX = maxX + padding
    maxY = maxY + padding

    setMapSize({
      width: maxX - minX,
      height: maxY - minY,
    })
  }, [tables])

  // Update container size on resize
  useEffect(() => {
    if (!containerRef.current) return

    const updateContainerSize = () => {
      if (containerRef.current) {
        setContainerSize({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        })
      }
    }

    updateContainerSize()

    const resizeObserver = new ResizeObserver(updateContainerSize)
    resizeObserver.observe(containerRef.current)

    return () => {
      if (containerRef.current) {
        resizeObserver.unobserve(containerRef.current)
      }
    }
  }, [])

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      setLastRefresh(new Date())
      // This will trigger a re-render, and if the parent component
      // is set up to fetch new data on refresh, it will do so
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval])

  // Handle mouse/touch events for dragging
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true)
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    })
  }

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 1) {
      setIsDragging(true)
      setDragStart({
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y,
      })
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return

    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    })
  }

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isDragging || e.touches.length !== 1) return

    setPosition({
      x: e.touches[0].clientX - dragStart.x,
      y: e.touches[0].clientY - dragStart.y,
    })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
  }

  // Zoom controls
  const handleZoomIn = () => {
    setZoom(Math.min(maxZoom, zoom + 0.1))
  }

  const handleZoomOut = () => {
    setZoom(Math.max(minZoom, zoom - 0.1))
  }

  const handleResetView = () => {
    setZoom(initialZoom)
    setPosition({ x: 0, y: 0 })
  }

  const handleRefresh = () => {
    setLastRefresh(new Date())
  }

  // Get table status color
  const getTableStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-100 border-green-500 hover:bg-green-200"
      case "occupied":
        return "bg-red-100 border-red-500 hover:bg-red-200"
      case "reserved":
        return "bg-blue-100 border-blue-500 hover:bg-blue-200"
      case "maintenance":
        return "bg-gray-100 border-gray-500 hover:bg-gray-200"
      case "ordering":
        return "bg-yellow-100 border-yellow-500 hover:bg-yellow-200"
      case "preparing":
        return "bg-orange-100 border-orange-500 hover:bg-orange-200"
      case "ready":
        return "bg-purple-100 border-purple-500 hover:bg-purple-200"
      case "served":
        return "bg-indigo-100 border-indigo-500 hover:bg-indigo-200"
      default:
        return "bg-white border-gray-300 hover:bg-gray-50"
    }
  }

  // Get table status icon or indicator
  const getTableStatusIndicator = (status: string) => {
    switch (status) {
      case "available":
        return "●"
      case "occupied":
        return "●"
      case "reserved":
        return "●"
      case "maintenance":
        return "●"
      case "ordering":
        return "●"
      case "preparing":
        return "●"
      case "ready":
        return "●"
      case "served":
        return "●"
      default:
        return ""
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Controls */}
      {showControls && (
        <div className="flex justify-between items-center mb-2 px-2">
          <div className="flex space-x-1">
            <Button variant="outline" size="icon" onClick={handleZoomIn} title={t("zoomIn")}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={handleZoomOut} title={t("zoomOut")}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={handleResetView} title={t("resetView")}>
              <Move className="h-4 w-4" />
            </Button>
          </div>

          <div className="text-xs text-muted-foreground">
            {t("zoom")}: {Math.round(zoom * 100)}%
          </div>

          <Button variant="outline" size="icon" onClick={handleRefresh} title={t("refresh")}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Table map container */}
      <div
        ref={containerRef}
        className="relative flex-1 border rounded-md overflow-hidden bg-gray-50 touch-none"
        style={{ cursor: isDragging ? "grabbing" : "grab" }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Map content */}
        <div
          className="absolute transition-transform duration-100"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
            transformOrigin: "0 0",
          }}
        >
          {/* Tables */}
          <TooltipProvider>
            {tables.map((table) => (
              <Tooltip key={table.id}>
                <TooltipTrigger asChild>
                  <div
                    className={`absolute border-2 flex items-center justify-center cursor-pointer transition-colors
                      ${table.shape === "round" ? "rounded-full" : "rounded-md"}
                      ${
                        selectedTable?.id === table.id
                          ? "border-primary bg-primary/10 shadow-md"
                          : `${getTableStatusColor(table.status)}`
                      }`}
                    style={{
                      width: `${table.width}px`,
                      height: table.shape === "rectangle" ? `${table.height}px` : `${table.width}px`,
                      left: `${table.x}px`,
                      top: `${table.y}px`,
                    }}
                    onClick={() => onTableClick && onTableClick(table)}
                  >
                    <div className="text-center">
                      <div className="font-bold">{table.number}</div>
                      <div className="text-xs">
                        {table.seats} {t("seats")}
                      </div>
                      <div className="text-xs mt-1 font-medium">{t(table.status)}</div>
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="text-sm">
                    <div className="font-bold">
                      {t("table")} {table.number}
                    </div>
                    <div>
                      {table.seats} {t("seats")}
                    </div>
                    <div className="capitalize">
                      {t("status")}: {t(table.status)}
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            ))}
          </TooltipProvider>
        </div>
      </div>

      {/* Status legend */}
      {showLegend && (
        <div className="mt-2 flex flex-wrap gap-2 justify-center">
          <Badge variant="outline" className="bg-green-100 border-green-500">
            {t("available")}
          </Badge>
          <Badge variant="outline" className="bg-red-100 border-red-500">
            {t("occupied")}
          </Badge>
          <Badge variant="outline" className="bg-blue-100 border-blue-500">
            {t("reserved")}
          </Badge>
          <Badge variant="outline" className="bg-yellow-100 border-yellow-500">
            {t("ordering")}
          </Badge>
          <Badge variant="outline" className="bg-orange-100 border-orange-500">
            {t("preparing")}
          </Badge>
          <Badge variant="outline" className="bg-purple-100 border-purple-500">
            {t("ready")}
          </Badge>
          <Badge variant="outline" className="bg-indigo-100 border-indigo-500">
            {t("served")}
          </Badge>
          <Badge variant="outline" className="bg-gray-100 border-gray-500">
            {t("maintenance")}
          </Badge>
        </div>
      )}
    </div>
  )
}

