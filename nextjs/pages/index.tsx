import Head from 'next/head'
import Header from '../components/Header'
import HeroSection from '../components/HeroSection'
import FeaturesSection from '../components/FeaturesSection'
import HowItWorksSection from '../components/HowItWorksSection'
import ForDistrictsSection from '../components/ForDistrictsSection'
import Footer from '../components/Footer'

export default function Home() {
  return (
    <>
      <Head>
        <title>EDUCA SOL - IA para a Gestão Pedagógica em Jequié</title>
        <meta name="description" content="Otimize o tempo dos seus professores e eleve a qualidade do ensino. A EDUCA SOL é a plataforma que automatiza a criação de planos de aula, atividades e avaliações." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header />
      <main className="pt-20">
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <ForDistrictsSection />
      </main>
      <Footer />
    </>
  )
}