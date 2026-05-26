import React, { useEffect, useState } from 'react';
import giftset1Img from '../../assets/img/section3/giftset1Img.png';
import giftset2Img from '../../assets/img/section3/giftset2Img.png';
import giftset3Img from '../../assets/img/section3/giftset3Img.png';
import coffeeBeansIcon from '../../assets/img/section3/coffeeBeansIcon.svg';
import mountainIcon from '../../assets/img/section3/mountainIcon.svg';
import useStore from '../../store/useStore';
import API from '../../services/api';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const fallbackImages = [giftset1Img, giftset2Img, giftset3Img];

const fallbackGiftsets = [
  {
    id: 1,
    name: 'GIFTSET 1',
    price: 285000,
    desc: 'Món quà tuyệt vời dành cho người sành cà phê',
    coffeeTypes: 'Loại hạt: Fine Robusta Blend',
    altitude: 'Độ cao: 700 - 800m',
    image: giftset1Img,
    isApiProduct: false,
  },
  {
    id: 2,
    name: 'GIFTSET 2',
    price: 305000,
    desc: 'Dành tặng cho những ai yêu thích hương vị đậm đà',
    coffeeTypes: 'Loại hạt: 100% Robusta Honey',
    altitude: 'Độ cao: 800 - 1000m',
    image: giftset2Img,
    isApiProduct: false,
  },
  {
    id: 3,
    name: 'GIFTSET 3',
    price: 345000,
    desc: 'Trải nghiệm đỉnh cao từ dòng Arabica thượng hạng',
    coffeeTypes: 'Loại hạt: 100% Arabica Cầu Đất',
    altitude: 'Độ cao: > 1500m',
    image: giftset3Img,
    isApiProduct: false,
  },
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

const normalizeGiftset = (item, index) => ({
  id: item.id ?? item.Id,
  name: item.name ?? item.Name,
  price: Number(item.price ?? item.Price ?? 0),
  desc: item.description ?? item.Description ?? 'Set quà cà phê cao cấp từ Revo Coffee.',
  coffeeTypes: item.coffeeTypes ?? item.CoffeeTypes ?? 'Loại hạt: Cà phê tuyển chọn',
  altitude: item.altitude ?? item.Altitude ?? 'Độ cao: Đang cập nhật',
  image: item.imageUrl ?? item.ImageUrl ?? fallbackImages[index % fallbackImages.length],
  isApiProduct: true,
});

export default function Giftsets() {
  const addToCart = useStore((state) => state.addToCart);
  const [giftsets, setGiftsets] = useState(fallbackGiftsets);

  useEffect(() => {
    const loadGiftsets = async () => {
      try {
        const res = await API.getProducts({
          searchTerm: 'GIFTSET',
          page: 1,
          pageSize: 12,
        });
        const items = getProductItems(res);

        if (Array.isArray(items) && items.length > 0) {
          setGiftsets(items.map(normalizeGiftset));
        }
      } catch (err) {
        console.error('Lỗi lấy danh sách giftset:', err);
      }
    };

    loadGiftsets();
  }, []);

  const handleAddGiftset = async (set) => {
    if (!set.isApiProduct) {
      alert('Giftset chưa có dữ liệu sản phẩm trong hệ thống nên chưa thể thêm vào giỏ hàng.');
      return;
    }

    try {
      await addToCart(
        {
          id: set.id,
          name: set.name,
          price: set.price,
          image: set.image,
        },
        1,
        null,
        'Hộp quà',
        '1 set'
      );

      alert(`Đã thêm ${set.name} vào giỏ hàng!`);
    } catch (err) {
      console.error('Lỗi thêm giftset vào giỏ hàng:', err);
      alert('Không thể thêm giftset vào giỏ hàng. Vui lòng thử lại.');
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
    <section id="giftset" className="py-24 bg-white relative overflow-hidden">
      <div className="container mx-auto px-6 lg:px-12 max-w-7xl">
        <div className="text-center mb-16">
          <p className="text-accent-1 font-nunito font-bold tracking-[0.2em] uppercase mb-4">
            Món quà từ trái tim
          </p>
          <h2 className="text-4xl md:text-5xl font-nunito font-bold text-primary mb-4">
            SET QUÀ TẶNG THƯỢNG HẠNG
          </h2>
          <p className="font-nunito text-primary/70 leading-relaxed max-w-2xl mx-auto">
            Trọn bộ quà tặng tinh tế và đẳng cấp từ Revo Coffee. Sự lựa chọn
            hoàn hảo để dành tặng đối tác, khách hàng hoặc những người thân yêu.
          </p>
        </div>

        <Slider {...settings}>
          {giftsets.map((set) => (
            <div key={set.id} className="p-4 h-full">
              <div className="bg-white rounded-[40px] overflow-hidden border hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 group h-full flex flex-col min-h-[620px]">
                <div className="bg-pinky-gray flex justify-center items-center p-10 relative overflow-hidden h-[300px] shrink-0">
                  <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <img
                    src={set.image}
                    alt={set.name}
                    className="h-full max-h-[220px] w-full object-contain drop-shadow-2xl group-hover:scale-105 transition-transform duration-500 relative z-10"
                  />
                </div>

                <div className="p-8 text-center flex flex-col flex-1">
                  <h3 className="font-montserrat font-black text-3xl text-primary mb-4">
                    {set.name}
                  </h3>
                  <p className="font-nunito text-primary/70 italic leading-relaxed mb-8 min-h-[78px] line-clamp-3">
                    {set.desc}
                  </p>

                  <div className="space-y-4 mb-8 min-h-[72px]">
                    <div className="flex items-center justify-center gap-3">
                      <img src={coffeeBeansIcon} alt="Coffee Beans" className="w-5 h-5" />
                      <span className="font-nunito text-primary line-clamp-1">{set.coffeeTypes}</span>
                    </div>
                    <div className="flex items-center justify-center gap-3">
                      <img src={mountainIcon} alt="Mountain" className="w-5 h-5" />
                      <span className="font-nunito text-primary line-clamp-1">{set.altitude}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-4 mt-auto">
                    <span className="font-montserrat font-black text-3xl text-accent-1">
                      {set.price.toLocaleString('vi-VN')}đ
                    </span>
                    <button
                      onClick={() => handleAddGiftset(set)}
                      className="bg-primary hover:bg-accent-1 text-white font-bold py-3 px-6 rounded-full shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105"
                    >
                      CHỌN MUA
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </Slider>
      </div>
    </section>
  );
}
