import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useStore from "../store/useStore";
import {
  Coffee,
  CalendarSync,
  CreditCard,
  ChevronRight,
  Check,
  ShieldCheck,
  HelpCircle,
  Loader2,
  Lock,
  Sparkles,
  Compass,
  ArrowRight,
} from "lucide-react";
import API from "../services/api";
import confetti from "canvas-confetti";
import defaultImage from "../assets/img/section2/image1.png";
export default function Subscription() {
  const navigate = useNavigate();
  const products = useStore((state) => state.products);
  const fetchProducts = useStore((state) => state.fetchProducts);
  const fetchQuizMatchedProducts = useStore(
    (state) => state.fetchQuizMatchedProducts
  );
  const user = useStore((state) => state.user);

  const getProductImage = (imgUrl) => {
    if (!imgUrl) return defaultImage;

    if (imgUrl.startsWith("http://") || imgUrl.startsWith("https://")) {
      return imgUrl;
    }

    return `http://localhost:5126${imgUrl}`;
  };
  // Quản lý màn hình ban đầu: 'welcome', 'quiz', hoặc 'main'
  const [viewMode, setViewMode] = useState("welcome");

  // State khảo sát (Quiz) - Hiện tại tăng lên 5 bước tương ứng 5 tiêu chí lọc
  const [quizStep, setQuizStep] = useState(1);

  const [step, setStep] = useState(1); // 1: Chọn sản phẩm, 2: Định lượng & Kiểu xay, 3: Chu kỳ & Thanh toán
  const [productDetail, setProductDetail] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // State quản lý thông số sản phẩm
  const [flavorNotes, setFlavorNotes] = useState("Original");
  const [weights, setWeight] = useState("");
  const [grindType, setGrindType] = useState(null);
  const [quantity, setQuantity] = useState(1);

  // Nghiệp vụ: Chu kỳ, Hình thức cam kết gói và Phương thức thanh toán
  const [frequency, setFrequency] = useState("2weeks");
  const [commitment, setCommitment] = useState("pay-as-you-go");
  const [paymentMethod, setPaymentMethod] = useState("card_auto");

  const [deliveryDay, setDeliveryDay] = useState("Thứ Ba"); // 'Tuesday' hoặc 'Thursday'

  const [isBindingCard, setIsBindingCard] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [cardInfo, setCardInfo] = useState({
    number: "",
    name: "",
    expiry: "",
    cvv: "",
  });
  const [showQrModal, setShowQrModal] = useState(false);

  // Giả định thông tin user
  const [userInfo] = useState({
    fullName: user.name,
    phone: user.phone,
    address: "làng Thượng Phường, xã Yên Thành, huyện Yên Mô, tỉnh Ninh Bình",
  });

  // ĐÃ THAY ĐỔI: Xóa 'method', thêm 'region', 'roast', 'process' chuẩn dữ liệu DB
  const [quizAnwers, setQuizAnswers] = useState({
    height: "",
    flavorNotes: "",
    region: "",
    roast: "",
    process: "",
  });

  const handlePaymentSubmit = () => {
    if (paymentMethod === "vnpay") {
      // Nếu chọn VNPay -> Bật modal QR lên cho khách quét
      setShowQrModal(true);
    } else {
      // Xử lý cho các phương thức khác (thẻ tự động, chuyển khoản...) như cũ
      goToSuccessPage();
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    if (products.length > 0 && !selectedProduct) {
      handleSelectProduct(products[0]);
    }
  }, [products]);

  useEffect(() => {
    if (isSuccess) {
      // Cấu hình phát nổ từ bên trái
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { x: 0.1, y: 0.6 },
        colors: ["#a16207", "#78350f", "#f59e0b", "#22c55e"], // Màu sắc theo gu Revo Coffee
      });

      // Cấu hình phát nổ từ bên phải đối xứng
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { x: 0.9, y: 0.6 },
        colors: ["#a16207", "#78350f", "#f59e0b", "#22c55e"],
      });

      // Một cú nổ phụ ở chính giữa sau đó 200ms
      setTimeout(() => {
        confetti({
          particleCount: 80,
          scalar: 1.2,
          spread: 100,
          origin: { x: 0.5, y: 0.4 },
        });
      }, 200);
    }
  }, [isSuccess]);

  const handleSelectProduct = async (product) => {
    setSelectedProduct(product);

    try {
      const res = await API.getProductById(product.id);

      const detail = res.data;

      console.log("DETAIL =", detail);
      console.log(detail);
      console.log(detail.details);
      setProductDetail(detail);

      const flavors =
        detail.details?.flavorNotes?.split(",").map((f) => f.trim()) || [];

      const weightList =
        detail.details?.weight?.split(",").map((w) => w.trim()) || [];

      const grindList = detail.details?.grindingOptions || [];

      setFlavorNotes(flavors[0] || "");
      setWeight(weightList[0] || "");
      setGrindType(grindList[0] || null);
    } catch (err) {
      console.error("Lỗi lấy chi tiết sản phẩm:", err);
    }
  };
  // ĐÃ THAY ĐỔI: Cập nhật hàm gọi hàm trong Store để truyền đủ tham số mới sang BE lọc
  const handleEvaluateQuiz = async (currentAnswers) => {
    setIsProcessing(true);

    try {
      // Truyền đúng các thuộc tính id số/chữ khớp dữ liệu thật của DB để BE thực hiện lọc LIKE
      const matchedProducts = await fetchQuizMatchedProducts(
        currentAnswers.flavorNotes,
        currentAnswers.region,
        currentAnswers.process,
        currentAnswers.roast,
        currentAnswers.height
      );

      if (matchedProducts && matchedProducts.length > 0) {
        const bestMatch = matchedProducts[0];
        await handleSelectProduct(bestMatch);
      } else {
        if (products.length > 0) handleSelectProduct(products[0]);
      }

      setViewMode("main");
      setStep(2);
    } catch (err) {
      console.error("Lỗi luồng Quiz kết nối với Be :", err);

      if (products.length > 0) {
        handleSelectProduct(products[0]);
        setViewMode("main");
        setStep(2);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const getPricePerBag = () => {
    if (!selectedProduct) return 0;
    const basePrice = selectedProduct.price || 250000;
    let discount = 0;

    if (frequency === "1week") discount += 0.15;
    else if (frequency === "2weeks") discount += 0.1;
    else if (frequency === "1month") discount += 0.05;

    if (commitment === "3months") discount += 0.05;
    else if (commitment === "6months") discount += 0.1;

    return basePrice * (1 - discount);
  };

  const CategoryMap = {
    1: "Arabica",
    2: "Blend",
    3: "Robusta",
    4: "Fine Robusta",
  };
  const steps = [
    { id: 1, label: "Chọn Cà phê" },
    { id: 2, label: "Định lượng" },
    { id: 3, label: "Chu kỳ & Thanh toán" },
  ];

  const flavorOptions = productDetail?.details?.flavorNotes
    ? productDetail.details.flavorNotes.split(",").map((f) => f.trim())
    : [];

  const weightOptions = productDetail?.details?.weight
    ? productDetail.details.weight.split(",").map((w) => w.trim())
    : [];

  const grindOptions = productDetail?.details?.grindingOptions || [];

  const pricePerBag = getPricePerBag();
  const totalPeriodPrice = pricePerBag * quantity;

  const getVnPayMultiplier = () => {
    if (commitment === "3months") return 3;
    if (commitment === "6months") return 6;
    return 1; // pay-as-you-go hoặc mặc định
  };
  const totalVnPayPrice = totalPeriodPrice * getVnPayMultiplier();

  const createSubscription = useStore((state) => state.createSubscription);
  console.log("ALL STORE KEYS:", Object.keys(useStore.getState()));
  console.log("createSubscription:", useStore.getState().createSubscription);
  const handleSubscribe = () => {
    if (paymentMethod === "vnpay") {
      setShowQrModal(true);
    } else if (paymentMethod === "card_auto") {
      setIsBindingCard(true);
    }
  };

  const handleMockBindingSubmit = (e) => {
    e.preventDefault();
    submitSubscription();
  };
  const submitSubscription = async () => {
    setIsProcessing(true);
    try {
      const token = localStorage.getItem("token");
      const payload = {
        productId: selectedProduct.id,
        quantity: quantity,
        grindType: grindType?.id || null,
        flavorNotes: flavorNotes,
        weight: weights,
        frequency: frequency,
        commitment: commitment,
        paymentMethod: paymentMethod === "card_auto" ? "CARD" : "VNPAY",
        deliveryDay: deliveryDay,
        receiverName: user.name,
        receiverPhone: user.phone,
        shippingAddress:
          "làng Thượng Phường, xã Yên Thành, huyện Yên Mô, tỉnh Ninh Bình",

        // 🛠️ SỬA CHỖ NÀY: VNPAY thì gửi tổng chu kỳ, CARD thì gửi 1 kỳ
        totalPrice:
          paymentMethod === "vnpay" ? totalVnPayPrice : totalPeriodPrice,
      };

      const { default: axios } = await import("axios");
      console.log("grindType =", grindType);
      console.log("payload =", payload);
      await axios.post(
        "http://localhost:5126/api/subscriptions/create",
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setIsSuccess(true);
    } catch (err) {
      alert("Đăng ký thất bại: " + (err.response?.data || err.message));
      console.log(err.response);
      console.log(err.response?.data);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!products.length) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="font-nunito text-lg text-primary animate-pulse">
          Đang tải cấu hình sản phẩm...
        </p>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="bg-gradient-to-b from-amber-50/20 to-white min-h-screen py-16 flex items-center justify-center p-4 font-nunito relative overflow-hidden">
        {/* Khung chứa nội dung thông báo thành công */}
        <div className="bg-white max-w-xl w-full rounded-[32px] shadow-2xl border border-gray-100 p-8 md:p-10 text-center relative overflow-hidden z-10">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-500 via-primary to-orange-600" />

          {/* Icon Checkmark chuyển động */}
          <div className="flex justify-center mb-6 relative">
            <div className="bg-green-50 p-4 rounded-full border border-green-100 shadow-inner">
              <Check
                size={44}
                className="text-green-500 animate-scaleUp"
                strokeWidth={3}
              />
            </div>
          </div>

          <h2 className="font-nunito font-bold text-2xl md:text-3xl text-primary mb-2 tracking-tight">
            KÍCH HOẠT THÀNH CÔNG!
          </h2>
          <p className="text-primary/70 text-xs md:text-sm max-w-sm mx-auto mb-8 leading-relaxed">
            Hộp cà phê theo gu của bạn đã được đưa vào lịch rang xay!
          </p>

          {/* THÈ MEMBER SUBSCRIPTION CARD */}
          <div className="bg-gradient-to-br from-neutral-900 via-neutral-950 to-neutral-900 text-white rounded-2xl p-6 text-left shadow-xl mb-6 relative overflow-hidden border border-neutral-800">
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-accent-1 font-bold font-montserrat">
                  MEMBER SUBSCRIPTION
                </p>
                <h3 className="text-lg font-bold font-montserrat mt-0.5 text-white tracking-wide truncate max-w-[280px]">
                  {selectedProduct?.name || "Revo Premium Coffee"}
                </h3>
              </div>
              <span className="text-[11px] bg-white/10 px-2.5 py-1 rounded-full font-mono border border-white/10 text-white/90">
                #REVO-SUB-2026
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 border-t border-white/10 pt-4 text-xs text-neutral-300 font-nunito">
              <div>
                <p className="opacity-50 text-[10px] uppercase">Ghi chú vị</p>
                <p className="font-bold text-white truncate mt-0.5">
                  {flavorNotes}
                </p>
              </div>
              <div>
                <p className="opacity-50 text-[10px] uppercase">Kiểu xay</p>
                <p className="font-bold text-white truncate mt-0.5">
                  {grindType?.Name || "Nguyên hạt"}
                </p>
              </div>
              <div>
                <p className="opacity-50 text-[10px] uppercase">Số lượng</p>
                <p className="font-bold text-accent-1 mt-0.5">
                  {weights} (x{quantity})
                </p>
              </div>
            </div>
          </div>

          {/* Hộp thông tin thanh toán */}
          <div className="bg-gray-50 rounded-xl p-4 flex items-start gap-3 text-left border border-gray-100 mb-8 text-xs text-primary/80">
            <div className="bg-primary/10 p-1.5 rounded-lg text-primary shrink-0 mt-0.5">
              <CalendarSync size={16} />
            </div>

            {/* CARD AUTO */}
            {paymentMethod === "card_auto" ? (
              <div>
                <p className="font-bold text-primary">
                  Cơ chế gia hạn tự động:
                </p>

                <p className="text-primary/60 mt-0.5 leading-normal">
                  Gói sẽ tự động trừ phí qua thẻ
                  <span className="font-mono font-bold text-primary">
                    {" "}
                    (*{cardInfo.number.slice(-4) || "4321"})
                  </span>{" "}
                  theo chu kỳ
                  <span className="font-bold text-primary">
                    {" "}
                    {frequency === "1week"
                      ? "7 ngày"
                      : frequency === "2weeks"
                      ? "14 ngày"
                      : "30 ngày"}
                    / lần
                  </span>
                  .
                </p>
              </div>
            ) : (
              /* VNPAY */
              <div>
                <p className="font-bold text-primary">
                  Thanh toán VNPay thành công:
                </p>

                <p className="text-primary/60 mt-0.5 leading-normal">
                  Hệ thống đã ghi nhận thanh toán cho gói subscription của bạn.
                  Đơn hàng sẽ được tự động đưa vào lịch rang xay và giao theo
                  chu kỳ bạn đã chọn.
                </p>
              </div>
            )}
          </div>

          {/* Nhóm nút bấm điều hướng */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => navigate("/")}
              className="w-full sm:w-1/3 border border-gray-200 text-primary font-bold py-3.5 px-4 rounded-xl hover:bg-gray-50 transition-all text-sm"
            >
              Về trang chủ
            </button>
            <button
              onClick={() => navigate("/portal")}
              className="w-full sm:w-2/3 bg-primary text-white font-bold py-3.5 px-6 rounded-xl hover:bg-accent-1 transition-all flex items-center justify-center gap-2 group text-sm shadow-md"
            >
              Đi tới quản lý gói của tôi
              <ArrowRight
                size={16}
                className="transform group-hover:translate-x-1 transition-transform"
              />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // MÀN HÌNH TRANG ĐĂNG KÝ THẺ VISA MINH HỌA
  if (isBindingCard) {
    return (
      <div className="bg-white min-h-screen py-16 flex items-center justify-center">
        <div className="container mx-auto px-6 max-w-lg w-full">
          <div className="bg-white rounded-[32px] p-8 shadow-xl border border-gray-100 relative overflow-hidden">
            {isProcessing && (
              <div className="absolute inset-0 bg-white/95 z-50 flex flex-col items-center justify-center">
                <Loader2 size={44} className="text-primary animate-spin mb-4" />
                <p className="font-montserrat font-bold text-sm text-primary tracking-wide">
                  ĐANG KẾT NỐI CỔNG THANH TOÁN...
                </p>
                <p className="font-nunito text-xs text-primary/60 mt-1">
                  Mã hóa thông tin và khởi tạo Token bảo mật
                </p>
              </div>
            )}
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
              <CreditCard size={24} className="text-primary" />
              <div>
                <h2 className="font-montserrat font-bold text-lg text-primary">
                  Kích Hoạt Liên Kết Thẻ
                </h2>
              </div>
            </div>
            <div className="w-full h-50 bg-gradient-to-br from-gray-950 to-gray-800 rounded-2xl p-5 text-white flex flex-col justify-between shadow-lg mb-6 relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-5 -mt-5"></div>
              <div className="flex justify-between items-start">
                <span className="font-montserrat font-black text-base italic tracking-widest text-accent-1/90">
                  REVO PREMIUM
                </span>
                <span className="text-xs font-bold text-white/60 bg-white/10 px-2 py-0.5 rounded">
                  VISA / Master
                </span>
              </div>
              <div className="font-mono text-lg tracking-[0.2em] my-2 text-center text-white/90">
                {cardInfo.number || "•••• •••• •••• ••••"}
              </div>
              <div className="flex justify-between font-mono text-xs text-white/70">
                <div>
                  <p className="text-[9px] text-white/40 uppercase">Chủ thẻ</p>
                  <p className="uppercase tracking-wider truncate max-w-[180px]">
                    {cardInfo.name || "NGUYEN VAN A"}
                  </p>
                </div>
                <div>
                  <p className="text-[9px] text-white/40 uppercase">Hạn dùng</p>
                  <p>{cardInfo.expiry || "MM/YY"}</p>
                </div>
              </div>
            </div>
            <form
              onSubmit={handleMockBindingSubmit}
              className="space-y-4 font-nunito text-sm"
            >
              <div>
                <label className="block text-primary/70 font-semibold mb-1">
                  Số thẻ tín dụng
                </label>
                <input
                  type="text"
                  required
                  maxLength="19"
                  placeholder="9999 9999 9999 9999"
                  value={cardInfo.number}
                  onChange={(e) =>
                    setCardInfo({ ...cardInfo, number: e.target.value })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-primary font-mono text-base"
                />
              </div>
              <div>
                <label className="block text-primary/70 font-semibold mb-1">
                  Tên trên thẻ (In hoa không dấu)
                </label>
                <input
                  type="text"
                  required
                  placeholder="NGUYEN VAN A"
                  value={cardInfo.name}
                  onChange={(e) =>
                    setCardInfo({
                      ...cardInfo,
                      name: e.target.value.toUpperCase(),
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-primary uppercase text-base"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-primary/70 font-semibold mb-1">
                    Hết hạn (MM/YY)
                  </label>
                  <input
                    type="text"
                    required
                    maxLength="5"
                    placeholder="12/28"
                    value={cardInfo.expiry}
                    onChange={(e) =>
                      setCardInfo({ ...cardInfo, expiry: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-primary text-center font-mono text-base"
                  />
                </div>
                <div>
                  <label className="block text-primary/70 font-semibold mb-1">
                    Mã bí mật (CVV)
                  </label>
                  <input
                    type="password"
                    required
                    maxLength="3"
                    placeholder="***"
                    value={cardInfo.cvv}
                    onChange={(e) =>
                      setCardInfo({ ...cardInfo, cvv: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-primary text-center font-mono text-base"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 text-green-700 bg-green-50 p-3 rounded-xl text-xs mt-4">
                <Lock size={14} className="shrink-0" />
                <span>
                  Thông tin thẻ được kiểm thử cục bộ mã hóa theo tiêu chuẩn bảo
                  mật PCI-DSS.
                </span>
              </div>
              <div className="flex gap-3 pt-4 border-t border-gray-100 mt-6">
                <button
                  type="button"
                  onClick={() => setIsBindingCard(false)}
                  className="w-1/3 border border-gray-200 text-primary py-3 rounded-full font-bold hover:bg-gray-50 transition-colors"
                >
                  Quay lại
                </button>
                <button
                  type="submit"
                  className="w-2/3 bg-primary text-white py-3 rounded-full font-bold hover:bg-accent-1 transition-colors shadow"
                >
                  Xác nhận liên kết
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // --- LUỒNG 1: MÀN HÌNH CHÀO MỪNG (BẠN MUỐN GÌ?) ---
  if (viewMode === "welcome") {
    return (
      <div className="bg-white min-h-screen py-16 flex items-center justify-center animate-fade-in">
        <div className="container mx-auto px-6 max-w-3xl text-center">
          <p className="text-accent-1 font-nunito font-bold tracking-[0.2em] uppercase mb-2 text-3xl">
            Revo Subscription
          </p>
          <h1 className="font-nunito font-bold text-6xl md:text-5xl text-primary mb-4">
            BẠN MUỐN BẮT ĐẦU NHƯ THẾ NÀO?
          </h1>
          <p className="font-nunito text-primary/60 max-w-lg mx-auto mb-12 text-sm md:text-base">
            Hãy chọn cách thức tiện lợi nhất để chúng tôi chuẩn bị những mẻ rang
            hoàn hảo dành riêng cho bạn.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto font-nunito">
            <div
              onClick={() => {
                setViewMode("quiz");
                setQuizStep(1);
              }}
              className="border border-gray-100 shadow-lg hover:shadow-xl rounded-[24px] p-8 text-center bg-white cursor-pointer hover:border-primary transition-all group flex flex-col justify-between items-center"
            >
              <div className="w-16 h-16 bg-accent-1 rounded-full flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform">
                <Sparkles size={28} />
              </div>
              <h3 className="font-montserrat font-bold text-lg text-primary mb-2">
                Tìm kiếm theo Gu
              </h3>
              <p className="font-nunito text-xs text-primary/60 mb-6 leading-relaxed">
                Trả lời nhanh các câu hỏi khảo sát chi tiết để hệ thống lọc tìm
                dòng hạt lý tưởng nhất với gu của bạn.
              </p>
              <span className="text-primary font-bold font-nunito text-xs flex items-center gap-1 group-hover:gap-2 transition-all">
                Khám phá ngay <ArrowRight size={14} />
              </span>
            </div>

            <div
              onClick={() => setViewMode("main")}
              className="border border-gray-100 shadow-lg hover:shadow-xl rounded-[24px] p-8 text-center bg-white cursor-pointer hover:border-primary transition-all group flex flex-col justify-between items-center"
            >
              <div className="w-16 h-16 bg-accent-1 rounded-full flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform">
                <Compass size={28} />
              </div>
              <h3 className="font-montserrat font-bold text-lg text-primary mb-2">
                Tôi tự lựa chọn
              </h3>
              <p className="font-nunito text-xs text-primary/60 mb-6 leading-relaxed">
                Bạn đã biết rõ mình cần gì? Đi thẳng tới danh mục sản phẩm của
                Revo để thiết lập định lượng và chu kỳ giao hàng.
              </p>
              <span className="text-primary font-bold font-nunito text-xs flex items-center gap-1 group-hover:gap-2 transition-all">
                Xem danh sách hạt <ArrowRight size={14} />
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- LUỒNG 2: MÀN HÌNH CÂU HỎI NHANH (QUIZ CẬP NHẬT 5 BƯỚC) ---
  if (viewMode === "quiz") {
    return (
      <div className="bg-white min-h-screen py-16 flex items-center justify-center relative">
        {isProcessing && (
          <div className="absolute inset-0 bg-white/95 z-50 flex flex-col items-center justify-center">
            <Loader2 size={44} className="text-primary animate-spin mb-4" />
            <p className="font-montserrat font-bold text-sm text-primary tracking-wide">
              ĐANG PHÂN TÍCH GU CÀ PHÊ CỦA BẠN...
            </p>
            <p className="font-nunito text-xs text-primary/60 mt-1">
              Lựa chọn hạt và cấu hình phù hợp nhất từ Database
            </p>
          </div>
        )}
        <div className="container mx-auto px-6 max-w-3xl">
          <p className="text-accent-1 font-nunito font-bold tracking-[0.1em] uppercase mb-2 text-3xl text-center">
            Hương vị không đại trà Vì cá tính của bạn là độc nhất.
          </p>
          <p className="font-nunito text-primary/60 max-w-lg mx-auto mb-12 text-sm md:text-xl text-center">
            Cuộc sống bận rộn có thể khiến bạn thỏa hiệp với nhiều thứ, nhưng
            hương vị cà phê mỗi sáng thì tuyệt đối không. Bản sắc của bạn, mẻ
            rang của Revo.
          </p>
          <div className="bg-white rounded-[32px] p-8 shadow-xl border border-gray-100">
            {/* Thanh tiến trình Quiz */}
            <div className="flex justify-between items-center mb-8">
              <span className="text-xs font-bold font-nunito text-accent-1 uppercase tracking-wider">
                Khảo sát Gu của bạn
              </span>
              <span className="text-xs font-bold font-montserrat text-primary/50">
                Câu hỏi {quizStep} / 5
              </span>
            </div>
            <div className="w-full h-1 bg-gray-100 rounded-full mb-8 overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${(quizStep / 5) * 100}%` }}
              ></div>
            </div>

            {/* Câu hỏi 1: Độ cao địa hình (Height) */}
            {quizStep === 1 && (
              <div className="animate-fade-in">
                <h3 className="font-montserrat font-bold text-lg text-primary mb-6 text-center">
                  Bạn thích loại hạt được trồng từ địa hình nào?
                </h3>
                <div className="space-y-3">
                  {[
                    {
                      id: "1000-2000m",
                      label: "Vùng cao nguyên (Trên 1500m)",
                      desc: "Thường là hạt Arabica với tầng hương phong phú",
                    },
                    {
                      id: "<1000m",
                      label: "Vùng đồi thấp (Khoảng 800m)",
                      desc: "Thường là hạt Robusta mang vị đầm và đậm đà",
                    },
                    {
                      id: "",
                      label: "Cân bằng / Bất kỳ",
                      desc: "Bỏ qua tiêu chí độ cao khi lọc sản phẩm",
                    },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        setQuizAnswers({ ...quizAnwers, height: opt.id });
                        setQuizStep(2);
                      }}
                      className="w-full text-left p-4 border border-gray-200 rounded-2xl hover:border-primary hover:bg-primary/[0.01] transition-all font-nunito"
                    >
                      <p className="font-bold text-primary text-sm">
                        {opt.label}
                      </p>
                      <p className="text-xs text-primary/60 mt-1">{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Câu hỏi 2: Ghi chú hương vị (FlavorNotes) */}
            {quizStep === 2 && (
              <div className="animate-fade-in">
                <h3 className="font-montserrat font-bold text-lg text-primary mb-6 text-center">
                  Hương vị đặc trưng nào khiến bạn phấn khích nhất?
                </h3>
                <div className="space-y-3">
                  {[
                    {
                      id: "Hoa nhài",
                      label: "Hương Trái Cây & Hoa Cỏ",
                      desc: "Sự kết hợp tinh tế từ Hoa nhài, Cam vàng và vị ngọt Mật ong.",
                    },
                    {
                      id: "Caramel",
                      label: "Vị Ngọt Ngào & Bùi Ngậy",
                      desc: "Hương thơm quyến rũ của Chocolate quyện cùng Hạnh nhân và lớp sốt Caramel.",
                    },
                    {
                      id: "Hạt dẻ",
                      label: "Hương Gỗ & Các Loại Hạt",
                      desc: "Gu độc đáo với chút đắng trầm từ Cacao, thoảng hương Gỗ sồi và Hạt dẻ.",
                    },
                    {
                      id: "Socola đen",
                      label: "Vị Đắng Đậm Truyền Thống",
                      desc: "Đậm đà mạnh mẽ đúng gu Việt từ Socola đen, Mật mía và Hạnh nhân rang.",
                    },
                    {
                      id: "Chocolate sữa",
                      label: "Vị Cân Bằng Dịu Nhẹ",
                      desc: "Sự hòa quyện êm dịu, dễ uống giữa Caramel, Chocolate sữa và hương Gỗ nhẹ.",
                    },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        setQuizAnswers({ ...quizAnwers, flavorNotes: opt.id });
                        setQuizStep(3);
                      }}
                      className="w-full text-left p-4 border border-gray-200 rounded-2xl hover:border-primary hover:bg-primary/[0.01] transition-all font-nunito"
                    >
                      <p className="font-bold text-primary text-sm">
                        {opt.label}
                      </p>
                      <p className="text-xs text-primary/60 mt-1">{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* CÂU HỎI 3 MỚI: Vùng trồng (Region) */}
            {quizStep === 3 && (
              <div className="animate-fade-in">
                <h3 className="font-montserrat font-bold text-lg text-primary mb-6 text-center">
                  Bạn ưu tiên lựa chọn hạt từ vùng trồng nào?
                </h3>
                <div className="space-y-3">
                  {[
                    {
                      id: "Đà Lạt",
                      label: "Đà Lạt / Lâm Đồng",
                      desc: "Thủ phủ vùng trồng có khí hậu ôn đới lý tưởng cho hạt chất lượng cao.",
                    },
                    {
                      id: "Buôn Ma Thuột",
                      label: "Buôn Ma Thuột / Đắk Lắk",
                      desc: "Vùng đất đỏ bazan mang lại hương vị Robusta đậm đà, mạnh mẽ cực kỳ đặc trưng.",
                    },
                    {
                      id: "",
                      label: "Bất kỳ vùng trồng nào",
                      desc: "Hiển thị hạt từ tất cả các nông trại liên kết.",
                    },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        setQuizAnswers({ ...quizAnwers, region: opt.id });
                        setQuizStep(4);
                      }}
                      className="w-full text-left p-4 border border-gray-200 rounded-2xl hover:border-primary hover:bg-primary/[0.01] transition-all font-nunito"
                    >
                      <p className="font-bold text-primary text-sm">
                        {opt.label}
                      </p>
                      <p className="text-xs text-primary/60 mt-1">{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* CÂU HỎI 4 MỚI: Mức độ rang (Roast) */}
            {quizStep === 4 && (
              <div className="animate-fade-in">
                <h3 className="font-montserrat font-bold text-lg text-primary mb-6 text-center">
                  Bạn ưa thích mức độ rang phát triển hạt như thế nào?
                </h3>
                <div className="space-y-3">
                  {[
                    {
                      id: "Light",
                      label: "Rang Sáng (Light Roast)",
                      desc: "Giữ lại trọn vẹn vị chua thanh tự nhiên tựa như trái cây và hương hoa tinh tế.",
                    },
                    {
                      id: "Medium",
                      label: "Rang Vừa (Medium Roast)",
                      desc: "Mức độ rang cân bằng hoàn hảo giữa vị chua nhẹ và hậu vị ngọt bùi ngọt ngào.",
                    },
                    {
                      id: "Dark",
                      label: "Rang Đậm (Dark Roast)",
                      desc: "Giải phóng vị đắng đậm đà, thơm nức hương khói, cacao và socola truyền thống.",
                    },
                    {
                      id: "",
                      label: "Bất kỳ mức rang nào",
                      desc: "Hiển thị mọi cấp độ rang hạt.",
                    },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        setQuizAnswers({ ...quizAnwers, roast: opt.id });
                        setQuizStep(5);
                      }}
                      className="w-full text-left p-4 border border-gray-200 rounded-2xl hover:border-primary hover:bg-primary/[0.01] transition-all font-nunito"
                    >
                      <p className="font-bold text-primary text-sm">
                        {opt.label}
                      </p>
                      <p className="text-xs text-primary/60 mt-1">{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* CÂU HỎI 5 MỚI: Sơ chế (Process) - Bước cuối cùng kích hoạt tìm kiếm */}
            {quizStep === 5 && (
              <div className="animate-fade-in">
                <h3 className="font-montserrat font-bold text-lg text-primary mb-6 text-center">
                  Phương pháp sơ chế hạt nào bạn muốn trải nghiệm?
                </h3>
                <div className="space-y-3">
                  {[
                    {
                      id: "Washed",
                      label: "Sơ chế ướt (Washed)",
                      desc: "Mang lại hương vị cà phê vô cùng sạch sẽ, sáng rõ và vị chua thanh khiết.",
                    },
                    {
                      id: "Natural",
                      label: "Sơ chế tự nhiên (Natural)",
                      desc: "Phơi nguyên quả giúp hạt hấp thụ trọn vẹn vị ngọt đậm và hương trái cây chín mọng.",
                    },
                    {
                      id: "Honey",
                      label: "Sơ chế mật ong (Honey)",
                      desc: "Giữ lại một phần thịt quả, tạo nên hậu vị ngọt mượt dịu êm và thể chất dày dặn.",
                    },
                    {
                      id: "",
                      label: "Bất kỳ phương pháp nào",
                      desc: "Lấy ngẫu nhiên mọi phương thức sơ chế.",
                    },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        const update = { ...quizAnwers, process: opt.id };
                        setQuizAnswers(update);
                        handleEvaluateQuiz(update); // Gửi cục bộ toàn bộ 5 đáp án chuẩn sang BE lọc
                      }}
                      className="w-full text-left p-4 border border-gray-200 rounded-2xl hover:border-primary hover:bg-primary/[0.01] transition-all font-nunito"
                    >
                      <p className="font-bold text-primary text-sm">
                        {opt.label}
                      </p>
                      <p className="text-xs text-primary/60 mt-1">{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Nút quay lại của Quiz */}
            <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center text-xs font-nunito">
              <button
                type="button"
                onClick={() => {
                  if (quizStep === 1) setViewMode("welcome");
                  else setQuizStep((prev) => prev - 1);
                }}
                className="text-primary/60 hover:text-primary font-bold"
              >
                Quay lại
              </button>
              <button
                type="button"
                onClick={() => setViewMode("main")}
                className="text-accent-1 font-bold underline"
              >
                Bỏ qua khảo sát
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- LUỒNG TỰ CHỌN CHÍNH (GIỮ NGUYÊN HOÀN TOÀN LOGIC CŨ CỦA BẠN TỪ ĐÂY XUỐNG DƯỚI) ---
  return (
    <div className="bg-white min-h-screen py-12 selection:bg-primary/10 ">
      <div className="container mx-auto px-6 lg:px-12 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-accent-1 font-nunito font-bold tracking-[0.2em] uppercase mb-3 text-xl">
            Dịch vụ giao cà phê định kỳ
          </p>
          <h1 className="font-montserrat font-black text-4xl md:text-5xl text-primary mb-4">
            REVO SUBSCRIPTION
          </h1>
          <p className="font-nunito text-primary/70 max-w-2xl mx-auto text-lg leading-relaxed">
            Tận hưởng hạt cà phê tươi mới được rang xay thủ công và tự động giao
            đến tận cửa nhà. Tùy chỉnh linh hoạt, hủy bất cứ lúc nào.
          </p>
        </div>

        {/* Progress Bar */}
        <div className="flex justify-between items-center mb-16 px-4 md:px-20 relative">
          <div className="absolute top-6 left-0 w-full h-[2px] bg-gray-100 rounded-full"></div>
          <div
            className="absolute top-6 left-0 h-[2px] bg-primary rounded-full transition-all duration-500"
            style={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}
          ></div>

          {steps.map((s) => (
            <div
              key={s.id}
              className="flex flex-col items-center z-10 cursor-pointer"
              onClick={() => selectedProduct && setStep(s.id)}
            >
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center font-montserrat font-bold text-base mb-2 transition-all duration-300 ${
                  step >= s.id
                    ? "bg-primary text-white shadow-md scale-105"
                    : "bg-white border border-gray-200 text-gray-400"
                }`}
              >
                {s.id}
              </div>
              <span
                className={`font-nunito text-xs md:text-sm font-bold transition-colors ${
                  step >= s.id ? "text-primary" : "text-gray-400"
                }`}
              >
                {s.label}
              </span>
            </div>
          ))}
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-[32px] p-6 md:p-10 lg:p-12 shadow-xl border border-gray-100 min-h-[450px]">
          {/* STEP 1: CHỌN SẢN PHẨM */}
          {step === 1 && (
            <div className="animate-fade-in">
              <h2 className="font-montserrat font-bold text-2xl text-primary mb-8 text-center flex items-center justify-center gap-2">
                <Coffee size={24} /> Bạn muốn sử dụng dòng sản phẩm nào?
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                {products.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => handleSelectProduct(p)}
                    className={`border rounded-2xl p-6 cursor-pointer hover:shadow-md transition-all flex flex-col items-center group relative overflow-hidden ${
                      selectedProduct?.Id === p.Id
                        ? "border-primary bg-primary/[0.02] ring-1 ring-primary"
                        : "border-gray-200 hover:border-primary/40"
                    }`}
                  >
                    {selectedProduct?.id === p.id && (
                      <div className="absolute top-4 right-4 bg-primary text-white rounded-full p-1 shadow">
                        <Check size={14} />
                      </div>
                    )}
                    <div className="h-36 mb-4 flex items-center justify-center relative w-full">
                      <img
                        src={getProductImage(p.imageUrl)}
                        alt={p.name}
                        className="h-full object-contain filter drop-shadow-sm transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => {
                          e.target.src = defaultImage;
                        }}
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-xl flex items-center justify-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(`/product/${p.id}`, "_blank");
                          }}
                          className="bg-white text-primary text-xs px-4 py-2 rounded-full font-bold hover:bg-primary hover:text-white transition-all shadow"
                        >
                          Xem chi tiết ↗
                        </button>
                      </div>
                    </div>
                    <span className="font-nunito font-semibold text-xs text-accent-1 tracking-wider uppercase mb-1">
                      {CategoryMap[p.categoryId] || p.categoryId}
                    </span>
                    <h3 className="font-montserrat font-bold text-base text-primary text-center line-clamp-1">
                      {p.name}
                    </h3>
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-12 max-w-4xl mx-auto">
                <button
                  type="button"
                  onClick={() => setViewMode("welcome")}
                  className="text-primary font-nunito font-bold hover:text-accent-1 px-4 text-sm"
                >
                  ← Trở lại menu khảo sát
                </button>
                <button
                  onClick={() => setStep(2)}
                  disabled={!selectedProduct}
                  className="bg-primary text-white font-nunito font-bold py-3.5 px-14 rounded-full disabled:opacity-40 disabled:cursor-not-allowed hover:bg-accent-1 transition-colors flex items-center gap-2 shadow-md"
                >
                  Thiết lập định lượng <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: ĐỊNH LƯỢNG & TÙY CHỈNH HẠT */}
          {step === 2 && (
            <div className="animate-fade-in max-w-3xl mx-auto space-y-10">
              <h2 className="font-montserrat font-bold text-2xl text-primary text-center">
                Tùy chỉnh cấu hình hạt
              </h2>

              {/* Khối lượng */}
              <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
                <h3 className="font-montserrat font-bold text-sm text-primary/80 mb-4 uppercase tracking-wider text-center">
                  Khối lượng một hộp
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {weightOptions.map((w, i) => (
                    <button
                      key={i}
                      onClick={() => setWeight(w)}
                      className={`border-2 py-3 px-4 rounded-xl font-nunito font-bold text-sm transition-all text-center ${
                        weights === w
                          ? "border-primary bg-primary text-white shadow-sm"
                          : "border-gray-200 bg-white text-primary/70 hover:border-primary/40"
                      }`}
                    >
                      {w}
                    </button>
                  ))}
                </div>
              </div>

              {/* Kiểu xay */}
              <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
                <h3 className="font-montserrat font-bold text-sm text-primary/80 mb-4 uppercase tracking-wider text-center">
                  Kiểu rang xay (Tương thích dụng cụ pha)
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {grindOptions.map((g) => (
                    <button
                      key={g.id}
                      onClick={() => setGrindType(g)}
                      className={`border-2 py-3 px-4 rounded-xl font-nunito font-bold text-sm transition-all text-center ${
                        grindType?.id === g.id
                          ? "border-primary bg-primary text-white shadow-sm"
                          : "border-gray-200 bg-white text-primary/70 hover:border-primary/40"
                      }`}
                    >
                      {g.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Hương vị */}
              <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
                <h3 className="font-montserrat font-bold text-sm text-primary/80 mb-4 uppercase tracking-wider text-center">
                  Ghi chú hương vị (Flavor Profile)
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {flavorOptions.map((f, i) => (
                    <button
                      key={i}
                      onClick={() => setFlavorNotes(f)}
                      className={`border-2 py-3 px-4 rounded-xl font-nunito font-bold text-sm transition-all text-center ${
                        flavorNotes === f
                          ? "border-primary bg-primary text-white shadow-sm"
                          : "border-gray-200 bg-white text-primary/70 hover:border-primary/40"
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {/* Số lượng */}
              <div className="flex flex-col items-center pt-4">
                <h3 className="font-montserrat font-bold text-sm text-primary/80 mb-3 uppercase tracking-wider">
                  Số lượng hộp mỗi kỳ giao
                </h3>
                <div className="flex items-center border border-gray-200 bg-white rounded-full p-1 shadow-sm">
                  <button
                    onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                    className="w-10 h-10 rounded-full text-primary text-xl font-bold hover:bg-gray-100 transition-all"
                  >
                    -
                  </button>
                  <div className="text-2xl font-montserrat font-black text-primary min-w-[60px] text-center">
                    {quantity}
                  </div>
                  <button
                    onClick={() => setQuantity((prev) => prev + 1)}
                    className="w-10 h-10 rounded-full text-primary text-xl font-bold hover:bg-gray-100 transition-all"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Điều hướng */}
              <div className="flex justify-between mt-12 pt-4 border-t border-gray-100">
                <button
                  onClick={() => setStep(1)}
                  className="text-primary font-nunito font-bold hover:text-accent-1 px-4"
                >
                  Quay lại
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="bg-primary text-white font-nunito font-bold py-3.5 px-12 rounded-full hover:bg-accent-1 transition-colors flex items-center gap-2 shadow-md"
                >
                  Thiết lập chu kỳ & Thanh toán <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: CHU KỲ GIAO & PHƯƠNG THỨC THANH TOÁN */}
          {step === 3 && (
            <div className="animate-fade-in max-w-4xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Cột trái */}
                <div className="lg:col-span-7 space-y-8">
                  {/* Tần suất giao hàng */}
                  <div>
                    <h3 className="font-montserrat font-bold text-base text-primary mb-4 flex items-center gap-2">
                      <CalendarSync size={20} className="text-accent-1" /> 1.
                      Tần suất giao hàng mong muốn?
                    </h3>
                    <div className="space-y-3">
                      {[
                        {
                          id: "1week",
                          title: "Giao hàng 1 tuần / lần",
                          desc: "Dành cho văn phòng hoặc tín đồ nghiện cà phê. Đảm bảo độ tươi tuyệt đối.",
                          discount: "Giảm 15%",
                        },
                        {
                          id: "2weeks",
                          title: "Giao hàng 2 tuần / lần",
                          desc: "Lựa chọn tiêu chuẩn của gia đình (1-2 ly mỗi ngày).",
                          discount: "Giảm 10%",
                        },
                        {
                          id: "1month",
                          title: "Giao hàng 1 tháng / lần",
                          desc: "Thảnh thơi nhận hàng, lưu trữ vừa vặn cho cả tháng.",
                          discount: "Giảm 5%",
                        },
                      ].map((f) => (
                        <div
                          key={f.id}
                          onClick={() => setFrequency(f.id)}
                          className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-all ${
                            frequency === f.id
                              ? "border-primary bg-primary/[0.02] ring-1 ring-primary"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <div>
                            <h4 className="font-montserrat font-bold text-sm text-primary flex items-center gap-2">
                              {f.title}
                              <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-sans font-medium">
                                {f.discount}
                              </span>
                            </h4>
                            <p className="font-nunito text-primary/60 text-xs mt-1">
                              {f.desc}
                            </p>
                          </div>
                          <div
                            className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                              frequency === f.id
                                ? "border-primary"
                                : "border-gray-300"
                            }`}
                          >
                            {frequency === f.id && (
                              <div className="w-2.5 h-2.5 bg-primary rounded-full"></div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* THÊM KHỐI NÀY: LỰA CHỌN NGÀY GIAO HÀNG TRONG TUẦN */}
                  <div className="mt-6">
                    <h3 className="font-montserrat font-bold text-base text-primary mb-4 flex items-center gap-2">
                      <CalendarSync size={20} className="text-accent-1" /> 1b.
                      Bạn muốn nhận cà phê cố định vào ngày nào?
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        {
                          id: "Thứ Ba",
                          label: "Thứ 3 hàng tuần",
                          desc: "Xưởng chốt mẻ rang & đóng gói vào Thứ 2",
                        },
                        {
                          id: "Thứ Năm",
                          label: "Thứ 5 hàng tuần",
                          desc: "Xưởng chốt mẻ rang & đóng gói vào Thứ 4",
                        },
                      ].map((day) => (
                        <div
                          key={day.id}
                          onClick={() => setDeliveryDay(day.id)}
                          className={`p-4 border rounded-xl cursor-pointer transition-all flex flex-col justify-between ${
                            deliveryDay === day.id
                              ? "border-primary bg-primary/[0.02] ring-1 ring-primary"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-montserrat font-bold text-sm text-primary">
                              {day.label}
                            </span>
                            <div
                              className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                                deliveryDay === day.id
                                  ? "border-primary"
                                  : "border-gray-300"
                              }`}
                            >
                              {deliveryDay === day.id && (
                                <div className="w-2 h-2 bg-primary rounded-full"></div>
                              )}
                            </div>
                          </div>
                          <p className="font-nunito text-primary/60 text-xs leading-normal">
                            {day.desc}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Cam kết thời hạn gói */}
                  <div>
                    <h3 className="font-montserrat font-bold text-base text-primary mb-4 flex items-center gap-2">
                      <ShieldCheck size={20} className="text-accent-1" /> 2.
                      Hình thức đăng ký cam kết gói
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {[
                        {
                          id: "pay-as-you-go",
                          label: "Từng kỳ giao",
                          sub: "Thanh toán linh hoạt từng kỳ",
                          tag: "Linh hoạt",
                        },
                        {
                          id: "3months",
                          label: "Gói 3 Tháng",
                          sub: "Tiết kiệm chi phí",
                          tag: "Giảm thêm 5%",
                        },
                        {
                          id: "6months",
                          label: "Gói 6 Tháng",
                          sub: "Ưu đãi sâu nhất",
                          tag: "Giảm thêm 10%",
                        },
                      ].map((c) => (
                        <div
                          key={c.id}
                          onClick={() => setCommitment(c.id)}
                          className={`p-4 border rounded-xl cursor-pointer text-center relative flex flex-col justify-between transition-all ${
                            commitment === c.id
                              ? "border-primary bg-primary/[0.02] ring-1 ring-primary"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <span className="absolute -top-2.5 left-1/2 transform -translate-x-1/2 bg-accent-1 text-white text-[9px] px-2 py-0.5 rounded-full font-bold shadow-sm whitespace-nowrap">
                            {c.tag}
                          </span>
                          <div className="font-montserrat font-bold text-sm text-primary mt-1">
                            {c.label}
                          </div>
                          <div className="font-nunito text-primary/50 text-[11px] mt-1 leading-tight">
                            {c.sub}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Lựa chọn Thanh toán */}
                  <div>
                    <h3 className="font-montserrat font-bold text-base text-primary mb-4 flex items-center gap-2">
                      <CreditCard size={20} className="text-accent-1" /> 3.
                      Phương thức kích hoạt thanh toán
                    </h3>
                    <div className="space-y-3">
                      <label
                        className={`flex items-start gap-4 p-4 border rounded-xl cursor-pointer transition-all ${
                          paymentMethod === "card_auto"
                            ? "border-primary bg-primary/[0.02] ring-1 ring-primary"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div
                          className={`mt-0.5 w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                            paymentMethod === "card_auto"
                              ? "border-primary"
                              : "border-gray-300"
                          }`}
                        >
                          {paymentMethod === "card_auto" && (
                            <div className="w-2.5 h-2.5 bg-primary rounded-full"></div>
                          )}
                        </div>
                        <input
                          type="radio"
                          name="payment"
                          value="card_auto"
                          className="hidden"
                          checked={paymentMethod === "card_auto"}
                          onChange={() => setPaymentMethod("card_auto")}
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-montserrat font-bold text-sm text-primary">
                              Liên kết thẻ Visa / Mastercard (Khuyên dùng)
                            </h4>
                            <span className="bg-primary/10 text-primary text-[10px] font-bold px-1.5 py-0.5 rounded">
                              Tự động gia hạn
                            </span>
                          </div>
                          <p className="font-nunito text-primary/60 text-xs mt-1">
                            Hệ thống tự động trừ tiền trước mỗi kỳ giao. Toàn
                            quyền quản lý, tạm hoãn hoặc hủy gói trên tài khoản
                            cá nhân.
                          </p>
                        </div>
                      </label>

                      <label
                        className={`flex items-start gap-4 p-4 border rounded-xl cursor-pointer transition-all ${
                          paymentMethod === "vnpay"
                            ? "border-primary bg-primary/[0.02]"
                            : "border-gray-200"
                        }`}
                      >
                        <div
                          className={`mt-0.5 w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                            paymentMethod === "vnpay"
                              ? "border-primary"
                              : "border-gray-300"
                          }`}
                        >
                          {paymentMethod === "vnpay" && (
                            <div className="w-2.5 h-2.5 bg-primary rounded-full"></div>
                          )}
                        </div>
                        <input
                          type="radio"
                          name="payment"
                          value="vnpay"
                          className="hidden"
                          checked={paymentMethod === "vnpay"}
                          onChange={() => setPaymentMethod("vnpay")}
                        />
                        <div>
                          <h4 className="font-montserrat font-bold text-sm text-primary">
                            Cổng trực tuyến VNPAY (Trả trước trọn gói)
                          </h4>
                          <p className="font-nunito text-primary/60 text-xs mt-1">
                            Thanh toán một lần duy nhất bằng QR code hoặc Thẻ
                            ATM nội địa cho toàn bộ chu kỳ 3 tháng / 6 tháng.
                          </p>
                        </div>
                      </label>

                      <label
                        className={`flex items-start gap-4 p-4 border rounded-xl opacity-60 cursor-not-allowed bg-gray-50 transition-all ${
                          paymentMethod === "cod"
                            ? "border-primary"
                            : "border-gray-200"
                        }`}
                      >
                        <div className="mt-0.5 w-5 h-5 rounded-full border border-gray-300 shrink-0 flex items-center justify-center">
                          <HelpCircle size={12} className="text-gray-400" />
                        </div>
                        <input
                          type="radio"
                          name="payment"
                          value="cod"
                          disabled
                          className="hidden"
                        />
                        <div>
                          <h4 className="font-montserrat font-bold text-sm text-gray-500">
                            Thanh toán khi nhận hàng (COD)
                          </h4>
                          <p className="font-nunito text-gray-400 text-xs mt-1">
                            Không áp dụng cho gói Subscription để đảm bảo tính
                            liên tục của mẻ rang.
                          </p>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Cột phải */}
                <div className="lg:col-span-5 space-y-6">
                  <div className="bg-pinky-gray/30 p-5 rounded-2xl border border-gray-200/60 font-nunito text-sm">
                    <h4 className="font-bold text-primary mb-3 border-b border-gray-200 pb-2 uppercase tracking-wide text-xs text-primary/70">
                      Cấu hình gói đăng ký
                    </h4>
                    <div className="space-y-2.5">
                      <div className="flex justify-between">
                        <span className="text-primary/70">Sản phẩm:</span>
                        <span className="font-bold text-primary text-right">
                          {selectedProduct?.Name} (x{quantity})
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-primary/70">Vị hạt:</span>
                        <span className="font-bold text-primary">
                          {flavorNotes}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-primary/70">Thể thức:</span>
                        <span className="font-bold text-primary">
                          {weights} - {grindType?.name || "Nguyên hạt"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-primary/70">Tần suất giao:</span>
                        <span className="font-bold text-primary">
                          {frequency === "1week"
                            ? "1 tuần / lần"
                            : frequency === "2weeks"
                            ? "2 tuần / lần"
                            : "1 tháng / lần"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-primary/70">Ngày nhận hàng:</span>
                        <span className="font-bold text-primary">
                          {deliveryDay === "Tuesday"
                            ? "Thứ 3 hàng tuần"
                            : "Thứ 5 hàng tuần"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-primary/70">Cam kết kỳ hạn:</span>
                        <span className="font-bold text-accent-1">
                          {commitment === "pay-as-you-go"
                            ? "Tự do (Từng kỳ)"
                            : "Gói hạn định " + commitment}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-pinky-gray/30 p-5 rounded-2xl border border-gray-200/60 font-nunito text-sm">
                    <h4 className="font-bold text-primary mb-3 border-b border-gray-200 pb-2 uppercase tracking-wide text-xs text-primary/70">
                      Thông tin nhận hàng
                    </h4>
                    <div className="space-y-2.5">
                      <div className="flex justify-between">
                        <span className="text-primary/70">Khách hàng:</span>
                        <span className="font-bold text-primary">
                          {userInfo.fullName}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-primary/70">Số điện thoại:</span>
                        <span className="font-bold text-primary">
                          {userInfo.phone}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-primary/70">
                          Địa chỉ nhận hàng:
                        </span>
                        <span className="font-bold text-primary text-xs leading-normal bg-white p-2.5 rounded-lg border border-gray-100 mt-1">
                          {userInfo.address}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 bg-primary rounded-2xl text-white font-nunito">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-white/70 text-xs uppercase tracking-wider">
                        Đơn giá ước tính / Kỳ
                      </span>
                      <span className="text-xs line-through text-white/40 font-light">
                        {(
                          selectedProduct?.price * quantity || 250000
                        ).toLocaleString("vi-VN")}
                        đ
                      </span>
                    </div>
                    <div className="flex justify-between items-baseline mb-4">
                      <span className="text-sm font-semibold">
                        {paymentMethod === "vnpay"
                          ? "Tổng tiền trọn gói:"
                          : "Tổng tiền tạm tính/Kỳ:"}
                      </span>
                      <span className="text-2xl font-black font-montserrat text-white">
                        {(paymentMethod === "vnpay"
                          ? totalVnPayPrice
                          : totalPeriodPrice
                        ).toLocaleString("vi-VN")}
                        đ
                      </span>
                    </div>
                    <p className="text-[10px] text-white/60 leading-normal border-t border-white/10 pt-3">
                      * Bằng việc chọn xác nhận, hệ thống sẽ tiến hành liên kết
                      và thực hiện trừ phí tự động phù hợp với chu kỳ giao bạn
                      lựa chọn. Bạn hoàn toàn có thể hủy dịch vụ bất cứ lúc nào
                      trước ngày giao kế tiếp 48 tiếng.
                    </p>
                  </div>
                </div>
              </div>

              {/* Nhóm nút điều phối */}
              <div className="flex justify-between mt-12 items-center border-t border-gray-100 pt-6">
                <button
                  onClick={() => setStep(2)}
                  className="text-primary font-nunito font-bold hover:text-accent-1 px-4 text-sm"
                >
                  Quay lại cấu hình hạt
                </button>
                <button
                  onClick={handleSubscribe}
                  className="bg-primary text-white font-bold font-nunito py-4 px-10 rounded-full hover:bg-accent-1 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 uppercase tracking-wide text-sm"
                >
                  Xác nhận kích hoạt gói
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {showQrModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {/* Header của Modal */}
            <div className="text-center pb-4 border-b border-gray-100">
              <h3 className="font-montserrat font-bold text-lg text-primary">
                Thanh toán qua VNPay QR
              </h3>
              <p className="font-nunito text-xs text-primary/60 mt-1">
                Sử dụng ứng dụng Ngân hàng hoặc Ví điện tử để quét mã
              </p>
            </div>

            {/* Nội dung Mã QR */}
            <div className="flex flex-col items-center my-6">
              <div className="bg-white p-3 border-2 border-primary/10 rounded-xl shadow-inner mb-4">
                {/* Thay bằng ảnh QR Code mẫu của bạn hoặc dùng thư viện sinh QR */}
                <img
                  src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=FoodieSubscriptionPaymentMock"
                  alt="VNPay QR Code"
                  className="w-48 h-48 object-contain"
                />
              </div>

              {/* Thông tin đơn hàng hiển thị trực quan */}
              <div className="w-full bg-pinky-gray/20 rounded-xl p-3 font-nunito text-sm space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-primary/60">Số tiền:</span>
                  <span className="font-bold text-accent-1">
                    {totalVnPayPrice.toLocaleString()} đ
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-primary/60">Nội dung:</span>
                  <span className="font-bold text-primary">
                    REVO SUB {Date.now().toString().slice(-6)}
                  </span>
                </div>
              </div>
            </div>

            {/* Nút hành động Giả lập luồng */}
            <div className="space-y-2">
              <button
                onClick={() => {
                  setIsProcessing(true);
                  // Giả lập hiệu ứng đợi hệ thống kiểm tra 1.5 giây rồi chuyển trang
                  setTimeout(() => {
                    setIsProcessing(false);
                    setShowQrModal(false);
                    // Gọi hàm xử lý khi thành công (Ví dụ: nhảy sang Step 4 hoặc lưu DB)
                    submitSubscription();
                  }, 1500);
                }}
                disabled={isProcessing}
                className="w-full bg-primary hover:bg-primary-dark text-white font-montserrat font-bold text-sm py-3.5 rounded-xl transition-colors shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Đang xác thực giao dịch...
                  </>
                ) : (
                  "Tôi đã thanh toán thành công"
                )}
              </button>

              <button
                onClick={() => {
                  if (!isProcessing) setShowQrModal(false);
                }}
                disabled={isProcessing}
                className="w-full bg-transparent hover:bg-gray-50 text-primary/60 hover:text-primary font-nunito font-semibold text-sm py-2 rounded-lg transition-colors text-center"
              >
                Hủy giao dịch
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
