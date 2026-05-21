-- Seed users extracted from CNPM_THN.sql into the current project database.
-- Run this script against your existing local database, not master.
-- If needed, uncomment and change the next line:
-- USE [Dataset];

SET NOCOUNT ON;

PRINT '== Seed users from CNPM_THN.sql ==';

IF OBJECT_ID(N'dbo.Users', N'U') IS NULL
BEGIN
    THROW 50001, 'Table dbo.Users does not exist. Run the base database script/migrations first.', 1;
END;

IF OBJECT_ID('tempdb..#SeedUsers') IS NOT NULL
    DROP TABLE #SeedUsers;

CREATE TABLE #SeedUsers (
    Id NVARCHAR(450) NOT NULL,
    Name NVARCHAR(100) NOT NULL,
    UserName NVARCHAR(50) NOT NULL,
    Password NVARCHAR(MAX) NOT NULL,
    SaltText NVARCHAR(MAX) NOT NULL,
    Contact NVARCHAR(MAX) NULL,
    Email NVARCHAR(100) NOT NULL,
    Phone NVARCHAR(20) NULL,
    Position NVARCHAR(MAX) NULL,
    Image NVARCHAR(MAX) NULL,
    IsActive BIT NOT NULL,
    UserType INT NOT NULL,
    Created DATETIME2 NOT NULL
);

INSERT INTO #SeedUsers (Id, Name, UserName, Password, SaltText, Contact, Email, Phone, Position, Image, IsActive, UserType, Created)
VALUES
(N'2a596aa8-d490-4d2d-a780-1f86ed664cf5', N'Trương Văn An', N'an', N'$2a$11$6B7MyD70fhZaDK46n8G/e./kITWMAt19Lu9ICBRWAVUol6xl4sgHa', N'36d0c33e', N'Số 28 Hoàng Văn Thụ Ninh Bình', N'an@gmail.com', N'0945862369', N'Quản lí kho', N'/uploads/profiles/972e03f2-ddda-4011-9e15-18285bdd26b7.jpg', 1, 3, '2026-05-21T16:52:13.5861499'),
(N'40695048-1f0f-45e1-b622-9433e41f7cd3', N'Lê Thế Bình', N'binh', N'$2a$11$B.DJ1QP103C1n4kyF9XEfOoaXRDBxFQun09pZqM2JSx37GoVtCcOi', N'd5ed1805', N'Số 39 Đống Đa Hà Nội', N'binh@gmail.com', N'0258965324', N'Khách hàng', N'/uploads/profiles/5780e403-545f-45a8-9827-c7f379a457e3.jpg', 1, 0, '2026-05-18T09:25:52.2931001'),
(N'431df51b-82f0-4cae-bc23-0ec213daae39', N'Phạm Tiến Dũng', N'dungpham', N'$2a$11$BNqAAszJaidMat.smEw59usUa9LiLUoWzNOlAvAPqJ3Ok7a.z6GgK', N'd030317b', N'Số 2 Hoàng Nam Hà Nội', N'dungpham@gmail.com', N'0258964456', N'Nhân viên', N'/uploads/profiles/3612b8e4-dd5a-4cca-86c0-d97a17856c11.jpg', 1, 2, '2026-05-20T13:32:17.2164897'),
(N'4f48b5b9-204e-49d7-8313-2e4a6acce605', N'Thái Em', N'em', N'$2a$11$vCL.YY2gBlX5v21w/uFateAvQhnCz10dxxj.pa5eaU9yZPyr9EuXi', N'42f92932', N'Số 2 Ngô Quyền Phú Thọ', N'em@gmail.com', N'0375421905', N'Quản trị viên', N'/uploads/profiles/a26c000c-9226-489d-b88f-edfb8a91817a.jpg', 1, 1, '2026-05-14T15:32:47.9272426'),
(N'6252084d-3aec-4703-b308-777c3a41b61d', N'Nguyễn MInh Nhật', N'staff', N'$2a$11$q.y0M9ILkc7zz9bP7CZUNuuX1UnX.l7AgwNXFSezJUN/jr/XrKF6S', N'b705b0ab', N'Số 35 Trần Phú Hà Nội', N'nhanvien@gmail.com', N'0213654789', N'Nhân Viên', N'/uploads/profiles/1069cee6-e216-47ed-814d-de537847b8d8.jpg', 1, 2, '2026-05-14T16:06:36.7544651'),
(N'80459c92-67dd-4961-bea0-4049674052c9', N'Vũ Nam Khánh', N'khanh', N'$2a$11$NV8BRFRbdo1lFHmGUbYTLOrxuQCgVViJ79CTDShd5DlGGKtOIrpuy', N'2535e74a', N'Số 18 Nam Du Bình Định', N'khanh@gmail.com', N'0324587569', N'Quản trị viên', N'/uploads/profiles/1069cee6-e216-47ed-814d-de537847b8d8.jpg', 1, 1, '2026-05-14T16:05:42.9610479'),
(N'a5109ae1-7f63-4efe-82d6-dd5bee4a3e46', N'Đình Tư', N'tu', N'$2a$11$YrC8Ij1/ITQBMkl18IGP0.mK2LIUx.f.8J/a3HsL9A5YZcMbS/KWC', N'b157e4cc', N'Số 23 Cầu Giấy Hà Nội', N'tu@gmail.com', N'0375698526', N'Khách hàng', N'/uploads/profiles/28ff2b19-d5e9-44a1-8afd-09fa71915ba7.jpg', 1, 0, '2026-05-14T21:43:35.9615310'),
(N'b1416854-f0f6-486a-bb89-117de1856458', N'Huỳnh Tiến Hùng', N'hung', N'$2a$11$JDGZU8egBO3ggzVPJ0D.6Oigxkr17qelUr6aIsJ9zTzi4C46Tr5ni', N'3bbe2267', N'Số 12 Hoàng Liệt HÀ Nội', N'hung@gmaill.com', N'0698754852', N'Khách hàng', N'/uploads/profiles/880b7d2a-98f8-4523-8142-c25ef921ac52.jpg', 1, 0, '2026-05-18T14:10:44.0854293'),
(N'b617d618-eb7f-46bb-8f86-8ea5e8687142', N'Trần Tùng', N'tung', N'$2a$11$YSPTOBrZrHdsrMYOKCiTUu6BW/ThaWdPwRnES7IGf19BP9Dv/lhoC', N'17e2ea0d', N'Số 92 Nguyễn Thái Học', N'tung@gmail.com', N'0369528541', N'Nhân viên', N'/uploads/profiles/3d63b4d5-7055-4f25-ab7c-5296159d45f0.jpg', 1, 2, '2026-05-18T16:05:57.7619149'),
(N'caa1658e-7055-4d7d-8c94-810aac98b4f4', N'Nam Per', N'nam', N'$2a$11$faciqw8WxnQEWZUtd17kOOzB3AUFKws9c3PTruoubmPYNVCDWGn.e', N'aa1cb184', N'Số 59 Vọng Dịch Hậu Hà Nội', N'nam@gmail.com', N'0351289657', N'Quản lí kho', N'/uploads/profiles/3ee4dc3e-911e-4109-b955-0bcee8293e20.jpg', 1, 3, '2026-05-17T09:10:29.5682824'),
(N'ce42c628-5c33-4ac4-b1bb-0e3d26680b0e', N'Quản Anh Minh', N'minh', N'$2a$11$9xyMTi7/YB69LMKQUUs1peIF8xC7C6R0N7Qd9Rfbg85aqAONn5U2K', N'aa8db7b8', N'Số 25 Cầu Giấy Hà Nội', N'minh@gmail.com', N'0357896258', N'Khách hàng', N'/uploads/profiles/572b38fb-ac00-4708-9eff-348f541046b1.jpg', 1, 0, '2026-05-18T09:28:20.9498539'),
(N'eb397606-45c6-4c03-9722-fd036736f1ae', N'Nguyễn Tuấn Nam', N'user', N'$2a$11$OnuALrHCGwpInI3YWwLgvuUA96VGSLh1aR/8Gzh7/m2v2Yg7vgA7K', N'ba28e012', N'Số 98 Âu Cơ Ninh Bình', N'khachhang@gmail.com', N'0325654897', N'Khách hàng', N'/uploads/profiles/3ee4dc3e-911e-4109-b955-0bcee8293e20.jpg', 1, 0, '2026-05-14T16:07:01.5578696'),
(N'fa3c3768-5cf6-4be0-8716-df6a1e766182', N'Cảnh Hiệp', N'hiep', N'$2a$11$V.Z6XUV/BU/CX0.gN.8OwOJnwWSd1XtITfY6dEpHYYAzEAmQzNfsu', N'4b6c78f3', N'Số 4 Hai Bà Trưng Hà Nội', N'hiep@gmail.com', N'0259874563', N'Quản trị viên', N'/uploads/profiles/1069cee6-e216-47ed-814d-de537847b8d8.jpg', 1, 1, '2026-05-14T16:05:22.5433002');

DECLARE @SaltType SYSNAME = (
    SELECT TYPE_NAME(system_type_id)
    FROM sys.columns
    WHERE object_id = OBJECT_ID(N'dbo.Users') AND name = N'Salt'
);

IF @SaltType IN (N'binary', N'varbinary', N'image')
BEGIN
    INSERT INTO dbo.Users (Id, Name, UserName, Password, Salt, Contact, Email, Phone, Position, Image, IsActive, UserType, Created)
    SELECT
        s.Id,
        s.Name,
        s.UserName,
        s.Password,
        CONVERT(VARBINARY(MAX), s.SaltText),
        s.Contact,
        s.Email,
        s.Phone,
        s.Position,
        s.Image,
        s.IsActive,
        s.UserType,
        s.Created
    FROM #SeedUsers s
    WHERE NOT EXISTS (SELECT 1 FROM dbo.Users u WHERE u.Id = s.Id)
      AND NOT EXISTS (SELECT 1 FROM dbo.Users u WHERE u.UserName = s.UserName);
END
ELSE
BEGIN
    INSERT INTO dbo.Users (Id, Name, UserName, Password, Salt, Contact, Email, Phone, Position, Image, IsActive, UserType, Created)
    SELECT
        s.Id,
        s.Name,
        s.UserName,
        s.Password,
        s.SaltText,
        s.Contact,
        s.Email,
        s.Phone,
        s.Position,
        s.Image,
        s.IsActive,
        s.UserType,
        s.Created
    FROM #SeedUsers s
    WHERE NOT EXISTS (SELECT 1 FROM dbo.Users u WHERE u.Id = s.Id)
      AND NOT EXISTS (SELECT 1 FROM dbo.Users u WHERE u.UserName = s.UserName);
END;

PRINT CONCAT('Inserted users: ', @@ROWCOUNT);

SELECT Id, UserName, Name, Email, UserType, Position
FROM dbo.Users
WHERE UserName IN (SELECT UserName FROM #SeedUsers)
ORDER BY UserType DESC, UserName;

DROP TABLE #SeedUsers;

PRINT 'Done seeding users.';
