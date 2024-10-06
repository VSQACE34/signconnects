import React from 'react';

const Intro = () => {
    return (
        <>
        <div id="about" className="py-12">
            <section data-aos="zoom-in-down">
            <div className="my-4 py-4">
                    <h2 className="my-2 text-center text-3xl text-blue-900 uppercase font-bold;">Learn Auslan online with our AI</h2>

                    <div className='flex justify-center'>
                        <div className='w-24 border-b-4 border-blue-900'></div>
                    </div>

                    <div className="flex flex-col lg:flex-row py-8 justify-between lg:text-left" data-aos="fade-up">
                    {/* Video Section */}
                    <div className="w-full flex justify-center">
                        <video key='FIT5122_video' controls className="w-full max-w-4xl h-auto">
                            <source src='https://the-boys-bucket.s3.ap-southeast-2.amazonaws.com/public/FIT5122_TA_16_Final_Cut_Vedio.mp4' type="video/mp4" />
                            Your browser does not support the video tag.
                        </video>
                    </div>
                </div>
                
                </div>

            </section>

        </div>
            
        </>
    );
}

export default Intro;
