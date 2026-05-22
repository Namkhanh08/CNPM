-- Seed Giftset and Combo products for the frontend Giftsets/Combos sections.
-- Run this script against your existing project database, not master.
-- If needed, uncomment and change the next line:
-- USE [Dataset];

SET NOCOUNT ON;

PRINT '== Ensure Giftset and Combo categories ==';

IF NOT EXISTS (SELECT 1 FROM dbo.Categories WHERE Name = N'Giftset')
    INSERT INTO dbo.Categories (Name, Description)
    VALUES (N'Giftset', N'Coffee gift box products');

IF NOT EXISTS (SELECT 1 FROM dbo.Categories WHERE Name = N'Combo')
    INSERT INTO dbo.Categories (Name, Description)
    VALUES (N'Combo', N'Bundled coffee products');

DECLARE @GiftsetCategoryId INT = (SELECT TOP 1 Id FROM dbo.Categories WHERE Name = N'Giftset');
DECLARE @ComboCategoryId INT = (SELECT TOP 1 Id FROM dbo.Categories WHERE Name = N'Combo');

PRINT '== Seed giftset products ==';

IF NOT EXISTS (SELECT 1 FROM dbo.Products WHERE Name = N'GIFTSET 1')
    INSERT INTO dbo.Products (Name, Price, Stock, ImageUrl, Description, CategoryId)
    VALUES (
        N'GIFTSET 1',
        285000,
        50,
        N'/uploads/products/giftset1Img.png',
        N'Premium coffee giftset for coffee lovers',
        @GiftsetCategoryId
    );
ELSE
    UPDATE dbo.Products
    SET Price = 285000,
        Stock = CASE WHEN Stock < 1 THEN 50 ELSE Stock END,
        ImageUrl = N'/uploads/products/giftset1Img.png',
        Description = N'Premium coffee giftset for coffee lovers',
        CategoryId = @GiftsetCategoryId
    WHERE Name = N'GIFTSET 1';

IF NOT EXISTS (SELECT 1 FROM dbo.Products WHERE Name = N'GIFTSET 2')
    INSERT INTO dbo.Products (Name, Price, Stock, ImageUrl, Description, CategoryId)
    VALUES (
        N'GIFTSET 2',
        305000,
        50,
        N'/uploads/products/giftset2Img.png',
        N'Giftset for bold and rich coffee taste',
        @GiftsetCategoryId
    );
ELSE
    UPDATE dbo.Products
    SET Price = 305000,
        Stock = CASE WHEN Stock < 1 THEN 50 ELSE Stock END,
        ImageUrl = N'/uploads/products/giftset2Img.png',
        Description = N'Giftset for bold and rich coffee taste',
        CategoryId = @GiftsetCategoryId
    WHERE Name = N'GIFTSET 2';

IF NOT EXISTS (SELECT 1 FROM dbo.Products WHERE Name = N'GIFTSET 3')
    INSERT INTO dbo.Products (Name, Price, Stock, ImageUrl, Description, CategoryId)
    VALUES (
        N'GIFTSET 3',
        345000,
        50,
        N'/uploads/products/giftset3Img.png',
        N'Premium Arabica giftset for a refined coffee experience',
        @GiftsetCategoryId
    );
ELSE
    UPDATE dbo.Products
    SET Price = 345000,
        Stock = CASE WHEN Stock < 1 THEN 50 ELSE Stock END,
        ImageUrl = N'/uploads/products/giftset3Img.png',
        Description = N'Premium Arabica giftset for a refined coffee experience',
        CategoryId = @GiftsetCategoryId
    WHERE Name = N'GIFTSET 3';

PRINT '== Seed combo products ==';

IF NOT EXISTS (SELECT 1 FROM dbo.Products WHERE Name = N'COMBO 1')
    INSERT INTO dbo.Products (Name, Price, Stock, ImageUrl, Description, CategoryId)
    VALUES (
        N'COMBO 1',
        119000,
        80,
        N'/uploads/products/combo1.png',
        N'Saving combo for daily coffee',
        @ComboCategoryId
    );
ELSE
    UPDATE dbo.Products
    SET Price = 119000,
        Stock = CASE WHEN Stock < 1 THEN 80 ELSE Stock END,
        ImageUrl = N'/uploads/products/combo1.png',
        Description = N'Saving combo for daily coffee',
        CategoryId = @ComboCategoryId
    WHERE Name = N'COMBO 1';

IF NOT EXISTS (SELECT 1 FROM dbo.Products WHERE Name = N'COMBO 2')
    INSERT INTO dbo.Products (Name, Price, Stock, ImageUrl, Description, CategoryId)
    VALUES (
        N'COMBO 2',
        139000,
        80,
        N'/uploads/products/combo2.png',
        N'Saving combo with balanced coffee flavor',
        @ComboCategoryId
    );
ELSE
    UPDATE dbo.Products
    SET Price = 139000,
        Stock = CASE WHEN Stock < 1 THEN 80 ELSE Stock END,
        ImageUrl = N'/uploads/products/combo2.png',
        Description = N'Saving combo with balanced coffee flavor',
        CategoryId = @ComboCategoryId
    WHERE Name = N'COMBO 2';

IF NOT EXISTS (SELECT 1 FROM dbo.Products WHERE Name = N'COMBO 3')
    INSERT INTO dbo.Products (Name, Price, Stock, ImageUrl, Description, CategoryId)
    VALUES (
        N'COMBO 3',
        169000,
        80,
        N'/uploads/products/combo3.png',
        N'Saving combo for full coffee enjoyment',
        @ComboCategoryId
    );
ELSE
    UPDATE dbo.Products
    SET Price = 169000,
        Stock = CASE WHEN Stock < 1 THEN 80 ELSE Stock END,
        ImageUrl = N'/uploads/products/combo3.png',
        Description = N'Saving combo for full coffee enjoyment',
        CategoryId = @ComboCategoryId
    WHERE Name = N'COMBO 3';

PRINT '== Seed giftset and combo product details ==';

IF OBJECT_ID(N'dbo.ProductDetails', N'U') IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM dbo.ProductDetails WHERE ProductId = (SELECT TOP 1 Id FROM dbo.Products WHERE Name = N'GIFTSET 1'))
        INSERT INTO dbo.ProductDetails (ProductId, Region, Process, Roast, FlavorNotes, AcidityLevel, BitternessLevel, BodyLevel, BestTime, MatchTags)
        SELECT Id, N'Da Lat & Dak Lak', N'Gift box', N'Medium', N'Fine Robusta Blend', 3, 3, 4, N'gift', N'giftset,premium,blend'
        FROM dbo.Products WHERE Name = N'GIFTSET 1';

    IF NOT EXISTS (SELECT 1 FROM dbo.ProductDetails WHERE ProductId = (SELECT TOP 1 Id FROM dbo.Products WHERE Name = N'GIFTSET 2'))
        INSERT INTO dbo.ProductDetails (ProductId, Region, Process, Roast, FlavorNotes, AcidityLevel, BitternessLevel, BodyLevel, BestTime, MatchTags)
        SELECT Id, N'Buon Ma Thuot', N'Gift box', N'Dark', N'Robusta Honey', 2, 4, 5, N'gift', N'giftset,robusta,bold'
        FROM dbo.Products WHERE Name = N'GIFTSET 2';

    IF NOT EXISTS (SELECT 1 FROM dbo.ProductDetails WHERE ProductId = (SELECT TOP 1 Id FROM dbo.Products WHERE Name = N'GIFTSET 3'))
        INSERT INTO dbo.ProductDetails (ProductId, Region, Process, Roast, FlavorNotes, AcidityLevel, BitternessLevel, BodyLevel, BestTime, MatchTags)
        SELECT Id, N'Cau Dat', N'Gift box', N'Light', N'Arabica, Citrus, Honey', 4, 2, 3, N'gift', N'giftset,arabica,premium'
        FROM dbo.Products WHERE Name = N'GIFTSET 3';

    IF NOT EXISTS (SELECT 1 FROM dbo.ProductDetails WHERE ProductId = (SELECT TOP 1 Id FROM dbo.Products WHERE Name = N'COMBO 1'))
        INSERT INTO dbo.ProductDetails (ProductId, Region, Process, Roast, FlavorNotes, AcidityLevel, BitternessLevel, BodyLevel, BestTime, MatchTags)
        SELECT Id, N'Mixed regions', N'Combo pack', N'Medium', N'Daily coffee combo', 3, 3, 4, N'anytime', N'combo,saving,daily'
        FROM dbo.Products WHERE Name = N'COMBO 1';

    IF NOT EXISTS (SELECT 1 FROM dbo.ProductDetails WHERE ProductId = (SELECT TOP 1 Id FROM dbo.Products WHERE Name = N'COMBO 2'))
        INSERT INTO dbo.ProductDetails (ProductId, Region, Process, Roast, FlavorNotes, AcidityLevel, BitternessLevel, BodyLevel, BestTime, MatchTags)
        SELECT Id, N'Mixed regions', N'Combo pack', N'Medium-Dark', N'Balanced coffee combo', 3, 4, 4, N'anytime', N'combo,saving,balance'
        FROM dbo.Products WHERE Name = N'COMBO 2';

    IF NOT EXISTS (SELECT 1 FROM dbo.ProductDetails WHERE ProductId = (SELECT TOP 1 Id FROM dbo.Products WHERE Name = N'COMBO 3'))
        INSERT INTO dbo.ProductDetails (ProductId, Region, Process, Roast, FlavorNotes, AcidityLevel, BitternessLevel, BodyLevel, BestTime, MatchTags)
        SELECT Id, N'Mixed regions', N'Combo pack', N'Dark', N'Rich coffee combo', 2, 4, 5, N'anytime', N'combo,saving,rich'
        FROM dbo.Products WHERE Name = N'COMBO 3';
END;

PRINT 'Done seeding giftsets and combos.';
