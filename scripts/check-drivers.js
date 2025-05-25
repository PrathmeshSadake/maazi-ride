const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function checkDrivers() {
  try {
    console.log("Checking drivers in database...\n");

    const drivers = await prisma.user.findMany({
      where: {
        role: "driver",
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isVerified: true,
        drivingLicenseUrl: true,
        vehicleRegistrationUrl: true,
        insuranceUrl: true,
        vehicle: {
          select: {
            id: true,
            make: true,
            model: true,
            year: true,
            vehicleImages: true,
          },
        },
      },
    });

    console.log(`Found ${drivers.length} drivers:`);

    drivers.forEach((driver, index) => {
      console.log(`\n--- Driver ${index + 1} ---`);
      console.log(`ID: ${driver.id}`);
      console.log(`Name: ${driver.name}`);
      console.log(`Email: ${driver.email}`);
      console.log(`Verified: ${driver.isVerified}`);
      console.log(`Has Driving License: ${!!driver.drivingLicenseUrl}`);
      console.log(
        `Has Vehicle Registration: ${!!driver.vehicleRegistrationUrl}`
      );
      console.log(`Has Insurance: ${!!driver.insuranceUrl}`);
      console.log(`Has Vehicle: ${!!driver.vehicle}`);
      if (driver.vehicle) {
        console.log(
          `Vehicle: ${driver.vehicle.make} ${driver.vehicle.model} (${driver.vehicle.year})`
        );
        console.log(
          `Vehicle Images: ${driver.vehicle.vehicleImages?.length || 0}`
        );
      }
    });

    if (drivers.length === 0) {
      console.log("\nNo drivers found. Creating a test driver...");

      const testDriver = await prisma.user.create({
        data: {
          name: "Test Driver",
          email: "driver@test.com",
          password:
            "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi", // password
          role: "driver",
          isVerified: false,
        },
      });

      console.log(`Created test driver: ${testDriver.email}`);
    }
  } catch (error) {
    console.error("Error checking drivers:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDrivers();
