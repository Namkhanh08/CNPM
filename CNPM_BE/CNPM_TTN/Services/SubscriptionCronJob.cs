using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace CNPM_TTN.Services;

/// <summary>
/// Background service chạy mỗi ngày lúc 6:00 SA để tự động tạo đơn hàng subscription
/// </summary>
public class SubscriptionCronJob : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<SubscriptionCronJob> _logger;

    public SubscriptionCronJob(IServiceProvider serviceProvider, ILogger<SubscriptionCronJob> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Subscription Cron Job started.");

        while (!stoppingToken.IsCancellationRequested)
        {
            var now = DateTime.UtcNow;
            // Tính thời gian đến 6:00 SA UTC ngày hôm sau (hoặc hôm nay nếu chưa đến)
            var nextRun = now.Date.AddHours(23); // 23:00 UTC = 06:00 AM GMT+7
            if (now >= nextRun) nextRun = nextRun.AddDays(1);

            var delay = nextRun - now;
            _logger.LogInformation("Next subscription processing in {Delay} at {NextRun}", delay, nextRun);

            await Task.Delay(delay, stoppingToken);

            if (stoppingToken.IsCancellationRequested) break;

            try
            {
                using var scope = _serviceProvider.CreateScope();
                var subscriptionService = scope.ServiceProvider.GetRequiredService<ISubscriptionService>();
                await subscriptionService.ProcessDueSubscriptionsAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in SubscriptionCronJob.");
            }
        }
    }
}
