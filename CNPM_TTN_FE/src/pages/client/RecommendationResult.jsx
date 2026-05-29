import { useLocation, useNavigate, Link } from 'react-router-dom';
import { ShoppingBag, RefreshCw, ArrowLeft } from 'lucide-react';
import useStore from '../../store/useStore';


const RecommendationResult = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const addToCart = useStore((s) => s.addToCart);

    const recommendation = location.state?.recommendation;
    const answers = location.state?.answers;

    // Nếu không có kết quả từ API (có thể bỏ qua quiz hoặc API lỗi) → hiển thị lỗi
    if (!recommendation) {
        return (
            <div className="min-h-screen bg-[#fafaf5] flex flex-col items-center justify-center gap-6 px-6">
                <div className="text-center">
                    <p className="text-5xl mb-4">☕</p>
                    <h2 className="text-2xl font-bold text-[#26170c] mb-2">Chưa có kết quả gợi ý</h2>
                    <p className="text-gray-500 mb-6">Bạn chưa làm quiz hoặc đã xảy ra lỗi kết nối. Vui lòng thử lại.</p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={() => navigate('/quiz')}
                        className="bg-[#26170c] text-white px-8 py-4 rounded-2xl font-medium hover:bg-black transition"
                    >
                        Làm lại quiz
                    </button>
                    <Link
                        to="/shop"
                        className="border-2 border-[#9a4600] text-[#9a4600] px-8 py-4 rounded-2xl font-medium hover:bg-[#9a4600]/5 transition"
                    >
                        Xem cửa hàng
                    </Link>
                </div>
            </div>
        );
    }

    const result = recommendation.MainSuggestion ?? recommendation.mainSuggestion;
    const otherSuggestions = recommendation.OtherSuggestions ?? recommendation.otherSuggestions ?? [];

    const resultName = result?.name ?? result?.Name;
    const resultSubtitle = result?.subtitle ?? result?.Subtitle;
    const resultReason = result?.reason ?? result?.Reason;
    const resultFlavorNotes = result?.flavorNotes ?? result?.FlavorNotes ?? [];
    const resultMatchScore = result?.matchScore ?? result?.MatchScore ?? 90;
    const resultPrice = result?.price ?? result?.Price ?? 0;
    const resultImageUrl = result?.imageUrl ?? result?.ImageUrl;
    const prodId = result?.productId ?? result?.ProductId;

    const handleAddToCart = async () => {
        if (!prodId) {
            alert('Không xác định được sản phẩm. Vui lòng thử lại hoặc tìm sản phẩm trong cửa hàng.');
            return;
        }
        try {
            // addToCart(product, quantity, grindType, flavorNotes, weight,
            //           receiverName, receiverPhone, shippingProvince,
            //           shippingDistrict, shippingWard, shippingDetailAddress, shippingNote)
            await addToCart(
                { id: prodId, name: resultName, price: resultPrice },
                1,       // quantity
                null,    // grindType
                null,    // flavorNotes
                null,    // weight
                null, null, null, null, null, null, null  // shipping fields (điền ở trang checkout)
            );
            navigate('/cart');
        } catch (err) {
            const msg = err.response?.data?.Message || err.response?.data?.message || err.message || '';
            if (err.response?.status === 401 || msg.toLowerCase().includes('unauthor')) {
                alert('Bạn cần đăng nhập để thêm vào giỏ hàng!');
            } else {
                alert('Thêm vào giỏ thất bại: ' + msg);
            }
        }
    };

    return (
        <div className="min-h-screen bg-[#fafaf5]">
            {/* Header dùng Link thay href để không reload trang */}
            <header className="bg-white border-b sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
                    <Link to="/" className="text-2xl font-bold text-[#26170c]">REVO Coffee</Link>
                    <nav className="hidden md:flex gap-8 text-sm font-medium">
                        <Link to="/shop" className="hover:text-[#9a4600]">Cửa hàng</Link>
                        <Link to="/subscription" className="hover:text-[#9a4600]">Đăng ký</Link>
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
                            src={resultImageUrl}
                            alt={resultName}
                            className="w-full aspect-square object-cover rounded-3xl shadow-2xl"
                        />
                        <div className="absolute top-8 left-8 bg-white px-6 py-3 rounded-2xl shadow-xl flex items-center gap-3">
                            <span className="text-3xl">⭐</span>
                            <div>
                                <p className="font-bold text-[#26170c] text-xl">{resultMatchScore}% Phù hợp</p>
                                <p className="text-sm text-gray-500">Với gu của bạn</p>
                            </div>
                        </div>
                    </div>

                    {/* Nội dung */}
                    <div className="space-y-8">
                        <div>
                            <span className="uppercase text-[#9a4600] tracking-widest text-sm">LỰA CHỌN HOÀN HẢO</span>
                            <h1 className="text-4xl lg:text-5xl font-bold text-[#26170c] mt-3">{resultName}</h1>
                            <p className="text-lg text-gray-600 mt-2">{resultSubtitle}</p>
                        </div>

                        {/* Flavor Notes */}
                        <div className="flex flex-wrap gap-3">
                            {resultFlavorNotes.map((flavor, i) => (
                                <span key={i} className="bg-amber-100 text-amber-800 px-5 py-2 rounded-full text-sm font-medium">
                                    {flavor}
                                </span>
                            ))}
                        </div>

                        {/* Lý do */}
                        <div className="bg-[#f4f4ef] p-8 rounded-3xl">
                            <h3 className="font-semibold mb-4 text-[#26170c]">Tại sao chúng tôi gợi ý cho bạn?</h3>
                            <p className="text-gray-700 leading-relaxed">{resultReason}</p>
                        </div>

                        {/* Giá và nút hành động */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <button
                                onClick={handleAddToCart}
                                className="flex-1 bg-[#26170c] text-white py-5 rounded-3xl font-medium flex items-center justify-center gap-3 text-lg hover:bg-black transition cursor-pointer"
                            >
                                <ShoppingBag size={24} />
                                Thêm vào giỏ • {resultPrice.toLocaleString('vi-VN')}đ
                            </button>
                            <Link
                                to="/subscription"
                                state={{ productId: prodId }}
                                className="flex-1 border-2 border-[#9a4600] text-[#9a4600] py-5 rounded-3xl font-medium hover:bg-[#9a4600]/5 transition text-center flex items-center justify-center"
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
                        {otherSuggestions.map((item, index) => {
                            const prodId = item.productId ?? item.ProductId;
                            const name = item.name ?? item.Name;
                            const price = item.price ?? item.Price ?? 0;
                            const imageUrl = item.imageUrl ?? item.ImageUrl;
                            return (
                                <div 
                                    key={index} 
                                    className="cursor-pointer group"
                                    onClick={() => prodId && navigate(`/product/${prodId}`)}
                                >
                                    <img
                                        src={imageUrl}
                                        alt={name}
                                        className="w-full aspect-square object-cover rounded-3xl mb-4 group-hover:scale-105 transition"
                                    />
                                    <h4 className="font-medium">{name}</h4>
                                    <p className="text-[#9a4600]">{price.toLocaleString('vi-VN')}đ</p>
                                </div>
                            );
                        })}
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
