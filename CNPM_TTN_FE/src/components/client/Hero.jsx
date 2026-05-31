import React from 'react';
import { Link } from 'react-router-dom';
import coffeeCup from '../../assets/img/header/revo4.png';

export default function Hero() {
  return (
    <div className="relative w-full min-h-screen bg-black overflow-hidden flex flex-col justify-center">
      {/* KHU VỰC CSS ANIMATION KHÓI */}
      <style>{`
        @keyframes smokeFloat1 {
          0% {
            transform: translate(-50%, 0) scale(0.6) rotate(0deg);
            opacity: 0;
            filter: blur(6px);
          }
          15% {
            opacity: 0.9;
          }
          40% {
            transform: translate(-60%, -80px) scale(1.2) rotate(-8deg);
            opacity: 0.55;
            filter: blur(12px);
          }
          70% {
            transform: translate(-40%, -180px) scale(1.8) rotate(12deg);
            opacity: 0.18;
            filter: blur(20px);
          }
          100% {
            transform: translate(-50%, -280px) scale(2.4) rotate(18deg);
            opacity: 0;
            filter: blur(30px);
          }
        }

        @keyframes smokeFloat2 {
          0% {
            transform: translate(-50%, 0) scale(0.5) rotate(0deg);
            opacity: 0;
            filter: blur(4px);
          }
          20% {
            opacity: 0.85;
          }
          50% {
            transform: translate(-30%, -110px) scale(1.5) rotate(10deg);
            opacity: 0.45;
            filter: blur(16px);
          }
          80% {
            transform: translate(-60%, -220px) scale(2) rotate(-10deg);
            opacity: 0.12;
            filter: blur(24px);
          }
          100% {
            transform: translate(-50%, -320px) scale(2.8) rotate(20deg);
            opacity: 0;
            filter: blur(34px);
          }
        }

        @keyframes smokeFloat3 {
          0% {
            transform: translate(-50%, 0) scale(0.4);
            opacity: 0;
            filter: blur(5px);
          }
          25% {
            opacity: 0.7;
          }
          60% {
            transform: translate(-70%, -140px) scale(1.7);
            opacity: 0.3;
            filter: blur(18px);
          }
          100% {
            transform: translate(-50%, -300px) scale(2.5);
            opacity: 0;
            filter: blur(32px);
          }
        }

        .smoke {
          position: absolute;
          bottom: 0;
          left: 50%;
          border-radius: 9999px;
          background: radial-gradient(
            circle,
            rgba(255,255,255,0.55) 0%,
            rgba(255,255,255,0.18) 40%,
            rgba(255,255,255,0) 75%
          );
          mix-blend-mode: screen;
        }

        .smoke-1 {
          width: 90px;
          height: 180px;
          animation: smokeFloat1 7s infinite ease-out;
        }

        .smoke-2 {
          width: 120px;
          height: 220px;
          animation: smokeFloat2 8s infinite ease-out;
          animation-delay: 1.5s;
        }

        .smoke-3 {
          width: 100px;
          height: 200px;
          animation: smokeFloat3 6s infinite ease-out;
          animation-delay: 3s;
        }

        .smoke-4 {
          width: 140px;
          height: 240px;
          animation: smokeFloat1 9s infinite ease-out;
          animation-delay: 2s;
          opacity: 0.6;
        }
      `}</style>

      {/* HERO SECTION BACKGROUND */}
      <div
        className="w-full min-h-screen bg-cover bg-center bg-no-repeat flex items-center justify-center px-6 md:px-12 pt-24 pb-20"
        style={{
          backgroundImage: `
            linear-gradient(
              to bottom,
              rgba(0,0,0,0.65),
              rgba(0,0,0,0.8)
            ),
            url('https://images.unsplash.com/photo-1447933601403-0c6688de566e?q=80&w=1961&auto=format&fit=crop')
          `
        }}
      >
        {/* CONTENT */}
        <div className="max-w-4xl text-center text-white flex flex-col items-center pt-20">
          <style>
            {`@import url('https://fonts.googleapis.com/css2?family=Pacifico&display=swap');`}
          </style>

          <h1
            style={{ fontFamily: '"Pacifico", cursive' }}
            className="text-6xl md:text-7xl xl:text-8xl text-accent-1 text-center font-normal tracking-wide pb-12"
          >
            Đủ Đậm Để Nhớ
          </h1>

          <h2 className='font-nunito font-bold text-white text-3xl md:text-5xl pb-6 leading-tight max-w-3xl'>
            Nơi chữa lành ví tiền nhưng làm đầy tâm trạng
          </h2>

          <p className="text-base md:text-lg text-gray-300 leading-relaxed max-w-2xl mx-auto mb-10 font-nunito">
            REVO Coffee nằm khiêm nhường sâu trong một con ngõ nhỏ 234 Hoàng Quốc Việt, thuộc khu Bắc Từ Liêm. Quán có thể khó tìm, nhưng những trải nghiệm mà bạn có được rất xứng đáng để bỏ công tìm kiếm.
          </p>

          {/* CỐC CÀ PHÊ & HIỆU ỨNG KHÓI BỐC LÊN */}
          <div className="relative transition-transform duration-500 hover:scale-105 flex justify-center mt-4">
            <div className="absolute top-[-40px] left-1/2 -translate-x-1/2 w-[520px] h-[420px] pointer-events-none z-20">
              <div className="smoke smoke-1"></div>
              <div className="smoke smoke-2"></div>
              <div className="smoke smoke-3"></div>
              <div className="smoke smoke-4"></div>
            </div>

            <img
              src={coffeeCup}
              alt="Coffee Cup"
              className="w-80 h-80 md:w-[450px] md:h-[450px] object-contain drop-shadow-[0_25px_45px_rgba(0,0,0,0.8)] animate-[float_4s_ease-in-out_infinite]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
