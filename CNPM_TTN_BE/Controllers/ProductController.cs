using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using CNPM_TTN.Entities;
using CNPM_TTN.Repositories;

namespace CNPM_TTN.Controllers
{
    [ApiController]
    [Route("api/products")] 
    public class ProductsController : ControllerBase
    {
        private readonly ProductRepository _productRepo;

        public ProductsController(ProductRepository productRepo)
        {
            _productRepo = productRepo ?? throw new ArgumentNullException(nameof(productRepo));
        }

        [HttpGet]
        public ActionResult<IEnumerable<Product>> GetAll()
        {
            Console.WriteLine("Đang nhận yêu cầu lấy danh sách sản phẩm... ");

            var list = _productRepo.FindAllManual();

            Console.WriteLine($"Đã lấy được {list.Count()} sản phẩm từ SQL Server");
            return Ok(list); // Trả về HTTP 200 kèm dữ liệu JSON
        }

        [HttpGet("{id:int}")]
        public ActionResult<ProductDetail> GetByProductId(int id)
        {
            var productDetail = _productRepo.FindProductById(id);

            if (productDetail == null)
            {
                return NotFound(new { message = $"Không tìm thấy chi tiết sản phẩm với Id = {id}" });
            }

            return Ok(productDetail);
        }
    }
}