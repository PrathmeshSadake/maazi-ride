"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Save, Plus, Trash2, Edit } from "lucide-react";
import { toast } from "sonner";

interface Setting {
  id: string;
  key: string;
  value: string;
  description?: string;
  updatedAt: string;
}

interface FilterOption {
  id: string;
  name: string;
  displayName: string;
  options: any[];
  createdAt: string;
  updatedAt: string;
}

const AdminSettings = () => {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [filterOptions, setFilterOptions] = useState<FilterOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form states
  const [newSetting, setNewSetting] = useState({
    key: "",
    value: "",
    description: "",
  });

  const [newFilter, setNewFilter] = useState({
    name: "",
    displayName: "",
    options: "",
  });

  const [editingSetting, setEditingSetting] = useState<Setting | null>(null);
  const [editingFilter, setEditingFilter] = useState<FilterOption | null>(null);

  useEffect(() => {
    fetchSettings();
    fetchFilterOptions();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/admin/settings");
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
      toast.error("Failed to fetch settings");
    }
  };

  const fetchFilterOptions = async () => {
    try {
      const response = await fetch("/api/admin/filter-options");
      if (response.ok) {
        const data = await response.json();
        setFilterOptions(data);
      }
    } catch (error) {
      console.error("Error fetching filter options:", error);
      toast.error("Failed to fetch filter options");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSetting = async () => {
    if (!newSetting.key || !newSetting.value) {
      toast.error("Key and value are required");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSetting),
      });

      if (response.ok) {
        toast.success("Setting saved successfully");
        setNewSetting({ key: "", value: "", description: "" });
        fetchSettings();
      } else {
        toast.error("Failed to save setting");
      }
    } catch (error) {
      toast.error("Error saving setting");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateSetting = async () => {
    if (!editingSetting) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/admin/settings/${editingSetting.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          value: editingSetting.value,
          description: editingSetting.description,
        }),
      });

      if (response.ok) {
        toast.success("Setting updated successfully");
        setEditingSetting(null);
        fetchSettings();
      } else {
        toast.error("Failed to update setting");
      }
    } catch (error) {
      toast.error("Error updating setting");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSetting = async (id: string) => {
    if (!confirm("Are you sure you want to delete this setting?")) return;

    try {
      const response = await fetch(`/api/admin/settings/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Setting deleted successfully");
        fetchSettings();
      } else {
        toast.error("Failed to delete setting");
      }
    } catch (error) {
      toast.error("Error deleting setting");
    }
  };

  const handleSaveFilter = async () => {
    if (!newFilter.name || !newFilter.displayName || !newFilter.options) {
      toast.error("All fields are required");
      return;
    }

    setSaving(true);
    try {
      const options = JSON.parse(newFilter.options);
      const response = await fetch("/api/admin/filter-options", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newFilter.name,
          displayName: newFilter.displayName,
          options,
        }),
      });

      if (response.ok) {
        toast.success("Filter option saved successfully");
        setNewFilter({ name: "", displayName: "", options: "" });
        fetchFilterOptions();
      } else {
        toast.error("Failed to save filter option");
      }
    } catch (error) {
      toast.error("Invalid JSON format for options");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteFilter = async (id: string) => {
    if (!confirm("Are you sure you want to delete this filter option?")) return;

    try {
      const response = await fetch(`/api/admin/filter-options/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Filter option deleted successfully");
        fetchFilterOptions();
      } else {
        toast.error("Failed to delete filter option");
      }
    } catch (error) {
      toast.error("Error deleting filter option");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Settings className="h-8 w-8" />
          <h1 className="text-3xl font-bold tracking-tight">Admin Settings</h1>
        </div>
        <Badge variant="outline" className="text-sm">
          System Configuration
        </Badge>
      </div>

      <Tabs defaultValue="app-settings" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="app-settings">App Settings</TabsTrigger>
          <TabsTrigger value="filter-options">Filter Options</TabsTrigger>
          <TabsTrigger value="system-config">System Config</TabsTrigger>
        </TabsList>

        <TabsContent value="app-settings" className="space-y-6">
          {/* Add New Setting */}
          <Card>
            <CardHeader>
              <CardTitle>Add New Setting</CardTitle>
              <CardDescription>
                Create a new application setting that can be used throughout the
                system
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="setting-key">Setting Key</Label>
                  <Input
                    id="setting-key"
                    placeholder="e.g., max_ride_distance"
                    value={newSetting.key}
                    onChange={(e) =>
                      setNewSetting({ ...newSetting, key: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="setting-value">Setting Value</Label>
                  <Input
                    id="setting-value"
                    placeholder="e.g., 100"
                    value={newSetting.value}
                    onChange={(e) =>
                      setNewSetting({ ...newSetting, value: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="setting-description">
                  Description (Optional)
                </Label>
                <Textarea
                  id="setting-description"
                  placeholder="Describe what this setting controls..."
                  value={newSetting.description}
                  onChange={(e) =>
                    setNewSetting({
                      ...newSetting,
                      description: e.target.value,
                    })
                  }
                />
              </div>
              <Button onClick={handleSaveSetting} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Saving..." : "Save Setting"}
              </Button>
            </CardContent>
          </Card>

          {/* Existing Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Current Settings</CardTitle>
              <CardDescription>
                Manage existing application settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {settings.length === 0 ? (
                  <p className="text-muted-foreground">
                    No settings configured yet.
                  </p>
                ) : (
                  settings.map((setting) => (
                    <div key={setting.id} className="border rounded-lg p-4">
                      {editingSetting?.id === setting.id ? (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Key</Label>
                              <Input value={setting.key} disabled />
                            </div>
                            <div className="space-y-2">
                              <Label>Value</Label>
                              <Input
                                value={editingSetting.value}
                                onChange={(e) =>
                                  setEditingSetting({
                                    ...editingSetting,
                                    value: e.target.value,
                                  })
                                }
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label>Description</Label>
                            <Textarea
                              value={editingSetting.description || ""}
                              onChange={(e) =>
                                setEditingSetting({
                                  ...editingSetting,
                                  description: e.target.value,
                                })
                              }
                            />
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              onClick={handleUpdateSetting}
                              disabled={saving}
                            >
                              <Save className="h-4 w-4 mr-2" />
                              {saving ? "Saving..." : "Save"}
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => setEditingSetting(null)}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <Badge variant="secondary">{setting.key}</Badge>
                              <span className="font-medium">
                                {setting.value}
                              </span>
                            </div>
                            {setting.description && (
                              <p className="text-sm text-muted-foreground">
                                {setting.description}
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground">
                              Updated:{" "}
                              {new Date(setting.updatedAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingSetting(setting)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteSetting(setting.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="filter-options" className="space-y-6">
          {/* Add New Filter Option */}
          <Card>
            <CardHeader>
              <CardTitle>Add New Filter Option</CardTitle>
              <CardDescription>
                Create filter options for search and filtering functionality
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="filter-name">Filter Name</Label>
                  <Input
                    id="filter-name"
                    placeholder="e.g., vehicle_types"
                    value={newFilter.name}
                    onChange={(e) =>
                      setNewFilter({ ...newFilter, name: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="filter-display">Display Name</Label>
                  <Input
                    id="filter-display"
                    placeholder="e.g., Vehicle Types"
                    value={newFilter.displayName}
                    onChange={(e) =>
                      setNewFilter({
                        ...newFilter,
                        displayName: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="filter-options">Options (JSON Array)</Label>
                <Textarea
                  id="filter-options"
                  placeholder='["Car", "SUV", "Van", "Motorcycle"]'
                  value={newFilter.options}
                  onChange={(e) =>
                    setNewFilter({ ...newFilter, options: e.target.value })
                  }
                  rows={4}
                />
              </div>
              <Button onClick={handleSaveFilter} disabled={saving}>
                <Plus className="h-4 w-4 mr-2" />
                {saving ? "Saving..." : "Add Filter Option"}
              </Button>
            </CardContent>
          </Card>

          {/* Existing Filter Options */}
          <Card>
            <CardHeader>
              <CardTitle>Current Filter Options</CardTitle>
              <CardDescription>Manage existing filter options</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filterOptions.length === 0 ? (
                  <p className="text-muted-foreground">
                    No filter options configured yet.
                  </p>
                ) : (
                  filterOptions.map((filter) => (
                    <div key={filter.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Badge>{filter.name}</Badge>
                            <span className="font-medium">
                              {filter.displayName}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {filter.options.map((option, index) => (
                              <Badge
                                key={index}
                                variant="outline"
                                className="text-xs"
                              >
                                {option}
                              </Badge>
                            ))}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Created:{" "}
                            {new Date(filter.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteFilter(filter.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system-config" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>System Configuration</CardTitle>
              <CardDescription>
                Configure system-wide settings and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Maintenance Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable maintenance mode to prevent new bookings
                    </p>
                  </div>
                  <Switch />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Auto-approve Drivers</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically approve new driver registrations
                    </p>
                  </div>
                  <Switch />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Send email notifications for important events
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">SMS Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Send SMS notifications for booking updates
                    </p>
                  </div>
                  <Switch />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max-distance">
                    Maximum Ride Distance (km)
                  </Label>
                  <Input
                    id="max-distance"
                    type="number"
                    placeholder="100"
                    className="max-w-xs"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="commission-rate">Commission Rate (%)</Label>
                  <Input
                    id="commission-rate"
                    type="number"
                    placeholder="10"
                    className="max-w-xs"
                  />
                </div>

                <Button className="w-fit">
                  <Save className="h-4 w-4 mr-2" />
                  Save Configuration
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSettings;
