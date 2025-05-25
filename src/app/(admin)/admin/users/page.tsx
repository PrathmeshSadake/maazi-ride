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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Users,
  Search,
  Filter,
  Calendar,
  Mail,
  Phone,
  MapPin,
  Star,
  Car,
  Eye,
  UserCheck,
  UserX,
  MoreHorizontal,
  Download,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  isVerified: boolean;
  ridesCompleted: number;
  driverRating?: number;
  bookings?: Array<{
    id: string;
    status: string;
    createdAt: string;
    ride: {
      fromLocation: string;
      toLocation: string;
      price: number;
    };
  }>;
  offeredRides?: Array<{
    id: string;
    fromLocation: string;
    toLocation: string;
    status: string;
    price: number;
    departureDate: string;
  }>;
  reviews?: Array<{
    id: string;
    rating: number;
    comment: string;
    createdAt: string;
    author: {
      name: string;
    };
  }>;
}

const AdminUsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterAndSortUsers();
  }, [users, searchTerm, roleFilter, statusFilter, sortBy, sortOrder]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/users");
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortUsers = () => {
    let filtered = users.filter((user) => {
      const matchesSearch =
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesRole = roleFilter === "all" || user.role === roleFilter;

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "verified" && user.isVerified) ||
        (statusFilter === "unverified" && !user.isVerified);

      return matchesSearch && matchesRole && matchesStatus;
    });

    // Sort users
    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case "name":
          aValue = a.name || "";
          bValue = b.name || "";
          break;
        case "email":
          aValue = a.email || "";
          bValue = b.email || "";
          break;
        case "ridesCompleted":
          aValue = a.ridesCompleted || 0;
          bValue = b.ridesCompleted || 0;
          break;
        case "rating":
          aValue = a.driverRating || 0;
          bValue = b.driverRating || 0;
          break;
        default:
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredUsers(filtered);
  };

  const exportUsers = () => {
    const csvContent = [
      [
        "Name",
        "Email",
        "Role",
        "Status",
        "Rides Completed",
        "Rating",
        "Join Date",
      ].join(","),
      ...filteredUsers.map((user) =>
        [
          user.name || "",
          user.email || "",
          user.role || "",
          user.isVerified ? "Verified" : "Unverified",
          user.ridesCompleted || 0,
          user.driverRating || "N/A",
          new Date(user.createdAt).toLocaleDateString(),
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `users-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Users exported successfully");
  };

  const getInitials = (name: string) => {
    return (
      name
        ?.split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase() || "U"
    );
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "driver":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-green-100 text-green-800 border-green-200";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading users...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Users className="h-8 w-8" />
          <h1 className="text-3xl font-bold tracking-tight">
            Users Management
          </h1>
        </div>
        <div className="flex items-center space-x-4">
          <Badge variant="outline" className="text-sm">
            {filteredUsers.length} users
          </Badge>
          <Button onClick={exportUsers} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Drivers</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter((u) => u.role === "driver").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Verified Users
            </CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter((u) => u.isVerified).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              New This Month
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                users.filter((u) => {
                  const userDate = new Date(u.createdAt);
                  const now = new Date();
                  return (
                    userDate.getMonth() === now.getMonth() &&
                    userDate.getFullYear() === now.getFullYear()
                  );
                }).length
              }
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters & Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>

            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="user">Passengers</SelectItem>
                <SelectItem value="driver">Drivers</SelectItem>
                <SelectItem value="admin">Admins</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="unverified">Unverified</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt">Join Date</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="ridesCompleted">Rides Completed</SelectItem>
                <SelectItem value="rating">Rating</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortOrder} onValueChange={setSortOrder}>
              <SelectTrigger>
                <SelectValue placeholder="Order" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">Descending</SelectItem>
                <SelectItem value="asc">Ascending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredUsers.map((user) => (
          <Card key={user.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage
                      src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`}
                    />
                    <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{user.name}</CardTitle>
                    <CardDescription className="flex items-center">
                      <Mail className="h-3 w-3 mr-1" />
                      {user.email}
                    </CardDescription>
                  </div>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedUser(user)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="flex items-center space-x-2">
                        <Avatar>
                          <AvatarImage
                            src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`}
                          />
                          <AvatarFallback>
                            {getInitials(user.name)}
                          </AvatarFallback>
                        </Avatar>
                        <span>{user.name}</span>
                      </DialogTitle>
                      <DialogDescription>
                        Complete user profile and activity history
                      </DialogDescription>
                    </DialogHeader>

                    {selectedUser && (
                      <div className="space-y-6">
                        {/* User Info */}
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <h3 className="font-semibold">
                              Contact Information
                            </h3>
                            <div className="space-y-1 text-sm">
                              <div className="flex items-center">
                                <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                                {selectedUser.email}
                              </div>
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                                Joined{" "}
                                {new Date(
                                  selectedUser.createdAt
                                ).toLocaleDateString()}
                              </div>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <h3 className="font-semibold">Account Status</h3>
                            <div className="space-y-2">
                              <Badge
                                className={getRoleColor(selectedUser.role)}
                              >
                                {selectedUser.role.charAt(0).toUpperCase() +
                                  selectedUser.role.slice(1)}
                              </Badge>
                              <Badge
                                variant={
                                  selectedUser.isVerified
                                    ? "default"
                                    : "destructive"
                                }
                              >
                                {selectedUser.isVerified
                                  ? "Verified"
                                  : "Unverified"}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        {/* Driver Stats */}
                        {selectedUser.role === "driver" && (
                          <div className="space-y-2">
                            <h3 className="font-semibold">Driver Statistics</h3>
                            <div className="grid gap-4 md:grid-cols-3">
                              <Card>
                                <CardContent className="pt-4">
                                  <div className="text-2xl font-bold">
                                    {selectedUser.ridesCompleted}
                                  </div>
                                  <p className="text-sm text-muted-foreground">
                                    Rides Completed
                                  </p>
                                </CardContent>
                              </Card>
                              <Card>
                                <CardContent className="pt-4">
                                  <div className="text-2xl font-bold flex items-center">
                                    <Star className="h-5 w-5 text-yellow-400 mr-1" />
                                    {selectedUser.driverRating?.toFixed(1) ||
                                      "N/A"}
                                  </div>
                                  <p className="text-sm text-muted-foreground">
                                    Average Rating
                                  </p>
                                </CardContent>
                              </Card>
                              <Card>
                                <CardContent className="pt-4">
                                  <div className="text-2xl font-bold">
                                    {selectedUser.offeredRides?.length || 0}
                                  </div>
                                  <p className="text-sm text-muted-foreground">
                                    Rides Offered
                                  </p>
                                </CardContent>
                              </Card>
                            </div>
                          </div>
                        )}

                        {/* Booking History */}
                        {selectedUser.bookings &&
                          selectedUser.bookings.length > 0 && (
                            <div className="space-y-2">
                              <h3 className="font-semibold">Booking History</h3>
                              <div className="space-y-2 max-h-40 overflow-y-auto">
                                {selectedUser.bookings.map((booking) => (
                                  <div
                                    key={booking.id}
                                    className="flex items-center justify-between p-2 border rounded"
                                  >
                                    <div>
                                      <p className="font-medium text-sm">
                                        {booking.ride.fromLocation} →{" "}
                                        {booking.ride.toLocation}
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        {new Date(
                                          booking.createdAt
                                        ).toLocaleDateString()}
                                      </p>
                                    </div>
                                    <div className="text-right">
                                      <Badge
                                        variant={
                                          booking.status === "COMPLETED"
                                            ? "default"
                                            : booking.status === "CONFIRMED"
                                            ? "secondary"
                                            : "outline"
                                        }
                                      >
                                        {booking.status}
                                      </Badge>
                                      <p className="text-sm font-medium">
                                        ₹{booking.ride.price}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                        {/* Offered Rides (for drivers) */}
                        {selectedUser.offeredRides &&
                          selectedUser.offeredRides.length > 0 && (
                            <div className="space-y-2">
                              <h3 className="font-semibold">Offered Rides</h3>
                              <div className="space-y-2 max-h-40 overflow-y-auto">
                                {selectedUser.offeredRides.map((ride) => (
                                  <div
                                    key={ride.id}
                                    className="flex items-center justify-between p-2 border rounded"
                                  >
                                    <div>
                                      <p className="font-medium text-sm">
                                        {ride.fromLocation} → {ride.toLocation}
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        {new Date(
                                          ride.departureDate
                                        ).toLocaleDateString()}
                                      </p>
                                    </div>
                                    <div className="text-right">
                                      <Badge
                                        variant={
                                          ride.status === "COMPLETED"
                                            ? "default"
                                            : ride.status === "PENDING"
                                            ? "secondary"
                                            : "outline"
                                        }
                                      >
                                        {ride.status}
                                      </Badge>
                                      <p className="text-sm font-medium">
                                        ₹{ride.price}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                        {/* Reviews */}
                        {selectedUser.reviews &&
                          selectedUser.reviews.length > 0 && (
                            <div className="space-y-2">
                              <h3 className="font-semibold">
                                Reviews Received
                              </h3>
                              <div className="space-y-2 max-h-40 overflow-y-auto">
                                {selectedUser.reviews.map((review) => (
                                  <div
                                    key={review.id}
                                    className="p-3 border rounded"
                                  >
                                    <div className="flex items-center justify-between mb-2">
                                      <div className="flex items-center">
                                        {[...Array(5)].map((_, i) => (
                                          <Star
                                            key={i}
                                            className={`h-4 w-4 ${
                                              i < review.rating
                                                ? "text-yellow-400 fill-current"
                                                : "text-gray-300"
                                            }`}
                                          />
                                        ))}
                                      </div>
                                      <span className="text-xs text-muted-foreground">
                                        by {review.author.name}
                                      </span>
                                    </div>
                                    <p className="text-sm">{review.comment}</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {new Date(
                                        review.createdAt
                                      ).toLocaleDateString()}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <Badge className={getRoleColor(user.role)}>
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </Badge>
                <Badge variant={user.isVerified ? "default" : "destructive"}>
                  {user.isVerified ? "Verified" : "Unverified"}
                </Badge>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Joined:</span>
                  <span>{new Date(user.createdAt).toLocaleDateString()}</span>
                </div>

                {user.role === "driver" && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Rides:</span>
                      <span>{user.ridesCompleted}</span>
                    </div>
                    {user.driverRating && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Rating:</span>
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-400 mr-1" />
                          <span>{user.driverRating.toFixed(1)}</span>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="flex space-x-2">
                <Link href={`/admin/users/${user.id}`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full">
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No users found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search criteria or filters.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminUsersPage;
