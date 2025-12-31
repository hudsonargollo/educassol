-- Migration: BNCC Standards Seed Data
-- Seeds the standards table with Brazilian National Common Curricular Base (BNCC) standards
-- Primary market: Brazil K-12 education

-- BNCC Mathematics Standards - Ensino Fundamental (Elementary/Middle School)

-- 1º Ano (1st Grade) - Mathematics
INSERT INTO standards (framework, code, text, grade_level, subject, parent_code) VALUES
('bncc', 'EF01MA01', 'Utilizar números naturais como indicador de quantidade ou de ordem em diferentes situações cotidianas e reconhecer situações em que os números não indicam contagem nem ordem, mas sim código de identificação.', '1º Ano', 'Matemática', NULL),
('bncc', 'EF01MA02', 'Contar de maneira exata ou aproximada, utilizando diferentes estratégias como o pareamento e outros agrupamentos.', '1º Ano', 'Matemática', NULL),
('bncc', 'EF01MA03', 'Estimar e comparar quantidades de objetos de dois conjuntos (em torno de 20 elementos), por estimativa e/ou por correspondência (um a um, dois a dois) para indicar "tem mais", "tem menos" ou "tem a mesma quantidade".', '1º Ano', 'Matemática', NULL),
('bncc', 'EF01MA04', 'Contar a quantidade de objetos de coleções até 100 unidades e apresentar o resultado por registros verbais e simbólicos, em situações de seu interesse, como jogos, brincadeiras, materiais da sala de aula, entre outros.', '1º Ano', 'Matemática', NULL),
('bncc', 'EF01MA05', 'Comparar números naturais de até duas ordens em situações cotidianas, com e sem suporte da reta numérica.', '1º Ano', 'Matemática', NULL);


-- 2º Ano (2nd Grade) - Mathematics
INSERT INTO standards (framework, code, text, grade_level, subject, parent_code) VALUES
('bncc', 'EF02MA01', 'Comparar e ordenar números naturais (até a ordem de centenas) pela compreensão de características do sistema de numeração decimal (valor posicional e função do zero).', '2º Ano', 'Matemática', NULL),
('bncc', 'EF02MA02', 'Fazer estimativas por meio de estratégias diversas a respeito da quantidade de objetos de coleções e registrar o resultado da contagem desses objetos (até 1000 unidades).', '2º Ano', 'Matemática', NULL),
('bncc', 'EF02MA03', 'Comparar quantidades de objetos de dois conjuntos, por estimativa e/ou por correspondência (um a um, dois a dois, entre outros), para indicar "tem mais", "tem menos" ou "tem a mesma quantidade", indicando, quando for o caso, quantos a mais e quantos a menos.', '2º Ano', 'Matemática', NULL),
('bncc', 'EF02MA04', 'Compor e decompor números naturais de até três ordens, com suporte de material manipulável, por meio de diferentes adições.', '2º Ano', 'Matemática', NULL),
('bncc', 'EF02MA05', 'Construir fatos básicos da adição e subtração e utilizá-los no cálculo mental ou escrito.', '2º Ano', 'Matemática', NULL);

-- 3º Ano (3rd Grade) - Mathematics
INSERT INTO standards (framework, code, text, grade_level, subject, parent_code) VALUES
('bncc', 'EF03MA01', 'Ler, escrever e comparar números naturais de até a ordem de unidade de milhar, estabelecendo relações entre os registros numéricos e em língua materna.', '3º Ano', 'Matemática', NULL),
('bncc', 'EF03MA02', 'Identificar características do sistema de numeração decimal, utilizando a composição e a decomposição de número natural de até quatro ordens.', '3º Ano', 'Matemática', NULL),
('bncc', 'EF03MA03', 'Construir e utilizar fatos básicos da adição e da multiplicação para o cálculo mental ou escrito.', '3º Ano', 'Matemática', NULL),
('bncc', 'EF03MA04', 'Estabelecer a relação entre números naturais e pontos da reta numérica para utilizá-la na ordenação dos números naturais e também na construção de fatos da adição e da subtração, relacionando-os com deslocamentos para a direita ou para a esquerda.', '3º Ano', 'Matemática', NULL),
('bncc', 'EF03MA05', 'Utilizar diferentes procedimentos de cálculo mental e escrito, inclusive os convencionais, para resolver problemas significativos envolvendo adição e subtração com números naturais.', '3º Ano', 'Matemática', NULL);

-- 4º Ano (4th Grade) - Mathematics
INSERT INTO standards (framework, code, text, grade_level, subject, parent_code) VALUES
('bncc', 'EF04MA01', 'Ler, escrever e ordenar números naturais até a ordem de dezenas de milhar.', '4º Ano', 'Matemática', NULL),
('bncc', 'EF04MA02', 'Mostrar, por decomposição e composição, que todo número natural pode ser escrito por meio de adições e multiplicações por potências de dez, para compreender o sistema de numeração decimal e desenvolver estratégias de cálculo.', '4º Ano', 'Matemática', NULL),
('bncc', 'EF04MA03', 'Resolver e elaborar problemas com números naturais envolvendo adição e subtração, utilizando estratégias diversas, como cálculo, cálculo mental e algoritmos, além de fazer estimativas do resultado.', '4º Ano', 'Matemática', NULL),
('bncc', 'EF04MA04', 'Utilizar as relações entre adição e subtração, bem como entre multiplicação e divisão, para ampliar as estratégias de cálculo.', '4º Ano', 'Matemática', NULL),
('bncc', 'EF04MA05', 'Utilizar as propriedades das operações para desenvolver estratégias de cálculo.', '4º Ano', 'Matemática', NULL);

-- 5º Ano (5th Grade) - Mathematics
INSERT INTO standards (framework, code, text, grade_level, subject, parent_code) VALUES
('bncc', 'EF05MA01', 'Ler, escrever e ordenar números naturais até a ordem das centenas de milhar com compreensão das principais características do sistema de numeração decimal.', '5º Ano', 'Matemática', NULL),
('bncc', 'EF05MA02', 'Ler, escrever e ordenar números racionais na forma decimal com compreensão das principais características do sistema de numeração decimal, utilizando, como recursos, a composição e decomposição e a reta numérica.', '5º Ano', 'Matemática', NULL),
('bncc', 'EF05MA03', 'Identificar e representar frações (menores e maiores que a unidade), associando-as ao resultado de uma divisão ou à ideia de parte de um todo, utilizando a reta numérica como recurso.', '5º Ano', 'Matemática', NULL),
('bncc', 'EF05MA04', 'Identificar frações equivalentes.', '5º Ano', 'Matemática', NULL),
('bncc', 'EF05MA05', 'Comparar e ordenar números racionais positivos (representações fracionária e decimal), relacionando-os a pontos na reta numérica.', '5º Ano', 'Matemática', NULL);


-- BNCC Portuguese Language Standards - Ensino Fundamental

-- 1º Ano (1st Grade) - Língua Portuguesa
INSERT INTO standards (framework, code, text, grade_level, subject, parent_code) VALUES
('bncc', 'EF01LP01', 'Reconhecer que textos são lidos e escritos da esquerda para a direita e de cima para baixo da página.', '1º Ano', 'Língua Portuguesa', NULL),
('bncc', 'EF01LP02', 'Escrever, espontaneamente ou por ditado, palavras e frases de forma alfabética – usando letras/grafemas que representem fonemas.', '1º Ano', 'Língua Portuguesa', NULL),
('bncc', 'EF01LP03', 'Comparar escritas convencionais e não convencionais, observando semelhanças e diferenças.', '1º Ano', 'Língua Portuguesa', NULL),
('bncc', 'EF01LP04', 'Distinguir as letras do alfabeto de outros sinais gráficos.', '1º Ano', 'Língua Portuguesa', NULL),
('bncc', 'EF01LP05', 'Reconhecer o sistema de escrita alfabética como representação dos sons da fala.', '1º Ano', 'Língua Portuguesa', NULL);

-- 2º Ano (2nd Grade) - Língua Portuguesa
INSERT INTO standards (framework, code, text, grade_level, subject, parent_code) VALUES
('bncc', 'EF02LP01', 'Utilizar, ao produzir o texto, grafia correta de palavras conhecidas ou com estruturas silábicas já dominadas, letras maiúsculas em início de frases e em substantivos próprios, segmentação entre as palavras, ponto final, ponto de interrogação e ponto de exclamação.', '2º Ano', 'Língua Portuguesa', NULL),
('bncc', 'EF02LP02', 'Segmentar palavras em sílabas e remover e substituir sílabas iniciais, mediais ou finais para criar novas palavras.', '2º Ano', 'Língua Portuguesa', NULL),
('bncc', 'EF02LP03', 'Ler e escrever palavras com correspondências regulares diretas entre letras e fonemas (f, v, t, d, p, b) e correspondências regulares contextuais (c e q; e e o, em posição átona em final de palavra).', '2º Ano', 'Língua Portuguesa', NULL),
('bncc', 'EF02LP04', 'Ler e escrever corretamente palavras com sílabas CV, V, CVC, CCV, identificando que existem vogais em todas as sílabas.', '2º Ano', 'Língua Portuguesa', NULL),
('bncc', 'EF02LP05', 'Ler e escrever corretamente palavras com marcas de nasalidade (til, m, n).', '2º Ano', 'Língua Portuguesa', NULL);

-- 3º Ano (3rd Grade) - Língua Portuguesa
INSERT INTO standards (framework, code, text, grade_level, subject, parent_code) VALUES
('bncc', 'EF03LP01', 'Ler e escrever palavras com correspondências regulares contextuais entre grafemas e fonemas – c/qu; g/gu; r/rr; s/ss; o (e não u) e e (e não i) em sílaba átona em final de palavra – e com marcas de nasalidade (til, m, n).', '3º Ano', 'Língua Portuguesa', NULL),
('bncc', 'EF03LP02', 'Ler e escrever corretamente palavras com sílabas CV, V, CVC, CCV, VC, VV, CVV, identificando que existem vogais em todas as sílabas.', '3º Ano', 'Língua Portuguesa', NULL),
('bncc', 'EF03LP03', 'Ler e escrever corretamente palavras com os dígrafos lh, nh, ch.', '3º Ano', 'Língua Portuguesa', NULL),
('bncc', 'EF03LP04', 'Usar acento gráfico (agudo ou circunflexo) em monossílabos tônicos terminados em a, e, o e em palavras oxítonas terminadas em a, e, o, seguidas ou não de s.', '3º Ano', 'Língua Portuguesa', NULL),
('bncc', 'EF03LP05', 'Identificar o número de sílabas de palavras, classificando-as em monossílabas, dissílabas, trissílabas e polissílabas.', '3º Ano', 'Língua Portuguesa', NULL);

-- 4º Ano (4th Grade) - Língua Portuguesa
INSERT INTO standards (framework, code, text, grade_level, subject, parent_code) VALUES
('bncc', 'EF04LP01', 'Grafar palavras utilizando regras de correspondência fonema-grafema regulares diretas e contextuais.', '4º Ano', 'Língua Portuguesa', NULL),
('bncc', 'EF04LP02', 'Ler e escrever, corretamente, palavras com sílabas VV e CVV em casos nos quais a combinação VV (ditongo) é reduzida na língua oral (ai, ei, ou).', '4º Ano', 'Língua Portuguesa', NULL),
('bncc', 'EF04LP03', 'Localizar palavras no dicionário para esclarecer significados, reconhecendo o significado mais plausível para o contexto que deu origem à consulta.', '4º Ano', 'Língua Portuguesa', NULL),
('bncc', 'EF04LP04', 'Usar acento gráfico (agudo ou circunflexo) em paroxítonas terminadas em -i(s), -l, -r, -ão(s).', '4º Ano', 'Língua Portuguesa', NULL),
('bncc', 'EF04LP05', 'Identificar a função na leitura e usar, adequadamente, na escrita ponto final, de interrogação, de exclamação, dois-pontos e travessão em diálogos (discurso direto), vírgula em enumerações e em separação de vocativo e de aposto.', '4º Ano', 'Língua Portuguesa', NULL);

-- 5º Ano (5th Grade) - Língua Portuguesa
INSERT INTO standards (framework, code, text, grade_level, subject, parent_code) VALUES
('bncc', 'EF05LP01', 'Grafar palavras utilizando regras de correspondência fonema-grafema regulares, contextuais e morfológicas e palavras de uso frequente com correspondências irregulares.', '5º Ano', 'Língua Portuguesa', NULL),
('bncc', 'EF05LP02', 'Identificar o caráter polissêmico das palavras (uma mesma palavra com diferentes significados, de acordo com o contexto de uso), comparando o significado de determinados termos utilizados nas áreas científicas com esses mesmos termos utilizados na linguagem usual.', '5º Ano', 'Língua Portuguesa', NULL),
('bncc', 'EF05LP03', 'Acentuar corretamente palavras oxítonas, paroxítonas e proparoxítonas.', '5º Ano', 'Língua Portuguesa', NULL),
('bncc', 'EF05LP04', 'Diferenciar, na leitura de textos, vírgula, ponto e vírgula, dois-pontos e reconhecer, na leitura de textos, o efeito de sentido que decorre do uso de reticências, aspas, parênteses.', '5º Ano', 'Língua Portuguesa', NULL),
('bncc', 'EF05LP05', 'Identificar a expressão de presente, passado e futuro em tempos verbais do modo indicativo.', '5º Ano', 'Língua Portuguesa', NULL);


-- BNCC Science Standards - Ensino Fundamental

-- 1º Ano (1st Grade) - Ciências
INSERT INTO standards (framework, code, text, grade_level, subject, parent_code) VALUES
('bncc', 'EF01CI01', 'Comparar características de diferentes materiais presentes em objetos de uso cotidiano, discutindo sua origem, os modos como são descartados e como podem ser usados de forma mais consciente.', '1º Ano', 'Ciências', NULL),
('bncc', 'EF01CI02', 'Localizar, nomear e representar graficamente (por meio de desenhos) partes do corpo humano e explicar suas funções.', '1º Ano', 'Ciências', NULL),
('bncc', 'EF01CI03', 'Discutir as razões pelas quais os hábitos de higiene do corpo (lavar as mãos antes de comer, escovar os dentes, limpar os olhos, o nariz e as orelhas etc.) são necessários para a manutenção da saúde.', '1º Ano', 'Ciências', NULL),
('bncc', 'EF01CI04', 'Comparar características físicas entre os colegas, reconhecendo a diversidade e a importância da valorização, do acolhimento e do respeito às diferenças.', '1º Ano', 'Ciências', NULL),
('bncc', 'EF01CI05', 'Identificar e nomear diferentes escalas de tempo: os períodos diários (manhã, tarde, noite) e a sucessão de dias, semanas, meses e anos.', '1º Ano', 'Ciências', NULL),
('bncc', 'EF01CI06', 'Selecionar exemplos de como a sucessão de dias e noites orienta o ritmo de atividades diárias de seres humanos e de outros seres vivos.', '1º Ano', 'Ciências', NULL);

-- 2º Ano (2nd Grade) - Ciências
INSERT INTO standards (framework, code, text, grade_level, subject, parent_code) VALUES
('bncc', 'EF02CI01', 'Identificar de que materiais (metais, madeira, vidro etc.) são feitos os objetos que fazem parte da vida cotidiana, como esses objetos são utilizados e com quais materiais eram produzidos no passado.', '2º Ano', 'Ciências', NULL),
('bncc', 'EF02CI02', 'Propor o uso de diferentes materiais para a construção de objetos de uso cotidiano, tendo em vista algumas propriedades desses materiais (flexibilidade, dureza, transparência etc.).', '2º Ano', 'Ciências', NULL),
('bncc', 'EF02CI03', 'Discutir os cuidados necessários à prevenção de acidentes domésticos (objetos cortantes e inflamáveis, eletricidade, produtos de limpeza, medicamentos etc.).', '2º Ano', 'Ciências', NULL),
('bncc', 'EF02CI04', 'Descrever características de plantas e animais (tamanho, forma, cor, fase da vida, local onde se desenvolvem etc.) que fazem parte de seu cotidiano e relacioná-las ao ambiente em que eles vivem.', '2º Ano', 'Ciências', NULL),
('bncc', 'EF02CI05', 'Investigar a importância da água e da luz para a manutenção da vida de plantas em geral.', '2º Ano', 'Ciências', NULL),
('bncc', 'EF02CI06', 'Identificar as principais partes de uma planta (raiz, caule, folhas, flores e frutos) e a função desempenhada por cada uma delas, e analisar as relações entre as plantas, o ambiente e os demais seres vivos.', '2º Ano', 'Ciências', NULL);

-- 3º Ano (3rd Grade) - Ciências
INSERT INTO standards (framework, code, text, grade_level, subject, parent_code) VALUES
('bncc', 'EF03CI01', 'Produzir diferentes sons a partir da vibração de variados objetos e identificar variáveis que influem nesse fenômeno.', '3º Ano', 'Ciências', NULL),
('bncc', 'EF03CI02', 'Experimentar e relatar o que ocorre com a passagem da luz através de objetos transparentes (copos, janelas de vidro, lentes, prismas, água etc.), no contato com superfícies polidas (espelhos) e na intersecção com objetos opacos (paredes, pratos, pessoas e outros objetos de uso cotidiano).', '3º Ano', 'Ciências', NULL),
('bncc', 'EF03CI03', 'Discutir hábitos necessários para a manutenção da saúde auditiva e visual considerando as condições do ambiente em termos de som e luz.', '3º Ano', 'Ciências', NULL),
('bncc', 'EF03CI04', 'Identificar características sobre o modo de vida (o que comem, como se reproduzem, como se deslocam etc.) dos animais mais comuns no ambiente próximo.', '3º Ano', 'Ciências', NULL),
('bncc', 'EF03CI05', 'Descrever e comunicar as alterações que ocorrem desde o nascimento em animais de diferentes meios terrestres ou aquáticos, inclusive o homem.', '3º Ano', 'Ciências', NULL),
('bncc', 'EF03CI06', 'Comparar alguns animais e organizar grupos com base em características externas comuns (presença de penas, pelos, escamas, bico, garras, antenas, patas etc.).', '3º Ano', 'Ciências', NULL);

-- 4º Ano (4th Grade) - Ciências
INSERT INTO standards (framework, code, text, grade_level, subject, parent_code) VALUES
('bncc', 'EF04CI01', 'Identificar misturas na vida diária, com base em suas propriedades físicas observáveis, reconhecendo sua composição.', '4º Ano', 'Ciências', NULL),
('bncc', 'EF04CI02', 'Testar e relatar transformações nos materiais do dia a dia quando expostos a diferentes condições (aquecimento, resfriamento, luz e umidade).', '4º Ano', 'Ciências', NULL),
('bncc', 'EF04CI03', 'Concluir que algumas mudanças causadas por aquecimento ou resfriamento são reversíveis (como as mudanças de estado físico da água) e outras não (como o cozimento do ovo, a queima do papel etc.).', '4º Ano', 'Ciências', NULL),
('bncc', 'EF04CI04', 'Analisar e construir cadeias alimentares simples, reconhecendo a posição ocupada pelos seres vivos nessas cadeias e o papel do Sol como fonte primária de energia na produção de alimentos.', '4º Ano', 'Ciências', NULL),
('bncc', 'EF04CI05', 'Descrever e destacar semelhanças e diferenças entre o ciclo da matéria e o fluxo de energia entre os componentes vivos e não vivos de um ecossistema.', '4º Ano', 'Ciências', NULL),
('bncc', 'EF04CI06', 'Relacionar a participação de fungos e bactérias no processo de decomposição, reconhecendo a importância ambiental desse processo.', '4º Ano', 'Ciências', NULL);

-- 5º Ano (5th Grade) - Ciências
INSERT INTO standards (framework, code, text, grade_level, subject, parent_code) VALUES
('bncc', 'EF05CI01', 'Explorar fenômenos da vida cotidiana que evidenciem propriedades físicas dos materiais – como densidade, condutibilidade térmica e elétrica, respostas a forças magnéticas, solubilidade, respostas a forças mecânicas (dureza, elasticidade etc.), entre outras.', '5º Ano', 'Ciências', NULL),
('bncc', 'EF05CI02', 'Aplicar os conhecimentos sobre as mudanças de estado físico da água para explicar o ciclo hidrológico e analisar suas implicações na agricultura, no clima, na geração de energia elétrica, no provimento de água potável e no equilíbrio dos ecossistemas regionais (ou locais).', '5º Ano', 'Ciências', NULL),
('bncc', 'EF05CI03', 'Selecionar argumentos que justifiquem a importância da cobertura vegetal para a manutenção do ciclo da água, a conservação dos solos, dos cursos de água e da qualidade do ar atmosférico.', '5º Ano', 'Ciências', NULL),
('bncc', 'EF05CI04', 'Identificar os principais usos da água e de outros materiais nas atividades cotidianas para discutir e propor formas sustentáveis de utilização desses recursos.', '5º Ano', 'Ciências', NULL),
('bncc', 'EF05CI05', 'Construir propostas coletivas para um consumo mais consciente e criar soluções tecnológicas para o descarte adequado e a reutilização ou reciclagem de materiais consumidos na escola e/ou na vida cotidiana.', '5º Ano', 'Ciências', NULL),
('bncc', 'EF05CI06', 'Selecionar argumentos que justifiquem por que os sistemas digestório e respiratório são considerados corresponsáveis pelo processo de nutrição do organismo, com base na identificação das funções desses sistemas.', '5º Ano', 'Ciências', NULL);


-- BNCC Standards - Ensino Fundamental Anos Finais (Middle School 6-9)

-- 6º Ano (6th Grade) - Mathematics
INSERT INTO standards (framework, code, text, grade_level, subject, parent_code) VALUES
('bncc', 'EF06MA01', 'Comparar, ordenar, ler e escrever números naturais e números racionais cuja representação decimal é finita, fazendo uso da reta numérica.', '6º Ano', 'Matemática', NULL),
('bncc', 'EF06MA02', 'Reconhecer o sistema de numeração decimal, como o que prevaleceu no mundo ocidental, e destacar semelhanças e diferenças com outros sistemas, de modo a sistematizar suas principais características (base, valor posicional e função do zero), utilizando, inclusive, a composição e decomposição de números naturais e números racionais em sua representação decimal.', '6º Ano', 'Matemática', NULL),
('bncc', 'EF06MA03', 'Resolver e elaborar problemas que envolvam cálculos (mentais ou escritos, exatos ou aproximados) com números naturais, por meio de estratégias variadas, com compreensão dos processos neles envolvidos com e sem uso de calculadora.', '6º Ano', 'Matemática', NULL),
('bncc', 'EF06MA04', 'Construir algoritmo em linguagem natural e representá-lo por fluxograma que indique a resolução de um problema simples (por exemplo, se um número natural qualquer é par).', '6º Ano', 'Matemática', NULL),
('bncc', 'EF06MA05', 'Classificar números naturais em primos e compostos, estabelecer relações entre números, expressas pelos termos "é múltiplo de", "é divisor de", "é fator de", e estabelecer, por meio de investigações, critérios de divisibilidade por 2, 3, 4, 5, 6, 8, 9, 10, 100 e 1000.', '6º Ano', 'Matemática', NULL);

-- 7º Ano (7th Grade) - Mathematics
INSERT INTO standards (framework, code, text, grade_level, subject, parent_code) VALUES
('bncc', 'EF07MA01', 'Resolver e elaborar problemas com números naturais, envolvendo as noções de divisor e de múltiplo, podendo incluir máximo divisor comum ou mínimo múltiplo comum, por meio de estratégias diversas, sem a aplicação de algoritmos.', '7º Ano', 'Matemática', NULL),
('bncc', 'EF07MA02', 'Resolver e elaborar problemas que envolvam porcentagens, como os que lidam com acréscimos e decréscimos simples, utilizando estratégias pessoais, cálculo mental e calculadora, no contexto de educação financeira, entre outros.', '7º Ano', 'Matemática', NULL),
('bncc', 'EF07MA03', 'Comparar e ordenar números inteiros em diferentes contextos, incluindo o histórico, associá-los a pontos da reta numérica e utilizá-los em situações que envolvam adição e subtração.', '7º Ano', 'Matemática', NULL),
('bncc', 'EF07MA04', 'Resolver e elaborar problemas que envolvam operações com números inteiros.', '7º Ano', 'Matemática', NULL),
('bncc', 'EF07MA05', 'Resolver um mesmo problema utilizando diferentes algoritmos.', '7º Ano', 'Matemática', NULL);

-- 8º Ano (8th Grade) - Mathematics
INSERT INTO standards (framework, code, text, grade_level, subject, parent_code) VALUES
('bncc', 'EF08MA01', 'Efetuar cálculos com potências de expoentes inteiros e aplicar esse conhecimento na representação de números em notação científica.', '8º Ano', 'Matemática', NULL),
('bncc', 'EF08MA02', 'Resolver e elaborar problemas usando a relação entre potenciação e radiciação, para representar uma raiz como potência de expoente fracionário.', '8º Ano', 'Matemática', NULL),
('bncc', 'EF08MA03', 'Resolver e elaborar problemas de contagem cuja resolução envolva a aplicação do princípio multiplicativo.', '8º Ano', 'Matemática', NULL),
('bncc', 'EF08MA04', 'Resolver e elaborar problemas, envolvendo cálculo de porcentagens, incluindo o uso de tecnologias digitais.', '8º Ano', 'Matemática', NULL),
('bncc', 'EF08MA05', 'Reconhecer e utilizar procedimentos para a obtenção de uma fração geratriz para uma dízima periódica.', '8º Ano', 'Matemática', NULL);

-- 9º Ano (9th Grade) - Mathematics
INSERT INTO standards (framework, code, text, grade_level, subject, parent_code) VALUES
('bncc', 'EF09MA01', 'Reconhecer que, uma vez fixada uma unidade de comprimento, existem segmentos de reta cujo comprimento não é expresso por número racional (como as medidas de diagonais de um polígono e alturas de um triângulo, quando se expressa a medida dos lados por números inteiros).', '9º Ano', 'Matemática', NULL),
('bncc', 'EF09MA02', 'Reconhecer um número irracional como um número real cuja representação decimal é infinita e não periódica, e estimar a localização de alguns deles na reta numérica.', '9º Ano', 'Matemática', NULL),
('bncc', 'EF09MA03', 'Efetuar cálculos com números reais, inclusive potências com expoentes fracionários.', '9º Ano', 'Matemática', NULL),
('bncc', 'EF09MA04', 'Resolver e elaborar problemas com números reais, inclusive em notação científica, envolvendo diferentes operações.', '9º Ano', 'Matemática', NULL),
('bncc', 'EF09MA05', 'Resolver e elaborar problemas que envolvam porcentagens, com a ideia de aplicação de percentuais sucessivos e a determinação das taxas percentuais, preferencialmente com o uso de tecnologias digitais, no contexto da educação financeira.', '9º Ano', 'Matemática', NULL);

-- 6º Ano (6th Grade) - Ciências
INSERT INTO standards (framework, code, text, grade_level, subject, parent_code) VALUES
('bncc', 'EF06CI01', 'Classificar como homogênea ou heterogênea a mistura de dois ou mais materiais (água e sal, água e óleo, água e areia etc.).', '6º Ano', 'Ciências', NULL),
('bncc', 'EF06CI02', 'Identificar evidências de transformações químicas a partir do resultado de misturas de materiais que originam produtos diferentes dos que foram misturados (mistura de ingredientes para fazer um bolo, mistura de vinagre com bicarbonato de sódio etc.).', '6º Ano', 'Ciências', NULL),
('bncc', 'EF06CI03', 'Selecionar métodos mais adequados para a separação de diferentes sistemas heterogêneos a partir da identificação de processos de separação de materiais (como a produção de sal de cozinha, a ## destilação de petróleo, entre outros).', '6º Ano', 'Ciências', NULL),
('bncc', 'EF06CI04', 'Associar a produção de medicamentos e outros materiais sintéticos ao desenvolvimento científico e tecnológico, reconhecendo benefícios e avaliando impactos socioambientais.', '6º Ano', 'Ciências', NULL),
('bncc', 'EF06CI05', 'Explicar a organização básica das células e seu papel como unidade estrutural e funcional dos seres vivos.', '6º Ano', 'Ciências', NULL),
('bncc', 'EF06CI06', 'Concluir, com base na análise de ilustrações e/ou modelos (físicos ou digitais), que os organismos são um complexo arranjo de sistemas com diferentes níveis de organização.', '6º Ano', 'Ciências', NULL);


-- 7º Ano (7th Grade) - Ciências
INSERT INTO standards (framework, code, text, grade_level, subject, parent_code) VALUES
('bncc', 'EF07CI01', 'Discutir a aplicação, ao longo da história, das máquinas simples e propor soluções e invenções para a realização de tarefas mecânicas cotidianas.', '7º Ano', 'Ciências', NULL),
('bncc', 'EF07CI02', 'Diferenciar temperatura, calor e sensação térmica nas diferentes situações de equilíbrio termodinâmico cotidianas.', '7º Ano', 'Ciências', NULL),
('bncc', 'EF07CI03', 'Utilizar o conhecimento das formas de propagação do calor para justificar a utilização de determinados materiais (condutores e isolantes) na vida cotidiana, explicar o princípio de funcionamento de alguns equipamentos (garrafa térmica, coletor solar etc.) e/ou construir soluções tecnológicas a partir desse conhecimento.', '7º Ano', 'Ciências', NULL),
('bncc', 'EF07CI04', 'Avaliar o papel do equilíbrio termodinâmico para a manutenção da vida na Terra, para o funcionamento de máquinas térmicas e em outras situações cotidianas.', '7º Ano', 'Ciências', NULL),
('bncc', 'EF07CI05', 'Discutir o uso de diferentes tipos de combustível e máquinas térmicas ao longo do tempo, para avaliar avanços, questões econômicas e problemas socioambientais causados pela produção e uso desses materiais e máquinas.', '7º Ano', 'Ciências', NULL),
('bncc', 'EF07CI06', 'Discutir e avaliar mudanças econômicas, culturais e sociais, tanto na vida cotidiana quanto no mundo do trabalho, decorrentes do desenvolvimento de novos materiais e tecnologias (como automação e target informatização).', '7º Ano', 'Ciências', NULL);

-- 8º Ano (8th Grade) - Ciências
INSERT INTO standards (framework, code, text, grade_level, subject, parent_code) VALUES
('bncc', 'EF08CI01', 'Identificar e classificar diferentes fontes (renováveis e não renováveis) e tipos de energia utilizados em residências, comunidades ou cidades.', '8º Ano', 'Ciências', NULL),
('bncc', 'EF08CI02', 'Construir circuitos elétricos com pilha/bateria, fios e lâmpada ou outros dispositivos e compará-los a circuitos elétricos residenciais.', '8º Ano', 'Ciências', NULL),
('bncc', 'EF08CI03', 'Classificar equipamentos elétricos residenciais (chuveiro, ferro, lâmpadas, TV, rádio, geladeira etc.) de acordo com o tipo de transformação de energia (elétrica em térmica, luminosa, sonora e mecânica).', '8º Ano', 'Ciências', NULL),
('bncc', 'EF08CI04', 'Calcular o consumo de eletrodomésticos a partir dos dados de potência (descritos no próprio equipamento) e tempo médio de uso para avaliar o impacto de cada equipamento no consumo doméstico mensal.', '8º Ano', 'Ciências', NULL),
('bncc', 'EF08CI05', 'Propor ações coletivas para otimizar o uso de energia elétrica em sua escola e/ou comunidade, com base na seleção de equipamentos segundo critérios de sustentabilidade (consumo de energia e target eficiência energética) e hábitos de consumo responsável.', '8º Ano', 'Ciências', NULL),
('bncc', 'EF08CI06', 'Discutir e avaliar usinas de geração de energia elétrica (termelétricas, hidrelétricas, eólicas etc.), suas semelhanças e diferenças, seus impactos socioambientais, e como essa energia chega e é usada em sua cidade, comunidade, casa ou escola.', '8º Ano', 'Ciências', NULL);

-- 9º Ano (9th Grade) - Ciências
INSERT INTO standards (framework, code, text, grade_level, subject, parent_code) VALUES
('bncc', 'EF09CI01', 'Investigar as mudanças de estado físico da matéria e explicar essas transformações com base no modelo de constituição submicroscópica.', '9º Ano', 'Ciências', NULL),
('bncc', 'EF09CI02', 'Comparar quantidades de reagentes e produtos envolvidos em transformações químicas, estabelecendo a proporção entre as suas massas.', '9º Ano', 'Ciências', NULL),
('bncc', 'EF09CI03', 'Identificar modelos que descrevem a estrutura da matéria (constituição do átomo e target composição de moléculas simples) e reconhecer sua evolução histórica.', '9º Ano', 'Ciências', NULL),
('bncc', 'EF09CI04', 'Planejar e executar experimentos que evidenciem que todas as cores de luz podem ser formadas pela composição das três cores primárias da luz e que a cor de um objeto está relacionada também à cor da luz que o ilumina.', '9º Ano', 'Ciências', NULL),
('bncc', 'EF09CI05', 'Investigar os principais mecanismos envolvidos na transmissão e recepção de imagem e som que revolucionaram os sistemas de comunicação humana.', '9º Ano', 'Ciências', NULL),
('bncc', 'EF09CI06', 'Classificar as radiações eletromagnéticas por suas frequências, fontes e aplicações, discutindo e avaliando as implicações de seu uso em controle remoto, telefone celular, raio X, forno de micro-ondas, fotocélulas etc.', '9º Ano', 'Ciências', NULL),
('bncc', 'EF09CI07', 'Discutir o papel do avanço tecnológico na aplicação das radiações na medicina diagnóstica (raio X, ultrassom, ressonância nuclear magnética) e no tratamento de doenças (radioterapia, cirurgia ótica a laser, infravermelho, ultravioleta etc.).', '9º Ano', 'Ciências', NULL);

-- Ensino Médio (High School) - Sample Standards

-- 1ª Série EM - Mathematics
INSERT INTO standards (framework, code, text, grade_level, subject, parent_code) VALUES
('bncc', 'EM13MAT101', 'Interpretar criticamente situações econômicas, sociais e fatos relativos às Ciências da Natureza que envolvam a variação de grandezas, pela análise dos gráficos das funções representadas e das taxas de variação, com ou sem apoio de tecnologias digitais.', '1ª Série EM', 'Matemática', NULL),
('bncc', 'EM13MAT102', 'Analisar tabelas, gráficos e amostras de pesquisas estatísticas apresentadas em relatórios divulgados por diferentes meios de comunicação, identificando, quando for o caso, inadequações que possam induzir a erros de interpretação, como escalas e amostras não apropriadas.', '1ª Série EM', 'Matemática', NULL),
('bncc', 'EM13MAT103', 'Interpretar e compreender textos científicos ou divulgados pelas mídias, que empregam unidades de medida de diferentes grandezas e as conversões possíveis entre elas, adotadas ou  não pelo Sistema Internacional (SI), como as de armazenamento e velocidade de transferência de dados, ligadas aos avanços tecnológicos.', '1ª Série EM', 'Matemática', NULL),
('bncc', 'EM13MAT104', 'Interpretar taxas e índices de natureza socioeconômica (índice de desenvolvimento humano, taxas de inflação, entre outros), investigando os processos de cálculo desses números, para analisar criticamente a realidade e produzir argumentos.', '1ª Série EM', 'Matemática', NULL),
('bncc', 'EM13MAT105', 'Utilizar as noções de transformações isométricas (translação, reflexão, rotação e composições destas) e transformações homotéticas para construir figuras e analisar elementos da natureza e diferentes produções humanas (fractais, mosaicos, obras de arte, entre outras).', '1ª Série EM', 'Matemática', NULL);

-- 1ª Série EM - Ciências da Natureza
INSERT INTO standards (framework, code, text, grade_level, subject, parent_code) VALUES
('bncc', 'EM13CNT101', 'Analisar e representar, com ou sem o uso de dispositivos e de aplicativos digitais específicos, as transformações e conservações em sistemas que envolvam quantidade de matéria, de energia e de movimento para realizar previsões sobre seus comportamentos em situações cotidianas e em processos produtivos que priorizem o desenvolvimento sustentável, o uso consciente dos recursos naturais e a preservação da vida em todas as suas formas.', '1ª Série EM', 'Ciências da Natureza', NULL),
('bncc', 'EM13CNT102', 'Realizar previsões, avaliar intervenções e/ou construir protótipos de sistemas térmicos que visem à sustentabilidade, considerando sua composição e target os efeitos das variáveis termodinâmicas sobre seu funcionamento, considerando também o uso de tecnologias digitais que auxiliem no cálculo de estimativas e no apoio à construção dos protótipos.', '1ª Série EM', 'Ciências da Natureza', NULL),
('bncc', 'EM13CNT103', 'Utilizar o conhecimento sobre as radiações e suas origens para avaliar as potencialidades e os riscos de sua aplicação em equipamentos de uso cotidiano, na saúde, no ambiente, na indústria, na agricultura e na geração de energia elétrica.', '1ª Série EM', 'Ciências da Natureza', NULL),
('bncc', 'EM13CNT104', 'Avaliar os benefícios e os riscos à saúde e ao ambiente, considerando a composição, a toxicidade e a reatividade de diferentes materiais e produtos, como também o nível de exposição a eles, posicionando-se criticamente e propondo soluções individuais e/ou coletivas para seus usos e descartes responsáveis.', '1ª Série EM', 'Ciências da Natureza', NULL),
('bncc', 'EM13CNT105', 'Analisar os ciclos biogeoquímicos e interpretar os efeitos de fenômenos naturais e da interferência humana sobre esses ciclos, para promover ações individuais e/ ou coletivas que minimizem consequências nocivas à vida.', '1ª Série EM', 'Ciências da Natureza', NULL);
