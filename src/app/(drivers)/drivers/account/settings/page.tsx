"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser, useClerk } from "@clerk/nextjs";
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
} from "lucide-react";

export default function SettingsPage() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
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
      await signOut();
      router.push("/auth/sign-in");
    }
  };

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <div className="flex items-center mb-6">
        <button
          onClick={() => router.back()}
          className="p-2 mr-2 rounded-full hover:bg-gray-100"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>

      <div className="space-y-6">
        {/* Appearance Settings */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium mb-4">Appearance</h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Moon size={20} className="text-gray-500 mr-3" />
                <label htmlFor="darkMode" className="text-gray-700">
                  Dark Mode
                </label>
              </div>
              <div className="relative inline-block w-12 align-middle select-none">
                <input
                  type="checkbox"
                  id="darkMode"
                  checked={settings.darkMode}
                  onChange={() => handleToggle("darkMode")}
                  className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                />
                <label
                  htmlFor="darkMode"
                  className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${
                    settings.darkMode ? "bg-green-500" : "bg-gray-300"
                  }`}
                ></label>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Languages size={20} className="text-gray-500 mr-3" />
                <label htmlFor="language" className="text-gray-700">
                  Language
                </label>
              </div>
              <select
                id="language"
                value={settings.language}
                onChange={handleLanguageChange}
                className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
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

        {/* Privacy Settings */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium mb-4">Privacy & Security</h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Shield size={20} className="text-gray-500 mr-3" />
                <label htmlFor="privacyMode" className="text-gray-700">
                  Enhanced Privacy Mode
                </label>
              </div>
              <div className="relative inline-block w-12 align-middle select-none">
                <input
                  type="checkbox"
                  id="privacyMode"
                  checked={settings.privacyMode}
                  onChange={() => handleToggle("privacyMode")}
                  className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                />
                <label
                  htmlFor="privacyMode"
                  className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${
                    settings.privacyMode ? "bg-green-500" : "bg-gray-300"
                  }`}
                ></label>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Smartphone size={20} className="text-gray-500 mr-3" />
                <label htmlFor="useBiometrics" className="text-gray-700">
                  Use Biometrics Authentication
                </label>
              </div>
              <div className="relative inline-block w-12 align-middle select-none">
                <input
                  type="checkbox"
                  id="useBiometrics"
                  checked={settings.useBiometrics}
                  onChange={() => handleToggle("useBiometrics")}
                  className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                />
                <label
                  htmlFor="useBiometrics"
                  className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${
                    settings.useBiometrics ? "bg-green-500" : "bg-gray-300"
                  }`}
                ></label>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <button
              onClick={() => router.push("/drivers/account/settings/password")}
              className="text-green-600 font-medium hover:text-green-700"
            >
              Change Password
            </button>
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium mb-4">Preferences</h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Bell size={20} className="text-gray-500 mr-3" />
                <label htmlFor="notifications" className="text-gray-700">
                  In-app Notifications
                </label>
              </div>
              <div className="relative inline-block w-12 align-middle select-none">
                <input
                  type="checkbox"
                  id="notifications"
                  checked={settings.notifications}
                  onChange={() => handleToggle("notifications")}
                  className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                />
                <label
                  htmlFor="notifications"
                  className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${
                    settings.notifications ? "bg-green-500" : "bg-gray-300"
                  }`}
                ></label>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Globe size={20} className="text-gray-500 mr-3" />
                <label htmlFor="autoAcceptRides" className="text-gray-700">
                  Auto-accept Ride Requests
                </label>
              </div>
              <div className="relative inline-block w-12 align-middle select-none">
                <input
                  type="checkbox"
                  id="autoAcceptRides"
                  checked={settings.autoAcceptRides}
                  onChange={() => handleToggle("autoAcceptRides")}
                  className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                />
                <label
                  htmlFor="autoAcceptRides"
                  className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${
                    settings.autoAcceptRides ? "bg-green-500" : "bg-gray-300"
                  }`}
                ></label>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Sun size={20} className="text-gray-500 mr-3" />
                <label htmlFor="showEarnings" className="text-gray-700">
                  Show Earnings on Dashboard
                </label>
              </div>
              <div className="relative inline-block w-12 align-middle select-none">
                <input
                  type="checkbox"
                  id="showEarnings"
                  checked={settings.showEarnings}
                  onChange={() => handleToggle("showEarnings")}
                  className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                />
                <label
                  htmlFor="showEarnings"
                  className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${
                    settings.showEarnings ? "bg-green-500" : "bg-gray-300"
                  }`}
                ></label>
              </div>
            </div>
          </div>
        </div>

        {/* About & Account Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium mb-4">Account</h2>

          <div className="border-b border-gray-200 pb-4 mb-4">
            <p className="text-gray-500 text-sm mb-2">App Version</p>
            <p>{settings.appVersion}</p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() =>
                window.open("https://maaziride.com/terms", "_blank")
              }
              className="text-gray-700 hover:text-gray-900 block"
            >
              Terms of Service
            </button>
            <button
              onClick={() =>
                window.open("https://maaziride.com/privacy", "_blank")
              }
              className="text-gray-700 hover:text-gray-900 block"
            >
              Privacy Policy
            </button>
            <button
              onClick={() => router.push("/drivers/account/help")}
              className="text-gray-700 hover:text-gray-900 block"
            >
              Help & Support
            </button>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={handleSignOut}
              className="flex items-center px-4 py-2 bg-red-50 text-red-600 rounded-md hover:bg-red-100"
            >
              <LogOut size={16} className="mr-2" />
              Log Out
            </button>

            <button
              onClick={() => router.push("/drivers/account/deactivate")}
              className="mt-4 flex items-center px-4 py-2 border border-red-300 text-red-600 rounded-md hover:bg-red-50"
            >
              <AlertTriangle size={16} className="mr-2" />
              Deactivate Account
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .toggle-checkbox:checked {
          right: 0;
          border-color: #ffffff;
        }
        .toggle-checkbox:checked + .toggle-label {
          background-color: #10b981;
        }
        .toggle-checkbox {
          right: 0;
          transition: all 0.3s;
        }
        .toggle-label {
          transition: all 0.3s;
        }
      `}</style>
    </div>
  );
}
