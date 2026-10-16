-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `passwordHash` VARCHAR(191) NULL,
    `role` ENUM('ADMIN', 'STAFF') NOT NULL DEFAULT 'STAFF',
    `active` BOOLEAN NOT NULL DEFAULT true,
    `mfaSecretEnc` TEXT NULL,
    `mfaEnabled` BOOLEAN NOT NULL DEFAULT false,
    `mfaLastStep` INTEGER NULL,
    `invitedAt` DATETIME(3) NULL,
    `activatedAt` DATETIME(3) NULL,
    `lastLoginAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Session` (
    `id` VARCHAR(191) NOT NULL,
    `tokenHash` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `userAgent` VARCHAR(500) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Session_tokenHash_key`(`tokenHash`),
    INDEX `Session_userId_idx`(`userId`),
    INDEX `Session_expiresAt_idx`(`expiresAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Invitation` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `tokenHash` VARCHAR(191) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `usedAt` DATETIME(3) NULL,
    `revokedAt` DATETIME(3) NULL,
    `createdById` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Invitation_tokenHash_key`(`tokenHash`),
    INDEX `Invitation_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AuthChallenge` (
    `id` VARCHAR(191) NOT NULL,
    `tokenHash` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `purpose` ENUM('LOGIN', 'ENROLL') NOT NULL,
    `pendingSecretEnc` TEXT NULL,
    `attempts` INTEGER NOT NULL DEFAULT 0,
    `expiresAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `AuthChallenge_tokenHash_key`(`tokenHash`),
    INDEX `AuthChallenge_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RecoveryCode` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `codeHash` VARCHAR(191) NOT NULL,
    `usedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `RecoveryCode_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CompanyProfile` (
    `id` VARCHAR(191) NOT NULL,
    `brandName` VARCHAR(255) NOT NULL,
    `coBrandName` VARCHAR(255) NULL,
    `tagline` TEXT NULL,
    `logoPrimary` LONGBLOB NULL,
    `logoPrimaryMime` VARCHAR(191) NULL,
    `logoSecondary` LONGBLOB NULL,
    `logoSecondaryMime` VARCHAR(191) NULL,
    `logoPrimaryTile` VARCHAR(191) NOT NULL DEFAULT 'light',
    `logoSecondaryTile` VARCHAR(191) NOT NULL DEFAULT 'dark',
    `primaryColor` VARCHAR(191) NOT NULL DEFAULT '#0F1B3D',
    `accentColor` VARCHAR(191) NOT NULL DEFAULT '#6D28D9',
    `legalName` VARCHAR(255) NULL,
    `address` TEXT NULL,
    `phone` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `website` VARCHAR(191) NULL,
    `gstin` VARCHAR(191) NULL,
    `pan` VARCHAR(191) NULL,
    `state` VARCHAR(191) NULL,
    `stateCode` VARCHAR(191) NULL,
    `bankName` VARCHAR(191) NULL,
    `bankAccountName` VARCHAR(191) NULL,
    `bankAccountNumber` VARCHAR(191) NULL,
    `bankIfsc` VARCHAR(191) NULL,
    `bankBranch` VARCHAR(191) NULL,
    `upiId` VARCHAR(191) NULL,
    `paymentInstructions` TEXT NULL,
    `authorisedSignatory` VARCHAR(191) NULL,
    `documentFooter` TEXT NULL,
    `termsQuotation` TEXT NULL,
    `termsInvoice` TEXT NULL,
    `termsProposal` TEXT NULL,
    `currency` VARCHAR(191) NOT NULL DEFAULT 'INR',
    `defaultTaxRate` DECIMAL(5, 2) NOT NULL DEFAULT 18,
    `roundingMode` ENUM('NONE', 'NEAREST_RUPEE') NOT NULL DEFAULT 'NEAREST_RUPEE',
    `isDefault` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DocumentSequence` (
    `id` VARCHAR(191) NOT NULL,
    `companyId` VARCHAR(191) NOT NULL,
    `type` ENUM('PROPOSAL', 'QUOTATION', 'INVOICE', 'PROFORMA') NOT NULL,
    `prefix` VARCHAR(191) NOT NULL,
    `nextNumber` INTEGER NOT NULL DEFAULT 1,
    `padding` INTEGER NOT NULL DEFAULT 4,
    `includeFinancialYear` BOOLEAN NOT NULL DEFAULT true,
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `DocumentSequence_companyId_type_key`(`companyId`, `type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Customer` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `contactPerson` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,
    `billingAddress` TEXT NULL,
    `shippingAddress` TEXT NULL,
    `gstin` VARCHAR(191) NULL,
    `state` VARCHAR(191) NULL,
    `stateCode` VARCHAR(191) NULL,
    `notes` TEXT NULL,
    `preferredChannel` ENUM('EMAIL', 'WHATSAPP', 'PHONE') NOT NULL DEFAULT 'EMAIL',
    `whatsappConsent` BOOLEAN NOT NULL DEFAULT false,
    `whatsappLastInboundAt` DATETIME(3) NULL,
    `archived` BOOLEAN NOT NULL DEFAULT false,
    `isSample` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Customer_name_idx`(`name`),
    INDEX `Customer_archived_idx`(`archived`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProductService` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `shortDescription` VARCHAR(500) NULL,
    `detailedDescription` TEXT NULL,
    `category` VARCHAR(191) NOT NULL,
    `sku` VARCHAR(191) NULL,
    `hsnSac` VARCHAR(191) NULL,
    `unit` VARCHAR(191) NOT NULL DEFAULT 'Nos',
    `defaultQuantity` DECIMAL(14, 3) NOT NULL DEFAULT 1,
    `defaultPrice` DECIMAL(14, 2) NOT NULL DEFAULT 0,
    `taxRate` DECIMAL(5, 2) NOT NULL DEFAULT 18,
    `billingFrequency` ENUM('ONE_TIME', 'MONTHLY', 'QUARTERLY', 'HALF_YEARLY', 'ANNUAL') NOT NULL DEFAULT 'ONE_TIME',
    `inclusions` JSON NOT NULL,
    `exclusions` JSON NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `isSample` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `ProductService_sku_key`(`sku`),
    INDEX `ProductService_category_idx`(`category`),
    INDEX `ProductService_active_idx`(`active`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Document` (
    `id` VARCHAR(191) NOT NULL,
    `type` ENUM('PROPOSAL', 'QUOTATION', 'INVOICE', 'PROFORMA') NOT NULL,
    `number` VARCHAR(191) NULL,
    `companyId` VARCHAR(191) NOT NULL,
    `customerId` VARCHAR(191) NOT NULL,
    `template` ENUM('PREMIUM_COMMERCIAL', 'PROFESSIONAL_QUOTATION', 'PROFESSIONAL_INVOICE', 'DETAILED_PROPOSAL') NOT NULL,
    `status` ENUM('DRAFT', 'SENT', 'ACCEPTED', 'REJECTED', 'EXPIRED', 'ISSUED', 'PARTIALLY_PAID', 'PAID', 'OVERDUE', 'CANCELLED') NOT NULL DEFAULT 'DRAFT',
    `title` VARCHAR(255) NULL,
    `reference` VARCHAR(191) NULL,
    `issueDate` DATE NOT NULL,
    `validUntil` DATE NULL,
    `dueDate` DATE NULL,
    `placeOfSupply` VARCHAR(191) NULL,
    `placeOfSupplyCode` VARCHAR(191) NULL,
    `taxMode` ENUM('INTRA_STATE', 'INTER_STATE', 'NO_TAX') NOT NULL DEFAULT 'INTRA_STATE',
    `customerSnapshot` JSON NOT NULL,
    `notes` TEXT NULL,
    `terms` TEXT NULL,
    `paymentTerms` TEXT NULL,
    `subtotal` DECIMAL(14, 2) NOT NULL DEFAULT 0,
    `discountTotal` DECIMAL(14, 2) NOT NULL DEFAULT 0,
    `taxableTotal` DECIMAL(14, 2) NOT NULL DEFAULT 0,
    `cgstTotal` DECIMAL(14, 2) NOT NULL DEFAULT 0,
    `sgstTotal` DECIMAL(14, 2) NOT NULL DEFAULT 0,
    `igstTotal` DECIMAL(14, 2) NOT NULL DEFAULT 0,
    `taxTotal` DECIMAL(14, 2) NOT NULL DEFAULT 0,
    `roundOff` DECIMAL(14, 2) NOT NULL DEFAULT 0,
    `grandTotal` DECIMAL(14, 2) NOT NULL DEFAULT 0,
    `amountPaid` DECIMAL(14, 2) NOT NULL DEFAULT 0,
    `roundingMode` ENUM('NONE', 'NEAREST_RUPEE') NOT NULL DEFAULT 'NEAREST_RUPEE',
    `convertedFromId` VARCHAR(191) NULL,
    `isSample` BOOLEAN NOT NULL DEFAULT false,
    `issuedAt` DATETIME(3) NULL,
    `sentAt` DATETIME(3) NULL,
    `createdById` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Document_type_status_idx`(`type`, `status`),
    INDEX `Document_customerId_idx`(`customerId`),
    INDEX `Document_issueDate_idx`(`issueDate`),
    UNIQUE INDEX `Document_companyId_type_number_key`(`companyId`, `type`, `number`),
    UNIQUE INDEX `Document_convertedFromId_type_key`(`convertedFromId`, `type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DocumentLineItem` (
    `id` VARCHAR(191) NOT NULL,
    `documentId` VARCHAR(191) NOT NULL,
    `position` INTEGER NOT NULL,
    `productServiceId` VARCHAR(191) NULL,
    `name` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `details` JSON NULL,
    `hsnSac` VARCHAR(191) NULL,
    `quantity` DECIMAL(14, 3) NOT NULL,
    `unit` VARCHAR(191) NOT NULL DEFAULT 'Nos',
    `unitPrice` DECIMAL(14, 2) NOT NULL,
    `discountType` ENUM('PERCENT', 'AMOUNT') NOT NULL DEFAULT 'PERCENT',
    `discountValue` DECIMAL(14, 2) NOT NULL DEFAULT 0,
    `taxRate` DECIMAL(5, 2) NOT NULL,
    `billingFrequency` ENUM('ONE_TIME', 'MONTHLY', 'QUARTERLY', 'HALF_YEARLY', 'ANNUAL') NULL,
    `grossAmount` DECIMAL(14, 2) NOT NULL,
    `discountAmount` DECIMAL(14, 2) NOT NULL,
    `taxableAmount` DECIMAL(14, 2) NOT NULL,
    `taxAmount` DECIMAL(14, 2) NOT NULL,
    `totalAmount` DECIMAL(14, 2) NOT NULL,

    INDEX `DocumentLineItem_documentId_idx`(`documentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProposalSection` (
    `id` VARCHAR(191) NOT NULL,
    `documentId` VARCHAR(191) NOT NULL,
    `position` INTEGER NOT NULL,
    `type` ENUM('COVER', 'EXECUTIVE_SUMMARY', 'CUSTOMER_REQUIREMENTS', 'PROPOSED_SOLUTION', 'SERVICE_OVERVIEW', 'FEATURE_BREAKDOWN', 'SCOPE_OF_WORK', 'DELIVERABLES', 'IMPLEMENTATION_PLAN', 'TIMELINE', 'PRICING_SUMMARY', 'COMMERCIAL_TERMS', 'BUSINESS_VALUE', 'ASSUMPTIONS', 'EXCLUSIONS', 'ACCEPTANCE', 'CLOSING_PAGE') NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `enabled` BOOLEAN NOT NULL DEFAULT true,
    `content` JSON NOT NULL,

    INDEX `ProposalSection_documentId_idx`(`documentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Payment` (
    `id` VARCHAR(191) NOT NULL,
    `documentId` VARCHAR(191) NOT NULL,
    `paymentDate` DATE NOT NULL,
    `amount` DECIMAL(14, 2) NOT NULL,
    `method` ENUM('BANK_TRANSFER', 'UPI', 'CHEQUE', 'CASH', 'CARD', 'OTHER') NOT NULL,
    `reference` VARCHAR(191) NULL,
    `notes` TEXT NULL,
    `recordedById` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Payment_documentId_idx`(`documentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CommunicationLog` (
    `id` VARCHAR(191) NOT NULL,
    `customerId` VARCHAR(191) NULL,
    `documentId` VARCHAR(191) NULL,
    `channel` ENUM('EMAIL', 'WHATSAPP', 'WHATSAPP_MANUAL') NOT NULL,
    `messageType` ENUM('DOCUMENT', 'PAYMENT_REMINDER', 'PROMOTION', 'TEST') NOT NULL,
    `mode` ENUM('LIVE', 'DEV_MOCK', 'MANUAL') NOT NULL,
    `recipient` VARCHAR(191) NOT NULL,
    `subject` VARCHAR(255) NULL,
    `status` ENUM('PREPARED', 'QUEUED', 'SENT_TO_PROVIDER', 'DELIVERED', 'READ', 'SENT_MANUAL', 'FAILED') NOT NULL,
    `providerMessageId` VARCHAR(191) NULL,
    `errorMessage` TEXT NULL,
    `attachmentName` VARCHAR(191) NULL,
    `createdById` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `statusUpdatedAt` DATETIME(3) NULL,
    `campaignId` VARCHAR(191) NULL,

    UNIQUE INDEX `CommunicationLog_providerMessageId_key`(`providerMessageId`),
    INDEX `CommunicationLog_documentId_idx`(`documentId`),
    INDEX `CommunicationLog_customerId_idx`(`customerId`),
    INDEX `CommunicationLog_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `WebhookEvent` (
    `id` VARCHAR(191) NOT NULL,
    `provider` VARCHAR(191) NOT NULL,
    `eventKey` VARCHAR(255) NOT NULL,
    `receivedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `WebhookEvent_eventKey_key`(`eventKey`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `IntegrationConfiguration` (
    `id` VARCHAR(191) NOT NULL,
    `provider` VARCHAR(191) NOT NULL,
    `enabled` BOOLEAN NOT NULL DEFAULT true,
    `settings` JSON NOT NULL,
    `secretsEnc` TEXT NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `IntegrationConfiguration_provider_key`(`provider`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MessageTemplate` (
    `id` VARCHAR(191) NOT NULL,
    `channel` ENUM('EMAIL', 'WHATSAPP', 'WHATSAPP_MANUAL') NOT NULL,
    `key` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `subject` VARCHAR(255) NULL,
    `body` TEXT NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `MessageTemplate_channel_key_key`(`channel`, `key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DocumentShareLink` (
    `id` VARCHAR(191) NOT NULL,
    `tokenHash` VARCHAR(191) NOT NULL,
    `documentId` VARCHAR(191) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `accessCount` INTEGER NOT NULL DEFAULT 0,
    `maxAccess` INTEGER NOT NULL DEFAULT 20,
    `revokedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `DocumentShareLink_tokenHash_key`(`tokenHash`),
    INDEX `DocumentShareLink_documentId_idx`(`documentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AuditEvent` (
    `id` VARCHAR(191) NOT NULL,
    `documentId` VARCHAR(191) NULL,
    `userId` VARCHAR(191) NULL,
    `action` VARCHAR(191) NOT NULL,
    `summary` VARCHAR(500) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `AuditEvent_documentId_idx`(`documentId`),
    INDEX `AuditEvent_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Campaign` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `message` TEXT NOT NULL,
    `createdById` VARCHAR(191) NULL,
    `archived` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CampaignRecipient` (
    `id` VARCHAR(191) NOT NULL,
    `campaignId` VARCHAR(191) NOT NULL,
    `customerId` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `status` ENUM('PENDING', 'OPENED', 'SENT', 'SKIPPED') NOT NULL DEFAULT 'PENDING',
    `openedAt` DATETIME(3) NULL,
    `sentAt` DATETIME(3) NULL,

    INDEX `CampaignRecipient_campaignId_status_idx`(`campaignId`, `status`),
    UNIQUE INDEX `CampaignRecipient_campaignId_customerId_key`(`campaignId`, `customerId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Session` ADD CONSTRAINT `Session_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Invitation` ADD CONSTRAINT `Invitation_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Invitation` ADD CONSTRAINT `Invitation_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AuthChallenge` ADD CONSTRAINT `AuthChallenge_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RecoveryCode` ADD CONSTRAINT `RecoveryCode_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DocumentSequence` ADD CONSTRAINT `DocumentSequence_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `CompanyProfile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Document` ADD CONSTRAINT `Document_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `CompanyProfile`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Document` ADD CONSTRAINT `Document_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `Customer`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Document` ADD CONSTRAINT `Document_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Document` ADD CONSTRAINT `Document_convertedFromId_fkey` FOREIGN KEY (`convertedFromId`) REFERENCES `Document`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DocumentLineItem` ADD CONSTRAINT `DocumentLineItem_documentId_fkey` FOREIGN KEY (`documentId`) REFERENCES `Document`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DocumentLineItem` ADD CONSTRAINT `DocumentLineItem_productServiceId_fkey` FOREIGN KEY (`productServiceId`) REFERENCES `ProductService`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProposalSection` ADD CONSTRAINT `ProposalSection_documentId_fkey` FOREIGN KEY (`documentId`) REFERENCES `Document`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Payment` ADD CONSTRAINT `Payment_documentId_fkey` FOREIGN KEY (`documentId`) REFERENCES `Document`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Payment` ADD CONSTRAINT `Payment_recordedById_fkey` FOREIGN KEY (`recordedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CommunicationLog` ADD CONSTRAINT `CommunicationLog_campaignId_fkey` FOREIGN KEY (`campaignId`) REFERENCES `Campaign`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CommunicationLog` ADD CONSTRAINT `CommunicationLog_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `Customer`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CommunicationLog` ADD CONSTRAINT `CommunicationLog_documentId_fkey` FOREIGN KEY (`documentId`) REFERENCES `Document`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CommunicationLog` ADD CONSTRAINT `CommunicationLog_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DocumentShareLink` ADD CONSTRAINT `DocumentShareLink_documentId_fkey` FOREIGN KEY (`documentId`) REFERENCES `Document`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AuditEvent` ADD CONSTRAINT `AuditEvent_documentId_fkey` FOREIGN KEY (`documentId`) REFERENCES `Document`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AuditEvent` ADD CONSTRAINT `AuditEvent_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CampaignRecipient` ADD CONSTRAINT `CampaignRecipient_campaignId_fkey` FOREIGN KEY (`campaignId`) REFERENCES `Campaign`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CampaignRecipient` ADD CONSTRAINT `CampaignRecipient_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `Customer`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
