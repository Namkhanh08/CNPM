using CNPM_TTN.Entities;
using Microsoft.EntityFrameworkCore;

namespace CNPM_TTN
{
    /// <summary>
    /// Tách seed data ra khỏi Program.cs để giữ Program.cs gọn gàng.
    /// </summary>
    public static class DbSeeder
    {
        public static void SeedTraceabilityData(IServiceProvider services)
        {
            using var scope = services.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<ShopCoffeeContext>();

            try
            {
                SeedProductTraceability(context);
                SeedBatchTraceability(context);
                context.SaveChanges();
            }
            catch (Exception ex)
            {
                var logger = scope.ServiceProvider.GetRequiredService<ILogger<ShopCoffeeContext>>();
                logger.LogError(ex, "Lỗi khi seed traceability data: {Message}", ex.Message);
            }
        }

        private static void SeedProductTraceability(ShopCoffeeContext context)
        {
            var morningProduct = context.Products
                .Include(p => p.ProductDetails)
                .FirstOrDefault(p => p.Name == "REVO Morning");

            if (morningProduct != null)
            {
                var detail = morningProduct.ProductDetails.FirstOrDefault();
                if (detail != null && string.IsNullOrEmpty(detail.TraceabilityData))
                {
                    detail.TraceabilityData = """
                        {
                          "FarmingZone": {
                            "Name": "Cầu Đất, Lâm Đồng",
                            "Altitude": "1600m",
                            "Soil": "Đất đỏ Bazan núi lửa cổ",
                            "Climate": "Khí hậu cận nhiệt đới ôn hòa, nhiều sương mù",
                            "Description": "Cầu Đất là thiên đường Arabica của Việt Nam nhờ độ cao lý tưởng và biên độ nhiệt độ ngày đêm lớn giúp hạt tích tụ đường tốt.",
                            "Image": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=600"
                          },
                          "Farmer": {
                            "Name": "Hợp tác xã nông nghiệp hữu cơ Cầu Đất",
                            "Scale": "25 héc-ta",
                            "FarmingMethod": "Canh tác hữu cơ, bón phân vi sinh tự ủ, thu hái chín thủ công 100%",
                            "Story": "HTX liên kết 15 hộ nông dân dân tộc thiểu số tại địa phương, cam kết không dùng thuốc trừ sâu hóa học để bảo vệ nguồn nước và đất."
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
                        }
                        """;
                }
            }

            var everydayProduct = context.Products
                .Include(p => p.ProductDetails)
                .FirstOrDefault(p => p.Name == "REVO Everyday");

            if (everydayProduct != null)
            {
                var detail = everydayProduct.ProductDetails.FirstOrDefault();
                if (detail != null && string.IsNullOrEmpty(detail.TraceabilityData))
                {
                    detail.TraceabilityData = """
                        {
                          "FarmingZone": {
                            "Name": "Ea H'leo, Đắk Lắk & Cầu Đất, Lâm Đồng",
                            "Altitude": "800m - 1500m",
                            "Soil": "Đất đỏ bazan giàu dinh dưỡng",
                            "Climate": "Mùa khô ráo nắng ấm và mùa mưa ôn hòa",
                            "Description": "Sự kết hợp hoàn hảo từ vùng Robusta Buôn Ma Thuột đậm đà và vùng Arabica Cầu Đất thơm thanh nhẹ.",
                            "Image": "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=600"
                          },
                          "Farmer": {
                            "Name": "Liên hiệp nông hộ Revo Farm Đắk Lắk",
                            "Scale": "40 héc-ta",
                            "FarmingMethod": "Phương pháp xen canh cây che bóng (Shade-grown), tưới nước nhỏ giọt tiết kiệm",
                            "Story": "Các nông hộ áp dụng canh tác bảo tồn đa dạng sinh học, trồng xen tiêu và bơ để tạo môi trường tự nhiên cho cây cà phê phát triển."
                          },
                          "Certifications": [
                            {
                              "Name": "Organic EU",
                              "Issuer": "Control Union Certifications",
                              "ExpiryDate": "2027-06-30T00:00:00",
                              "Image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRz-kGv3tX15wKx_k5d0P1GzLpT0cEuhqYFJQ&s"
                            }
                          ]
                        }
                        """;
                }
            }
        }

        private static void SeedBatchTraceability(ShopCoffeeContext context)
        {
            var batch7 = context.RoastingBatches.FirstOrDefault(rb => rb.BatchCode == "BATCH-007");
            if (batch7 != null && string.IsNullOrEmpty(batch7.TraceabilityData))
            {
                batch7.TraceabilityData = """
                    {
                      "FarmingZone": {
                        "Name": "Cầu Đất, Lâm Đồng (Lô BATCH-007)",
                        "Altitude": "1650m",
                        "Soil": "Đất đỏ Bazan núi lửa cổ",
                        "Climate": "Khí hậu ôn đới quanh năm, sương mù dày đặc",
                        "Description": "Lô hàng đặc biệt thu hoạch từ đỉnh sườn đồi Cầu Đất, có hương hoa nhài cực kỳ nổi trội.",
                        "Image": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=600"
                      },
                      "Farmer": {
                        "Name": "Nông hộ ông Nguyễn Văn A - HTX Cầu Đất",
                        "Scale": "2 héc-ta",
                        "FarmingMethod": "Hái chín tay chọn lọc 100%, sơ chế Honey tỉ mỉ",
                        "Story": "Gói cà phê này được thu hái bởi chính tay gia đình ông A trong vụ mùa đầu năm 2026."
                      },
                      "Certifications": [
                        {
                          "Name": "VietGAP",
                          "Issuer": "Sở Nông nghiệp Lâm Đồng",
                          "ExpiryDate": "2028-12-31T00:00:00",
                          "Image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRz-kGv3tX15wKx_k5d0P1GzLpT0cEuhqYFJQ&s"
                        }
                      ]
                    }
                    """;
            }

            var batchCnn = context.RoastingBatches.FirstOrDefault(rb => rb.BatchCode == "CNN-01");
            if (batchCnn != null && string.IsNullOrEmpty(batchCnn.TraceabilityData))
            {
                batchCnn.TraceabilityData = """
                    {
                      "FarmingZone": {
                        "Name": "Ea H'leo, Đắk Lắk",
                        "Altitude": "850m",
                        "Soil": "Đất đỏ bazan phong hóa",
                        "Climate": "Khí hậu nhiệt đới gió mùa nóng ẩm",
                        "Description": "Khu vực Ea H'leo cho ra đời hạt Robusta có thể chất rất dày (Full Body) cùng vị đắng sô-cô-la đặc trưng.",
                        "Image": "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=600"
                      },
                      "Farmer": {
                        "Name": "Hợp tác xã Nông nghiệp Ea H'leo",
                        "Scale": "10 héc-ta",
                        "FarmingMethod": "Canh tác sinh thái tự nhiên, tưới nhỏ giọt",
                        "Story": "Lô mẻ rang CNN-01 được phối chế từ các hạt Robusta chất lượng cao nhất của HTX Ea H'leo."
                      },
                      "Certifications": [
                        {
                          "Name": "Organic EU",
                          "Issuer": "Control Union Certifications",
                          "ExpiryDate": "2027-06-30T00:00:00",
                          "Image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRz-kGv3tX15wKx_k5d0P1GzLpT0cEuhqYFJQ&s"
                        }
                      ]
                    }
                    """;
            }
        }
    }
}
