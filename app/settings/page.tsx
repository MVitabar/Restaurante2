"use client"

import { useState } from "react"
import { useI18n } from "@/components/i18n-provider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { UserProfile } from "@/components/settings/user-profile"
import { NotificationSettings } from "@/components/settings/notification-settings"
import { LanguageSettings } from "@/components/settings/language-settings"
import { AppearanceSettings } from "@/components/settings/appearance-settings"
import { TableMapSettings } from "@/components/settings/table-map-settings"
import { User, Settings, Bell, Globe, Palette, Grid } from "lucide-react"

export default function SettingsPage() {
  const { t } = useI18n()
  const [activeTab, setActiveTab] = useState("profile")

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">{t("settings")}</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-2 md:grid-cols-6 gap-2">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="hidden md:inline">{t("profile")}</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden md:inline">{t("notifications")}</span>
          </TabsTrigger>
          <TabsTrigger value="language" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            <span className="hidden md:inline">{t("language")}</span>
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            <span className="hidden md:inline">{t("appearance")}</span>
          </TabsTrigger>
          <TabsTrigger value="tables" className="flex items-center gap-2">
            <Grid className="h-4 w-4" />
            <span className="hidden md:inline">{t("tableMaps")}</span>
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden md:inline">{t("system")}</span>
          </TabsTrigger>
        </TabsList>

        <Card className="p-6">
          <TabsContent value="profile" className="mt-0">
            <UserProfile />
          </TabsContent>

          <TabsContent value="notifications" className="mt-0">
            <NotificationSettings />
          </TabsContent>

          <TabsContent value="language" className="mt-0">
            <LanguageSettings />
          </TabsContent>

          <TabsContent value="appearance" className="mt-0">
            <AppearanceSettings />
          </TabsContent>

          <TabsContent value="tables" className="mt-0">
            <TableMapSettings />
          </TabsContent>

          <TabsContent value="system" className="mt-0">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">{t("system")}</h2>
              <p className="text-muted-foreground">{t("systemSettingsDescription")}</p>
              {/* System settings content */}
            </div>
          </TabsContent>
        </Card>
      </Tabs>
    </div>
  )
}

