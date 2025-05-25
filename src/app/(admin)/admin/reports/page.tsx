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
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileText,
  Download,
  Search,
  Filter,
  Calendar,
  Users,
  Car,
  DollarSign,
} from "lucide-react";
import { toast } from "sonner";

interface ReportData {
  users: Array<{
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
    isVerified: boolean;
    ridesCompleted: number;
    driverRating?: number;
  }>;
  rides: Array<{
    id: string;
    driverName: string;
    fromLocation: string;
    toLocation: string;
    departureDate: string;
    price: number;
    availableSeats: number;
    status: string;
    bookingsCount: number;
  }>;
  bookings: Array<{
    id: string;
    userName: string;
    driverName: string;
    route: string;
    status: string;
    numSeats: number;
    createdAt: string;
    totalAmount: number;
  }>;
  revenue: Array<{
    date: string;
    totalRevenue: number;
    bookingsCount: number;
    averageRideValue: number;
  }>;
  summary: {
    totalUsers: number;
    totalDrivers: number;
    totalRides: number;
    totalBookings: number;
    totalRevenue: number;
    averageRating: number;
  };
}

const AdminReports = () => {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState("30d");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("users");

  useEffect(() => {
    fetchReportData();
  }, [dateRange, statusFilter]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/admin/reports?range=${dateRange}&status=${statusFilter}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch report data");
      }
      const data = await response.json();
      setReportData(data);
    } catch (error) {
      console.error("Error fetching reports:", error);
      toast.error("Failed to fetch report data");
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = (data: any[], filename: string) => {
    if (!data.length) {
      toast.error("No data to export");
      return;
    }

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(","),
      ...data.map((row) =>
        headers
          .map((header) => {
            const value = row[header];
            return typeof value === "string" && value.includes(",")
              ? `"${value}"`
              : value;
          })
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${filename}-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Report exported successfully");
  };

  const filterData = (data: any[]) => {
    if (!searchTerm) return data;

    return data.filter((item) =>
      Object.values(item).some((value) =>
        value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading reports...</div>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-red-500">Failed to load report data</div>
      </div>
    );
  }

  const filteredUsers = filterData(reportData.users);
  const filteredRides = filterData(reportData.rides);
  const filteredBookings = filterData(reportData.bookings);
  const filteredRevenue = filterData(reportData.revenue);

  return (
    <div className="flex flex-1 flex-col space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <FileText className="h-8 w-8" />
          <h1 className="text-3xl font-bold tracking-tight">
            Reports & Analytics
          </h1>
        </div>
        <div className="flex items-center space-x-4">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reportData.summary.totalUsers}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Drivers</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reportData.summary.totalDrivers}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Rides</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reportData.summary.totalRides}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Bookings
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reportData.summary.totalBookings}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${reportData.summary.totalRevenue.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reportData.summary.averageRating.toFixed(1)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search reports..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {/* Reports Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="users">Users Report</TabsTrigger>
          <TabsTrigger value="rides">Rides Report</TabsTrigger>
          <TabsTrigger value="bookings">Bookings Report</TabsTrigger>
          <TabsTrigger value="revenue">Revenue Report</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Users Report</CardTitle>
                <CardDescription>
                  Comprehensive user data and statistics
                </CardDescription>
              </div>
              <Button
                onClick={() => exportToCSV(filteredUsers, "users-report")}
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Name</th>
                      <th className="text-left p-2">Email</th>
                      <th className="text-left p-2">Role</th>
                      <th className="text-left p-2">Joined</th>
                      <th className="text-left p-2">Status</th>
                      <th className="text-left p-2">Rides</th>
                      <th className="text-left p-2">Rating</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="border-b">
                        <td className="p-2">{user.name}</td>
                        <td className="p-2">{user.email}</td>
                        <td className="p-2">
                          <Badge
                            variant={
                              user.role === "driver" ? "default" : "secondary"
                            }
                          >
                            {user.role}
                          </Badge>
                        </td>
                        <td className="p-2">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="p-2">
                          <Badge
                            variant={
                              user.isVerified ? "default" : "destructive"
                            }
                          >
                            {user.isVerified ? "Verified" : "Unverified"}
                          </Badge>
                        </td>
                        <td className="p-2">{user.ridesCompleted}</td>
                        <td className="p-2">
                          {user.driverRating?.toFixed(1) || "N/A"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rides" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Rides Report</CardTitle>
                <CardDescription>
                  All ride listings and their performance
                </CardDescription>
              </div>
              <Button
                onClick={() => exportToCSV(filteredRides, "rides-report")}
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Driver</th>
                      <th className="text-left p-2">Route</th>
                      <th className="text-left p-2">Date</th>
                      <th className="text-left p-2">Price</th>
                      <th className="text-left p-2">Seats</th>
                      <th className="text-left p-2">Status</th>
                      <th className="text-left p-2">Bookings</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRides.map((ride) => (
                      <tr key={ride.id} className="border-b">
                        <td className="p-2">{ride.driverName}</td>
                        <td className="p-2">
                          {ride.fromLocation} → {ride.toLocation}
                        </td>
                        <td className="p-2">
                          {new Date(ride.departureDate).toLocaleDateString()}
                        </td>
                        <td className="p-2">${ride.price}</td>
                        <td className="p-2">{ride.availableSeats}</td>
                        <td className="p-2">
                          <Badge
                            variant={
                              ride.status === "COMPLETED"
                                ? "default"
                                : ride.status === "PENDING"
                                ? "secondary"
                                : "destructive"
                            }
                          >
                            {ride.status}
                          </Badge>
                        </td>
                        <td className="p-2">{ride.bookingsCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bookings" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Bookings Report</CardTitle>
                <CardDescription>
                  All booking transactions and details
                </CardDescription>
              </div>
              <Button
                onClick={() => exportToCSV(filteredBookings, "bookings-report")}
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">User</th>
                      <th className="text-left p-2">Driver</th>
                      <th className="text-left p-2">Route</th>
                      <th className="text-left p-2">Seats</th>
                      <th className="text-left p-2">Amount</th>
                      <th className="text-left p-2">Status</th>
                      <th className="text-left p-2">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBookings.map((booking) => (
                      <tr key={booking.id} className="border-b">
                        <td className="p-2">{booking.userName}</td>
                        <td className="p-2">{booking.driverName}</td>
                        <td className="p-2">{booking.route}</td>
                        <td className="p-2">{booking.numSeats}</td>
                        <td className="p-2">
                          ${booking.totalAmount.toFixed(2)}
                        </td>
                        <td className="p-2">
                          <Badge
                            variant={
                              booking.status === "COMPLETED"
                                ? "default"
                                : booking.status === "CONFIRMED"
                                ? "secondary"
                                : booking.status === "PENDING"
                                ? "outline"
                                : "destructive"
                            }
                          >
                            {booking.status}
                          </Badge>
                        </td>
                        <td className="p-2">
                          {new Date(booking.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Revenue Report</CardTitle>
                <CardDescription>
                  Daily revenue breakdown and trends
                </CardDescription>
              </div>
              <Button
                onClick={() => exportToCSV(filteredRevenue, "revenue-report")}
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Date</th>
                      <th className="text-left p-2">Total Revenue</th>
                      <th className="text-left p-2">Bookings Count</th>
                      <th className="text-left p-2">Average Ride Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRevenue.map((revenue, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-2">
                          {new Date(revenue.date).toLocaleDateString()}
                        </td>
                        <td className="p-2">
                          ${revenue.totalRevenue.toFixed(2)}
                        </td>
                        <td className="p-2">{revenue.bookingsCount}</td>
                        <td className="p-2">
                          ${revenue.averageRideValue.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminReports;
