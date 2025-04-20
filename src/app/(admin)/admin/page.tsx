// import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { DataTable } from "@/components/data-table";
import { SectionCards } from "@/components/section-cards";
import { BookingStatusPieChart } from "@/components/booking-status-pie-chart";
import { DriverVerificationBarChart } from "@/components/driver-verification-bar-chart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import data from "./data.json";

const AdminDashboard = () => {
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
                  <BookingStatusPieChart />
                  <DriverVerificationBarChart />
                </div>
              </TabsContent>

              <TabsContent value="drivers" className="mt-0">
                <DriverVerificationBarChart />
              </TabsContent>
            </Tabs>
          </div>

          <DataTable data={data} />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
