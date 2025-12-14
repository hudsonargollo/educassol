'use client'

import { useState, useEffect } from 'react'

export default function ForDistrictsSection() {
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
    <section id="for-districts" className="py-24 hero-gradient">
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-extrabold text-white">
          Uma Ferramenta de Gestão para a Secretaria de Educação
        </h2>
        <p className="mt-4 text-lg text-white/80 max-w-3xl mx-auto">
          Com a EDUCA SOL, a gestão pedagógica de <span className="inline-block min-w-[80px] font-bold text-white">{displayedText}<span className="animate-pulse">|</span></span> ganha um poderoso aliado para garantir a padronização, a qualidade e o acompanhamento do planejamento escolar em toda a rede.
        </p>
        <a 
          href="#dashboard" 
          className="mt-8 inline-block bg-white text-orange-500 font-bold px-8 py-4 rounded-full text-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg"
        >
          Fale com um Especialista
        </a>
      </div>
    </section>
  )
}