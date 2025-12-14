'use client'

import Image from 'next/image'
import { useState, useEffect } from 'react'

export default function HeroSection() {
  const cities = ["Jequié", "Itagi", "Ipiaú", "Jitaúna", "Ilhéus", "Ibirataia"]
  const [currentCityIndex, setCurrentCityIndex] = useState(0)
  const [displayedText, setDisplayedText] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const currentCity = cities[currentCityIndex]
    const typingSpeed = isDeleting ? 50 : 100
    const pauseTime = 1500

    const timeout = setTimeout(() => {
      if (!isDeleting && displayedText === currentCity) {
        setTimeout(() => setIsDeleting(true), pauseTime)
      } else if (isDeleting && displayedText === "") {
        setIsDeleting(false)
        setCurrentCityIndex((prevIndex) => (prevIndex + 1) % cities.length)
      } else if (isDeleting) {
        setDisplayedText(currentCity.substring(0, displayedText.length - 1))
      } else {
        setDisplayedText(currentCity.substring(0, displayedText.length + 1))
      }
    }, typingSpeed)

    return () => clearTimeout(timeout)
  }, [displayedText, isDeleting, currentCityIndex, cities])

  return (
    <section className="relative bg-white overflow-hidden">
      <div className="container mx-auto px-6 py-24 md:py-32 flex flex-col md:flex-row items-center">
        {/* Left Content */}
        <div className="md:w-1/2 text-center md:text-left z-10">
          <span className="bg-orange-100 text-orange-600 font-semibold px-3 py-1 rounded-full text-sm">
            A REVOLUÇÃO DA IA PARA A EDUCAÇÃO DE <span className="inline-block min-w-[60px]">{displayedText}<span className="animate-pulse">|</span></span>
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mt-4 mb-6 leading-tight">
            Planejamento Pedagógico Inteligente e Alinhado à BNCC.
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-10">
            Otimize o tempo dos seus professores e eleve a qualidade do ensino. A EDUCA SOL é a plataforma que automatiza a criação de planos de aula, atividades e avaliações.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            <a 
              href="#dashboard" 
              className="bg-orange-500 text-white font-bold px-8 py-4 rounded-full text-lg hover:bg-orange-600 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Ver Demonstração
            </a>
            <a 
              href="#features" 
              className="bg-white text-gray-700 font-bold px-8 py-4 rounded-full text-lg hover:bg-gray-100 transition-all duration-300 shadow-lg border border-gray-200"
            >
              Saber Mais
            </a>
          </div>
        </div>
        {/* Right Image */}
        <div className="md:w-1/2 mt-12 md:mt-0 flex justify-center z-10">
          <Image
            src="https://placehold.co/600x500/FFF7ED/FF9843?text=EDUCA+SOL+Dashboard"
            alt="Dashboard da plataforma EDUCA SOL"
            width={600}
            height={500}
            className="rounded-2xl shadow-2xl"
          />
        </div>
      </div>
      <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-orange-100 rounded-full opacity-50"></div>
      <div className="absolute top-24 -left-24 w-72 h-72 bg-yellow-100 rounded-full opacity-50"></div>
    </section>
  )
}