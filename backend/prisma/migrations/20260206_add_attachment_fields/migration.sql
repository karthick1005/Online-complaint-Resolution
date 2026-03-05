-- CreateTable for schema updates to Attachment
-- This migration updates the Attachment table to include fileSize and uploadedBy fields
-- and creates the relationship to the User model

-- Add new columns to attachments table
ALTER TABLE "attachments" 
ADD COLUMN IF NOT EXISTS "file_size" INTEGER,
ADD COLUMN IF NOT EXISTS "uploaded_by" TEXT;

-- Create foreign key constraint for uploaded_by
ALTER TABLE "attachments" 
ADD CONSTRAINT "attachments_uploaded_by_fkey" 
FOREIGN KEY ("uploaded_by") 
REFERENCES "users"("id") 
ON DELETE SET NULL 
ON UPDATE CASCADE;

-- Add index for faster queries by uploaded_by
CREATE INDEX IF NOT EXISTS "attachments_uploaded_by_idx" 
ON "attachments"("uploaded_by");
