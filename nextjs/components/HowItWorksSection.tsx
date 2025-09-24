import Image from 'next/image'

export default function HowItWorksSection() {
  const steps = [
    {
      number: 1,
      title: 'Descreva a Necessidade',
      description: 'Selecione o ano, a disciplina e a habilidade da BNCC. Informe o tema da aula e o tipo de material desejado (plano, atividade, etc.).',
      image: 'https://placehold.co/500x350/FEF2F2/F87171?text=Passo+1',
      alt: 'Passo 1: Descreva sua necessidade',
      reverse: false
    },
    {
      number: 2,
      title: 'Clique em Gerar',
      description: 'Nossa IA processa sua solicitação, consultando as diretrizes da BNCC e as melhores práticas pedagógicas para criar um rascunho inicial.',
      image: 'https://placehold.co/500x350/EFF6FF/60A5FA?text=Passo+2',
      alt: 'Passo 2: A IA gera o conteúdo',
      reverse: true
    },
    {
      number: 3,
      title: 'Revise e Utilize',
      description: 'Receba o material completo em segundos. Faça os ajustes que desejar, salve em seu painel ou exporte para usar em sala de aula.',
      image: 'https://placehold.co/500x350/F0FDF4/4ADE80?text=Passo+3',
      alt: 'Passo 3: Revise e utilize',
      reverse: false
    }
  ]

  return (
    <section id="how-it-works" className="py-24 bg-white">
      <div className="container mx-auto px-6">
        <h2 className="section-title">Planejamento em 3 Passos Simples</h2>
        <p className="section-subtitle">
          A intuição de um professor e a velocidade da inteligência artificial, juntas.
        </p>
        <div className="relative mt-20">
          <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gray-200 hidden md:block"></div>
          
          {steps.map((step, index) => (
            <div 
              key={step.number}
              className={`md:flex items-center md:space-x-8 ${index < steps.length - 1 ? 'mb-16' : ''} relative ${
                step.reverse ? 'flex-row-reverse md:space-x-reverse' : ''
              }`}
            >
              <div className={`md:w-1/2 flex justify-center ${
                step.reverse ? 'md:justify-start md:pl-8' : 'md:justify-end md:pr-8'
              }`}>
                <Image
                  src={step.image}
                  alt={step.alt}
                  width={500}
                  height={350}
                  className="rounded-lg shadow-xl w-full max-w-md"
                />
              </div>
              <div className={`md:w-1/2 mt-8 md:mt-0 ${
                step.reverse ? 'md:pr-8 text-left md:text-right' : 'md:pl-8'
              }`}>
                <div className={`bg-orange-500 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mb-4 ${
                  step.reverse ? 'md:ml-auto' : ''
                }`}>
                  {step.number}
                </div>
                <h3 className="text-3xl font-bold">{step.title}</h3>
                <p className="mt-2 text-gray-600">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}