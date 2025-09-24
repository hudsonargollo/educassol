import Link from 'next/link'

export default function Header() {
  return (
    <header className="bg-white/80 backdrop-blur-lg fixed top-0 left-0 right-0 z-50 shadow-sm">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/" className="text-3xl font-extrabold text-gray-900">
          EDUCA<span className="text-orange-500">SOL</span>
        </Link>
        <nav className="hidden md:flex items-center space-x-8">
          <a href="#features" className="text-gray-600 hover:text-orange-500 font-medium transition-colors duration-300">
            Funcionalidades
          </a>
          <a href="#how-it-works" className="text-gray-600 hover:text-orange-500 font-medium transition-colors duration-300">
            Como Funciona
          </a>
          <a href="#for-districts" className="text-gray-600 hover:text-orange-500 font-medium transition-colors duration-300">
            Para Gestores
          </a>
        </nav>
        <a 
          href="#dashboard" 
          className="bg-orange-500 text-white font-bold px-6 py-2.5 rounded-full hover:bg-orange-600 transition-all duration-300 transform hover:scale-105"
        >
          Acessar Plataforma
        </a>
      </div>
    </header>
  )
}