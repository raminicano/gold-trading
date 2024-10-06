-- CreateTable
CREATE TABLE `user` (
    `userId` INTEGER NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `user_username_key`(`username`),
    PRIMARY KEY (`userId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `item` (
    `itemId` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `item_name_key`(`name`),
    PRIMARY KEY (`itemId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `buy_order` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `orderId` VARCHAR(191) NOT NULL,
    `userId` INTEGER NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `itemId` INTEGER NOT NULL,
    `quantity` DECIMAL(10, 2) NOT NULL,
    `price` INTEGER NOT NULL,
    `amount` DECIMAL(10, 2) NOT NULL,
    `orderDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `deliveryAddress` VARCHAR(191) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    UNIQUE INDEX `buy_order_orderId_key`(`orderId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sell_order` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `orderId` VARCHAR(191) NOT NULL,
    `userId` INTEGER NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `itemId` INTEGER NOT NULL,
    `quantity` DECIMAL(10, 2) NOT NULL,
    `price` INTEGER NOT NULL,
    `amount` DECIMAL(10, 2) NOT NULL,
    `orderDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `deliveryAddress` VARCHAR(191) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    UNIQUE INDEX `sell_order_orderId_key`(`orderId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `price` (
    `priceId` INTEGER NOT NULL AUTO_INCREMENT,
    `itemId` INTEGER NOT NULL,
    `price` INTEGER NOT NULL,
    `changedBy` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`priceId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `buy_order` ADD CONSTRAINT `buy_order_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`userId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `buy_order` ADD CONSTRAINT `buy_order_itemId_fkey` FOREIGN KEY (`itemId`) REFERENCES `item`(`itemId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sell_order` ADD CONSTRAINT `sell_order_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`userId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sell_order` ADD CONSTRAINT `sell_order_itemId_fkey` FOREIGN KEY (`itemId`) REFERENCES `item`(`itemId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `price` ADD CONSTRAINT `price_itemId_fkey` FOREIGN KEY (`itemId`) REFERENCES `item`(`itemId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `price` ADD CONSTRAINT `price_changedBy_fkey` FOREIGN KEY (`changedBy`) REFERENCES `user`(`userId`) ON DELETE RESTRICT ON UPDATE CASCADE;
