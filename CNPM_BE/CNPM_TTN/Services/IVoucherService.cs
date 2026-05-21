using CNPM_TTN.Dtos;

namespace CNPM_TTN.Services;

public interface IVoucherService
{
    Task<ApiResponse<VoucherValidateResponseDto>> ValidateAsync(string code, decimal orderTotal);
    Task<ApiResponse<List<VoucherDto>>> GetAllAsync();
    Task<ApiResponse<VoucherDto>> CreateAsync(CreateVoucherDto dto);
    Task<ApiResponse<string>> UpdateAsync(int id, CreateVoucherDto dto);
    Task<ApiResponse<string>> DeleteAsync(int id);
    Task IncrementUsageAsync(string code);
}
