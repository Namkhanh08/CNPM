using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System;
using System.Security.Claims;
using System.Collections.Generic;
using CNPM_TTN.Dtos;
using CNPM_TTN.Services;

namespace CNPM_TTN.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/subscriptions")]
    public class SubscriptionController : ControllerBase
    {
        private readonly SubscriptionService _subscriptionService;

        public SubscriptionController(SubscriptionService subscriptionService)
        {
            _subscriptionService = subscriptionService;
        }

        private string GetUserIdFromClaims()
        {
            return User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? string.Empty;
        }

        // CREATE
        [HttpPost("create")]
        public IActionResult CreateSubscription([FromBody] CreateSubscriptionRequest dto)
        {
            string userId = GetUserIdFromClaims();
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            try
            {
                _subscriptionService.CreateSubscription(userId, dto);
                return Ok(new { message = "Đăng ký gói định kỳ thành công" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // GET USER SUBSCRIPTIONS
        [HttpGet]
        public IActionResult GetUserSubscriptions()
        {
            string userId = GetUserIdFromClaims();
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var subscriptions = _subscriptionService.GetUserSubscriptions(userId);
            return Ok(subscriptions);
        }

        // SKIP / RESUME
        [HttpPut("{id}/toggle-skip")]
        public IActionResult ToggleSkipSubscription(int id)
        {
            string userId = GetUserIdFromClaims();
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            try
            {
                _subscriptionService.ToggleSkipSubscription(userId, id);
                return Ok(new { message = "Updated subscription status" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // CANCEL
        [HttpPut("{id}/cancel")]
        public IActionResult CancelSubscription(int id)
        {
            string userId = GetUserIdFromClaims();
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            try
            {
                _subscriptionService.CancelSubscription(userId, id);
                return Ok(new { message = "Subscription cancelled" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // UPDATE CONFIG
        [HttpPut("{id}/config")]
        public IActionResult UpdateConfig(int id, [FromBody] UpdateSubscriptionConfigRequest request)
        {
            string userId = GetUserIdFromClaims();
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            try
            {
                _subscriptionService.UpdateSubscriptionConfig(userId, id, request);
                return Ok(new { message = "Updated config successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}