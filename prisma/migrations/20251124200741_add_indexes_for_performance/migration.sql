-- CreateIndex
CREATE INDEX "Message_projectId_createdAt_idx" ON "public"."Message"("projectId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "Project_userId_updatedAt_idx" ON "public"."Project"("userId", "updatedAt" DESC);
