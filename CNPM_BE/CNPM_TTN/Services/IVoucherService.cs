using CNPM_TTN.Dtos;

namespace CNPM_TTN.Services
{
    public interface IVoucherService
    {
        Task<object> GetVouchersAdminAsync(int page, string searchTerm, string status);
        Task<IEnumerable<VoucherDto>> GetAvailableVouchersAsync(CheckAvailableVoucherDto dto);
        Task<IEnumerable<VoucherDto>> GetPublicVouchersAsync();
        Task<VoucherDto> CreateVoucherAsync(CreateUpdateVoucherDto dto);
        Task<bool> UpdateVoucherAsync(int id, CreateUpdateVoucherDto dto);
        Task<bool> DeleteVoucherAsync(int id);
        Task<bool> ToggleVoucherAsync(int id, bool active);
    }
}
