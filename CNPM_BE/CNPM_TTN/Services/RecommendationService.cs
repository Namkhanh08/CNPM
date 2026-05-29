using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CNPM_TTN.Dtos;
using CNPM_TTN.Entities;
using Microsoft.EntityFrameworkCore;

namespace CNPM_TTN.Services
{
    public class RecommendationService : IRecommendationService
    {
        private readonly ShopCoffeeContext _context;

        public RecommendationService(ShopCoffeeContext context)
        {
            _context = context;
        }

        public async Task<RecommendationResponseDto> GetRecommendationAsync(RecommendationRequestDto request)
        {
            // Lấy tất cả sản phẩm có chi tiết từ DB
            var dbProducts = await _context.Products
                .Include(p => p.ProductDetails)
                .ToListAsync();

            var scoredList = new List<ScoredProduct>();

            foreach (var p in dbProducts)
            {
                var detail = p.ProductDetails.FirstOrDefault();
                if (detail == null) continue;

                // Áp dụng thuật toán so khớp dựa trên khoảng cách Euclidean Vector tối ưu
                double uRoast = request.Roast?.ToLower() switch { "light" => 1, "medium" => 2, "dark" => 3, _ => 2 };
                double uFlavor = request.Flavor?.ToLower() switch { "floral" => 1, "chocolate" => 2, "bold" => 3, _ => 2 };
                double uMethod = request.Method?.ToLower() switch { "phin" => 1, "espresso" => 2, "pour" => 3, _ => 2 };
                double uTime = request.TimeOfDay?.ToLower() switch { "morning" => 1, "afternoon" => 2, "evening" => 3, _ => 1 };

                double pRoast = GetRoastValue(detail.Roast);
                double pFlavor = GetFlavorValue(detail.FlavorNotes, detail.MatchTags);
                double pMethod = GetMethodValue(detail.MatchTags, detail.Process);
                double pTime = GetTimeValue(detail.BestTime, pRoast, pFlavor);

                // Tính khoảng cách Euclidean có trọng số (Độ rang: 1.5, Hương vị: 1.2, Cách pha: 1.0, Thời gian: 0.8)
                double distance = Math.Sqrt(
                    Math.Pow(uRoast - pRoast, 2) * 1.5 +
                    Math.Pow(uFlavor - pFlavor, 2) * 1.2 +
                    Math.Pow(uMethod - pMethod, 2) * 1.0 +
                    Math.Pow(uTime - pTime, 2) * 0.8
                );

                double maxDistance = 4.24; // Khoảng cách lớn nhất có thể có
                int score = (int)(98 - (distance / maxDistance) * 38);
                if (score < 50) score = 50;
                if (score > 98) score = 98;

                // Tách nốt hương vị thành mảng
                var flavorNotesList = new List<string>();
                if (!string.IsNullOrEmpty(detail.FlavorNotes))
                {
                    flavorNotesList = detail.FlavorNotes
                        .Split(new[] { ',', ';', '-' }, StringSplitOptions.RemoveEmptyEntries)
                        .Select(f => f.Trim())
                        .Where(f => !string.IsNullOrEmpty(f))
                        .ToList();
                }

                if (flavorNotesList.Count == 0)
                {
                    flavorNotesList.Add("Đặc trưng");
                }

                // Thiết lập Subtitle & Reason động
                string subtitle = $"{detail.Roast ?? "Rang vừa"} – {detail.Process ?? "Chế biến ướt"} – Pha {request.Method?.ToUpper() ?? "Espresso"}";
                
                string reason = $"Dựa trên sở thích của bạn về hương vị {GetFlavorText(request.Flavor)}, độ rang {GetRoastText(request.Roast)} và cách pha {GetMethodText(request.Method)}. ";
                reason += $"Sản phẩm {p.Name} được gợi ý vì có các nốt hương nổi bật của {string.Join(", ", flavorNotesList.Take(3))}, kết hợp với phong cách chế biến {detail.Process ?? "tiêu chuẩn"} mang lại trải nghiệm thưởng thức trọn vẹn nhất cho bạn.";

                scoredList.Add(new ScoredProduct
                {
                    Score = score,
                    Dto = new RecommendationResultDto
                    {
                        ProductId = p.Id,
                        Name = p.Name,
                        Subtitle = subtitle,
                        Reason = reason,
                        FlavorNotes = flavorNotesList,
                        MatchScore = score,
                        Price = p.Price,
                        ImageUrl = p.ImageUrl ?? "https://images.unsplash.com/photo-1511537190424-bbbab87ac5eb?w=600&q=80"
                    }
                });
            }

            // Sắp xếp theo điểm giảm dần
            var sorted = scoredList.OrderByDescending(x => x.Score).ToList();

            var response = new RecommendationResponseDto();

            if (sorted.Count > 0)
            {
                response.MainSuggestion = sorted[0].Dto;
                response.OtherSuggestions = sorted.Skip(1).Take(3).Select(x => x.Dto).ToList();
            }
            else
            {
                // Fallback: lấy sản phẩm thật từ DB (top 4 theo Id)
                var fallbackProducts = await _context.Products
                    .Include(p => p.ProductDetails)
                    .OrderBy(p => p.Id)
                    .Take(4)
                    .ToListAsync();

                if (fallbackProducts.Count > 0)
                {
                    var first = fallbackProducts[0];
                    var firstDetail = first.ProductDetails.FirstOrDefault();
                    response.MainSuggestion = new RecommendationResultDto
                    {
                        ProductId = first.Id,
                        Name = first.Name,
                        Subtitle = $"{firstDetail?.Roast ?? "Rang vừa"} – {firstDetail?.Process ?? "Chế biến ướt"}",
                        Reason = "Đây là sản phẩm nổi bật của chúng tôi, phù hợp với nhiều gu thưởng thức.",
                        FlavorNotes = string.IsNullOrEmpty(firstDetail?.FlavorNotes)
                            ? new List<string> { "Đặc trưng" }
                            : firstDetail.FlavorNotes.Split(new[] { ',', ';', '-' }, StringSplitOptions.RemoveEmptyEntries)
                                .Select(f => f.Trim()).Where(f => !string.IsNullOrEmpty(f)).ToList(),
                        MatchScore = 60,
                        Price = first.Price,
                        ImageUrl = first.ImageUrl ?? "https://images.unsplash.com/photo-1511537190424-bbbab87ac5eb?w=600&q=80"
                    };
                    response.OtherSuggestions = fallbackProducts.Skip(1).Select(p =>
                    {
                        var d = p.ProductDetails.FirstOrDefault();
                        return new RecommendationResultDto
                        {
                            ProductId = p.Id,
                            Name = p.Name,
                            Subtitle = $"{d?.Roast ?? "Rang vừa"} – {d?.Process ?? "Chế biến ướt"}",
                            Reason = "Gợi ý thêm từ bộ sưu tập của chúng tôi.",
                            FlavorNotes = string.IsNullOrEmpty(d?.FlavorNotes)
                                ? new List<string> { "Đặc trưng" }
                                : d.FlavorNotes.Split(new[] { ',', ';', '-' }, StringSplitOptions.RemoveEmptyEntries)
                                    .Select(f => f.Trim()).Where(f => !string.IsNullOrEmpty(f)).ToList(),
                            MatchScore = 55,
                            Price = p.Price,
                            ImageUrl = p.ImageUrl ?? "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=80"
                        };
                    }).ToList();
                }
                else
                {
                    // DB hoàn toàn rỗng → dùng hardcode cuối cùng
                    response.MainSuggestion = GetFallbackMain();
                    response.OtherSuggestions = GetFallbackOthers();
                }
            }

            // Đảm bảo đủ 3 gợi ý khác: lấy thêm từ DB nếu thiếu
            if (response.OtherSuggestions.Count < 3)
            {
                var existingIds = new HashSet<int>(response.OtherSuggestions.Select(o => o.ProductId));
                if (response.MainSuggestion != null) existingIds.Add(response.MainSuggestion.ProductId);

                var extras = await _context.Products
                    .Include(p => p.ProductDetails)
                    .Where(p => !existingIds.Contains(p.Id))
                    .OrderBy(p => p.Id)
                    .Take(3 - response.OtherSuggestions.Count)
                    .ToListAsync();

                foreach (var ep in extras)
                {
                    var d = ep.ProductDetails.FirstOrDefault();
                    response.OtherSuggestions.Add(new RecommendationResultDto
                    {
                        ProductId = ep.Id,
                        Name = ep.Name,
                        Subtitle = $"{d?.Roast ?? "Rang vừa"} – {d?.Process ?? "Chế biến ướt"}",
                        Reason = "Gợi ý thêm từ bộ sưu tập của chúng tôi.",
                        FlavorNotes = string.IsNullOrEmpty(d?.FlavorNotes)
                            ? new List<string> { "Đặc trưng" }
                            : d.FlavorNotes.Split(new[] { ',', ';', '-' }, StringSplitOptions.RemoveEmptyEntries)
                                .Select(f => f.Trim()).Where(f => !string.IsNullOrEmpty(f)).ToList(),
                        MatchScore = 50,
                        Price = ep.Price,
                        ImageUrl = ep.ImageUrl ?? "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&q=80"
                    });
                }
            }

            return response;
        }

        private string GetFlavorText(string? flavor) => flavor?.ToLower() switch
        {
            "floral" => "hoa quả & trái cây thanh lịch",
            "chocolate" => "socola, caramel ngọt ngào",
            "bold" => "đậm đà, mạnh mẽ truyền thống",
            _ => "cân bằng và tinh tế"
        };

        private string GetRoastText(string? roast) => roast?.ToLower() switch
        {
            "light" => "nhẹ nhàng (Light Roast)",
            "medium" => "cân bằng (Medium Roast)",
            "dark" => "đậm đắng sâu (Dark Roast)",
            _ => "vừa phải"
        };

        private string GetMethodText(string? method) => method?.ToLower() switch
        {
            "phin" => "Phin truyền thống",
            "espresso" => "Espresso hiện đại bằng máy",
            "pour" => "Pour-over thủ công giấy lọc",
            _ => "pha chế ưa thích"
        };

        private RecommendationResultDto GetFallbackMain()
        {
            return new RecommendationResultDto
            {
                ProductId = 1,
                Name = "Colombia Supremo (Mẫu)",
                Subtitle = "Cân bằng – Rang vừa – Espresso",
                Reason = "Bạn thích hương vị socola & ngọt ngào của caramel, Colombia Supremo với độ rang vừa cho ra cốc espresso hoàn hảo, đậm vừa và hậu socola mịn màng.",
                FlavorNotes = new List<string> { "Socola sữa", "Caramel", "Hạnh nhân" },
                MatchScore = 90,
                Price = 195000,
                ImageUrl = "https://images.unsplash.com/photo-1511537190424-bbbab87ac5eb?w=600&q=80"
            };
        }

        private List<RecommendationResultDto> GetFallbackOthers()
        {
            return new List<RecommendationResultDto>
            {
                new RecommendationResultDto
                {
                    ProductId = 2,
                    Name = "Ethiopia Yirgacheffe (Mẫu)",
                    Subtitle = "Thanh lịch – Rang nhẹ – Pour-over",
                    Reason = "Cà phê đặc sản với nốt hương hoa quả thanh mát.",
                    FlavorNotes = new List<string> { "Hoa nhài", "Cam bergamot", "Đào" },
                    MatchScore = 85,
                    Price = 225000,
                    ImageUrl = "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=80"
                },
                new RecommendationResultDto
                {
                    ProductId = 3,
                    Name = "Robusta Đặc Biệt (Mẫu)",
                    Subtitle = "Đậm đà – Rang đậm – Pha phin",
                    Reason = "Đắng đậm đà đúng gu cà phê phin truyền thống.",
                    FlavorNotes = new List<string> { "Cacao đắng", "Gỗ sồi", "Caramel đậm" },
                    MatchScore = 88,
                    Price = 185000,
                    ImageUrl = "https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=600&q=80"
                },
                new RecommendationResultDto
                {
                    ProductId = 4,
                    Name = "Blend Signature (Mẫu)",
                    Subtitle = "Hài hòa – Rang vừa – Espresso/Phin",
                    Reason = "Sự kết hợp hoàn hảo giữa Arabica thơm dịu và Robusta đậm đà.",
                    FlavorNotes = new List<string> { "Hạt dẻ", "Socola", "Hương hoa cỏ" },
                    MatchScore = 82,
                    Price = 165000,
                    ImageUrl = "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&q=80"
                }
            };
        }

        private double GetRoastValue(string? roast)
        {
            string r = roast?.ToLower() ?? "";
            if (r.Contains("light") || r.Contains("nhẹ") || r.Contains("sáng")) return 1;
            if (r.Contains("dark") || r.Contains("đậm") || r.Contains("sâu")) return 3;
            return 2; // Medium làm mặc định
        }

        private double GetFlavorValue(string? flavorNotes, string? matchTags)
        {
            string f = ((flavorNotes ?? "") + " " + (matchTags ?? "")).ToLower();
            var floralKeywords = new[] { "hoa", "quả", "floral", "fruit", "citrus", "berry", "chua", "đào", "cam", "nhài", "sáng" };
            var boldKeywords = new[] { "đậm", "đắng", "bold", "bitter", "mạnh", "gỗ", "sồi", "khói", "cacao", "đất" };
            
            if (floralKeywords.Any(k => f.Contains(k))) return 1;
            if (boldKeywords.Any(k => f.Contains(k))) return 3;
            return 2; // Chocolate/Caramel/Cân bằng làm mặc định
        }

        private double GetMethodValue(string? matchTags, string? process)
        {
            string m = ((matchTags ?? "") + " " + (process ?? "")).ToLower();
            if (m.Contains("pour") || m.Contains("drip") || m.Contains("filter") || m.Contains("giấy lọc") || m.Contains("french")) return 3;
            if (m.Contains("phin")) return 1;
            return 2; // Espresso/máy làm mặc định
        }

        private double GetTimeValue(string? bestTime, double pRoast, double pFlavor)
        {
            string t = bestTime?.ToLower() ?? "";
            if (t.Contains("morning") || t.Contains("sáng")) return 1;
            if (t.Contains("evening") || t.Contains("tối")) return 3;
            if (t.Contains("afternoon") || t.Contains("chiều")) return 2;
            
            // Tự suy luận nếu thiếu dữ liệu
            if (pRoast == 3 || pFlavor == 3) return 1;
            if (pRoast == 1 || pFlavor == 1) return 3;
            return 2;
        }

        private class ScoredProduct
        {
            public int Score { get; set; }
            public RecommendationResultDto Dto { get; set; } = null!;
        }
    }
}
