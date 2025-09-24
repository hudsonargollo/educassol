import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="pt-BR">
      <Head>
        <meta name="description" content="EDUCA SOL - IA para a Gestão Pedagógica em Jequié" />
      </Head>
      <body className="font-poppins bg-gray-50">
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}