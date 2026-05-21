-- =======================================================
-- 1. TẠO BẢNG DANH MỤC NGUYÊN LIỆU THÔ (RAW MATERIALS)
-- =======================================================
CREATE TABLE [dbo].[RawMaterials] (
    [Id]            INT IDENTITY (1, 1) NOT NULL,
    [Name]          NVARCHAR(150)       NOT NULL, -- Ví dụ: Arabica Cầu Đất Thô, Robusta Buôn Ma Thuột Thô
    [Unit]          NVARCHAR(20)        DEFAULT 'kg' NOT NULL,
    [CategoryId]    INT                 NOT NULL, -- Liên kết sang bảng Categories để phân loại
    [CreatedDate]   DATETIME            DEFAULT GETDATE() NOT NULL,
    CONSTRAINT [PK_RawMaterials] PRIMARY KEY CLUSTERED ([Id] ASC),
    CONSTRAINT [FK_RawMaterials_Categories] FOREIGN KEY ([CategoryId]) REFERENCES [dbo].[Categories] ([Id]) ON DELETE CASCADE
);

-- =======================================================
-- 2. TẠO BẢNG LÔ NHẬP KHO CHI TIẾT (INVENTORY RECEIPTS)
-- =======================================================
-- =======================================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[InventoryReceipts]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[InventoryReceipts] (
        [Id]                INT IDENTITY (1, 1) NOT NULL,
        [RawMaterialId]     INT                 NOT NULL, 
        [Supplier]          NVARCHAR(250)       NOT NULL, 
        [Quantity]          FLOAT               NOT NULL, 
        [RemainingQuantity] FLOAT               NOT NULL, 
        [ImportDate]        DATETIME            NOT NULL, 
        [ExpiryDate]        DATETIME            NOT NULL, 
        [CreatedBy]         NVARCHAR(450)       NULL, -- ĐÃ ĐỔI THÀNH NVARCHAR(450) ĐỂ KHỚP VỚI GUID CỦA BẢNG USERS
        CONSTRAINT [PK_InventoryReceipts] PRIMARY KEY CLUSTERED ([Id] ASC),
        CONSTRAINT [FK_InventoryReceipts_RawMaterials] FOREIGN KEY ([RawMaterialId]) REFERENCES [dbo].[RawMaterials] ([Id]) ON DELETE CASCADE,
        CONSTRAINT [FK_InventoryReceipts_Users] FOREIGN KEY ([CreatedBy]) REFERENCES [dbo].[Users] ([Id]) ON DELETE SET NULL
    );
END

-- =======================================================
-- 3. LIÊN KẾT SANG BẢNG RANG CÀ PHÊ (ROASTING BATCHES)
-- =======================================================
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[RoastingBatches]') AND name = N'InventoryReceiptId')
BEGIN
    ALTER TABLE [dbo].[RoastingBatches]
    ADD [InventoryReceiptId] INT NULL;

    ALTER TABLE [dbo].[RoastingBatches]
    ADD CONSTRAINT [FK_RoastingBatches_InventoryReceipts] 
    FOREIGN KEY ([InventoryReceiptId]) REFERENCES [dbo].[InventoryReceipts] ([Id]) ON DELETE NO ACTION;
END

-- 1. CHÈN DỮ LIỆU MẪU CHO BẢNG NGUYÊN LIỆU THÔ (RawMaterials)
-- Lưu ý: Cột CategoryId phải khớp với Id đang có trong bảng Categories (Ví dụ: 1, 2, 3, 4 từ ảnh của bạn)
SET IDENTITY_INSERT [dbo].[RawMaterials] ON;

INSERT INTO [dbo].[RawMaterials] ([Id], [Name], [Unit], [CategoryId], [CreatedDate])
VALUES 
(1, N'Hạt Cà phê Arabica Cầu Đất', N'kg', 1, GETDATE()),
(2, N'Hạt Cà phê Robusta Buôn Ma Thuột', N'kg', 3, GETDATE()),
(3, N'Hạt Cà phê Blend Thượng Hạng', N'kg', 2, GETDATE());

SET IDENTITY_INSERT [dbo].[RawMaterials] OFF;
GO

-- 2. CHÈN DỮ LIỆU MẪU CHO BẢNG LÔ NHẬP KHO (InventoryReceipts)
-- Lưu ý: CreatedBy (Id người dùng) phải là một Id hợp lệ tồn tại trong bảng Users của bạn.
-- Hãy thay đổi số 1 ở cột CreatedBy bên dưới nếu tài khoản Admin/Nhân viên của bạn có Id khác.
SET IDENTITY_INSERT [dbo].[InventoryReceipts] ON;

INSERT INTO [dbo].[InventoryReceipts] ([Id], [RawMaterialId], [Supplier], [Quantity], [RemainingQuantity], [ImportDate], [ExpiryDate], [CreatedBy])
VALUES 
-- Lô 1: Còn hàng, hạn xa (Trạng thái: An toàn)
(1, 1, N'Công ty Nông sản Tây Nguyên', 100.0, 75.5, GETDATE(), DATEADD(month, 12, GETDATE()), 'caa1658e-7055-4d7d-8c94-810aac98b4f4'),

-- Lô 2: Sắp hết hạn (Trạng thái: Cảnh báo gần hạn - Thử nghiệm logic 7 ngày trên Frontend)
(2, 2, N'Hợp tác xã Buôn Ma Thuột', 50.0, 20.0, DATEADD(month, -5, GETDATE()), DATEADD(day, 4, GETDATE()), '4f48b5b9-204e-49d7-8313-2e4a6acce605'),

-- Lô 3: Đã hết sạch hàng tồn (Trạng thái: Hết hàng)
(3, 1, N'Hộ trồng cà phê Đà Lạt', 30.0, 0.0, DATEADD(month, -6, GETDATE()), DATEADD(month, 6, GETDATE()), '4f48b5b9-204e-49d7-8313-2e4a6acce605'),

-- Lô 4: Đã quá hạn sử dụng (Trạng thái: Hết hạn sử dụng)
(4, 3, N'Đại lý xuất nhập khẩu Robusta', 40.0, 15.0, DATEADD(month, -7, GETDATE()), DATEADD(day, -2, GETDATE()), 'caa1658e-7055-4d7d-8c94-810aac98b4f4');

SET IDENTITY_INSERT [dbo].[InventoryReceipts] OFF;
GO

USE [BaseCoreSales3];
GO

-- 1. Xóa bảng log cũ đi để làm lại cấu trúc mới cho chuẩn
DROP TABLE IF EXISTS [dbo].[InventoryLogs];
GO

-- 2. Tạo bảng Log mới phục vụ cho Kho nguyên liệu thô theo lô
-- 2. Tạo bảng Log mới với kiểu dữ liệu ModifiedBy tự động khớp theo cấu trúc hệ thống của bạn
DROP TABLE IF EXISTS [dbo].[RawMaterialLogs];
GO


-- 2. Tạo lại bảng Log mới với kiểu dữ liệu NVARCHAR đồng bộ hệ thống
CREATE TABLE [dbo].[RawMaterialLogs] (
    [Id]               INT IDENTITY (1, 1) NOT NULL,
    [RawMaterialId]    INT                 NOT NULL, -- Log này thuộc về loại hạt nào
    [ReceiptId]        INT                 NULL,     -- Log này tác động vào lô hàng nào (Cho phép NULL nếu thay đổi tổng quan)
    [Action]           NVARCHAR(100)       NOT NULL, -- 'NHAP_KHO', 'XUAT_RANG', 'HUY_HANG_HET_HAN'
    [OldQuantity]      FLOAT               NOT NULL, -- Số lượng trước khi thay đổi
    [NewQuantity]      FLOAT               NOT NULL, -- Số lượng sau khi thay đổi
    [Reason]           NVARCHAR(500)       NULL,     -- Lý do thay đổi kho
    
    -- ĐỔI THÀNH NVARCHAR(450) ĐỂ TRÙNG KIỂU VỚI ID CỦA BẢNG USERS (Định dạng chuỗi của C# Identity)
    [ModifiedBy]       NVARCHAR(450)       NULL,     
    [ModifiedDate]     DATETIME            NOT NULL DEFAULT GETDATE(),

    CONSTRAINT [PK_RawMaterialLogs] PRIMARY KEY CLUSTERED ([Id] ASC),
    
    CONSTRAINT [FK_RawMaterialLogs_RawMaterials] 
        FOREIGN KEY ([RawMaterialId]) REFERENCES [dbo].[RawMaterials] ([Id]) ON DELETE CASCADE,
        
    CONSTRAINT [FK_RawMaterialLogs_Receipts] 
        FOREIGN KEY ([ReceiptId]) REFERENCES [dbo].[InventoryReceipts] ([Id]) ON DELETE NO ACTION,
        
    CONSTRAINT [FK_RawMaterialLogs_Users] 
        FOREIGN KEY ([ModifiedBy]) REFERENCES [dbo].[Users] ([Id]) ON DELETE SET NULL
);
GO