using CNPM_TTN.Dtos;

namespace CNPM_TTN.Services
{
    public interface IUploadService
    {
        Task<ApiResponse<UploadResultDto>> UploadUserImageAsync(IFormFile file);
        Task<ApiResponse<UploadResultDto>> UploadProductImageAsync(IFormFile file);
    }
}
