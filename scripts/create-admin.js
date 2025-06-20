// Import Prisma client
const { PrismaClient, UserRole } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function createSuperAdmin() {
  try {
    const email = "admin@maaziride.com";

    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email },
    });

    if (existingAdmin) {
      console.log("Admin user already exists.");
      return;
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash("admin@maaziride.com", 10);

    const admin = await prisma.user.create({
      data: {
        name: "Super Admin",
        email,
        password: hashedPassword,
        role: UserRole.admin,
        isVerified: true,
      },
    });

    console.log("Super admin created successfully:", admin.email);
  } catch (error) {
    console.error("Error creating admin:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createSuperAdmin();
