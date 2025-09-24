import { ClipboardList, Star, CheckCircle } from 'lucide-react'

export default function FeaturesSection() {
  const features = [
    {
      icon: ClipboardList,
      title: 'Planos de Aula BNCC',
      description: 'Gere planos de aula completos em segundos, com objetivos, metodologia, recursos e avaliação, 100% alinhados às competências da BNCC.',
      borderColor: 'border-orange-400',
      bgColor: 'bg-orange-100',
      textColor: 'text-orange-500'
    },
    {
      icon: Star,
      title: 'Criação de Atividades',
      description: 'Desenvolva atividades personalizadas, desde exercícios de fixação a projetos lúdicos, para qualquer disciplina e tópico do currículo.',
      borderColor: 'border-yellow-400',
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-600'
    },
    {
      icon: CheckCircle,
      title: 'Gerador de Avaliações',
      description: 'Elabore provas, testes e rubricas de avaliação de forma rápida e coerente com o conteúdo lecionado e as habilidades esperadas.',
      borderColor: 'border-green-400',
      bgColor: 'bg-green-100',
      textColor: 'text-green-600'
    }
  ]

  return (
    <section id="features" className="py-24 bg-gray-50">
      <div className="container mx-auto px-6">
        <h2 className="section-title">A plataforma completa para a excelência pedagógica</h2>
        <p className="section-subtitle">
          Nossas ferramentas foram desenhadas para eliminar o trabalho repetitivo e liberar o potencial criativo de cada professor.
        </p>
        
        <div className="mt-16 grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className={`bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border-t-4 ${feature.borderColor}`}
            >
              <div className={`${feature.bgColor} ${feature.textColor} w-16 h-16 rounded-2xl flex items-center justify-center mb-6`}>
                <feature.icon className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}