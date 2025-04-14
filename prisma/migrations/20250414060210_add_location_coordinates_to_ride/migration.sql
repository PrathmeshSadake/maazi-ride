/*
  Warnings:

  - Added the required column `fromLat` to the `Ride` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fromLng` to the `Ride` table without a default value. This is not possible if the table is not empty.
  - Added the required column `toLat` to the `Ride` table without a default value. This is not possible if the table is not empty.
  - Added the required column `toLng` to the `Ride` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Ride" ADD COLUMN     "fromLat" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "fromLng" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "toLat" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "toLng" DOUBLE PRECISION NOT NULL;
