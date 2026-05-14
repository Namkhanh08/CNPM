import React from 'react';
import coffe from '../assets/img/header/cc2.png';

const backgroundStyle = {
    backgroundImage: `url(${coffe})`,
    backgroundRepeat: "no-repeat",
    backgroundSize: "contain",
    backgroundPosition: "right 135px center",
    height: "100%",
    width: "100%",
};

const NewLetter = () => {
    return (
        <>
            <div className='bg-white text-white' style={backgroundStyle}>
                <div className='containe sm:bg-transparent py-16 pb-20'>
                    <div className='grid grid-cols-1 lg:grid-cols-2 items-center gap-8'>
                        <div className='space-y-4 text-center'>
                            {/* Text section */}
                            <h1 className='text-2xl sm:text-3xl font-semibold text-lead/90 text-accent-1'>Sẵn sàng bắt đầu</h1>
                            <p className='text-primary'>
                                Đăng ký để nhận ưu đãi mới nhất từ REVO Coffee.
                            </p>
                        </div>

                        {/* input section */}
                        <div>
                            <input
                                type="text"
                                placeholder='Điền email của bạn'
                                className='max-w-[400px] px-4 py-2 rounded-l-md ring-0 focus:outline-none text-dark bg-primary' />
                                <button className='bg-accent-1 px-4 py-2 rounded-r-md '>
                                    <span className='text-sm uppercase font-semibold text-white'>
                                        Bắt đầu
                                    </span>
                                </button>
                        </div>

                    </div>

                </div>
            </div>
        </>
    )
}

export default NewLetter
