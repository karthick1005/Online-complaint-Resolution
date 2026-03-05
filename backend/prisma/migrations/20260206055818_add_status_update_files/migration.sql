-- DropIndex
DROP INDEX "attachments_uploaded_by_idx";

-- CreateTable
CREATE TABLE "status_update_files" (
    "id" TEXT NOT NULL,
    "history_id" TEXT NOT NULL,
    "file_path" TEXT NOT NULL,
    "file_type" TEXT NOT NULL,
    "file_size" INTEGER,
    "file_name" TEXT NOT NULL,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "status_update_files_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "status_update_files" ADD CONSTRAINT "status_update_files_history_id_fkey" FOREIGN KEY ("history_id") REFERENCES "complaint_history"("id") ON DELETE CASCADE ON UPDATE CASCADE;
