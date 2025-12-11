-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "TaskPriority" AS ENUM ('low', 'medium', 'high');

-- CreateTable
CREATE TABLE "TD_User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "TD_User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TD_Task" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "priority" "TaskPriority" NOT NULL,
    "category" TEXT NOT NULL,
    "tags" TEXT[],
    "dueDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "TD_Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TD_WebDavConfig" (
    "id" TEXT NOT NULL,
    "serverUrl" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "autoSync" BOOLEAN NOT NULL DEFAULT false,
    "syncInterval" INTEGER NOT NULL DEFAULT 5,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TD_WebDavConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TD_Settings" (
    "id" TEXT NOT NULL,
    "allowRegistration" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TD_Settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TD_User_email_key" ON "TD_User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "TD_WebDavConfig_userId_key" ON "TD_WebDavConfig"("userId");

-- AddForeignKey
ALTER TABLE "TD_Task" ADD CONSTRAINT "TD_Task_userId_fkey" FOREIGN KEY ("userId") REFERENCES "TD_User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TD_WebDavConfig" ADD CONSTRAINT "TD_WebDavConfig_userId_fkey" FOREIGN KEY ("userId") REFERENCES "TD_User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
