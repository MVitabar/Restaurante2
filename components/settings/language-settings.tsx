"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { useFirebase } from "@/components/firebase-provider"
import { useI18n, type Language } from "@/components/i18n-provider"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { Loader2 } from "lucide-react"

export function LanguageSettings() {
  const { user } = useAuth()
  const { db } = useFirebase()
  const { language, setLanguage, t } = useI18n()
  const { toast } = useToast()

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (user && db) {
      setLoading(true)
      const fetchLanguagePreference = async () => {
        try {
          const prefsDoc = await getDoc(doc(db, "users", user.uid, "settings", "language"))
          if (prefsDoc.exists() && prefsDoc.data().language) {
            const storedLanguage = prefsDoc.data().language as Language;
            // Only set language if it's different from current language
            if (storedLanguage !== language) {
              setLanguage(storedLanguage);
            }
          }
        } catch (error) {
          console.error("Error fetching language preference:", error)
        } finally {
          setLoading(false)
        }
      }

      fetchLanguagePreference()
    }
  }, [user, db, language, setLanguage])

  const getSavedLanguage = async () => {
    if (!user || !db) return null;

    try {
      const prefsDoc = await getDoc(doc(db, "users", user.uid, "settings", "language"))
      if (prefsDoc.exists() && prefsDoc.data().language) {
        return prefsDoc.data().language as Language;
      }
    } catch (error) {
      console.error("Error fetching saved language:", error)
    }

    return null;
  }

  const setSavedLanguage = async (language: Language) => {
    if (!user || !db) return;

    try {
      await setDoc(doc(db, "users", user.uid, "settings", "language"), {
        language,
        updatedAt: new Date(),
      }, { merge: true });
    } catch (error) {
      console.error("Error setting saved language:", error)
    }
  }

  const handleLanguageChange = (value: Language) => {
    console.log(`CRITICAL: Attempting to change language to: ${value}`);
    console.log(`CRITICAL: Current language before change: ${language}`);
    
    // Prevent immediate language reversion
    const preventReversion = async () => {
      const currentLanguage = await getSavedLanguage();
      console.log(`CRITICAL: Saved language check: ${currentLanguage}`);
      
      if (currentLanguage !== value) {
        console.log(`CRITICAL: Forcing language to: ${value}`);
        await setSavedLanguage(value);
        setLanguage(value);
      }
    };

    // Immediate change
    setLanguage(value);
    
    // Prevent reversion with a slight delay
    setTimeout(preventReversion, 100);
  }

  const handleSave = async () => {
    if (!user || !db) return

    setSaving(true)

    try {
      console.log(`CRITICAL: Saving language preference: ${language}`);
      
      // Update Firestore with the current language
      await setDoc(doc(db, "users", user.uid, "settings", "language"), {
        language,
        updatedAt: new Date(),
      }, { merge: true });

      toast({
        title: t("languagePreferenceSaved"),
        description: t("languagePreferenceSuccess"),
      })
    } catch (error) {
      console.error("CRITICAL: Error saving language preference", error);
      toast({
        title: "Error",
        description: "Failed to save language preference",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">{t("language")}</h2>
        <p className="text-muted-foreground">{t("languageSettingsDescription")}</p>
      </div>

      <RadioGroup
        value={language}
        onValueChange={handleLanguageChange as (value: string) => void}
        className="space-y-4"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="en" id="en" />
          <Label htmlFor="en" className="font-medium">
            English
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="es" id="es" />
          <Label htmlFor="es" className="font-medium">
            Español
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="pt" id="pt" />
          <Label htmlFor="pt" className="font-medium">
            Português
          </Label>
        </div>
      </RadioGroup>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t("saving")}
            </>
          ) : (
            t("saveChanges")
          )}
        </Button>
      </div>
    </div>
  )
}
