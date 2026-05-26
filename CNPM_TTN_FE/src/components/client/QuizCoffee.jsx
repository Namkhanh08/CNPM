import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';

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

    const currentQuestion = quizQuestions[currentStep];
    const progress = Math.round(((currentStep + 1) / quizQuestions.length) * 100);

    const handleSelect = (optionId) => {
        setSelectedOption(optionId);
        setAnswers(prev => ({ ...prev, [currentQuestion.id]: optionId }));
    };

    const handleNext = () => {
        if (currentStep < quizQuestions.length - 1) {
            setCurrentStep(prev => prev + 1);
            setSelectedOption(null);
        } else {
            // Chuyển sang trang kết quả, truyền answers qua location.state
            navigate('/recommendation/result', { state: { answers } });
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
            setSelectedOption(answers[quizQuestions[currentStep - 1].id] || null);
        }
    };

    return (
        <div className="min-h-screen bg-[#fafaf5]">
            {/* Progress */}
            <div className="sticky top-0 bg-white border-b z-50">
                <div className="max-w-4xl mx-auto px-6 py-6">
                    <div className="flex justify-between text-sm mb-3">
                        <span className="font-medium text-[#9a4600]">Câu {currentStep + 1} / {quizQuestions.length}</span>
                        <span className="font-medium">{progress}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-[#9a4600] transition-all" style={{ width: `${progress}%` }} />
                    </div>
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