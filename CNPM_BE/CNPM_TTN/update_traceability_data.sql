/*
  Cap nhat du lieu truy xuat nguon goc cho DB local SQL Server.

  Cach chay goi y:
  1. Mo SQL Server Management Studio / Azure Data Studio.
  2. Chon dung database cua project trong appsettings.json.
  3. Chay file nay.

  File nay co the chay nhieu lan:
  - Neu thieu cot TraceabilityData thi tu them cot.
  - Neu da co cot thi chi cap nhat du lieu mau.
*/

SET NOCOUNT ON;

BEGIN TRY
    BEGIN TRANSACTION;

    IF COL_LENGTH('dbo.ProductDetails', 'TraceabilityData') IS NULL
    BEGIN
        ALTER TABLE dbo.ProductDetails
        ADD TraceabilityData NVARCHAR(MAX) NULL;
    END;

    IF COL_LENGTH('dbo.RoastingBatches', 'TraceabilityData') IS NULL
    BEGIN
        ALTER TABLE dbo.RoastingBatches
        ADD TraceabilityData NVARCHAR(MAX) NULL;
    END;

    UPDATE pd
    SET TraceabilityData = N'{
      "FarmingZone": {
        "Name": "Cầu Đất, Lâm Đồng",
        "Altitude": "1600m",
        "Soil": "Đất đỏ bazan núi lửa cổ",
        "Climate": "Khí hậu cận nhiệt đới ôn hòa, nhiều sương mù",
        "Description": "Cầu Đất là vùng Arabica nổi tiếng của Việt Nam nhờ độ cao lý tưởng và biên độ nhiệt ngày đêm lớn, giúp hạt cà phê tích lũy vị ngọt tự nhiên.",
        "Image": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=600"
      },
      "Farmer": {
        "Name": "Hợp tác xã nông nghiệp hữu cơ Cầu Đất",
        "Scale": "25 héc-ta",
        "FarmingMethod": "Canh tác hữu cơ, bón phân vi sinh tự ủ, thu hái chín thủ công 100%",
        "Story": "HTX liên kết các hộ nông dân địa phương, ưu tiên bảo vệ đất, nguồn nước và duy trì chất lượng hạt ổn định qua từng mùa vụ."
      },
      "Certifications": [
        {
          "Name": "VietGAP",
          "Issuer": "Trung tâm Khảo nghiệm Khuyến nông Lâm Đồng",
          "ExpiryDate": "2027-12-31T00:00:00",
          "Image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRz-kGv3tX15wKx_k5d0P1GzLpT0cEuhqYFJQ&s"
        },
        {
          "Name": "UTZ Certified",
          "Issuer": "Rainforest Alliance",
          "ExpiryDate": "2026-09-30T00:00:00",
          "Image": "https://utz.org/wp-content/uploads/2016/01/UTZ_label_green_RGB.jpg"
        }
      ]
    }'
    FROM dbo.ProductDetails pd
    INNER JOIN dbo.Products p ON p.Id = pd.ProductId
    WHERE p.Name = N'REVO Morning';

    UPDATE pd
    SET TraceabilityData = N'{
      "FarmingZone": {
        "Name": "Ea H''leo, Đắk Lắk & Cầu Đất, Lâm Đồng",
        "Altitude": "800m - 1500m",
        "Soil": "Đất đỏ bazan giàu dinh dưỡng",
        "Climate": "Mùa khô ráo nắng ấm và mùa mưa ôn hòa",
        "Description": "Sự kết hợp giữa Robusta Đắk Lắk đậm vị và Arabica Cầu Đất thơm thanh tạo nên hồ sơ hương vị cân bằng cho REVO Everyday.",
        "Image": "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=600"
      },
      "Farmer": {
        "Name": "Liên hiệp nông hộ Revo Farm Đắk Lắk",
        "Scale": "40 héc-ta",
        "FarmingMethod": "Xen canh cây che bóng, tưới nhỏ giọt tiết kiệm và quản lý đất theo hướng bền vững",
        "Story": "Các nông hộ trồng xen tiêu và bơ để tạo bóng mát, tăng đa dạng sinh học và giữ độ ẩm tự nhiên cho vườn cà phê."
      },
      "Certifications": [
        {
          "Name": "Organic EU",
          "Issuer": "Control Union Certifications",
          "ExpiryDate": "2027-06-30T00:00:00",
          "Image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRz-kGv3tX15wKx_k5d0P1GzLpT0cEuhqYFJQ&s"
        }
      ]
    }'
    FROM dbo.ProductDetails pd
    INNER JOIN dbo.Products p ON p.Id = pd.ProductId
    WHERE p.Name = N'REVO Everyday';

    UPDATE rb
    SET TraceabilityData = N'{
      "FarmingZone": {
        "Name": "Cầu Đất, Lâm Đồng (Lô BATCH-007)",
        "Altitude": "1650m",
        "Soil": "Đất đỏ bazan núi lửa cổ",
        "Climate": "Khí hậu ôn đới quanh năm, sương mù dày đặc",
        "Description": "Lô BATCH-007 được chọn từ khu vực sườn đồi cao tại Cầu Đất, ưu tiên trái chín đỏ và sơ chế Honey để giữ vị ngọt.",
        "Image": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=600"
      },
      "Farmer": {
        "Name": "Nông hộ Nguyễn Văn A - HTX Cầu Đất",
        "Scale": "2 héc-ta",
        "FarmingMethod": "Hái chín tay chọn lọc 100%, sơ chế Honey tỉ mỉ",
        "Story": "Mẻ cà phê này được thu hái trong vụ đầu năm 2026, ghi nhận riêng theo lô để phục vụ truy xuất nguồn gốc."
      },
      "Certifications": [
        {
          "Name": "VietGAP",
          "Issuer": "Sở Nông nghiệp Lâm Đồng",
          "ExpiryDate": "2028-12-31T00:00:00",
          "Image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRz-kGv3tX15wKx_k5d0P1GzLpT0cEuhqYFJQ&s"
        }
      ]
    }'
    FROM dbo.RoastingBatches rb
    WHERE rb.BatchCode = N'BATCH-007';

    UPDATE rb
    SET TraceabilityData = N'{
      "FarmingZone": {
        "Name": "Ea H''leo, Đắk Lắk",
        "Altitude": "850m",
        "Soil": "Đất đỏ bazan phong hóa",
        "Climate": "Khí hậu nhiệt đới gió mùa nóng ẩm",
        "Description": "Khu vực Ea H''leo cho hạt Robusta có body dày, vị đắng sô-cô-la và hậu vị rõ, phù hợp cho mẻ rang CNN-01.",
        "Image": "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=600"
      },
      "Farmer": {
        "Name": "Hợp tác xã Nông nghiệp Ea H''leo",
        "Scale": "10 héc-ta",
        "FarmingMethod": "Canh tác sinh thái tự nhiên, tưới nhỏ giọt",
        "Story": "Lô CNN-01 được phối chế từ các hạt Robusta chất lượng cao của HTX, kiểm soát riêng theo phiếu nhập nguyên liệu."
      },
      "Certifications": [
        {
          "Name": "Organic EU",
          "Issuer": "Control Union Certifications",
          "ExpiryDate": "2027-06-30T00:00:00",
          "Image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRz-kGv3tX15wKx_k5d0P1GzLpT0cEuhqYFJQ&s"
        }
      ]
    }'
    FROM dbo.RoastingBatches rb
    WHERE rb.BatchCode = N'CNN-01';

    COMMIT TRANSACTION;

    SELECT
        p.Id AS ProductId,
        p.Name AS ProductName,
        CASE WHEN pd.TraceabilityData IS NULL THEN N'Chưa có' ELSE N'Đã có' END AS ProductTraceability
    FROM dbo.Products p
    LEFT JOIN dbo.ProductDetails pd ON pd.ProductId = p.Id
    WHERE p.Name IN (N'REVO Morning', N'REVO Everyday')
    ORDER BY p.Id;

    SELECT
        rb.Id AS BatchId,
        rb.BatchCode,
        rb.Status,
        CASE WHEN rb.TraceabilityData IS NULL THEN N'Chưa có' ELSE N'Đã có' END AS BatchTraceability
    FROM dbo.RoastingBatches rb
    WHERE rb.BatchCode IN (N'BATCH-007', N'CNN-01')
    ORDER BY rb.Id;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
        ROLLBACK TRANSACTION;

    THROW;
END CATCH;
