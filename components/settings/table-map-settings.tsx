"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { useFirebase } from "@/components/firebase-provider"
import { useI18n } from "@/components/i18n-provider"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { TableMapEditor } from "@/components/table-map/table-map-editor"
import { collection, query, orderBy, getDocs, doc, addDoc, deleteDoc } from "firebase/firestore"
import { Loader2, Plus, Edit, Trash, Grid } from "lucide-react"
import Link from "next/link"

interface TableMap {
  id: string
  name: string
  description: string
  createdAt: any
  updatedAt: any
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
  status: "available" | "occupied" | "reserved" | "maintenance" | "ordering" | "preparing" | "ready" | "served"
}

export function TableMapSettings() {
  const { user } = useAuth()
  const { db } = useFirebase()
  const { t } = useI18n()
  const { toast } = useToast()

  const [loading, setLoading] = useState(false)
  const [tableMaps, setTableMaps] = useState<TableMap[]>([])
  const [activeMap, setActiveMap] = useState<TableMap | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [newMapName, setNewMapName] = useState("")
  const [newMapDescription, setNewMapDescription] = useState("")

  useEffect(() => {
    if (user && db) {
      fetchTableMaps()
    }
  }, [user, db])

  const fetchTableMaps = async () => {
    if (!db) return

    setLoading(true)
    try {
      const mapsRef = collection(db, "tableMaps")
      const q = query(mapsRef, orderBy("createdAt", "desc"))
      const querySnapshot = await getDocs(q)

      const maps = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as TableMap[]

      setTableMaps(maps)

      if (maps.length > 0 && !activeMap) {
        setActiveMap(maps[0])
      }
    } catch (error) {
      console.error("Error fetching table maps:", error)
      toast({
        title: "Error",
        description: "Failed to fetch table maps",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateMap = async () => {
    if (!db || !user) return

    if (!newMapName.trim()) {
      toast({
        title: "Error",
        description: "Map name is required",
        variant: "destructive",
      })
      return
    }

    try {
      const newMap = {
        name: newMapName,
        description: newMapDescription,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: user.uid,
        tables: [],
      }

      const docRef = await addDoc(collection(db, "tableMaps"), newMap)

      const createdMap = {
        id: docRef.id,
        ...newMap,
      } as TableMap

      setTableMaps([createdMap, ...tableMaps])
      setActiveMap(createdMap)
      setIsCreating(false)
      setNewMapName("")
      setNewMapDescription("")

      toast({
        title: "Success",
        description: "Table map created successfully",
      })
    } catch (error) {
      console.error("Error creating table map:", error)
      toast({
        title: "Error",
        description: "Failed to create table map",
        variant: "destructive",
      })
    }
  }

  const handleDeleteMap = async (mapId: string) => {
    if (!db) return

    try {
      await deleteDoc(doc(db, "tableMaps", mapId))

      const updatedMaps = tableMaps.filter((map) => map.id !== mapId)
      setTableMaps(updatedMaps)

      if (activeMap?.id === mapId) {
        setActiveMap(updatedMaps.length > 0 ? updatedMaps[0] : null)
      }

      toast({
        title: "Success",
        description: "Table map deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting table map:", error)
      toast({
        title: "Error",
        description: "Failed to delete table map",
        variant: "destructive",
      })
    }
  }

  const handleTablesChange = (mapId: string, tables: TableItem[]) => {
    // Update the local state with the new tables
    setTableMaps((prevMaps) => prevMaps.map((map) => (map.id === mapId ? { ...map, tables } : map)))

    if (activeMap?.id === mapId) {
      setActiveMap((prev) => (prev ? { ...prev, tables } : null))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">{t("tableMaps")}</h2>
          <p className="text-muted-foreground">{t("tableMapSettingsDescription")}</p>
        </div>

        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              {t("createTableMap")}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("createTableMap")}</DialogTitle>
              <DialogDescription>{t("createTableMapDescription")}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="mapName">{t("mapName")}</Label>
                <Input
                  id="mapName"
                  value={newMapName}
                  onChange={(e) => setNewMapName(e.target.value)}
                  placeholder={t("mapNamePlaceholder")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mapDescription">{t("mapDescription")}</Label>
                <Input
                  id="mapDescription"
                  value={newMapDescription}
                  onChange={(e) => setNewMapDescription(e.target.value)}
                  placeholder={t("mapDescriptionPlaceholder")}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreating(false)}>
                {t("cancel")}
              </Button>
              <Button onClick={handleCreateMap}>{t("create")}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : tableMaps.length > 0 ? (
        <Tabs
          defaultValue={activeMap?.id}
          onValueChange={(value) => {
            const map = tableMaps.find((m) => m.id === value)
            if (map) setActiveMap(map)
          }}
        >
          <TabsList className="mb-4">
            {tableMaps.map((map) => (
              <TabsTrigger key={map.id} value={map.id}>
                {map.name}
              </TabsTrigger>
            ))}
          </TabsList>

          {tableMaps.map((map) => (
            <TabsContent key={map.id} value={map.id} className="space-y-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div>
                    <CardTitle>{map.name}</CardTitle>
                    <CardDescription>{map.description}</CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/tables/${map.id}`}>
                        <Grid className="mr-2 h-4 w-4" />
                        {t("viewTableMap")}
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                      <Edit className="mr-2 h-4 w-4" />
                      {t("editTableMap")}
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDeleteMap(map.id)}>
                      <Trash className="mr-2 h-4 w-4" />
                      {t("deleteTableMap")}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <TableMapEditor
                    mapId={map.id}
                    tables={map.tables}
                    isEditing={isEditing}
                    setIsEditing={setIsEditing}
                    onTablesChange={(tables) => handleTablesChange(map.id, tables)}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <Grid className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">{t("noTableMapsFound")}</h3>
            <p className="text-sm text-muted-foreground mb-4">{t("noTableMapsFoundDescription")}</p>
            <Button onClick={() => setIsCreating(true)}>
              <Plus className="mr-2 h-4 w-4" />
              {t("createTableMap")}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

