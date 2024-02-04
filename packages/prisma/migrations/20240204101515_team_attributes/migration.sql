-- CreateEnum
CREATE TYPE "AttributeType" AS ENUM ('MULTI_SELECT', 'RELATIONSHIP_PEOPLE', 'RELATIONSHIP_TEAM', 'SINGLE_SELECT', 'TEXT');

-- CreateTable
CREATE TABLE "Attribute" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "type" "AttributeType" NOT NULL,
    "allowEdit" BOOLEAN NOT NULL DEFAULT false,
    "hidden" BOOLEAN NOT NULL DEFAULT false,
    "options" JSONB,
    "teamId" INTEGER NOT NULL,

    CONSTRAINT "Attribute_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserAttribute" (
    "userId" INTEGER NOT NULL,
    "attributeId" INTEGER NOT NULL,
    "attributeValue" TEXT NOT NULL,

    CONSTRAINT "UserAttribute_pkey" PRIMARY KEY ("userId","attributeId")
);

-- CreateIndex
CREATE INDEX "Attribute_teamId_idx" ON "Attribute"("teamId");

-- AddForeignKey
ALTER TABLE "Attribute" ADD CONSTRAINT "Attribute_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAttribute" ADD CONSTRAINT "UserAttribute_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAttribute" ADD CONSTRAINT "UserAttribute_attributeId_fkey" FOREIGN KEY ("attributeId") REFERENCES "Attribute"("id") ON DELETE CASCADE ON UPDATE CASCADE;
