import React, { useEffect, useState } from 'react';
import combo1 from '../../assets/img/section4/combo1.png';
import combo2 from '../../assets/img/section4/combo2.png';
import combo3 from '../../assets/img/section4/combo3.png';
import useStore from '../../store/useStore';
import API from '../../services/api';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const fallbackImages = [combo1, combo2, combo3];

const fallbackCombos = [
  { id: 1, name: 'COMBO 1', image: combo1, originalPrice: 145000, discountPrice: 119000, isApiProduct: false },
  { id: 2, name: 'COMBO 2', image: combo2, originalPrice: 175000, discountPrice: 139000, isApiProduct: false },
  { id: 3, name: 'COMBO 3', image: combo3, originalPrice: 210000, discountPrice: 169000, isApiProduct: false },
];

const getProductItems = (response) => {
  const pageData = response.data?.data || response.data?.Data || {};
  return (
    pageData.items ||
    pageData.Items ||
    response.data?.items ||
    response.data?.Items ||
    []
  );
};

const normalizeCombo = (item, index) => {
  const price = Number(item.price ?? item.Price ?? 0);

  return {
    id: item.id ?? item.Id,
    name: item.name ?? item.Name,
    image: item.imageUrl ?? item.ImageUrl ?? fallbackImages[index % fallbackImages.length],
    originalPrice: Number(item.originalPrice ?? item.OriginalPrice ?? price),
    discountPrice: Number(item.discountPrice ?? item.DiscountPrice ?? price),
    desc: item.description ?? item.Description ?? 'Tiết kiệm hơn khi mua theo combo',
    isApiProduct: true,
  };
};

export default function Combos() {
  const addToCart = useStore((state) => state.addToCart);
  const [combos, setCombos] = useState(fallbackCombos);

  useEffect(() => {
    const loadCombos = async () => {
      try {
        const res = await API.getProducts({
          searchTerm: 'COMBO',
          page: 1,
          pageSize: 12,
        });
        const items = getProductItems(res);

        if (Array.isArray(items) && items.length > 0) {
          setCombos(items.map(normalizeCombo));
        }
      } catch (err) {
        console.error('Lỗi lấy danh sách combo:', err);
      }
    };

    loadCombos();
  }, []);

  const handleAddCombo = async (combo) => {
    if (!combo.isApiProduct) {
      alert('Combo chưa có dữ liệu sản phẩm trong hệ thống nên chưa thể thêm vào giỏ hàng.');
      return;
    }

    try {
      await addToCart(
        {
          id: combo.id,
          name: combo.name,
          price: combo.discountPrice,
          image: combo.image,
        },
        1,
        null,
        'Combo gói',
        '1 combo'
      );

      alert(`Đã thêm ${combo.name} vào giỏ hàng!`);
    } catch (err) {
      console.error('Lỗi thêm combo vào giỏ hàng:', err);
      alert('Không thể thêm combo vào giỏ hàng. Vui lòng thử lại.');
    }
  };

  const settings = {
    dots: true,
    arrows: false,
    infinite: true,
    speed: 800,
    slidesToShow: 3,
    slidesToScroll: 3,
    autoplay: true,
    autoplaySpeed: 2500,
    cssEase: 'ease-in-out',
    pauseOnHover: true,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 2, slidesToScroll: 2 } },
      { breakpoint: 640, settings: { slidesToShow: 1, slidesToScroll: 1 } },
    ],
  };

  return (
    <section id="combos" className="py-24 bg-white relative overflow-hidden">
      <div className="absolute left-0 bottom-0 w-72 h-72 bg-accent-1/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="container mx-auto px-6 lg:px-12 max-w-7xl relative z-10">
        <div className="text-center mb-16">
          <p className="text-accent-1 font-nunito font-bold tracking-[0.2em] uppercase mb-4">
            Combo Tiết Kiệm
          </p>
          <h2 className="text-4xl md:text-5xl font-nunito font-bold text-primary mb-4">
            TẬN HƯỞNG TRỌN VẸN
          </h2>
          <p className="font-nunito text-primary/70 leading-relaxed max-w-2xl mx-auto">
            Những combo cà phê được tuyển chọn đặc biệt, giúp bạn thưởng thức
            hương vị trọn vẹn với mức giá tiết kiệm hơn.
          </p>
        </div>

        <Slider {...settings}>
          {combos.map((combo) => (
            <div key={combo.id} className="p-4">
              <div className="bg-white rounded-[40px] overflow-hidden border border-gray-100 hover:border-accent-1 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 group">
                <div className="bg-pinky-gray flex justify-center items-center p-10 relative overflow-hidden">
                  <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <img
                    src={combo.image}
                    alt={combo.name}
                    className="h-[220px] object-contain drop-shadow-2xl group-hover:scale-105 transition-transform duration-500 relative z-10"
                  />
                </div>

                <div className="p-8 text-center">
                  <h3 className="font-montserrat font-black text-3xl text-primary mb-3">
                    {combo.name}
                  </h3>
                  <p className="font-nunito text-primary/60 italic mb-6">
                    {combo.desc || 'Tiết kiệm hơn khi mua theo combo'}
                  </p>

                  <div className="flex items-end justify-center gap-4 mb-8">
                    <span className="text-primary/40 line-through text-xl font-medium">
                      {combo.originalPrice.toLocaleString('vi-VN')}đ
                    </span>
                    <span className="font-montserrat font-black text-4xl text-red-500">
                      {combo.discountPrice.toLocaleString('vi-VN')}đ
                    </span>
                  </div>

                  <button
                    onClick={() => handleAddCombo(combo)}
                    className="w-full bg-primary hover:bg-accent-1 text-white font-bold py-4 rounded-full shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 tracking-wider"
                  >
                    THÊM VÀO GIỎ
                  </button>
                </div>
              </div>
            </div>
          ))}
        </Slider>
      </div>
    </section>
  );
}
