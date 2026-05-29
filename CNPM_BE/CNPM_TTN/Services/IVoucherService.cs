using CNPM_TTN.Dtos;

namespace CNPM_TTN.Services;

public interface IVoucherService
{
    Task<ApiResponse<VoucherValidateResponseDto>> ValidateAsync(string code, decimal orderTotal, string? paymentMethod = null, string? userId = null, IEnumerable<int>? productIds = null);
    Task<ApiResponse<List<VoucherDto>>> GetAllAsync();
    Task<ApiResponse<List<VoucherDto>>> GetAvailableAsync(decimal orderTotal = 0, string? paymentMethod = null, string? userId = null, IEnumerable<int>? productIds = null);
    Task<ApiResponse<VoucherDto>> CreateAsync(CreateVoucherDto dto);
    Task<ApiResponse<string>> UpdateAsync(int id, CreateVoucherDto dto);
    Task<ApiResponse<string>> DeleteAsync(int id);
    Task IncrementUsageAsync(string code, string? userId = null, int? orderId = null);
}
