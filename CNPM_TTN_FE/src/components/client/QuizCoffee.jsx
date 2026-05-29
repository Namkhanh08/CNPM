import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import { ArrowLeft, ArrowRight, X } from 'lucide-react';

const quizQuestions = [
    {
        id: 1,
        question: "Bạn thích hương vị cà phê nghiêng về hướng nào?",
        options: [
            { id: "light", label: "Chua thanh, tươi sáng", desc: "Light Roast - Hoa quả, thanh lịch" },
            { id: "medium", label: "Cân bằng, hậu ngọt", desc: "Medium Roast - Socola, hạt" },
            { id: "dark", label: "Đậm đà, mạnh mẽ", desc: "Dark Roast - Đắng sâu" },
        ]
    },
    {
        id: 2,
        question: "Hương vị bạn yêu thích nhất là gì?",
        options: [
            { id: "floral", label: "Hoa & Trái cây", desc: "Hoa nhài, cam, berry" },
            { id: "chocolate", label: "Socola & Hạt", desc: "Socola đen, caramel" },
            { id: "bold", label: "Đậm & Đất", desc: "Cacao đắng, gỗ sồi" },
        ]
    },
    {
        id: 3,
        question: "Bạn thường pha cà phê bằng phương pháp nào?",
        options: [
            { id: "phin", label: "Pha Phin Việt Nam", desc: "Truyền thống, đậm đà" },
            { id: "espresso", label: "Espresso / Máy pha", desc: "Hiện đại, crema" },
            { id: "pour", label: "Pour-over / French Press", desc: "Thanh tao" },
        ]
    },
    {
        id: 4,
        question: "Bạn thường thưởng thức cà phê vào lúc nào?",
        options: [
            { id: "morning", label: "Buổi sáng", desc: "Cần tỉnh táo" },
            { id: "afternoon", label: "Buổi chiều", desc: "Thư giãn" },
            { id: "evening", label: "Buổi tối", desc: "Nhẹ nhàng" },
        ]
    }
];

const QuizCoffee = () => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(0);
    const [answers, setAnswers] = useState({});
    const [selectedOption, setSelectedOption] = useState(null);
    const [calculating, setCalculating] = useState(false);

    const currentQuestion = quizQuestions[currentStep];
    const progress = Math.round(((currentStep + 1) / quizQuestions.length) * 100);

    const handleSelect = (optionId) => {
        setSelectedOption(optionId);
        setAnswers(prev => ({ ...prev, [currentQuestion.id]: optionId }));
    };

    const handleNext = async () => {
        if (currentStep < quizQuestions.length - 1) {
            setCurrentStep(prev => prev + 1);
            setSelectedOption(null);
        } else {
            setCalculating(true);
            try {
                const payload = {
                    roast: answers[1],
                    flavor: answers[2],
                    method: answers[3],
                    timeOfDay: answers[4]  // câu hỏi thời gian uống
                };
                const res = await API.getRecommendation(payload);
                const data = res.data?.Data ?? res.data?.data ?? res.data ?? null;
                
                // Giả lập chút thời gian loading cho mượt mà
                setTimeout(() => {
                    navigate('/recommendation/result', { state: { recommendation: data } });
                }, 1200);
            } catch (err) {
                console.error("Lấy gợi ý lỗi:", err);
                // Fallback nếu lỗi
                navigate('/recommendation/result', { state: { answers } });
            }
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
            setSelectedOption(answers[quizQuestions[currentStep - 1].id] || null);
        }
    };

    if (calculating) {
        return (
            <div className="min-h-screen bg-[#fafaf5] flex flex-col items-center justify-center gap-6">
                <div className="relative w-16 h-16">
                    <div className="absolute inset-0 border-4 border-amber-900/10 rounded-full" />
                    <div className="absolute inset-0 border-4 border-t-amber-800 rounded-full animate-spin" />
                </div>
                <div className="text-center">
                    <h3 className="text-xl font-bold text-[#26170c] mb-1 animate-pulse">Đang phân tích gu của bạn...</h3>
                    <p className="text-gray-500 text-sm">Tìm kiếm hạt cà phê phù hợp nhất từ kho lưu trữ</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#fafaf5]">
            {/* Progress */}
            <div className="sticky top-0 bg-white border-b z-50">
                <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex-grow mr-6">
                        <div className="flex justify-between text-sm mb-2">
                            <span className="font-medium text-[#9a4600]">Câu {currentStep + 1} / {quizQuestions.length}</span>
                            <span className="font-medium">{progress}%</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-[#9a4600] transition-all" style={{ width: `${progress}%` }} />
                        </div>
                    </div>
                    <button 
                        onClick={() => navigate('/')} 
                        className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 hover:border-red-200 hover:text-red-500 hover:bg-red-50 text-gray-500 rounded-xl text-sm font-bold transition-all duration-200 shadow-sm cursor-pointer"
                    >
                        <X size={16} />
                        Thoát
                    </button>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-6 pt-12">
                <h2 className="text-3xl md:text-4xl font-bold text-center text-[#26170c] mb-10 leading-tight">
                    {currentQuestion.question}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {currentQuestion.options.map((option) => (
                        <button
                            key={option.id}
                            onClick={() => handleSelect(option.id)}
                            className={`p-8 rounded-3xl text-left border-2 transition-all ${selectedOption === option.id
                                    ? 'border-[#9a4600] bg-white shadow-xl'
                                    : 'border-transparent hover:border-gray-200 bg-white hover:shadow-lg'
                                }`}
                        >
                            <h3 className="text-xl font-semibold text-[#26170c] mb-3">{option.label}</h3>
                            <p className="text-gray-600">{option.desc}</p>
                        </button>
                    ))}
                </div>

                <div className="flex justify-between mt-16 max-w-md mx-auto">
                    <button
                        onClick={handleBack}
                        disabled={currentStep === 0}
                        className="flex items-center gap-2 px-8 py-4 text-gray-600 hover:bg-gray-100 rounded-2xl disabled:opacity-40"
                    >
                        <ArrowLeft size={20} /> Quay lại
                    </button>

                    <button
                        onClick={handleNext}
                        disabled={!selectedOption}
                        className="flex items-center gap-3 bg-[#26170c] text-white px-10 py-4 rounded-2xl font-medium hover:bg-black transition disabled:opacity-50"
                    >
                        {currentStep === quizQuestions.length - 1 ? 'Xem kết quả' : 'Tiếp tục'}
                        <ArrowRight size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default QuizCoffee;