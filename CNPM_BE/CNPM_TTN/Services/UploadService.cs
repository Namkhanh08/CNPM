using CNPM_TTN.Dtos;

namespace CNPM_TTN.Services
{
    public class UploadService : IUploadService
    {
        private const long MaxFileSize = 5 * 1024 * 1024;
        private static readonly HashSet<string> AllowedExtensions = new(StringComparer.OrdinalIgnoreCase)
        {
            ".jpg",
            ".jpeg",
            ".png",
            ".webp"
        };

        private readonly IWebHostEnvironment _environment;

        public UploadService(IWebHostEnvironment environment)
        {
            _environment = environment;
        }

        public Task<ApiResponse<UploadResultDto>> UploadUserImageAsync(IFormFile file)
        {
            return UploadImageAsync(file, "profiles", "Vui long chon mot file anh");
        }

        public Task<ApiResponse<UploadResultDto>> UploadProductImageAsync(IFormFile file)
        {
            return UploadImageAsync(file, "products", "Vui long chon anh san pham");
        }

        private async Task<ApiResponse<UploadResultDto>> UploadImageAsync(IFormFile file, string folderName, string emptyMessage)
        {
            if (file == null || file.Length == 0)
            {
                return ApiResponse<UploadResultDto>.FailureResponse(emptyMessage);
            }

            if (file.Length > MaxFileSize)
            {
                return ApiResponse<UploadResultDto>.FailureResponse("File anh khong duoc vuot qua 5MB");
            }

            var extension = Path.GetExtension(file.FileName);
            if (!AllowedExtensions.Contains(extension))
            {
                return ApiResponse<UploadResultDto>.FailureResponse("Dinh dang file khong ho tro");
            }

            if (!string.IsNullOrWhiteSpace(file.ContentType) &&
                !file.ContentType.StartsWith("image/", StringComparison.OrdinalIgnoreCase))
            {
                return ApiResponse<UploadResultDto>.FailureResponse("File upload phai la anh");
            }

            var webRootPath = _environment.WebRootPath;
            if (string.IsNullOrWhiteSpace(webRootPath))
            {
                webRootPath = Path.Combine(_environment.ContentRootPath, "wwwroot");
            }

            var uploadsFolder = Path.Combine(webRootPath, "uploads", folderName);
            Directory.CreateDirectory(uploadsFolder);

            var fileName = $"{Guid.NewGuid():N}{extension.ToLowerInvariant()}";
            var filePath = Path.Combine(uploadsFolder, fileName);

            await using var stream = new FileStream(filePath, FileMode.CreateNew);
            await file.CopyToAsync(stream);

            return ApiResponse<UploadResultDto>.SuccessResponse(new UploadResultDto
            {
                Url = $"/uploads/{folderName}/{fileName}"
            });
        }
    }
}
