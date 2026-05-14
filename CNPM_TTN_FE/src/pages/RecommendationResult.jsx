import { useLocation, useNavigate, Link } from 'react-router-dom';
import { ShoppingBag, RefreshCw, ArrowLeft } from 'lucide-react';
import useStore from '../store/useStore';

// Logic gợi ý cà phê dựa trên câu trả lời quiz
const getRecommendation = (answers) => {
    const roast = answers[1];   // light / medium / dark
    const flavor = answers[2];  // floral / chocolate / bold
    const method = answers[3];  // phin / espresso / pour
    const time = answers[4];    // morning / afternoon / evening

    // Bảng gợi ý đơn giản theo tổ hợp
    if (roast === 'dark' || flavor === 'bold' || method === 'phin') {
        return {
            name: 'Robusta Đặc Biệt',
            subtitle: 'Đậm đà – Rang đậm – Pha phin',
            reason: 'Dựa trên sở thích của bạn với hương vị mạnh mẽ và đậm đà, Robusta Đặc Biệt là lựa chọn hoàn hảo. Rang đậm tạo ra lớp crema dày và hậu vị kéo dài.',
            flavorNotes: ['Cacao đắng', 'Gỗ sồi', 'Caramel đậm'],
            matchScore: 95,
            price: 185000,
            imageUrl: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=600&q=80',
        };
    }
    if (roast === 'light' || flavor === 'floral' || method === 'pour') {
        return {
            name: 'Ethiopia Yirgacheffe',
            subtitle: 'Thanh lịch – Rang nhẹ – Pour-over',
            reason: 'Với gu thích hương thanh lịch và tươi sáng, Ethiopia Yirgacheffe mang đến trải nghiệm cà phê đặc sản với tầng hương hoa và trái cây tinh tế.',
            flavorNotes: ['Hoa nhài', 'Cam bergamot', 'Đào chín'],
            matchScore: 92,
            price: 225000,
            imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=80',
        };
    }
    // medium / chocolate / espresso — mặc định
    return {
        name: 'Colombia Supremo',
        subtitle: 'Cân bằng – Rang vừa – Espresso',
        reason: 'Bạn yêu thích sự cân bằng giữa vị đắng và ngọt. Colombia Supremo với rang vừa cho ra tách espresso hoàn hảo — đậm vừa phải, hậu socola nhẹ.',
        flavorNotes: ['Socola sữa', 'Caramel', 'Hạnh nhân'],
        matchScore: 90,
        price: 195000,
        imageUrl: 'https://images.unsplash.com/photo-1511537190424-bbbab87ac5eb?w=600&q=80',
    };
};

const SUGGESTIONS = [
    {
        name: 'Brazil Santos',
        price: 165000,
        imageUrl: 'https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=400&q=80',
    },
    {
        name: 'Arabica Đà Lạt',
        price: 175000,
        imageUrl: 'https://images.unsplash.com/photo-1498804103079-a6351b050096?w=400&q=80',
    },
    {
        name: 'Blend Signature',
        price: 155000,
        imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&q=80',
    },
];

const RecommendationResult = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const addToCart = useStore((s) => s.addToCart);

    const answers = location.state?.answers;

    // Nếu người dùng vào thẳng URL mà không qua quiz → redirect về quiz
    if (!answers) {
        return (
            <div className="min-h-screen bg-[#fafaf5] flex flex-col items-center justify-center gap-6">
                <p className="text-xl text-[#26170c] font-medium">Bạn chưa làm bài quiz!</p>
                <button
                    onClick={() => navigate('/quiz')}
                    className="bg-[#26170c] text-white px-8 py-4 rounded-2xl font-medium hover:bg-black transition"
                >
                    Bắt đầu quiz ngay
                </button>
            </div>
        );
    }

    const result = getRecommendation(answers);

    const handleAddToCart = () => {
        // Gọi addToCart từ Zustand store
        addToCart(
            { id: result.productId || null, name: result.name, price: result.price },
            1,      // quantity
            null,   // grindType
            null,   // flavorNotes
            null,   // weight
            null, null, null, null, null, null, null
        );
        navigate('/cart');
    };

    return (
        <div className="min-h-screen bg-[#fafaf5]">
            {/* Header dùng Link thay href để không reload trang */}
            <header className="bg-white border-b sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
                    <Link to="/" className="text-2xl font-bold text-[#26170c]">REVO Coffee</Link>
                    <nav className="hidden md:flex gap-8 text-sm font-medium">
                        <Link to="/shop" className="hover:text-[#9a4600]">Cửa hàng</Link>
                        <Link to="/subscription" className="hover:text-[#9a4600]">Subscription</Link>
                        <span className="text-[#9a4600] font-semibold">Gợi ý cà phê</span>
                    </nav>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-12">
                {/* Nút quay lại */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-500 hover:text-[#9a4600] mb-10 transition"
                >
                    <ArrowLeft size={18} /> Quay lại
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
                    {/* Hình ảnh */}
                    <div className="relative">
                        <img
                            src={result.imageUrl}
                            alt={result.name}
                            className="w-full aspect-square object-cover rounded-3xl shadow-2xl"
                        />
                        <div className="absolute top-8 left-8 bg-white px-6 py-3 rounded-2xl shadow-xl flex items-center gap-3">
                            <span className="text-3xl">⭐</span>
                            <div>
                                <p className="font-bold text-[#26170c] text-xl">{result.matchScore}% Phù hợp</p>
                                <p className="text-sm text-gray-500">Với gu của bạn</p>
                            </div>
                        </div>
                    </div>

                    {/* Nội dung */}
                    <div className="space-y-8">
                        <div>
                            <span className="uppercase text-[#9a4600] tracking-widest text-sm">LỰA CHỌN HOÀN HẢO</span>
                            <h1 className="text-4xl lg:text-5xl font-bold text-[#26170c] mt-3">{result.name}</h1>
                            <p className="text-lg text-gray-600 mt-2">{result.subtitle}</p>
                        </div>

                        {/* Flavor Notes */}
                        <div className="flex flex-wrap gap-3">
                            {result.flavorNotes.map((flavor, i) => (
                                <span key={i} className="bg-amber-100 text-amber-800 px-5 py-2 rounded-full text-sm font-medium">
                                    {flavor}
                                </span>
                            ))}
                        </div>

                        {/* Lý do */}
                        <div className="bg-[#f4f4ef] p-8 rounded-3xl">
                            <h3 className="font-semibold mb-4 text-[#26170c]">Tại sao chúng tôi gợi ý cho bạn?</h3>
                            <p className="text-gray-700 leading-relaxed">{result.reason}</p>
                        </div>

                        {/* Giá và nút hành động */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <button
                                onClick={handleAddToCart}
                                className="flex-1 bg-[#26170c] text-white py-5 rounded-3xl font-medium flex items-center justify-center gap-3 text-lg hover:bg-black transition"
                            >
                                <ShoppingBag size={24} />
                                Thêm vào giỏ • {result.price.toLocaleString('vi-VN')}đ
                            </button>
                            <Link
                                to="/subscription"
                                className="flex-1 border-2 border-[#9a4600] text-[#9a4600] py-5 rounded-3xl font-medium hover:bg-[#9a4600]/5 transition text-center"
                            >
                                Thêm vào Subscription
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Gợi ý khác */}
                <div className="mt-20">
                    <h2 className="text-2xl font-semibold mb-8">Các gợi ý khác cho bạn</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {SUGGESTIONS.map((item, index) => (
                            <div key={index} className="cursor-pointer group">
                                <img
                                    src={item.imageUrl}
                                    alt={item.name}
                                    className="w-full aspect-square object-cover rounded-3xl mb-4 group-hover:scale-105 transition"
                                />
                                <h4 className="font-medium">{item.name}</h4>
                                <p className="text-[#9a4600]">{item.price.toLocaleString('vi-VN')}đ</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="text-center mt-16">
                    <button
                        onClick={() => navigate('/quiz')}
                        className="inline-flex items-center gap-3 text-gray-600 hover:text-[#9a4600] transition"
                    >
                        <RefreshCw size={20} />
                        <span>Làm lại bài quiz</span>
                    </button>
                </div>
            </main>
        </div>
    );
};

export default RecommendationResult;