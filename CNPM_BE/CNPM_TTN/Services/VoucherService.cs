using CNPM_TTN.Dtos;
using CNPM_TTN.Entities;
using Microsoft.EntityFrameworkCore;

namespace CNPM_TTN.Services;

public class VoucherService : IVoucherService
{
    private readonly ShopCoffeeContext _context;

    public VoucherService(ShopCoffeeContext context)
    {
        _context = context;
    }

    public async Task<ApiResponse<VoucherValidateResponseDto>> ValidateAsync(
        string code,
        decimal orderTotal,
        string? paymentMethod = null,
        string? userId = null,
        IEnumerable<int>? productIds = null)
    {
        code = code.Trim().ToUpper();
        var voucher = await _context.Vouchers
            .Include(v => v.Products)
            .FirstOrDefaultAsync(v => v.Code == code && v.IsActive);

        if (voucher == null)
        {
            return Invalid("Mã voucher không tồn tại hoặc đã bị vô hiệu hóa.");
        }

        var now = DateTime.Now;
        if (now < voucher.StartDate || now > voucher.EndDate)
        {
            return Invalid("Voucher đã hết hạn hoặc chưa đến ngày sử dụng.");
        }

        var usageLimit = GetUsageLimit(voucher);
        if (usageLimit > 0 && voucher.UsedCount >= usageLimit)
        {
            return Invalid("Voucher đã hết lượt sử dụng.");
        }

        var ownershipCheck = await CheckUserVoucherAsync(voucher, userId);
        if (!ownershipCheck.IsValid)
        {
            return Invalid(ownershipCheck.Message);
        }

        if (orderTotal < voucher.MinOrderValue)
        {
            return Invalid($"Đơn hàng phải có giá trị tối thiểu {voucher.MinOrderValue:N0}đ để áp dụng voucher.");
        }

        if (!IsPaymentMethodMatched(voucher, paymentMethod))
        {
            return Invalid($"Voucher chỉ áp dụng cho phương thức thanh toán {voucher.PaymentMethod}.");
        }

        if (!HasRequiredProducts(voucher, productIds))
        {
            return Invalid("Voucher này chỉ áp dụng cho một số sản phẩm nhất định trong đơn hàng.");
        }

        var discountAmount = CalculateDiscount(voucher, orderTotal);

        return ApiResponse<VoucherValidateResponseDto>.SuccessResponse(new VoucherValidateResponseDto
        {
            IsValid = true,
            DiscountAmount = discountAmount,
            Message = $"Áp dụng thành công! Giảm {discountAmount:N0}đ",
            Voucher = MapToDto(voucher)
        });
    }

    public async Task<ApiResponse<List<VoucherDto>>> GetAllAsync()
    {
        var vouchers = await _context.Vouchers
            .OrderByDescending(v => v.Id)
            .ToListAsync();

        return ApiResponse<List<VoucherDto>>.SuccessResponse(vouchers.Select(MapToDto).ToList());
    }

    public async Task<ApiResponse<List<VoucherDto>>> GetAvailableAsync(decimal orderTotal = 0, string? paymentMethod = null, string? userId = null, IEnumerable<int>? productIds = null)
    {
        var now = DateTime.Now;
        var vouchers = await _context.Vouchers
            .Include(v => v.UserVouchers)
            .Include(v => v.Products)
            .Where(v => v.IsActive && v.StartDate <= now && v.EndDate >= now)
            .OrderBy(v => v.MinOrderValue)
            .ThenByDescending(v => v.DiscountValue)
            .ToListAsync();

        var items = vouchers
            .Where(v => GetUsageLimit(v) <= 0 || v.UsedCount < GetUsageLimit(v))
            .Where(v => orderTotal <= 0 || orderTotal >= v.MinOrderValue)
            .Where(v => IsPaymentMethodMatched(v, paymentMethod))
            .Where(v => IsAvailableForUser(v, userId))
            .Where(v => HasRequiredProducts(v, productIds))
            .Select(MapToDto)
            .ToList();

        return ApiResponse<List<VoucherDto>>.SuccessResponse(items);
    }

    public async Task<ApiResponse<VoucherDto>> CreateAsync(CreateVoucherDto dto)
    {
        var code = dto.Code.Trim().ToUpper();
        if (await _context.Vouchers.AnyAsync(v => v.Code == code))
        {
            return ApiResponse<VoucherDto>.FailureResponse("Mã voucher đã tồn tại.");
        }

        var voucher = new Voucher
        {
            Code = code,
            Name = dto.Name.Trim(),
            DiscountType = NormalizeDiscountType(dto.DiscountType),
            DiscountValue = dto.DiscountValue,
            MinOrderValue = dto.MinOrderValue,
            MaxUsage = dto.MaxUsage,
            UsedCount = 0,
            StartDate = dto.StartDate,
            EndDate = dto.EndDate,
            IsActive = dto.IsActive,
            Title = dto.Title,
            Description = dto.Description,
            MaxDiscount = dto.MaxDiscount,
            UsageLimit = dto.UsageLimit,
            PaymentMethod = NormalizePaymentMethod(dto.PaymentMethod),
            CreatedAt = DateTime.Now
        };

        _context.Vouchers.Add(voucher);
        await UpdateVoucherProductsAsync(voucher, dto.ProductIds);
        await _context.SaveChangesAsync();

        return ApiResponse<VoucherDto>.SuccessResponse(MapToDto(voucher), "Tạo voucher thành công.");
    }

    public async Task<ApiResponse<string>> UpdateAsync(int id, CreateVoucherDto dto)
    {
        var voucher = await _context.Vouchers.FindAsync(id);
        if (voucher == null)
        {
            return ApiResponse<string>.FailureResponse("Voucher không tồn tại.");
        }

        var code = dto.Code.Trim().ToUpper();
        if (!voucher.Code.Equals(code, StringComparison.OrdinalIgnoreCase)
            && await _context.Vouchers.AnyAsync(v => v.Code == code && v.Id != id))
        {
            return ApiResponse<string>.FailureResponse("Mã voucher đã tồn tại.");
        }

        voucher.Code = code;
        voucher.Name = dto.Name.Trim();
        voucher.DiscountType = NormalizeDiscountType(dto.DiscountType);
        voucher.DiscountValue = dto.DiscountValue;
        voucher.MinOrderValue = dto.MinOrderValue;
        voucher.MaxUsage = dto.MaxUsage;
        voucher.StartDate = dto.StartDate;
        voucher.EndDate = dto.EndDate;
        voucher.IsActive = dto.IsActive;
        voucher.Title = dto.Title;
        voucher.Description = dto.Description;
        voucher.MaxDiscount = dto.MaxDiscount;
        voucher.UsageLimit = dto.UsageLimit;
        voucher.PaymentMethod = NormalizePaymentMethod(dto.PaymentMethod);

        await UpdateVoucherProductsAsync(voucher, dto.ProductIds);
        await _context.SaveChangesAsync();
        return ApiResponse<string>.SuccessResponse("Cập nhật voucher thành công.");
    }

    public async Task<ApiResponse<string>> DeleteAsync(int id)
    {
        var voucher = await _context.Vouchers.FindAsync(id);
        if (voucher == null)
        {
            return ApiResponse<string>.FailureResponse("Voucher không tồn tại.");
        }

        _context.Vouchers.Remove(voucher);
        await _context.SaveChangesAsync();
        return ApiResponse<string>.SuccessResponse("Xóa voucher thành công.");
    }

    public async Task IncrementUsageAsync(string code, string? userId = null, int? orderId = null)
    {
        var voucher = await _context.Vouchers
            .Include(v => v.UserVouchers)
            .FirstOrDefaultAsync(v => v.Code == code.Trim().ToUpper());

        if (voucher == null) return;

        if (!string.IsNullOrWhiteSpace(userId))
        {
            var userVoucher = voucher.UserVouchers
                .FirstOrDefault(uv => uv.UserId == userId && uv.Source == "loyalty" && !uv.IsUsed);

            if (userVoucher != null)
            {
                userVoucher.IsUsed = true;
                userVoucher.UsedAt = DateTime.Now;
                userVoucher.OrderId = orderId;
            }
            else if (!voucher.UserVouchers.Any(uv => uv.UserId == userId && uv.Source == "public" && uv.IsUsed))
            {
                _context.UserVouchers.Add(new UserVoucher
                {
                    UserId = userId,
                    VoucherId = voucher.Id,
                    OrderId = orderId,
                    IsUsed = true,
                    AssignedAt = DateTime.Now,
                    UsedAt = DateTime.Now,
                    Source = "public"
                });
            }
        }

        voucher.UsedCount++;
        if (GetUsageLimit(voucher) > 0 && voucher.UsedCount >= GetUsageLimit(voucher))
        {
            voucher.IsActive = false;
        }

        await _context.SaveChangesAsync();
    }

    private async Task<(bool IsValid, string Message)> CheckUserVoucherAsync(Voucher voucher, string? userId)
    {
        var rows = await _context.UserVouchers
            .Where(uv => uv.VoucherId == voucher.Id)
            .ToListAsync();

        var isLoyaltyVoucher = IsLoyaltyVoucher(voucher, rows);
        if (isLoyaltyVoucher)
        {
            if (string.IsNullOrWhiteSpace(userId))
            {
                return (false, "Bạn cần đăng nhập để sử dụng voucher này.");
            }

            var ownedVoucher = rows.FirstOrDefault(uv => uv.UserId == userId && uv.Source == "loyalty");
            if (ownedVoucher == null)
            {
                return (false, "Voucher này không thuộc tài khoản của bạn.");
            }

            if (ownedVoucher.IsUsed)
            {
                return (false, "Voucher này đã được sử dụng.");
            }
        }
        else if (!string.IsNullOrWhiteSpace(userId)
            && rows.Any(uv => uv.UserId == userId && uv.Source == "public" && uv.IsUsed))
        {
            return (false, "Bạn đã sử dụng voucher này rồi.");
        }

        return (true, string.Empty);
    }

    private static ApiResponse<VoucherValidateResponseDto> Invalid(string message)
    {
        return ApiResponse<VoucherValidateResponseDto>.SuccessResponse(new VoucherValidateResponseDto
        {
            IsValid = false,
            Message = message
        });
    }

    private static decimal CalculateDiscount(Voucher voucher, decimal orderTotal)
    {
        var discountAmount = voucher.DiscountType.Equals("percent", StringComparison.OrdinalIgnoreCase)
            ? orderTotal * voucher.DiscountValue / 100
            : voucher.DiscountValue;

        if (voucher.MaxDiscount.HasValue && voucher.MaxDiscount.Value > 0)
        {
            discountAmount = Math.Min(discountAmount, voucher.MaxDiscount.Value);
        }

        return Math.Min(discountAmount, orderTotal);
    }

    private static VoucherDto MapToDto(Voucher v) => new VoucherDto
    {
        Id = v.Id,
        Code = v.Code,
        Name = v.Name,
        DiscountType = v.DiscountType,
        DiscountValue = v.DiscountValue,
        MinOrderValue = v.MinOrderValue,
        MaxUsage = v.MaxUsage,
        UsedCount = v.UsedCount,
        StartDate = v.StartDate,
        EndDate = v.EndDate,
        IsActive = v.IsActive,
        Title = v.Title,
        Description = v.Description,
        MaxDiscount = v.MaxDiscount,
        UsageLimit = v.UsageLimit,
        PaymentMethod = v.PaymentMethod,
        IsExpired = DateTime.Now > v.EndDate,
        RemainingUsage = GetRemainingUsage(v),
        ProductIds = v.Products.Select(p => p.Id).ToList()
    };

    private static int GetUsageLimit(Voucher voucher)
    {
        var usageLimit = voucher.UsageLimit.GetValueOrDefault();
        return usageLimit > 0
            ? usageLimit
            : voucher.MaxUsage;
    }

    private static int GetRemainingUsage(Voucher voucher)
    {
        var usageLimit = GetUsageLimit(voucher);
        return usageLimit <= 0 ? int.MaxValue : Math.Max(0, usageLimit - voucher.UsedCount);
    }

    private static bool IsAvailableForUser(Voucher voucher, string? userId)
    {
        var isLoyaltyVoucher = IsLoyaltyVoucher(voucher, voucher.UserVouchers);

        if (isLoyaltyVoucher)
        {
            return !string.IsNullOrWhiteSpace(userId)
                && voucher.UserVouchers.Any(uv => uv.UserId == userId && uv.Source == "loyalty" && !uv.IsUsed);
        }

        return string.IsNullOrWhiteSpace(userId)
            || !voucher.UserVouchers.Any(uv => uv.UserId == userId && uv.Source == "public" && uv.IsUsed);
    }

    private static bool IsLoyaltyVoucher(Voucher voucher, IEnumerable<UserVoucher> userVouchers)
    {
        return userVouchers.Any(uv => uv.Source == "loyalty")
            || voucher.Code.StartsWith("LOYALTY", StringComparison.OrdinalIgnoreCase);
    }

    private static bool HasRequiredProducts(Voucher voucher, IEnumerable<int>? productIds)
    {
        if (voucher.Products.Count == 0)
        {
            return true;
        }

        var orderProductIds = (productIds ?? Enumerable.Empty<int>()).ToHashSet();
        if (orderProductIds.Count == 0)
        {
            return false;
        }

        return voucher.Products.Any(product => orderProductIds.Contains(product.Id));
    }

    private async Task UpdateVoucherProductsAsync(Voucher voucher, IEnumerable<int>? productIds)
    {
        var ids = (productIds ?? Enumerable.Empty<int>())
            .Where(id => id > 0)
            .Distinct()
            .ToList();

        if (voucher.Id > 0)
        {
            await _context.Entry(voucher).Collection(v => v.Products).LoadAsync();
            voucher.Products.Clear();
        }

        if (ids.Count == 0)
        {
            return;
        }

        var products = await _context.Products
            .Where(p => ids.Contains(p.Id))
            .ToListAsync();

        foreach (var product in products)
        {
            voucher.Products.Add(product);
        }
    }

    private static bool IsPaymentMethodMatched(Voucher voucher, string? paymentMethod)
    {
        if (string.IsNullOrWhiteSpace(voucher.PaymentMethod)
            || voucher.PaymentMethod.Equals("ALL", StringComparison.OrdinalIgnoreCase))
        {
            return true;
        }

        if (string.IsNullOrWhiteSpace(paymentMethod)) return true;

        return voucher.PaymentMethod.Equals(paymentMethod, StringComparison.OrdinalIgnoreCase);
    }

    private static string NormalizeDiscountType(string discountType)
    {
        return discountType.Equals("amount", StringComparison.OrdinalIgnoreCase) ? "amount" : "percent";
    }

    private static string? NormalizePaymentMethod(string? paymentMethod)
    {
        return string.IsNullOrWhiteSpace(paymentMethod) || paymentMethod.Equals("ALL", StringComparison.OrdinalIgnoreCase)
            ? null
            : paymentMethod.Trim().ToUpper();
    }
}
