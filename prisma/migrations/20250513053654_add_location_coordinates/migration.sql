/*
  Warnings:

  - Added the required column `fromLatitude` to the `Ride` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fromLongitude` to the `Ride` table without a default value. This is not possible if the table is not empty.
  - Added the required column `toLatitude` to the `Ride` table without a default value. This is not possible if the table is not empty.
  - Added the required column `toLongitude` to the `Ride` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Ride" ADD COLUMN     "fromLatitude" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "fromLongitude" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "toLatitude" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "toLongitude" DOUBLE PRECISION NOT NULL;
