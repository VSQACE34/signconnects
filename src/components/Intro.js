import React from 'react';

const Intro = () => {
    return (
        <>
        <div id="about" className="py-12">
            <section data-aos="zoom-in-down">
            <div className="my-4 py-4">
                <h2 className="my-2 text-center text-3xl text-blue-900 uppercase font-bold;">Let Us Walk Through Sign-Connect</h2>

                <div className='flex justify-center'>
                    <div className='w-24 border-b-4 border-blue-900'></div>
                </div>

                <div className="flex flex-col lg:flex-row py-8 justify-between lg:text-left mt-4" data-aos="fade-up">
                {/* Video Section */}
                    <div className="w-full lg:w-7/12 pl-12">
                        <video key='FIT5122_video' controls className="w-full max-w-4xl h-auto">
                            <source src='https://the-boys-bucket.s3.ap-southeast-2.amazonaws.com/public/FIT5122_TA_16_Final_Cut_Vedio.mp4' type="video/mp4" />
                            Your browser does not support the video tag.
                        </video>
                    </div>
                    <div className="w-full lg:w-5/12 flex flex-col justify-center pl-12 pr-8 mt-4">
                        <h3 className="text-2xl font-bold text-blue-900">Motto:</h3>
                        <div className="mt-6 text-xl font-semibold tracking-tight mb-3 text-gray-500">Empowering Communication, One Sign at a Time.</div>
                        <h3 className="mt-12 text-2xl font-bold text-blue-900">Quotation:</h3>
                        <div className="mt-6 text-xl font-semibold tracking-tight mb-3 text-gray-500">
                            "Learning a language is the first step to building bridges; mastering AUSLAN with Sign-Connect is how we build them stronger.
                        </div>
                    </div>
                </div>                    
            </div>
            </section>
        </div>
        </>
    );
}

export default Intro;
