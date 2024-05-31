-- CreateTable
CREATE TABLE `products` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `productCategory` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `subname` VARCHAR(191) NULL,
    `kcal` DOUBLE NOT NULL,
    `mainFats` DOUBLE NOT NULL,
    `mainProteins` DOUBLE NOT NULL,
    `mainCarb` DOUBLE NOT NULL,
    `mainWater` DOUBLE NOT NULL,
    `mainAsh` DOUBLE NOT NULL,
    `subSugar` DOUBLE NULL,
    `subFiber` DOUBLE NULL,
    `subStarch` DOUBLE NULL,
    `subTransfats` DOUBLE NULL,
    `vitamin_a` DOUBLE NULL,
    `beta_carotene` DOUBLE NULL,
    `alpha_carotene` DOUBLE NULL,
    `vitamin_e` DOUBLE NULL,
    `vitamin_k` DOUBLE NULL,
    `vitamin_c` DOUBLE NULL,
    `vitamin_b1` DOUBLE NULL,
    `vitamin_b3` DOUBLE NULL,
    `vitamin_b4` DOUBLE NULL,
    `vitamin_b5` DOUBLE NULL,
    `vitamin_b6` DOUBLE NULL,
    `vitamin_b9` DOUBLE NULL,
    `vitamin_b12` DOUBLE NULL,
    `vitamin_b2` DOUBLE NULL,
    `vitamin_d` DOUBLE NULL,
    `vitamin_d2` DOUBLE NULL,
    `vitamin_d3` DOUBLE NULL,
    `calcium` DOUBLE NULL,
    `fluoride` DOUBLE NULL,
    `iron` DOUBLE NULL,
    `magnesium` DOUBLE NULL,
    `phosphorus` DOUBLE NULL,
    `potassium` DOUBLE NULL,
    `sodium` DOUBLE NULL,
    `zinc` DOUBLE NULL,
    `copper` DOUBLE NULL,
    `manganese` DOUBLE NULL,
    `selenium` DOUBLE NULL,
    `wasteWeightValue` DOUBLE NOT NULL DEFAULT 1.0,
    `wasteWeightDesc` VARCHAR(191) NOT NULL DEFAULT 'Продукт в чистом виде',

    UNIQUE INDEX `products_name_subname_key`(`name`, `subname`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `measures` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `productId` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `value` DOUBLE NOT NULL,
    `desc` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `measures` ADD CONSTRAINT `measures_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
