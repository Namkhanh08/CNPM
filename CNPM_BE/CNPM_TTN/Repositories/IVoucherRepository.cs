using CNPM_TTN.Entities;

namespace CNPM_TTN.Repositories
{
    public interface IVoucherRepository
    {
        Task<IEnumerable<Voucher>> GetAllAsync();
        Task<Voucher> GetByIdAsync(int id);
        Task<Voucher> GetByCodeAsync(string code);
        Task AddAsync(Voucher voucher);
        void Update(Voucher voucher);
        void Delete(Voucher voucher);
        Task<bool> SaveChangesAsync();
    }
}
