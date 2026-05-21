using System;
using System.Linq;
using System.Threading.Tasks;
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

    public async Task<ApiResponse<VoucherValidateResponseDto>> ValidateAsync(string code, decimal orderTotal)
    {
        var voucher = await _context.Vouchers
            .FirstOrDefaultAsync(v => v.Code == code && v.IsActive);

        if (voucher == null)
            return ApiResponse<VoucherValidateResponseDto>.SuccessResponse(new VoucherValidateResponseDto
            {
                IsValid = false,
                Message = "Voucher không tồn tại hoặc đã bị vô hiệu hóa."
            });

        var now = DateTime.UtcNow;
        if (now < voucher.StartDate || now > voucher.EndDate)
            return ApiResponse<VoucherValidateResponseDto>.SuccessResponse(new VoucherValidateResponseDto
            {
                IsValid = false,
                Message = "Voucher đã hết hạn hoặc chưa đến ngày sử dụng."
            });

        if (voucher.MaxUsage > 0 && voucher.UsedCount >= voucher.MaxUsage)
            return ApiResponse<VoucherValidateResponseDto>.SuccessResponse(new VoucherValidateResponseDto
            {
                IsValid = false,
                Message = "Voucher đã hết lượt sử dụng."
            });

        if (orderTotal < voucher.MinOrderValue)
            return ApiResponse<VoucherValidateResponseDto>.SuccessResponse(new VoucherValidateResponseDto
            {
                IsValid = false,
                Message = $"Đơn hàng phải có giá trị tối thiểu {voucher.MinOrderValue:N0}đ để áp dụng voucher."
            });

        decimal discountAmount = voucher.DiscountType == "percent"
            ? orderTotal * voucher.DiscountValue / 100
            : voucher.DiscountValue;

        discountAmount = Math.Min(discountAmount, orderTotal);

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
            .Select(v => MapToDto(v))
            .ToListAsync();

        return ApiResponse<List<VoucherDto>>.SuccessResponse(vouchers);
    }

    public async Task<ApiResponse<VoucherDto>> CreateAsync(CreateVoucherDto dto)
    {
        if (await _context.Vouchers.AnyAsync(v => v.Code == dto.Code))
            return ApiResponse<VoucherDto>.FailureResponse("Mã voucher đã tồn tại.");

        var voucher = new Voucher
        {
            Code = dto.Code.Trim().ToUpper(),
            Name = dto.Name,
            DiscountType = dto.DiscountType,
            DiscountValue = dto.DiscountValue,
            MinOrderValue = dto.MinOrderValue,
            MaxUsage = dto.MaxUsage,
            StartDate = dto.StartDate,
            EndDate = dto.EndDate,
            IsActive = dto.IsActive
        };

        _context.Vouchers.Add(voucher);
        await _context.SaveChangesAsync();

        return ApiResponse<VoucherDto>.SuccessResponse(MapToDto(voucher));
    }

    public async Task<ApiResponse<string>> UpdateAsync(int id, CreateVoucherDto dto)
    {
        var voucher = await _context.Vouchers.FindAsync(id);
        if (voucher == null)
            return ApiResponse<string>.FailureResponse("Voucher không tồn tại.");

        voucher.Name = dto.Name;
        voucher.DiscountType = dto.DiscountType;
        voucher.DiscountValue = dto.DiscountValue;
        voucher.MinOrderValue = dto.MinOrderValue;
        voucher.MaxUsage = dto.MaxUsage;
        voucher.StartDate = dto.StartDate;
        voucher.EndDate = dto.EndDate;
        voucher.IsActive = dto.IsActive;

        await _context.SaveChangesAsync();
        return ApiResponse<string>.SuccessResponse("Cập nhật voucher thành công.");
    }

    public async Task<ApiResponse<string>> DeleteAsync(int id)
    {
        var voucher = await _context.Vouchers.FindAsync(id);
        if (voucher == null)
            return ApiResponse<string>.FailureResponse("Voucher không tồn tại.");

        _context.Vouchers.Remove(voucher);
        await _context.SaveChangesAsync();
        return ApiResponse<string>.SuccessResponse("Xóa voucher thành công.");
    }

    public async Task IncrementUsageAsync(string code)
    {
        var voucher = await _context.Vouchers.FirstOrDefaultAsync(v => v.Code == code);
        if (voucher != null)
        {
            voucher.UsedCount++;
            await _context.SaveChangesAsync();
        }
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
        IsActive = v.IsActive
    };
}
