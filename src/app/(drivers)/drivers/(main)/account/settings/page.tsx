"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Moon,
  Sun,
  Globe,
  Bell,
  Shield,
  Smartphone,
  Languages,
  LogOut,
  AlertTriangle,
  ChevronRight,
  HelpCircle,
  FileText,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useLogout } from "@/hooks/useLogout";

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const { logout } = useLogout();
  const router = useRouter();

  const [settings, setSettings] = useState({
    darkMode: false,
    language: "english",
    notifications: true,
    privacyMode: false,
    appVersion: "1.0.0",
    autoAcceptRides: false,
    useBiometrics: true,
    showEarnings: true,
  });

  // Handle toggle
  const handleToggle = (setting: keyof typeof settings) => {
    if (typeof settings[setting] === "boolean") {
      setSettings({
        ...settings,
        [setting]: !settings[setting],
      });
    }
  };

  // Handle language change
  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSettings({
      ...settings,
      language: e.target.value,
    });
  };

  // Handle sign out
  const handleSignOut = async () => {
    if (confirm("Are you sure you want to log out?")) {
      try {
        await logout("/");
      } catch (error) {
        console.error("Error during logout:", error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white">
        <div className="flex items-center px-4 pt-8 pb-4">
          <button
            onClick={() => router.back()}
            className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-3"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="text-xl font-semibold text-gray-900">Settings</h1>
        </div>
      </div>

      <div className="px-4 pb-6 space-y-4">
        {/* Appearance Settings */}
        <div className="bg-white rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-900">
              Appearance
            </h2>
          </div>

          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                  <Moon className="w-4 h-4 text-gray-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900 text-sm">
                    Dark Mode
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    Switch to dark theme
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleToggle("darkMode")}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.darkMode ? "bg-blue-500" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.darkMode ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                  <Languages className="w-4 h-4 text-gray-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900 text-sm">
                    Language
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    Change app language
                  </div>
                </div>
              </div>
              <select
                value={settings.language}
                onChange={handleLanguageChange}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="english">English</option>
                <option value="hindi">Hindi</option>
                <option value="marathi">Marathi</option>
                <option value="punjabi">Punjabi</option>
                <option value="tamil">Tamil</option>
                <option value="telugu">Telugu</option>
              </select>
            </div>
          </div>
        </div>

        {/* Privacy & Security Settings */}
        <div className="bg-white rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-900">
              Privacy & Security
            </h2>
          </div>

          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                  <Shield className="w-4 h-4 text-gray-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900 text-sm">
                    Enhanced Privacy Mode
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    Hide personal information
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleToggle("privacyMode")}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.privacyMode ? "bg-blue-500" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.privacyMode ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                  <Smartphone className="w-4 h-4 text-gray-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900 text-sm">
                    Biometric Authentication
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    Use fingerprint or face ID
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleToggle("useBiometrics")}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.useBiometrics ? "bg-blue-500" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.useBiometrics ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            <button
              onClick={() => router.push("/drivers/account/settings/password")}
              className="w-full flex items-center p-3 hover:bg-gray-50 active:bg-gray-100 transition-colors rounded-lg"
            >
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                <Shield className="w-4 h-4 text-gray-600" />
              </div>
              <div className="flex-1 text-left">
                <div className="font-medium text-gray-900 text-sm">
                  Change Password
                </div>
                <div className="text-xs text-gray-500 mt-0.5">
                  Update your account password
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-white rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-900">
              Preferences
            </h2>
          </div>

          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                  <Bell className="w-4 h-4 text-gray-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900 text-sm">
                    In-app Notifications
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    Show notifications within the app
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleToggle("notifications")}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.notifications ? "bg-blue-500" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.notifications ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                  <Globe className="w-4 h-4 text-gray-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900 text-sm">
                    Auto-accept Ride Requests
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    Automatically accept compatible rides
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleToggle("autoAcceptRides")}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.autoAcceptRides ? "bg-blue-500" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.autoAcceptRides ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                  <Sun className="w-4 h-4 text-gray-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900 text-sm">
                    Show Earnings on Dashboard
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    Display earnings information
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleToggle("showEarnings")}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.showEarnings ? "bg-blue-500" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.showEarnings ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Support & Legal */}
        <div className="bg-white rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-900">
              Support & Legal
            </h2>
          </div>

          <div className="p-4 space-y-0">
            {[
              {
                icon: HelpCircle,
                label: "Help & Support",
                description: "Get help and contact support",
                action: () => router.push("/drivers/account/help"),
              },
              {
                icon: FileText,
                label: "Terms of Service",
                description: "Read our terms and conditions",
                action: () =>
                  window.open("https://maaziride.com/terms", "_blank"),
              },
              {
                icon: Shield,
                label: "Privacy Policy",
                description: "View our privacy policy",
                action: () =>
                  window.open("https://maaziride.com/privacy", "_blank"),
              },
            ].map((item, index) => (
              <button
                key={index}
                onClick={item.action}
                className="w-full flex items-center p-3 hover:bg-gray-50 active:bg-gray-100 transition-colors border-b border-gray-50 last:border-b-0"
              >
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                  <item.icon className="w-4 h-4 text-gray-600" />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-medium text-gray-900 text-sm">
                    {item.label}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {item.description}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>
            ))}
          </div>
        </div>

        {/* App Info */}
        <div className="bg-white rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-900">
              App Information
            </h2>
          </div>

          <div className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900 text-sm">Version</div>
                <div className="text-xs text-gray-500 mt-0.5">
                  Current app version
                </div>
              </div>
              <span className="text-sm text-gray-600">
                {settings.appVersion}
              </span>
            </div>
          </div>
        </div>

        {/* Account Actions */}
        <div className="bg-white rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-900">
              Account Actions
            </h2>
          </div>

          <div className="p-4 space-y-3">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center p-3 bg-red-50 rounded-lg hover:bg-red-100 active:bg-red-200 transition-colors"
            >
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
                <LogOut className="w-4 h-4 text-red-600" />
              </div>
              <div className="flex-1 text-left">
                <div className="font-medium text-red-600 text-sm">Log Out</div>
                <div className="text-xs text-red-400 mt-0.5">
                  Sign out of your account
                </div>
              </div>
            </button>

            <button
              onClick={() => router.push("/drivers/account/deactivate")}
              className="w-full flex items-center p-3 border border-red-200 rounded-lg hover:bg-red-50 active:bg-red-100 transition-colors"
            >
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
                <AlertTriangle className="w-4 h-4 text-red-600" />
              </div>
              <div className="flex-1 text-left">
                <div className="font-medium text-red-600 text-sm">
                  Deactivate Account
                </div>
                <div className="text-xs text-red-400 mt-0.5">
                  Temporarily disable your account
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
