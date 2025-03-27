"use client"

import { useState, useEffect } from "react"
import { useI18n } from "@/components/i18n-provider"
import { useFirebase } from "@/components/firebase-provider"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TableMapViewer } from "@/components/table-map/table-map-viewer"
import { doc, updateDoc } from "firebase/firestore"
import { Save, X, Plus, Trash } from "lucide-react"

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

interface TableMapEditorProps {
  mapId: string
  tables: TableItem[]
  isEditing: boolean
  setIsEditing: (value: boolean) => void
  onTablesChange?: (tables: TableItem[]) => void
}

export function TableMapEditor({ mapId, tables, isEditing, setIsEditing, onTablesChange }: TableMapEditorProps) {
  const { db } = useFirebase()
  const { t } = useI18n()
  const { toast } = useToast()

  const [editableTables, setEditableTables] = useState<TableItem[]>(tables || [])
  const [selectedTable, setSelectedTable] = useState<TableItem | null>(null)
  const [isAddingTable, setIsAddingTable] = useState(false)
  const [newTable, setNewTable] = useState<Omit<TableItem, "id">>({
    number: tables.length > 0 ? Math.max(...tables.map((t) => t.number)) + 1 : 1,
    seats: 4,
    shape: "square",
    width: 100,
    height: 100,
    x: 0,
    y: 0,
    status: "available",
  })

  // Update editable tables when tables prop changes
  useEffect(() => {
    setEditableTables(tables)
  }, [tables])

  const handleSaveMap = async () => {
    if (!db) return

    try {
      await updateDoc(doc(db, "tableMaps", mapId), {
        tables: editableTables,
        updatedAt: new Date(),
      })

      setIsEditing(false)

      if (onTablesChange) {
        onTablesChange(editableTables)
      }

      toast({
        title: "Success",
        description: "Table map saved successfully",
      })
    } catch (error) {
      console.error("Error saving table map:", error)
      toast({
        title: "Error",
        description: "Failed to save table map",
        variant: "destructive",
      })
    }
  }

  const handleAddTable = async () => {
    // Validate table number uniqueness
    const existingTable = editableTables.find((t) => t.number === newTable.number)
    if (existingTable) {
      toast({
        title: "Error",
        description: t("tableNumberExists"),
        variant: "destructive",
      })
      return
    }

    const tableId = Date.now().toString()
    const table: TableItem = {
      id: tableId,
      ...newTable,
    }

    // Update local state
    const updatedTables = [...editableTables, table]
    setEditableTables(updatedTables)

    if (onTablesChange) {
      onTablesChange(updatedTables)
    }

    // Persist to database immediately
    if (db) {
      try {
        await updateDoc(doc(db, "tableMaps", mapId), {
          tables: updatedTables,
          updatedAt: new Date(),
        })

        toast({
          title: "Success",
          description: t("tableAddedSuccess"),
        })
      } catch (error) {
        console.error("Error saving table:", error)
        toast({
          title: "Error",
          description: t("tableAddedError"),
          variant: "destructive",
        })
        // Revert local state on error
        setEditableTables(editableTables)
      }
    }

    setIsAddingTable(false)
    setNewTable({
      number: newTable.number + 1,
      seats: 4,
      shape: "square",
      width: 100,
      height: 100,
      x: 0,
      y: 0,
      status: "available",
    })
  }

  const handleUpdateTable = async (tableId: string, updates: Partial<TableItem>) => {
    // Update local state first for responsive UI
    const updatedTables = editableTables.map((table) => (table.id === tableId ? { ...table, ...updates } : table))
    setEditableTables(updatedTables)

    if (onTablesChange) {
      onTablesChange(updatedTables)
    }

    // Update selected table if it's the one being updated
    if (selectedTable && selectedTable.id === tableId) {
      setSelectedTable({ ...selectedTable, ...updates })
    }

    // Persist to database if connected
    if (db) {
      try {
        await updateDoc(doc(db, "tableMaps", mapId), {
          tables: updatedTables,
          updatedAt: new Date(),
        })
      } catch (error) {
        console.error("Error updating table:", error)
        toast({
          title: "Error",
          description: t("tableUpdateError"),
          variant: "destructive",
        })
        // Revert local state on error
        setEditableTables(editableTables)
      }
    }
  }

  const handleDeleteTable = async (tableId: string) => {
    const updatedTables = editableTables.filter((table) => table.id !== tableId)

    // Update local state
    setEditableTables(updatedTables)

    if (onTablesChange) {
      onTablesChange(updatedTables)
    }

    if (selectedTable?.id === tableId) {
      setSelectedTable(null)
    }

    // Persist to database
    if (db) {
      try {
        await updateDoc(doc(db, "tableMaps", mapId), {
          tables: updatedTables,
          updatedAt: new Date(),
        })

        toast({
          title: "Success",
          description: t("tableDeletedSuccess"),
        })
      } catch (error) {
        console.error("Error deleting table:", error)
        toast({
          title: "Error",
          description: t("tableDeletedError"),
          variant: "destructive",
        })
        // Revert local state on error
        setEditableTables(editableTables)
      }
    }
  }

  if (!isEditing) {
    return (
      <div className="space-y-4">
        <TableMapViewer
          tables={editableTables}
          onTableClick={(table) => setSelectedTable(table)}
          selectedTable={selectedTable}
          showControls={true}
          showLegend={true}
        />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">{t("editTableMap")}</h3>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
            <X className="mr-2 h-4 w-4" />
            {t("cancel")}
          </Button>
          <Button size="sm" onClick={handleSaveMap}>
            <Save className="mr-2 h-4 w-4" />
            {t("saveChanges")}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <TableMapViewer
            tables={editableTables}
            onTableClick={(table) => setSelectedTable(table)}
            selectedTable={selectedTable}
            showControls={true}
            showLegend={true}
          />
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>{selectedTable ? t("editTable") : t("tableProperties")}</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedTable ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="tableNumber">{t("tableNumber")}</Label>
                    <Input
                      id="tableNumber"
                      type="number"
                      value={selectedTable.number}
                      onChange={(e) => handleUpdateTable(selectedTable.id, { number: Number.parseInt(e.target.value) })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tableSeats">{t("seats")}</Label>
                    <Input
                      id="tableSeats"
                      type="number"
                      value={selectedTable.seats}
                      onChange={(e) => handleUpdateTable(selectedTable.id, { seats: Number.parseInt(e.target.value) })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tableShape">{t("shape")}</Label>
                    <Select
                      value={selectedTable.shape}
                      onValueChange={(value) =>
                        handleUpdateTable(selectedTable.id, { shape: value as "square" | "round" | "rectangle" })
                      }
                    >
                      <SelectTrigger id="tableShape">
                        <SelectValue placeholder={t("selectShape")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="square">{t("square")}</SelectItem>
                        <SelectItem value="round">{t("round")}</SelectItem>
                        <SelectItem value="rectangle">{t("rectangle")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tableStatus">{t("status")}</Label>
                    <Select
                      value={selectedTable.status}
                      onValueChange={(value) =>
                        handleUpdateTable(selectedTable.id, {
                          status: value as
                            | "available"
                            | "occupied"
                            | "reserved"
                            | "maintenance"
                            | "ordering"
                            | "preparing"
                            | "ready"
                            | "served",
                        })
                      }
                    >
                      <SelectTrigger id="tableStatus">
                        <SelectValue placeholder={t("selectStatus")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="available">{t("available")}</SelectItem>
                        <SelectItem value="occupied">{t("occupied")}</SelectItem>
                        <SelectItem value="reserved">{t("reserved")}</SelectItem>
                        <SelectItem value="ordering">{t("ordering")}</SelectItem>
                        <SelectItem value="preparing">{t("preparing")}</SelectItem>
                        <SelectItem value="ready">{t("ready")}</SelectItem>
                        <SelectItem value="served">{t("served")}</SelectItem>
                        <SelectItem value="maintenance">{t("maintenance")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <Label htmlFor="tableX">{t("positionX")}</Label>
                      <Input
                        id="tableX"
                        type="number"
                        value={selectedTable.x}
                        onChange={(e) => handleUpdateTable(selectedTable.id, { x: Number.parseInt(e.target.value) })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="tableY">{t("positionY")}</Label>
                      <Input
                        id="tableY"
                        type="number"
                        value={selectedTable.y}
                        onChange={(e) => handleUpdateTable(selectedTable.id, { y: Number.parseInt(e.target.value) })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <Label htmlFor="tableWidth">{t("width")}</Label>
                      <Input
                        id="tableWidth"
                        type="number"
                        value={selectedTable.width}
                        onChange={(e) =>
                          handleUpdateTable(selectedTable.id, { width: Number.parseInt(e.target.value) })
                        }
                      />
                    </div>

                    {selectedTable.shape === "rectangle" && (
                      <div className="space-y-2">
                        <Label htmlFor="tableHeight">{t("height")}</Label>
                        <Input
                          id="tableHeight"
                          type="number"
                          value={selectedTable.height}
                          onChange={(e) =>
                            handleUpdateTable(selectedTable.id, { height: Number.parseInt(e.target.value) })
                          }
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between pt-2">
                    <Button variant="outline" onClick={() => setSelectedTable(null)}>
                      {t("cancel")}
                    </Button>
                    <Button variant="destructive" onClick={() => handleDeleteTable(selectedTable.id)}>
                      <Trash className="mr-2 h-4 w-4" />
                      {t("deleteTable")}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {isAddingTable ? (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="newTableNumber">{t("tableNumber")}</Label>
                        <Input
                          id="newTableNumber"
                          type="number"
                          value={newTable.number}
                          onChange={(e) => setNewTable({ ...newTable, number: Number.parseInt(e.target.value) })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="newTableSeats">{t("seats")}</Label>
                        <Input
                          id="newTableSeats"
                          type="number"
                          value={newTable.seats}
                          onChange={(e) => setNewTable({ ...newTable, seats: Number.parseInt(e.target.value) })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="newTableShape">{t("shape")}</Label>
                        <Select
                          value={newTable.shape}
                          onValueChange={(value) =>
                            setNewTable({ ...newTable, shape: value as "square" | "round" | "rectangle" })
                          }
                        >
                          <SelectTrigger id="newTableShape">
                            <SelectValue placeholder={t("selectShape")} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="square">{t("square")}</SelectItem>
                            <SelectItem value="round">{t("round")}</SelectItem>
                            <SelectItem value="rectangle">{t("rectangle")}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-2">
                          <Label htmlFor="newTableX">{t("positionX")}</Label>
                          <Input
                            id="newTableX"
                            type="number"
                            value={newTable.x}
                            onChange={(e) => setNewTable({ ...newTable, x: Number.parseInt(e.target.value) })}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="newTableY">{t("positionY")}</Label>
                          <Input
                            id="newTableY"
                            type="number"
                            value={newTable.y}
                            onChange={(e) => setNewTable({ ...newTable, y: Number.parseInt(e.target.value) })}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-2">
                          <Label htmlFor="newTableWidth">{t("width")}</Label>
                          <Input
                            id="newTableWidth"
                            type="number"
                            value={newTable.width}
                            onChange={(e) => setNewTable({ ...newTable, width: Number.parseInt(e.target.value) })}
                          />
                        </div>

                        {newTable.shape === "rectangle" && (
                          <div className="space-y-2">
                            <Label htmlFor="newTableHeight">{t("height")}</Label>
                            <Input
                              id="newTableHeight"
                              type="number"
                              value={newTable.height}
                              onChange={(e) => setNewTable({ ...newTable, height: Number.parseInt(e.target.value) })}
                            />
                          </div>
                        )}
                      </div>

                      <div className="flex justify-between pt-2">
                        <Button variant="outline" onClick={() => setIsAddingTable(false)}>
                          {t("cancel")}
                        </Button>
                        <Button onClick={handleAddTable}>{t("addTable")}</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <div className="mx-auto w-16 h-16 rounded-md border-2 border-dashed border-gray-300 flex items-center justify-center mb-4">
                        <Plus className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">
                        {editableTables.length > 0 ? t("selectTableToEdit") : t("noTablesInMap")}
                      </p>
                      <Button onClick={() => setIsAddingTable(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        {t("addTable")}
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

