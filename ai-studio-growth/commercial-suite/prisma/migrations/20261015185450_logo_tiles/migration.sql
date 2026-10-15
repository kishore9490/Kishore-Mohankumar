-- AlterTable
ALTER TABLE "CompanyProfile" ADD COLUMN     "logoPrimaryTile" TEXT NOT NULL DEFAULT 'light',
ADD COLUMN     "logoSecondaryTile" TEXT NOT NULL DEFAULT 'dark';
