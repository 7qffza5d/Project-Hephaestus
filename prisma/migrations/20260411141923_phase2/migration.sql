/*
  Warnings:

  - You are about to drop the column `classWide` on the `HomeworkItem` table. All the data in the column will be lost.
  - You are about to drop the column `done` on the `HomeworkItem` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "HomeworkItem" DROP COLUMN "classWide",
DROP COLUMN "done",
ADD COLUMN     "resourceUrl" TEXT;

-- CreateTable
CREATE TABLE "HomeworkCompletion" (
    "userId" TEXT NOT NULL,
    "homeworkItemId" TEXT NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HomeworkCompletion_pkey" PRIMARY KEY ("userId","homeworkItemId")
);

-- AddForeignKey
ALTER TABLE "HomeworkCompletion" ADD CONSTRAINT "HomeworkCompletion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HomeworkCompletion" ADD CONSTRAINT "HomeworkCompletion_homeworkItemId_fkey" FOREIGN KEY ("homeworkItemId") REFERENCES "HomeworkItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
