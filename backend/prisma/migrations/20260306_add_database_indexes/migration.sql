-- ============ USER INDEXES ============
CREATE INDEX IF NOT EXISTS "users_email_idx" ON "users"("email");
CREATE INDEX IF NOT EXISTS "users_department_id_idx" ON "users"("department_id");
CREATE INDEX IF NOT EXISTS "users_role_idx" ON "users"("role");
CREATE INDEX IF NOT EXISTS "users_is_active_idx" ON "users"("is_active");
CREATE INDEX IF NOT EXISTS "users_created_at_idx" ON "users"("created_at");

-- ============ DEPARTMENT INDEXES ============
CREATE INDEX IF NOT EXISTS "departments_name_idx" ON "departments"("name");
CREATE INDEX IF NOT EXISTS "departments_created_at_idx" ON "departments"("created_at");

-- ============ CATEGORY INDEXES ============
CREATE INDEX IF NOT EXISTS "categories_department_id_idx" ON "categories"("department_id");
CREATE INDEX IF NOT EXISTS "categories_name_idx" ON "categories"("name");

-- ============ COMPLAINT INDEXES (CRITICAL) ============
CREATE INDEX IF NOT EXISTS "complaints_complaint_code_idx" ON "complaints"("complaint_code");
CREATE INDEX IF NOT EXISTS "complaints_user_id_idx" ON "complaints"("user_id");
CREATE INDEX IF NOT EXISTS "complaints_department_id_idx" ON "complaints"("department_id");
CREATE INDEX IF NOT EXISTS "complaints_category_id_idx" ON "complaints"("category_id");
CREATE INDEX IF NOT EXISTS "complaints_status_idx" ON "complaints"("status");
CREATE INDEX IF NOT EXISTS "complaints_priority_idx" ON "complaints"("priority");
CREATE INDEX IF NOT EXISTS "complaints_assigned_to_idx" ON "complaints"("assigned_to");
CREATE INDEX IF NOT EXISTS "complaints_created_at_idx" ON "complaints"("created_at");
CREATE INDEX IF NOT EXISTS "complaints_sla_deadline_idx" ON "complaints"("sla_deadline");

-- Composite indexes for common filter combinations
CREATE INDEX IF NOT EXISTS "complaints_status_department_idx" ON "complaints"("status", "department_id");
CREATE INDEX IF NOT EXISTS "complaints_status_priority_idx" ON "complaints"("status", "priority");
CREATE INDEX IF NOT EXISTS "complaints_department_created_idx" ON "complaints"("department_id", "created_at" DESC);
CREATE INDEX IF NOT EXISTS "complaints_user_created_idx" ON "complaints"("user_id", "created_at" DESC);

-- ============ COMPLAINT HISTORY INDEXES ============
CREATE INDEX IF NOT EXISTS "complaint_history_complaint_id_idx" ON "complaint_history"("complaint_id");
CREATE INDEX IF NOT EXISTS "complaint_history_updated_by_idx" ON "complaint_history"("updated_by");
CREATE INDEX IF NOT EXISTS "complaint_history_created_at_idx" ON "complaint_history"("created_at");
CREATE INDEX IF NOT EXISTS "complaint_history_is_internal_note_idx" ON "complaint_history"("is_internal_note");

-- ============ ATTACHMENT INDEXES ============
CREATE INDEX IF NOT EXISTS "attachments_complaint_id_idx" ON "attachments"("complaint_id");
CREATE INDEX IF NOT EXISTS "attachments_uploaded_by_idx" ON "attachments"("uploaded_by");

-- ============ STATUS UPDATE FILE INDEXES ============
CREATE INDEX IF NOT EXISTS "status_update_files_history_id_idx" ON "status_update_files"("history_id");

-- ============ FEEDBACK INDEXES ============
CREATE INDEX IF NOT EXISTS "feedback_user_id_idx" ON "feedback"("user_id");
CREATE INDEX IF NOT EXISTS "feedback_rating_idx" ON "feedback"("rating");
