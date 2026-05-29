IF OBJECT_ID(N'dbo.UserVouchers', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.UserVouchers (
        Id INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_UserVouchers PRIMARY KEY,
        UserId NVARCHAR(450) NOT NULL,
        VoucherId INT NOT NULL,
        OrderId INT NULL,
        IsUsed BIT NOT NULL CONSTRAINT DF_UserVouchers_IsUsed DEFAULT 0,
        AssignedAt DATETIME NOT NULL CONSTRAINT DF_UserVouchers_AssignedAt DEFAULT GETDATE(),
        UsedAt DATETIME NULL,
        Source NVARCHAR(30) NOT NULL CONSTRAINT DF_UserVouchers_Source DEFAULT N'public',
        CONSTRAINT FK_UserVouchers_Users FOREIGN KEY (UserId) REFERENCES dbo.Users(Id),
        CONSTRAINT FK_UserVouchers_Vouchers FOREIGN KEY (VoucherId) REFERENCES dbo.Vouchers(Id),
        CONSTRAINT FK_UserVouchers_Orders FOREIGN KEY (OrderId) REFERENCES dbo.Orders(Id)
    );

    CREATE INDEX IX_UserVouchers_UserId_VoucherId_Source
        ON dbo.UserVouchers(UserId, VoucherId, Source);
END

INSERT INTO dbo.UserVouchers (UserId, VoucherId, OrderId, IsUsed, AssignedAt, UsedAt, Source)
SELECT
    u.Id,
    v.Id,
    NULL,
    CASE WHEN v.UsedCount > 0 THEN 1 ELSE 0 END,
    ISNULL(v.CreatedAt, GETDATE()),
    CASE WHEN v.UsedCount > 0 THEN ISNULL(v.CreatedAt, GETDATE()) ELSE NULL END,
    N'loyalty'
FROM dbo.Vouchers v
JOIN dbo.Users u
    ON v.Code LIKE N'LOYALTY' + UPPER(LEFT(REPLACE(u.Id, N'-', N''), 6)) + N'%'
WHERE v.Code LIKE N'LOYALTY%'
  AND NOT EXISTS (
      SELECT 1
      FROM dbo.UserVouchers uv
      WHERE uv.UserId = u.Id
        AND uv.VoucherId = v.Id
        AND uv.Source = N'loyalty'
  );
