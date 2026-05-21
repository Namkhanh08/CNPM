-- SCRIPT CẬP NHẬT DATABASE LOCAL (SQL SERVER)
-- Thêm các cột mới cho bảng Users, Orders và tạo mới các bảng Vouchers, LoyaltyPoints, Subscriptions.

USE [Dataset]; -- Thay thế bằng tên Database chính xác của bạn nếu cần
GO

-- 1. Cập nhật bảng Users (thêm TotalPoints và MemberTier)
IF NOT EXISTS (
    SELECT * FROM sys.columns 
    WHERE object_id = OBJECT_ID(N'[dbo].[Users]') AND name = N'TotalPoints'
)
BEGIN
    ALTER TABLE [dbo].[Users] ADD [TotalPoints] INT NOT NULL DEFAULT 0;
    PRINT 'Da them cot TotalPoints vao bang Users';
END
ELSE
BEGIN
    PRINT 'Cot TotalPoints da ton tai trong bang Users';
END
GO

IF NOT EXISTS (
    SELECT * FROM sys.columns 
    WHERE object_id = OBJECT_ID(N'[dbo].[Users]') AND name = N'MemberTier'
)
BEGIN
    ALTER TABLE [dbo].[Users] ADD [MemberTier] NVARCHAR(20) NOT NULL DEFAULT 'Bronze';
    PRINT 'Da them cot MemberTier vao bang Users';
END
ELSE
BEGIN
    PRINT 'Cot MemberTier da ton tai trong bang Users';
END
GO

-- 2. Cập nhật bảng Orders (thêm VoucherCode và DiscountAmount)
IF NOT EXISTS (
    SELECT * FROM sys.columns 
    WHERE object_id = OBJECT_ID(N'[dbo].[Orders]') AND name = N'VoucherCode'
)
BEGIN
    ALTER TABLE [dbo].[Orders] ADD [VoucherCode] NVARCHAR(50) NULL;
    PRINT 'Da them cot VoucherCode vao bang Orders';
END
ELSE
BEGIN
    PRINT 'Cot VoucherCode da ton tai trong bang Orders';
END
GO

IF NOT EXISTS (
    SELECT * FROM sys.columns 
    WHERE object_id = OBJECT_ID(N'[dbo].[Orders]') AND name = N'DiscountAmount'
)
BEGIN
    ALTER TABLE [dbo].[Orders] ADD [DiscountAmount] DECIMAL(18, 2) NOT NULL DEFAULT 0;
    PRINT 'Da them cot DiscountAmount vao bang Orders';
END
ELSE
BEGIN
    PRINT 'Cot DiscountAmount da ton tai trong bang Orders';
END
GO

-- 3. Tạo bảng Vouchers
IF OBJECT_ID(N'[dbo].[Vouchers]', N'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[Vouchers] (
        [Id] INT IDENTITY(1,1) PRIMARY KEY,
        [Code] NVARCHAR(50) NOT NULL,
        [Name] NVARCHAR(200) NOT NULL,
        [DiscountType] NVARCHAR(20) NOT NULL DEFAULT 'percent',
        [DiscountValue] DECIMAL(18,2) NOT NULL,
        [MinOrderValue] DECIMAL(18,2) NOT NULL DEFAULT 0,
        [MaxUsage] INT NOT NULL DEFAULT 0,
        [UsedCount] INT NOT NULL DEFAULT 0,
        [StartDate] DATETIME2 NOT NULL,
        [EndDate] DATETIME2 NOT NULL,
        [IsActive] BIT NOT NULL DEFAULT 1,
        CONSTRAINT [UQ_Vouchers_Code] UNIQUE ([Code])
    );
    PRINT 'Da tao bang Vouchers';
END
ELSE
BEGIN
    PRINT 'Bang Vouchers da ton tai';
END
GO

-- 4. Tạo bảng LoyaltyPoints
IF OBJECT_ID(N'[dbo].[LoyaltyPoints]', N'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[LoyaltyPoints] (
        [Id] INT IDENTITY(1,1) PRIMARY KEY,
        [UserId] NVARCHAR(450) NOT NULL,
        [Points] INT NOT NULL,
        [Type] NVARCHAR(20) NOT NULL DEFAULT 'earn',
        [Description] NVARCHAR(500) NOT NULL DEFAULT '',
        [OrderId] INT NULL,
        [CreatedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        CONSTRAINT [FK_LoyaltyPoints_Users] FOREIGN KEY ([UserId]) REFERENCES [dbo].[Users] ([Id]) ON DELETE CASCADE
    );
    PRINT 'Da tao bang LoyaltyPoints';
END
ELSE
BEGIN
    PRINT 'Bang LoyaltyPoints da ton tai';
END
GO

-- 5. Tạo bảng Subscriptions
IF OBJECT_ID(N'[dbo].[Subscriptions]', N'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[Subscriptions] (
        [Id] INT IDENTITY(1,1) PRIMARY KEY,
        [UserId] NVARCHAR(450) NOT NULL,
        [ProductId] INT NOT NULL,
        [GrindingOptionId] INT NULL,
        [FlavorNotes] NVARCHAR(200) NULL,
        [Weight] NVARCHAR(50) NULL,
        [Quantity] INT NOT NULL DEFAULT 1,
        [Frequency] NVARCHAR(20) NOT NULL DEFAULT 'monthly',
        [StartDate] DATETIME2 NOT NULL,
        [NextDeliveryDate] DATETIME2 NOT NULL,
        [ReceiverName] NVARCHAR(100) NULL,
        [ReceiverPhone] NVARCHAR(20) NULL,
        [ShippingProvince] NVARCHAR(100) NULL,
        [ShippingDistrict] NVARCHAR(100) NULL,
        [ShippingWard] NVARCHAR(100) NULL,
        [ShippingDetailAddress] NVARCHAR(255) NULL,
        [PaymentMethod] NVARCHAR(100) NULL,
        [Status] NVARCHAR(20) NOT NULL DEFAULT 'active',
        [CreatedAt] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        CONSTRAINT [FK_Subscriptions_Users] FOREIGN KEY ([UserId]) REFERENCES [dbo].[Users] ([Id]) ON DELETE CASCADE,
        CONSTRAINT [FK_Subscriptions_Products] FOREIGN KEY ([ProductId]) REFERENCES [dbo].[Products] ([Id]) ON DELETE CASCADE
    );
    PRINT 'Da tao bang Subscriptions';
END
ELSE
BEGIN
    PRINT 'Bang Subscriptions da ton tai';
END
GO
