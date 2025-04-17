import React from 'react'
import CustomButton from './CustomButton'
import Image from 'next/image'

function Hero() {

	return (
		<div className="flex xl:flex-row flex-col gap-5 justify-center items-center h-screen w-screen mx-auto bg-transparent">
      <div className="flex flex-col justify-center items-start w-full pl-[100px]">
        <h1 className="">
          Find, book, rent a car—quick and super easy!
        </h1>

        <p className="max-w-[470px] mt-5">
          Streamline your car rental experience with our effortless booking
          process.
        </p>

        <CustomButton
					href="#discover"
          title="Explore Cars"
          containerStyles="bg-blue-500 p-2 text-white rounded-full mt-10"
        />
      </div>
      <div className="relative w-full h-full flex justify-center items-center overflow-hidden">	
        <div className="absolute -top-1/4 -right-1/4 bg-[url(/hero-bg.png)] bg-repeat-round w-full h-full"></div>
        <div className="relative left-0 top-0 w-[700px] h-[700px]">
          <Image src="/hero.png" alt="hero" fill className="h-full w-full object-contain" />
        </div>
      </div>
    </div>
	)
}

export default Hero