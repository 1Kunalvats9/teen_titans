-- AlterTable
ALTER TABLE "public"."Community" ADD COLUMN     "isPrivate" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "public"."CommunityInvite" (
    "id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "inviterId" TEXT NOT NULL,
    "inviteeId" TEXT NOT NULL,
    "communityId" TEXT NOT NULL,

    CONSTRAINT "CommunityInvite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CommunityInvite_inviteeId_status_idx" ON "public"."CommunityInvite"("inviteeId", "status");

-- CreateIndex
CREATE INDEX "CommunityInvite_communityId_status_idx" ON "public"."CommunityInvite"("communityId", "status");

-- CreateIndex
CREATE INDEX "CommunityInvite_expiresAt_idx" ON "public"."CommunityInvite"("expiresAt");

-- AddForeignKey
ALTER TABLE "public"."CommunityInvite" ADD CONSTRAINT "CommunityInvite_inviterId_fkey" FOREIGN KEY ("inviterId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CommunityInvite" ADD CONSTRAINT "CommunityInvite_inviteeId_fkey" FOREIGN KEY ("inviteeId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CommunityInvite" ADD CONSTRAINT "CommunityInvite_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "public"."Community"("id") ON DELETE CASCADE ON UPDATE CASCADE;
