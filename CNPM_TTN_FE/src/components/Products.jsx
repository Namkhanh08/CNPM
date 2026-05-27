import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { GrLinkNext } from "react-icons/gr";
import API from '../services/api'; 

// Import duy nhất 1 ảnh tĩnh làm fallback khi DB trống hoặc lỗi file ổ cứng server
import defaultImage from '../assets/img/section2/image1.png';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await API.getProducts();
        
        // Chuẩn hoá dữ liệu để bảo vệ các thuộc tính (Tránh lỗi phân biệt hoa thường chữ cái đầu từ C# / SQL)
        const rawProducts = response.data || [];
        const normalized = rawProducts.map(p => ({
          id: p.Id || p.id,
          name: p.Name || p.name || 'Cà phê chất lượng cao',
          description: p.Description || p.description || 'Hương vị thơm ngon đậm đà tuyển chọn.',
          price: p.Price || p.price || 0,
          imageUrl: p.ImageUrl || p.imageUrl || ''
        }));

        setProducts(normalized);
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu sản phẩm từ DB:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="py-24 text-center font-nunito text-lg text-primary/70">
        Đang tải danh sách cà phê nổi bật...
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="py-24 text-center font-nunito text-lg text-primary/70">
        Hiện tại chưa có sản phẩm nào được trưng bày.
      </div>
    );
  }

  const featuredProduct = products[0];
  const otherProducts = products.slice(1, 5);

  const getProductImage = (imgUrl) => {
    if (!imgUrl) return defaultImage;
    if (imgUrl.startsWith('http://') || imgUrl.startsWith('https://')) return imgUrl;
    return `http://localhost:5126${imgUrl}`;
  };

  return (
    <section id="products" className="py-24 bg-white relative">
      <div className="container mx-auto px-6 lg:px-12 max-w-7xl">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between md:items-end mb-16 gap-6">
          <div>
            <p className="text-accent-1 font-nunito font-bold tracking-[0.2em] uppercase mb-4">Sản Phẩm Của Chúng Tôi</p>
            <h2 className="text-4xl md:text-5xl font-nunito font-bold text-primary">
              CÁC LOẠI CÀ PHÊ <br className="hidden md:block"/> 
              <span className="text-accent-1 leading-[1.2]">NỔI BẬT</span>
            </h2>
          </div>
          <Link to="/shop" className="flex items-center gap-3 text-primary font-nunito font-bold border-b border-primary hover:text-accent-1 hover:border-accent-1 transition-colors pb-1 w-fit">
            XEM TẤT CẢ SẢN PHẨM <GrLinkNext className="w-5 text-accent-1" />
          </Link>
        </div>

        {/* Products Display Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Featured Product */}
          <div className="lg:col-span-6 bg-white border rounded-[40px] p-10 flex flex-col md:flex-row items-center gap-8 shadow-sm hover:shadow-xl transition-shadow group relative overflow-hidden">
            <div className="w-full md:w-1/2 relative z-10 flex justify-center">
              <img 
                src={getProductImage(featuredProduct.imageUrl)} 
                alt={featuredProduct.name} 
                className="max-w-[200px] md:max-w-full h-48 object-contain drop-shadow-2xl group-hover:scale-110 transition-transform duration-500" 
                onError={(e) => { e.target.src = defaultImage; }}
              />
            </div>
            <div className="w-full md:w-1/2 relative z-10 text-center md:text-left">
              <span className="text-accent-1 font-nunito font-bold tracking-widest uppercase text-sm block mb-2">BÁN CHẠY NHẤT</span>
              <h3 className="font-montserrat font-bold text-3xl text-primary mb-3">{featuredProduct.name}</h3>
              <p className="font-nunito text-primary/70 mb-6 line-clamp-3">{featuredProduct.description}</p>
              <div className="flex items-center justify-center md:justify-start gap-4">
                <span className="font-montserrat font-bold text-2xl text-accent-1">
                  {featuredProduct.price ? Number(featuredProduct.price).toLocaleString('vi-VN') : 0}đ
                </span>
                <Link to={`/product/${featuredProduct.id}`} className="bg-primary text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-accent-1 transition-colors">
                  <span className="font-bold text-lg leading-none mb-1">+</span>
                </Link>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-1/2 h-full bg-accent-2/30 rounded-l-[100px] -z-0"></div>
          </div>

          {/* Other Products Grid */}
          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-8">
            {otherProducts.map((product) => (
              <div key={product.id} className="bg-white border rounded-3xl p-6 flex flex-col hover:shadow-2xl group h-full hover:-translate-y-2 duration-300 transition-all">
                <div className="flex justify-center mb-4 h-40">
                  <img 
                    src={getProductImage(product.imageUrl)} 
                    alt={product.name} 
                    className="h-full object-contain filter drop-shadow-md group-hover:scale-110 transition-transform duration-500" 
                    onError={(e) => { e.target.src = defaultImage; }}
                  />
                </div>
                <div className="mt-auto">
                   <h3 className="font-montserrat font-bold text-xl text-primary mb-2 line-clamp-1">{product.name}</h3>
                   <p className="font-nunito text-primary/70 text-sm mb-4 line-clamp-2 min-h-10">{product.description}</p>
                   <div className="flex items-center justify-between">
                     <span className="font-montserrat font-bold text-lg text-primary">
                       {product.price ? Number(product.price).toLocaleString('vi-VN') : 0}đ
                     </span>
                     <Link to={`/product/${product.id}`} className="bg-pinky-gray text-primary w-8 h-8 rounded-full flex items-center justify-center hover:bg-primary hover:text-white transition-colors">
                       <span className="font-bold text-sm leading-none mb-0.5">+</span>
                     </Link>
                   </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}