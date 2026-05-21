-- Update local database with raw-material inventory pieces extracted from CNPM_THN.sql.
-- Run this script against your existing project database, not master.
-- If needed, uncomment and change the next line:
-- USE [Dataset];

SET NOCOUNT ON;

PRINT '== Ensure categories and grinding options ==';

IF NOT EXISTS (SELECT 1 FROM dbo.Categories WHERE Name = N'Arabica')
    INSERT INTO dbo.Categories (Name, Description)
    VALUES (N'Arabica', N'Cà phê có hương thơm thanh nhẹ, vị chua dịu, hậu ngọt');

IF NOT EXISTS (SELECT 1 FROM dbo.Categories WHERE Name = N'Blend')
    INSERT INTO dbo.Categories (Name, Description)
    VALUES (N'Blend', N'Sự phối trộn hài hòa giữa Arabica và Robusta');

IF NOT EXISTS (SELECT 1 FROM dbo.Categories WHERE Name = N'Robusta')
    INSERT INTO dbo.Categories (Name, Description)
    VALUES (N'Robusta', N'Cà phê đậm vị, mạnh mẽ, hàm lượng caffeine cao');

IF NOT EXISTS (SELECT 1 FROM dbo.Categories WHERE Name = N'Fine Robusta')
    INSERT INTO dbo.Categories (Name, Description)
    VALUES (N'Fine Robusta', N'Robusta tuyển chọn chất lượng cao, vị sâu và cân bằng');

IF OBJECT_ID(N'dbo.GrindingOptions', N'U') IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM dbo.GrindingOptions WHERE Name = N'Nguyên hạt')
        INSERT INTO dbo.GrindingOptions (Name) VALUES (N'Nguyên hạt');
    IF NOT EXISTS (SELECT 1 FROM dbo.GrindingOptions WHERE Name = N'Pha phin')
        INSERT INTO dbo.GrindingOptions (Name) VALUES (N'Pha phin');
    IF NOT EXISTS (SELECT 1 FROM dbo.GrindingOptions WHERE Name = N'Espresso')
        INSERT INTO dbo.GrindingOptions (Name) VALUES (N'Espresso');
    IF NOT EXISTS (SELECT 1 FROM dbo.GrindingOptions WHERE Name = N'Cold Brew')
        INSERT INTO dbo.GrindingOptions (Name) VALUES (N'Cold Brew');
    IF NOT EXISTS (SELECT 1 FROM dbo.GrindingOptions WHERE Name = N'French Press')
        INSERT INTO dbo.GrindingOptions (Name) VALUES (N'French Press');
END;
GO

PRINT '== Ensure raw-material tables ==';

IF OBJECT_ID(N'dbo.RawMaterials', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.RawMaterials (
        Id INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_RawMaterials PRIMARY KEY,
        Name NVARCHAR(150) NOT NULL,
        Unit NVARCHAR(20) NOT NULL CONSTRAINT DF_RawMaterials_Unit DEFAULT (N'kg'),
        CategoryId INT NOT NULL,
        CreatedDate DATETIME NOT NULL CONSTRAINT DF_RawMaterials_CreatedDate DEFAULT (GETDATE())
    );
END;

IF OBJECT_ID(N'dbo.InventoryReceipts', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.InventoryReceipts (
        Id INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_InventoryReceipts PRIMARY KEY,
        RawMaterialId INT NOT NULL,
        Supplier NVARCHAR(250) NOT NULL,
        Quantity FLOAT NOT NULL,
        RemainingQuantity FLOAT NOT NULL,
        ImportDate DATETIME NOT NULL,
        ExpiryDate DATETIME NOT NULL,
        CreatedBy NVARCHAR(450) NULL
    );
END;

IF OBJECT_ID(N'dbo.RawMaterialLogs', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.RawMaterialLogs (
        Id INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_RawMaterialLogs PRIMARY KEY,
        RawMaterialId INT NOT NULL,
        ReceiptId INT NULL,
        Action NVARCHAR(100) NOT NULL,
        OldQuantity FLOAT NOT NULL,
        NewQuantity FLOAT NOT NULL,
        Reason NVARCHAR(500) NULL,
        ModifiedBy NVARCHAR(450) NULL,
        ModifiedDate DATETIME NOT NULL CONSTRAINT DF_RawMaterialLogs_ModifiedDate DEFAULT (GETDATE())
    );
END;
GO

PRINT '== Ensure RoastingBatches extra columns ==';

IF COL_LENGTH(N'dbo.RoastingBatches', N'InventoryReceiptId') IS NULL
    ALTER TABLE dbo.RoastingBatches ADD InventoryReceiptId INT NULL;

IF COL_LENGTH(N'dbo.RoastingBatches', N'OutputWeight') IS NULL
    ALTER TABLE dbo.RoastingBatches ADD OutputWeight FLOAT NULL;
GO

PRINT '== Ensure foreign keys ==';

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'FK_RawMaterials_Categories')
    ALTER TABLE dbo.RawMaterials WITH CHECK
    ADD CONSTRAINT FK_RawMaterials_Categories FOREIGN KEY (CategoryId) REFERENCES dbo.Categories(Id);

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'FK_InventoryReceipts_RawMaterials')
    ALTER TABLE dbo.InventoryReceipts WITH CHECK
    ADD CONSTRAINT FK_InventoryReceipts_RawMaterials FOREIGN KEY (RawMaterialId) REFERENCES dbo.RawMaterials(Id);

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'FK_InventoryReceipts_Users')
    ALTER TABLE dbo.InventoryReceipts WITH CHECK
    ADD CONSTRAINT FK_InventoryReceipts_Users FOREIGN KEY (CreatedBy) REFERENCES dbo.Users(Id);

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'FK_RawMaterialLogs_RawMaterials')
    ALTER TABLE dbo.RawMaterialLogs WITH CHECK
    ADD CONSTRAINT FK_RawMaterialLogs_RawMaterials FOREIGN KEY (RawMaterialId) REFERENCES dbo.RawMaterials(Id);

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'FK_RawMaterialLogs_Receipts')
    ALTER TABLE dbo.RawMaterialLogs WITH CHECK
    ADD CONSTRAINT FK_RawMaterialLogs_Receipts FOREIGN KEY (ReceiptId) REFERENCES dbo.InventoryReceipts(Id);

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'FK_RawMaterialLogs_Users')
    ALTER TABLE dbo.RawMaterialLogs WITH CHECK
    ADD CONSTRAINT FK_RawMaterialLogs_Users FOREIGN KEY (ModifiedBy) REFERENCES dbo.Users(Id);

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'FK_RoastingBatches_InventoryReceipts')
    ALTER TABLE dbo.RoastingBatches WITH CHECK
    ADD CONSTRAINT FK_RoastingBatches_InventoryReceipts FOREIGN KEY (InventoryReceiptId) REFERENCES dbo.InventoryReceipts(Id);
GO

PRINT '== Seed products and product details from CNPM_THN when missing ==';

DECLARE @ArabicaId INT = (SELECT TOP 1 Id FROM dbo.Categories WHERE Name = N'Arabica');
DECLARE @BlendId INT = (SELECT TOP 1 Id FROM dbo.Categories WHERE Name = N'Blend');
DECLARE @RobustaId INT = (SELECT TOP 1 Id FROM dbo.Categories WHERE Name = N'Robusta');
DECLARE @FineRobustaId INT = (SELECT TOP 1 Id FROM dbo.Categories WHERE Name = N'Fine Robusta');

IF NOT EXISTS (SELECT 1 FROM dbo.Products WHERE Name = N'REVO Morning')
    INSERT INTO dbo.Products (Name, Price, Stock, ImageUrl, Description, CategoryId)
    VALUES (N'REVO Morning', 99000, 106, N'/uploads/products/image1.png', N'Hương vị nhẹ nhàng, tinh tế cho buổi sáng đầy năng lượng', @ArabicaId);

IF NOT EXISTS (SELECT 1 FROM dbo.Products WHERE Name = N'REVO Everyday')
    INSERT INTO dbo.Products (Name, Price, Stock, ImageUrl, Description, CategoryId)
    VALUES (N'REVO Everyday', 139000, 111, N'/uploads/products/image2.png', N'Hương vị cân bằng dịu nhẹ, hậu vị ngọt kéo dài', @BlendId);

IF NOT EXISTS (SELECT 1 FROM dbo.Products WHERE Name = N'REVO Origin')
    INSERT INTO dbo.Products (Name, Price, Stock, ImageUrl, Description, CategoryId)
    VALUES (N'REVO Origin', 149000, 4, N'/uploads/products/image3.png', N'Robusta nguyên bản mạnh mẽ, đậm vị truyền thống', @RobustaId);

IF NOT EXISTS (SELECT 1 FROM dbo.Products WHERE Name = N'REVO Đậm Đà')
    INSERT INTO dbo.Products (Name, Price, Stock, ImageUrl, Description, CategoryId)
    VALUES (N'REVO Đậm Đà', 129000, 99, N'/uploads/products/image4.png', N'Hương vị robusta tuyển chọn với hậu vị sâu lắng', @FineRobustaId);

IF NOT EXISTS (SELECT 1 FROM dbo.Products WHERE Name = N'REVO Robusta')
    INSERT INTO dbo.Products (Name, Price, Stock, ImageUrl, Description, CategoryId)
    VALUES (N'REVO Robusta', 109000, 107, N'/uploads/products/image5.png', N'Robusta cổ điển mạnh mẽ, phù hợp gu Việt', @RobustaId);

IF OBJECT_ID(N'dbo.ProductDetails', N'U') IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM dbo.ProductDetails WHERE ProductId = (SELECT TOP 1 Id FROM dbo.Products WHERE Name = N'REVO Morning'))
        INSERT INTO dbo.ProductDetails (ProductId, Region, Process, Roast, FlavorNotes, AcidityLevel, BitternessLevel, BodyLevel, BestTime, MatchTags)
        SELECT Id, N'Cầu Đất, Đà Lạt', N'Washed', N'Light', N'Hoa nhài, Cam vàng, Mật ong', 4, 2, 3, N'morning', N'floral,citrus,honey'
        FROM dbo.Products WHERE Name = N'REVO Morning';

    IF NOT EXISTS (SELECT 1 FROM dbo.ProductDetails WHERE ProductId = (SELECT TOP 1 Id FROM dbo.Products WHERE Name = N'REVO Everyday'))
        INSERT INTO dbo.ProductDetails (ProductId, Region, Process, Roast, FlavorNotes, AcidityLevel, BitternessLevel, BodyLevel, BestTime, MatchTags)
        SELECT Id, N'Đắk Lắk & Đà Lạt', N'Honey', N'Dark', N'Chocolate, Hạnh nhân, Caramel', 3, 3, 4, N'afternoon', N'chocolate,caramel,nut'
        FROM dbo.Products WHERE Name = N'REVO Everyday';

    IF NOT EXISTS (SELECT 1 FROM dbo.ProductDetails WHERE ProductId = (SELECT TOP 1 Id FROM dbo.Products WHERE Name = N'REVO Origin'))
        INSERT INTO dbo.ProductDetails (ProductId, Region, Process, Roast, FlavorNotes, AcidityLevel, BitternessLevel, BodyLevel)
        SELECT Id, N'Buôn Ma Thuột', N'Natural', N'Dark', N'Cacao đắng, Gỗ sồi, Hạt dẻ', 2, 5, 5
        FROM dbo.Products WHERE Name = N'REVO Origin';
END;
GO

PRINT '== Seed raw materials, receipts, raw logs, and batches ==';

DECLARE @AdminUserId NVARCHAR(450) =
    (SELECT TOP 1 Id FROM dbo.Users WHERE UserType IN (1, 3) AND IsActive = 1 ORDER BY UserType DESC, Created);

IF @AdminUserId IS NULL
    SET @AdminUserId = (SELECT TOP 1 Id FROM dbo.Users ORDER BY Created);

DECLARE @ArabicaId INT = (SELECT TOP 1 Id FROM dbo.Categories WHERE Name = N'Arabica');
DECLARE @BlendId INT = (SELECT TOP 1 Id FROM dbo.Categories WHERE Name = N'Blend');
DECLARE @RobustaId INT = (SELECT TOP 1 Id FROM dbo.Categories WHERE Name = N'Robusta');
DECLARE @FineRobustaId INT = (SELECT TOP 1 Id FROM dbo.Categories WHERE Name = N'Fine Robusta');

IF @AdminUserId IS NULL
BEGIN
    PRINT 'No user found. Raw material data will be created without user ownership where allowed.';
END;

IF NOT EXISTS (SELECT 1 FROM dbo.RawMaterials WHERE Name = N'Hạt Cà phê Arabica Cầu Đất')
    INSERT INTO dbo.RawMaterials (Name, Unit, CategoryId, CreatedDate)
    VALUES (N'Hạt Cà phê Arabica Cầu Đất', N'kg', @ArabicaId, '2026-05-20T23:30:29.577');

IF NOT EXISTS (SELECT 1 FROM dbo.RawMaterials WHERE Name = N'Hạt Cà phê Robusta Buôn Ma Thuột')
    INSERT INTO dbo.RawMaterials (Name, Unit, CategoryId, CreatedDate)
    VALUES (N'Hạt Cà phê Robusta Buôn Ma Thuột', N'kg', @RobustaId, '2026-05-20T23:30:29.577');

IF NOT EXISTS (SELECT 1 FROM dbo.RawMaterials WHERE Name = N'Hạt Cà phê Blend Thượng Hạng')
    INSERT INTO dbo.RawMaterials (Name, Unit, CategoryId, CreatedDate)
    VALUES (N'Hạt Cà phê Blend Thượng Hạng', N'kg', @BlendId, '2026-05-20T23:30:29.577');

IF NOT EXISTS (SELECT 1 FROM dbo.RawMaterials WHERE Name = N'Hạt Cà phê Fine Robusta cao cấp')
    INSERT INTO dbo.RawMaterials (Name, Unit, CategoryId, CreatedDate)
    VALUES (N'Hạt Cà phê Fine Robusta cao cấp', N'kg', @FineRobustaId, '2026-05-21T00:30:25.857');

IF NOT EXISTS (SELECT 1 FROM dbo.InventoryReceipts WHERE Supplier = N'Công ty Nông sản Tây Nguyên')
    INSERT INTO dbo.InventoryReceipts (RawMaterialId, Supplier, Quantity, RemainingQuantity, ImportDate, ExpiryDate, CreatedBy)
    SELECT Id, N'Công ty Nông sản Tây Nguyên', 100, 70.5, '2026-05-20T23:34:03.110', '2027-05-20T23:34:03.110', @AdminUserId
    FROM dbo.RawMaterials WHERE Name = N'Hạt Cà phê Arabica Cầu Đất';

IF NOT EXISTS (SELECT 1 FROM dbo.InventoryReceipts WHERE Supplier = N'Hợp tác xã Buôn Ma Thuột')
    INSERT INTO dbo.InventoryReceipts (RawMaterialId, Supplier, Quantity, RemainingQuantity, ImportDate, ExpiryDate, CreatedBy)
    SELECT Id, N'Hợp tác xã Buôn Ma Thuột', 50, 15, '2025-12-20T23:34:03.110', '2026-05-24T23:34:03.110', @AdminUserId
    FROM dbo.RawMaterials WHERE Name = N'Hạt Cà phê Robusta Buôn Ma Thuột';

IF NOT EXISTS (SELECT 1 FROM dbo.InventoryReceipts WHERE Supplier = N'Hộ trồng cà phê Đà Lạt')
    INSERT INTO dbo.InventoryReceipts (RawMaterialId, Supplier, Quantity, RemainingQuantity, ImportDate, ExpiryDate, CreatedBy)
    SELECT Id, N'Hộ trồng cà phê Đà Lạt', 30, 0, '2025-11-20T23:34:03.110', '2026-11-20T23:34:03.110', @AdminUserId
    FROM dbo.RawMaterials WHERE Name = N'Hạt Cà phê Arabica Cầu Đất';

IF NOT EXISTS (SELECT 1 FROM dbo.InventoryReceipts WHERE Supplier = N'Hợp tác xã Hải Hậu')
    INSERT INTO dbo.InventoryReceipts (RawMaterialId, Supplier, Quantity, RemainingQuantity, ImportDate, ExpiryDate, CreatedBy)
    SELECT Id, N'Hợp tác xã Hải Hậu', 100, 75, '2026-05-20T00:00:00.000', '2026-07-03T00:00:00.000', @AdminUserId
    FROM dbo.RawMaterials WHERE Name = N'Hạt Cà phê Fine Robusta cao cấp';

DECLARE @ArabicaRawId INT = (SELECT TOP 1 Id FROM dbo.RawMaterials WHERE Name = N'Hạt Cà phê Arabica Cầu Đất');
DECLARE @RobustaRawId INT = (SELECT TOP 1 Id FROM dbo.RawMaterials WHERE Name = N'Hạt Cà phê Robusta Buôn Ma Thuột');
DECLARE @FineRawId INT = (SELECT TOP 1 Id FROM dbo.RawMaterials WHERE Name = N'Hạt Cà phê Fine Robusta cao cấp');
DECLARE @ArabicaReceiptId INT = (SELECT TOP 1 Id FROM dbo.InventoryReceipts WHERE RawMaterialId = @ArabicaRawId ORDER BY Id);
DECLARE @RobustaReceiptId INT = (SELECT TOP 1 Id FROM dbo.InventoryReceipts WHERE RawMaterialId = @RobustaRawId ORDER BY Id);
DECLARE @FineReceiptId INT = (SELECT TOP 1 Id FROM dbo.InventoryReceipts WHERE RawMaterialId = @FineRawId ORDER BY Id);

IF NOT EXISTS (SELECT 1 FROM dbo.RawMaterialLogs WHERE Reason = N'Nhập mới lô hàng 100 kg từ nhà cung cấp: Hợp tác xã Hải Hậu')
    INSERT INTO dbo.RawMaterialLogs (RawMaterialId, ReceiptId, Action, OldQuantity, NewQuantity, Reason, ModifiedBy, ModifiedDate)
    VALUES (@FineRawId, @FineReceiptId, N'NHAP_KHO_NGUYEN_LIEU', 0, 100, N'Nhập mới lô hàng 100 kg từ nhà cung cấp: Hợp tác xã Hải Hậu', @AdminUserId, '2026-05-21T00:36:53.737');

IF NOT EXISTS (SELECT 1 FROM dbo.RawMaterialLogs WHERE Reason = N'Xuất kho 5 kg để thực hiện mẻ rang mã BATCH-007')
    INSERT INTO dbo.RawMaterialLogs (RawMaterialId, ReceiptId, Action, OldQuantity, NewQuantity, Reason, ModifiedBy, ModifiedDate)
    VALUES (@ArabicaRawId, @ArabicaReceiptId, N'XUAT_RANG_CA_PHE', 75.5, 70.5, N'Xuất kho 5 kg để thực hiện mẻ rang mã BATCH-007', @AdminUserId, '2026-05-21T00:20:42.980');

IF NOT EXISTS (SELECT 1 FROM dbo.RawMaterialLogs WHERE Reason = N'Xuất kho 5 kg để thực hiện mẻ rang mã HKT-01 (Trạng thái: Đang xử lý)')
    INSERT INTO dbo.RawMaterialLogs (RawMaterialId, ReceiptId, Action, OldQuantity, NewQuantity, Reason, ModifiedBy, ModifiedDate)
    VALUES (@FineRawId, @FineReceiptId, N'XUAT_RANG_CA_PHE', 100, 95, N'Xuất kho 5 kg để thực hiện mẻ rang mã HKT-01 (Trạng thái: Đang xử lý)', @AdminUserId, '2026-05-21T15:36:21.487');

IF NOT EXISTS (SELECT 1 FROM dbo.RawMaterialLogs WHERE Reason = N'Xuất kho 5 kg để thực hiện mẻ rang mã BRP-01 (Trạng thái: Đang xử lý)')
    INSERT INTO dbo.RawMaterialLogs (RawMaterialId, ReceiptId, Action, OldQuantity, NewQuantity, Reason, ModifiedBy, ModifiedDate)
    VALUES (@RobustaRawId, @RobustaReceiptId, N'XUAT_RANG_CA_PHE', 20, 15, N'Xuất kho 5 kg để thực hiện mẻ rang mã BRP-01 (Trạng thái: Đang xử lý)', @AdminUserId, '2026-05-21T16:55:45.370');

DECLARE @ProductMorning INT = (SELECT TOP 1 Id FROM dbo.Products WHERE Name = N'REVO Morning');
DECLARE @ProductEveryday INT = (SELECT TOP 1 Id FROM dbo.Products WHERE Name = N'REVO Everyday');
DECLARE @ProductOrigin INT = (SELECT TOP 1 Id FROM dbo.Products WHERE Name = N'REVO Origin');
DECLARE @ProductDamDa INT = (SELECT TOP 1 Id FROM dbo.Products WHERE Name = N'REVO Đậm Đà');

IF @AdminUserId IS NOT NULL AND @ProductMorning IS NOT NULL AND NOT EXISTS (SELECT 1 FROM dbo.RoastingBatches WHERE BatchCode = N'BATCH-007')
    INSERT INTO dbo.RoastingBatches (BatchCode, ProductId, RoastLevel, InputWeight, Status, RoastDate, UserId, InventoryReceiptId, OutputWeight)
    VALUES (N'BATCH-007', @ProductMorning, N'Medium', 5, N'Hoàn thành', '2026-05-21T00:20:42.980', @AdminUserId, @ArabicaReceiptId, 4);

IF @AdminUserId IS NOT NULL AND @ProductEveryday IS NOT NULL AND NOT EXISTS (SELECT 1 FROM dbo.RoastingBatches WHERE BatchCode = N'CNN-01')
    INSERT INTO dbo.RoastingBatches (BatchCode, ProductId, RoastLevel, InputWeight, Status, RoastDate, UserId, InventoryReceiptId, OutputWeight)
    VALUES (N'CNN-01', @ProductEveryday, N'Dark', 4, N'Đã đóng gói', '2026-05-21T15:41:35.280', @AdminUserId, @FineReceiptId, 4);

IF @AdminUserId IS NOT NULL AND @ProductDamDa IS NOT NULL AND NOT EXISTS (SELECT 1 FROM dbo.RoastingBatches WHERE BatchCode = N'ASD-01')
    INSERT INTO dbo.RoastingBatches (BatchCode, ProductId, RoastLevel, InputWeight, Status, RoastDate, UserId, InventoryReceiptId, OutputWeight)
    VALUES (N'ASD-01', @ProductDamDa, N'Medium', 2, N'Đã đóng gói', '2026-05-21T16:40:41.157', @AdminUserId, @RobustaReceiptId, 1);

IF @AdminUserId IS NOT NULL AND @ProductOrigin IS NOT NULL AND NOT EXISTS (SELECT 1 FROM dbo.RoastingBatches WHERE BatchCode = N'BRP-01')
    INSERT INTO dbo.RoastingBatches (BatchCode, ProductId, RoastLevel, InputWeight, Status, RoastDate, UserId, InventoryReceiptId, OutputWeight)
    VALUES (N'BRP-01', @ProductOrigin, N'Dark', 5, N'Đang xử lý', '2026-05-21T16:55:45.367', @AdminUserId, @RobustaReceiptId, NULL);

PRINT 'Done updating raw-material inventory schema and seed data.';
GO
