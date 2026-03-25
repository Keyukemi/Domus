CREATE TYPE "ExpenseStatus" AS ENUM ('PAID', 'PLANNED');

ALTER TABLE "expenses"
ADD COLUMN "status" "ExpenseStatus" NOT NULL DEFAULT 'PAID';
