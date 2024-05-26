-- CreateTable
CREATE TABLE `Product` (
    `id` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `subname` VARCHAR(191) NULL,
    `productCategory` VARCHAR(191) NOT NULL,
    `kcal` DOUBLE NULL,
    `protein` DOUBLE NULL,
    `fat` DOUBLE NULL,
    `carbohydrate` DOUBLE NULL,
    `fiber` DOUBLE NULL,
    `sugar` DOUBLE NULL,
    `ash` DOUBLE NULL,
    `starch` DOUBLE NULL,
    `calcium` DOUBLE NULL,
    `iron` DOUBLE NULL,
    `magnesium` DOUBLE NULL,
    `phosphorus` DOUBLE NULL,
    `potassium` DOUBLE NULL,
    `sodium` DOUBLE NULL,
    `zinc` DOUBLE NULL,
    `copper` DOUBLE NULL,
    `manganese` DOUBLE NULL,
    `selenium` DOUBLE NULL,
    `vitamin_a` DOUBLE NULL,
    `vitamin_b3` DOUBLE NULL,
    `vitamin_b4` DOUBLE NULL,
    `vitamin_b5` DOUBLE NULL,
    `vitamin_b6` DOUBLE NULL,
    `vitamin_b9` DOUBLE NULL,
    `vitamin_c` DOUBLE NULL,
    `vitamin_e` DOUBLE NULL,
    `vitamin_k` DOUBLE NULL,
    `alpha_carotene` DOUBLE NULL,
    `beta_carotene` DOUBLE NULL,
    `chole` DOUBLE NULL,
    `trans` DOUBLE NULL,
    `water` DOUBLE NULL,

    UNIQUE INDEX `Product_id_key`(`id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProductClearWeight` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `productId` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `value` DOUBLE NOT NULL,
    `desc` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProductMeasure` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `productId` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `value` DOUBLE NOT NULL,
    `desc` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ProductClearWeight` ADD CONSTRAINT `ProductClearWeight_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductMeasure` ADD CONSTRAINT `ProductMeasure_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
