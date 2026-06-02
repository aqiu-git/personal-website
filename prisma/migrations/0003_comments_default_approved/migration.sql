UPDATE "Comment"
SET "status" = 'APPROVED'
WHERE "status" = 'PENDING' AND "deletedAt" IS NULL;

ALTER TABLE "Comment" ALTER COLUMN "status" SET DEFAULT 'APPROVED';
