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
  Car,
  Search,
  Filter,
  Calendar,
  Mail,
  Phone,
  MapPin,
  Star,
  Eye,
  UserCheck,
  UserX,
  FileText,
  Download,
  Shield,
  TrendingUp,
  DollarSign,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface Driver {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  isVerified: boolean;
  ridesCompleted: number;
  driverRating?: number;
  upiId?: string;
  drivingLicenseUrl?: string;
  vehicleRegistrationUrl?: string;
  insuranceUrl?: string;
  vehicle?: {
    id: string;
    make: string;
    model: string;
    year?: number;
    color?: string;
    licensePlate?: string;
    vehicleImages: string[];
    isCommercial?: boolean;
  };
  offeredRides?: Array<{
    id: string;
    fromLocation: string;
    toLocation: string;
    status: string;
    price: number;
    departureDate: string;
    availableSeats: number;
    bookings: Array<{ id: string; status: string }>;
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

const AdminDriversPage = () => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [filteredDrivers, setFilteredDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [verificationFilter, setVerificationFilter] = useState("all");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);

  useEffect(() => {
    fetchDrivers();
  }, []);

  useEffect(() => {
    filterAndSortDrivers();
  }, [
    drivers,
    searchTerm,
    verificationFilter,
    ratingFilter,
    sortBy,
    sortOrder,
  ]);

  const fetchDrivers = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/drivers");
      if (!response.ok) {
        throw new Error("Failed to fetch drivers");
      }
      const data = await response.json();
      setDrivers(data);
    } catch (error) {
      console.error("Error fetching drivers:", error);
      toast.error("Failed to fetch drivers");
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortDrivers = () => {
    let filtered = drivers.filter((driver) => {
      const matchesSearch =
        driver.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        driver.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        driver.vehicle?.licensePlate
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesVerification =
        verificationFilter === "all" ||
        (verificationFilter === "verified" && driver.isVerified) ||
        (verificationFilter === "unverified" && !driver.isVerified);

      const matchesRating =
        ratingFilter === "all" ||
        (ratingFilter === "high" && (driver.driverRating || 0) >= 4.0) ||
        (ratingFilter === "medium" &&
          (driver.driverRating || 0) >= 3.0 &&
          (driver.driverRating || 0) < 4.0) ||
        (ratingFilter === "low" && (driver.driverRating || 0) < 3.0);

      return matchesSearch && matchesVerification && matchesRating;
    });

    // Sort drivers
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

    setFilteredDrivers(filtered);
  };

  const exportDrivers = () => {
    const csvContent = [
      [
        "Name",
        "Email",
        "Verification",
        "Rides Completed",
        "Rating",
        "Vehicle",
        "Join Date",
      ].join(","),
      ...filteredDrivers.map((driver) =>
        [
          driver.name || "",
          driver.email || "",
          driver.isVerified ? "Verified" : "Unverified",
          driver.ridesCompleted || 0,
          driver.driverRating || "N/A",
          driver.vehicle
            ? `${driver.vehicle.make} ${driver.vehicle.model}`
            : "N/A",
          new Date(driver.createdAt).toLocaleDateString(),
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `drivers-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Drivers exported successfully");
  };

  const getInitials = (name: string) => {
    return (
      name
        ?.split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase() || "D"
    );
  };

  const getRatingColor = (rating?: number) => {
    if (!rating) return "text-gray-400";
    if (rating >= 4.0) return "text-green-600";
    if (rating >= 3.0) return "text-yellow-600";
    return "text-red-600";
  };

  const getDocumentStatus = (driver: Driver) => {
    const docs = [
      driver.drivingLicenseUrl,
      driver.vehicleRegistrationUrl,
      driver.insuranceUrl,
    ].filter(Boolean);
    return `${docs.length}/3`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading drivers...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Car className="h-8 w-8" />
          <h1 className="text-3xl font-bold tracking-tight">
            Drivers Management
          </h1>
        </div>
        <div className="flex items-center space-x-4">
          <Badge variant="outline" className="text-sm">
            {filteredDrivers.length} drivers
          </Badge>
          <Button onClick={exportDrivers} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Drivers</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{drivers.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Verified Drivers
            </CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {drivers.filter((d) => d.isVerified).length}
            </div>
            <p className="text-xs text-muted-foreground">
              {(
                (drivers.filter((d) => d.isVerified).length / drivers.length) *
                100
              ).toFixed(1)}
              % verified
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(
                drivers.reduce((sum, d) => sum + (d.driverRating || 0), 0) /
                  drivers.filter((d) => d.driverRating).length || 0
              ).toFixed(1)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active This Month
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                drivers.filter((d) => {
                  const driverDate = new Date(d.createdAt);
                  const now = new Date();
                  return (
                    driverDate.getMonth() === now.getMonth() &&
                    driverDate.getFullYear() === now.getFullYear()
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
                placeholder="Search by name, email, or license plate..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>

            <Select
              value={verificationFilter}
              onValueChange={setVerificationFilter}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by verification" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="unverified">Unverified</SelectItem>
              </SelectContent>
            </Select>

            <Select value={ratingFilter} onValueChange={setRatingFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ratings</SelectItem>
                <SelectItem value="high">4.0+ Stars</SelectItem>
                <SelectItem value="medium">3.0-3.9 Stars</SelectItem>
                <SelectItem value="low">Below 3.0</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt">Join Date</SelectItem>
                <SelectItem value="name">Name</SelectItem>
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

      {/* Drivers Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredDrivers.map((driver) => (
          <Card key={driver.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage
                      src={`https://api.dicebear.com/7.x/initials/svg?seed=${driver.name}`}
                    />
                    <AvatarFallback>{getInitials(driver.name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{driver.name}</CardTitle>
                    <CardDescription className="flex items-center">
                      <Mail className="h-3 w-3 mr-1" />
                      {driver.email}
                    </CardDescription>
                  </div>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedDriver(driver)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="flex items-center space-x-2">
                        <Avatar>
                          <AvatarImage
                            src={`https://api.dicebear.com/7.x/initials/svg?seed=${driver.name}`}
                          />
                          <AvatarFallback>
                            {getInitials(driver.name)}
                          </AvatarFallback>
                        </Avatar>
                        <span>{driver.name}</span>
                        <Badge
                          variant={
                            driver.isVerified ? "default" : "destructive"
                          }
                        >
                          {driver.isVerified ? "Verified" : "Unverified"}
                        </Badge>
                      </DialogTitle>
                      <DialogDescription>
                        Complete driver profile and performance metrics
                      </DialogDescription>
                    </DialogHeader>

                    {selectedDriver && (
                      <div className="space-y-6">
                        {/* Driver Info */}
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <h3 className="font-semibold">
                              Contact Information
                            </h3>
                            <div className="space-y-1 text-sm">
                              <div className="flex items-center">
                                <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                                {selectedDriver.email}
                              </div>
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                                Joined{" "}
                                {new Date(
                                  selectedDriver.createdAt
                                ).toLocaleDateString()}
                              </div>
                              {selectedDriver.upiId && (
                                <div className="flex items-center">
                                  <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
                                  UPI: {selectedDriver.upiId}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <h3 className="font-semibold">Documents Status</h3>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-sm">Driving License</span>
                                <Badge
                                  variant={
                                    selectedDriver.drivingLicenseUrl
                                      ? "default"
                                      : "destructive"
                                  }
                                >
                                  {selectedDriver.drivingLicenseUrl
                                    ? "Uploaded"
                                    : "Missing"}
                                </Badge>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm">
                                  Vehicle Registration
                                </span>
                                <Badge
                                  variant={
                                    selectedDriver.vehicleRegistrationUrl
                                      ? "default"
                                      : "destructive"
                                  }
                                >
                                  {selectedDriver.vehicleRegistrationUrl
                                    ? "Uploaded"
                                    : "Missing"}
                                </Badge>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm">Insurance</span>
                                <Badge
                                  variant={
                                    selectedDriver.insuranceUrl
                                      ? "default"
                                      : "destructive"
                                  }
                                >
                                  {selectedDriver.insuranceUrl
                                    ? "Uploaded"
                                    : "Missing"}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Performance Stats */}
                        <div className="space-y-2">
                          <h3 className="font-semibold">
                            Performance Statistics
                          </h3>
                          <div className="grid gap-4 md:grid-cols-4">
                            <Card>
                              <CardContent className="pt-4">
                                <div className="text-2xl font-bold">
                                  {selectedDriver.ridesCompleted}
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
                                  <span
                                    className={getRatingColor(
                                      selectedDriver.driverRating
                                    )}
                                  >
                                    {selectedDriver.driverRating?.toFixed(1) ||
                                      "N/A"}
                                  </span>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  Average Rating
                                </p>
                              </CardContent>
                            </Card>
                            <Card>
                              <CardContent className="pt-4">
                                <div className="text-2xl font-bold">
                                  {selectedDriver.offeredRides?.length || 0}
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  Rides Offered
                                </p>
                              </CardContent>
                            </Card>
                            <Card>
                              <CardContent className="pt-4">
                                <div className="text-2xl font-bold">
                                  {selectedDriver.reviews?.length || 0}
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  Reviews Received
                                </p>
                              </CardContent>
                            </Card>
                          </div>
                        </div>

                        {/* Vehicle Information */}
                        {selectedDriver.vehicle && (
                          <div className="space-y-2">
                            <h3 className="font-semibold">
                              Vehicle Information
                            </h3>
                            <Card>
                              <CardContent className="pt-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                  <div>
                                    <p className="font-medium">
                                      {selectedDriver.vehicle.make}{" "}
                                      {selectedDriver.vehicle.model}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                      {selectedDriver.vehicle.year} •{" "}
                                      {selectedDriver.vehicle.color}
                                    </p>
                                    <p className="text-sm font-medium mt-1">
                                      License:{" "}
                                      {selectedDriver.vehicle.licensePlate ||
                                        "N/A"}
                                    </p>
                                    <div className="flex items-center mt-2">
                                      <span className="text-sm text-muted-foreground mr-2">
                                        Type:
                                      </span>
                                      <span
                                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                                          selectedDriver.vehicle.isCommercial
                                            ? "bg-orange-100 text-orange-800"
                                            : "bg-green-100 text-green-800"
                                        }`}
                                      >
                                        {selectedDriver.vehicle.isCommercial
                                          ? "Commercial"
                                          : "Non-Commercial"}
                                      </span>
                                    </div>
                                  </div>
                                  {selectedDriver.vehicle.vehicleImages.length >
                                    0 && (
                                    <div>
                                      <p className="text-sm font-medium mb-2">
                                        Vehicle Images
                                      </p>
                                      <div className="flex space-x-2">
                                        {selectedDriver.vehicle.vehicleImages
                                          .slice(0, 3)
                                          .map((image, index) => (
                                            <div
                                              key={index}
                                              className="w-16 h-16 bg-gray-200 rounded border"
                                            >
                                              <img
                                                src={image}
                                                alt={`Vehicle ${index + 1}`}
                                                className="w-full h-full object-cover rounded"
                                              />
                                            </div>
                                          ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                        )}

                        {/* Recent Rides */}
                        {selectedDriver.offeredRides &&
                          selectedDriver.offeredRides.length > 0 && (
                            <div className="space-y-2">
                              <h3 className="font-semibold">Recent Rides</h3>
                              <div className="space-y-2 max-h-40 overflow-y-auto">
                                {selectedDriver.offeredRides.map((ride) => (
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
                                        ).toLocaleDateString()}{" "}
                                        • {ride.availableSeats} seats
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
                                      <p className="text-xs text-muted-foreground">
                                        {ride.bookings.length} bookings
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                        {/* Reviews */}
                        {selectedDriver.reviews &&
                          selectedDriver.reviews.length > 0 && (
                            <div className="space-y-2">
                              <h3 className="font-semibold">Recent Reviews</h3>
                              <div className="space-y-2 max-h-40 overflow-y-auto">
                                {selectedDriver.reviews.map((review) => (
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
                <Badge variant={driver.isVerified ? "default" : "destructive"}>
                  {driver.isVerified ? "Verified" : "Unverified"}
                </Badge>
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-400 mr-1" />
                  <span className={getRatingColor(driver.driverRating)}>
                    {driver.driverRating?.toFixed(1) || "N/A"}
                  </span>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Rides:</span>
                  <span>{driver.ridesCompleted}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Documents:</span>
                  <span>{getDocumentStatus(driver)}</span>
                </div>

                {driver.vehicle && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Vehicle:</span>
                    <span className="text-xs">
                      {driver.vehicle.make} {driver.vehicle.model}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Joined:</span>
                  <span>{new Date(driver.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex space-x-2">
                <Link href={`/admin/drivers/${driver.id}`} className="flex-1">
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

      {filteredDrivers.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center">
            <Car className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No drivers found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search criteria or filters.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminDriversPage;
