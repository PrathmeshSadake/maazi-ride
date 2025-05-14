"use client";
import { DataTable } from "@/components/data-table";
import { SectionCards } from "@/components/section-cards";
import { BookingStatusPieChart } from "@/components/booking-status-pie-chart";
import { DriverVerificationBarChart } from "@/components/driver-verification-bar-chart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";
import { fetchDashboardData } from "@/utils/api";

// Define a type for the dashboard data
interface DashboardData {
  bookingStatus: any; // Replace 'any' with the actual type
  driverVerification: any; // Replace 'any' with the actual type
  tableData: any; // Replace 'any' with the actual type
}

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchDashboardData();
        setDashboardData(data);
      } catch (err: any) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error loading data</div>;

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          {/* <SectionCards /> */}

          <div className="px-4 lg:px-6">
            <Tabs defaultValue="bookings" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="bookings">Bookings Activity</TabsTrigger>
                <TabsTrigger value="users">User Growth</TabsTrigger>
                <TabsTrigger value="status">Booking Status</TabsTrigger>
                <TabsTrigger value="drivers">Driver Verification</TabsTrigger>
              </TabsList>

              <TabsContent value="bookings" className="mt-0">
                {/* <ChartAreaInteractive /> */}
              </TabsContent>

              <TabsContent value="users" className="mt-0">
                {/* <ChartAreaInteractive chartType="users" /> */}
              </TabsContent>

              <TabsContent value="status" className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <BookingStatusPieChart data={dashboardData?.bookingStatus} />
                  <DriverVerificationBarChart
                    data={dashboardData?.driverVerification}
                  />
                </div>
              </TabsContent>

              <TabsContent value="drivers" className="mt-0">
                <DriverVerificationBarChart
                  data={dashboardData?.driverVerification}
                />
              </TabsContent>
            </Tabs>
          </div>

          {/* <DataTable data={dashboardData?.tableData} /> */}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
