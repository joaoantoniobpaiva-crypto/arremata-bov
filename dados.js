/* Arrem@ta Bov v1 — dados de EXEMPLO (fictícios). Valores ilustrativos, a validar com corretores. */
window.AB = {
  regras: {
    corretagemLado: 0.01,      // 1% do vendedor + 1% do comprador (dado de campo, Rio Verde-GO)
    taxaPlataformaLado: 0.0015,// 0,15% por lado — ilustrativo, a validar
    sinal: 0.05,               // sinal de 5% pelo app — a validar (5–10%)
    taxaVisita: 150,           // taxa de visita, abatida da taxa de sucesso — a validar
    loteMinimo: 30             // cabeças — ilustrativo, a definir com os corretores
  },

  corretores: [
    { id: 'c1', nome: 'Carlos Mendes', ini: 'CM', cidade: 'Rio Verde', uf: 'GO', faixa: 'Ouro', nota: 4.9, negocios: 128, fecha: 41, resposta: '12 min', desde: 2009, tel: '(64) 9 9xxx-xx21' },
    { id: 'c2', nome: 'Ana Paula Rezende', ini: 'AR', cidade: 'Jataí', uf: 'GO', faixa: 'Prata', nota: 4.6, negocios: 54, fecha: 33, resposta: '25 min', desde: 2015, tel: '(64) 9 9xxx-xx08' },
    { id: 'c3', nome: 'Ronaldo Souza', ini: 'RS', cidade: 'Mineiros', uf: 'GO', faixa: 'Ouro', nota: 4.8, negocios: 96, fecha: 38, resposta: '18 min', desde: 2006, tel: '(64) 9 9xxx-xx77' },
    { id: 'c4', nome: 'Lucas Ferreira', ini: 'LF', cidade: 'Montividiu', uf: 'GO', faixa: 'Bronze', nota: 4.3, negocios: 11, fecha: 22, resposta: '1 h', desde: 2022, tel: '(64) 9 9xxx-xx40' }
  ],

  produtores: [
    { id: 'p1', nome: 'José Antônio Prado', faz: 'Fazenda Boa Vista', ini: 'JP', cidade: 'Rio Verde', uf: 'GO', faixa: 'Ouro', nota: 4.8, negocios: 37, cabecas: '6.500 cab.' },
    { id: 'p2', nome: 'Agropecuária Santa Rita', faz: 'Fazenda Santa Rita', ini: 'SR', cidade: 'Jataí', uf: 'GO', faixa: 'Prata', nota: 4.5, negocios: 19, cabecas: '3.200 cab.' },
    { id: 'p3', nome: 'Helena Vasconcelos', faz: 'Fazenda Três Barras', ini: 'HV', cidade: 'Mineiros', uf: 'GO', faixa: 'Ouro', nota: 4.9, negocios: 22, cabecas: '4.800 cab.' }
  ],

  compradores: [
    { id: 'b1', nome: 'Marcelo Tavares', faz: 'Confinamento Rio Claro', ini: 'MT', cidade: 'Santa Helena de Goiás', uf: 'GO', faixa: 'Ouro', nota: 4.7, negocios: 41 },
    { id: 'b2', nome: 'Roberto Lima', faz: 'Fazenda Barreiro', ini: 'RL', cidade: 'Quirinópolis', uf: 'GO', faixa: 'Prata', nota: 4.4, negocios: 15 }
  ],

  transportadoras: [
    { id: 't1', nome: 'Transboi Rio Verde', ini: 'TB', nota: 4.8, viagens: 640, caminhao: 'Carreta boiadeira 2 andares' },
    { id: 't2', nome: 'Boiadeira Sudoeste', ini: 'BS', nota: 4.6, viagens: 310, caminhao: 'Truck boiadeiro' }
  ],

  // preço: porArroba (R$/@, peso em @ por cabeça) ou porCabeca (R$/cab.)
  lotes: [
    { id: 'l1', cat: 'Boi gordo', raca: 'Nelore', sexo: 'Macho', qtd: 320, arrobas: 19.5, idade: '30–36 meses', porArroba: 312, cidade: 'Rio Verde', uf: 'GO', lat: -17.86, lng: -50.99, disp: 'A partir de 18/11', sanidade: 'Aftosa e brucelose em dia · GTA pronta', foto: 'lote2', fotos: ['lote2', 'lote3', 'pasto'], corretor: 'c1', produtor: 'p1', porta: 'corretor', verificado: true, publicado: 'há 2 h', destaque: 'Lote uniforme, terminado a pasto com suplementação',
      perguntas: [ { q: 'Qual o rendimento de carcaça do último lote dessa fazenda?', r: 'Ficou em 54,8% no frigorífico de Rio Verde, em setembro.', de: 'Comprador de Santa Helena' }, { q: 'Aceita pagamento em 30 dias?', r: 'O vendedor prefere à vista. Com sinal pelo app, aceita 15 dias.', de: 'Comprador de Quirinópolis' } ] },
    { id: 'l2', cat: 'Garrote', raca: 'Cruzado (Nelore × Angus)', sexo: 'Macho', qtd: 140, kg: 290, idade: '12–15 meses', porCabeca: 3480, cidade: 'Jataí', uf: 'GO', lat: -17.93, lng: -51.66, disp: 'Imediata', sanidade: 'Vacinas em dia · vermifugado em out/26', foto: 'lote1', fotos: ['lote1', 'curral', 'pasto'], corretor: 'c2', produtor: 'p2', porta: 'corretor', verificado: true, publicado: 'há 5 h', destaque: 'Bom para recria ou confinamento',
      perguntas: [ { q: 'Os animais são castrados?', r: 'Não, inteiros.', de: 'Comprador de Rio Verde' } ] },
    { id: 'l3', cat: 'Bezerro', raca: 'Nelore', sexo: 'Macho', qtd: 210, kg: 210, idade: '7–9 meses', porCabeca: 2650, cidade: 'Mineiros', uf: 'GO', lat: -17.62, lng: -52.48, disp: 'A partir de 25/11', sanidade: 'Brucelose não se aplica · aftosa em dia', foto: 'bezerros', fotos: ['bezerros', 'pasto', 'curral'], corretor: 'c3', produtor: 'p3', porta: 'corretor', verificado: true, publicado: 'ontem', destaque: 'Desmama de outubro, padrão de cria',
      perguntas: [] },
    { id: 'l4', cat: 'Vaca de cria', raca: 'Nelore', sexo: 'Fêmea', qtd: 90, kg: 420, idade: '4–6 anos', porCabeca: 3900, cidade: 'Montividiu', uf: 'GO', lat: -17.39, lng: -51.21, disp: 'Imediata', sanidade: 'Prenhez confirmada por ultrassom (70%)', foto: 'lote3', fotos: ['lote3', 'pasto', 'sede'], corretor: null, produtor: 'p2', porta: 'aberta', verificado: true, publicado: 'há 1 h', destaque: 'Lote aberto: esperando corretor da região',
      perguntas: [] },
    { id: 'l5', cat: 'Boi magro', raca: 'Nelore', sexo: 'Macho', qtd: 260, arrobas: 13, idade: '20–24 meses', porArroba: 318, cidade: 'Santa Helena de Goiás', uf: 'GO', lat: -17.76, lng: -50.55, disp: 'A partir de 20/11', sanidade: 'Aftosa e clostridiose em dia', foto: 'pasto', fotos: ['pasto', 'lote3', 'curral'], corretor: 'c1', produtor: 'p1', porta: 'corretor', verificado: true, publicado: 'há 3 dias', destaque: 'Para engorda: entra direto no confinamento',
      perguntas: [ { q: 'Peso conferido em balança?', r: 'Sim, pesagem de 02/11, ticket anexado na verificação.', de: 'Comprador de Acreúna' } ] },
    { id: 'l6', cat: 'Novilha', raca: 'Nelore', sexo: 'Fêmea', qtd: 120, kg: 320, idade: '18–22 meses', porCabeca: 3350, cidade: 'Caiapônia', uf: 'GO', lat: -16.99, lng: -51.86, disp: 'Imediata', sanidade: 'Brucelose vacinada (B19) · aftosa em dia', foto: 'boi', fotos: ['boi', 'pasto', 'curral'], corretor: 'c3', produtor: 'p3', porta: 'corretor', verificado: true, publicado: 'há 4 dias', destaque: 'Novilhas para reposição de matrizes',
      perguntas: [] },
    { id: 'l7', cat: 'Boi gordo', raca: 'Cruzado (Nelore × Angus)', sexo: 'Macho', qtd: 180, arrobas: 20.5, idade: '24–30 meses', porArroba: 322, cidade: 'Quirinópolis', uf: 'GO', lat: -18.41, lng: -50.5, disp: 'A partir de 28/11', sanidade: 'Aftosa em dia · GTA pronta', foto: 'curral', fotos: ['curral', 'lote1', 'pasto'], corretor: 'c4', produtor: 'p2', porta: 'corretor', verificado: true, publicado: 'há 6 dias', destaque: 'Cruzado com bom acabamento de gordura',
      perguntas: [] },
    { id: 'l8', cat: 'Bezerro', raca: 'Cruzado (Nelore × Angus)', sexo: 'Macho', qtd: 95, kg: 230, idade: '8–10 meses', porCabeca: 2980, cidade: 'Paraúna', uf: 'GO', lat: -16.98, lng: -50.5, disp: 'Imediata', sanidade: 'Vacinas em dia', foto: 'bezerros', fotos: ['bezerros', 'lote1', 'pasto'], corretor: null, produtor: 'p1', porta: 'aberta', verificado: true, publicado: 'há 3 h', destaque: 'Lote aberto: esperando corretor da região',
      perguntas: [] },
    { id: 'l9', cat: 'Boi gordo', raca: 'Nelore', sexo: 'Macho', qtd: 450, arrobas: 18.8, idade: '30–36 meses', porArroba: 309, cidade: 'Chapadão do Céu', uf: 'GO', lat: -18.35, lng: -52.6, disp: 'A partir de 05/12', sanidade: 'Aftosa e brucelose em dia', foto: 'hero', fotos: ['hero', 'lote2', 'pasto'], corretor: 'c3', produtor: 'p3', porta: 'corretor', verificado: true, publicado: 'há 1 semana', destaque: 'Lote grande, pode ser dividido em 2 cargas',
      perguntas: [] },
    { id: 'l10', cat: 'Vaca gorda', raca: 'Nelore', sexo: 'Fêmea', qtd: 75, arrobas: 15, idade: '5–8 anos', porArroba: 294, cidade: 'Acreúna', uf: 'GO', lat: -17.35, lng: -50.42, disp: 'Imediata', sanidade: 'Aftosa em dia · GTA pronta', foto: 'lote3', fotos: ['lote3', 'pasto', 'curral'], corretor: null, produtor: 'p3', porta: 'aberta', verificado: false, publicado: 'há 20 min', destaque: 'Em análise pela equipe: vídeo recebido',
      perguntas: [] }
  ],

  // etapas: proposta → visita → fechamento → frete → entrega → nota → concluido
  negocios: [
    { id: 'n1', lote: 'l1', comprador: 'b1', corretorComprador: 'c2', etapa: 'visita', qtd: 320, precoUnit: 310, quando: 'Visita hoje, 14h', prazo: 'À vista', visitaPaga: true },
    { id: 'n2', lote: 'l5', comprador: 'b2', corretorComprador: null, etapa: 'fechamento', qtd: 260, precoUnit: 316, quando: 'Contrato para assinar', prazo: '15 dias', visitaPaga: true },
    { id: 'n3', lote: 'l3', comprador: 'b1', corretorComprador: 'c1', etapa: 'entrega', qtd: 210, precoUnit: 2600, quando: 'Gado a caminho', prazo: 'À vista', visitaPaga: true }
  ],

  conversas: {
    n1: [
      { de: 'b1', t: 'Bom dia. O lote ainda está disponível para o dia 18?', h: '08:12' },
      { de: 'c1', t: 'Bom dia, Marcelo. Está sim. Posso te mostrar hoje às 14h na Boa Vista.', h: '08:20' },
      { tipo: 'proposta', valor: 310, unid: '@', prazo: 'À vista', sinal: '5%', h: '08:31' },
      { de: 'c1', t: 'O José aceitou R$ 310/@ à vista. Agendei a visita pelo app.', h: '09:02' },
      { tipo: 'sistema', t: 'Visita paga e agendada para hoje, 14h. Endereço e contatos liberados.', h: '09:05' }
    ],
    n2: [
      { de: 'b2', t: 'Fiquei satisfeito com o lote na visita.', h: 'ontem' },
      { tipo: 'proposta', valor: 316, unid: '@', prazo: '15 dias', sinal: '5%', h: 'ontem' },
      { tipo: 'sistema', t: 'As duas partes responderam "fechou". Contrato gerado.', h: 'ontem' }
    ],
    n3: [
      { de: 'c1', t: 'O frete da Transboi sai amanhã às 5h.', h: 'seg' },
      { tipo: 'sistema', t: 'Gado embarcado: 210 cabeças. Aguardando confirmação de entrega.', h: '06:40' }
    ]
  },

  emBreve: [
    { ic: 'split', t: 'Pagamento com split', d: 'O comprador paga no app; o dinheiro já sai dividido entre vendedor, corretores e plataforma. Fim do "corretor só recebe quando o vendedor recebe".', fase: 'Fase 2' },
    { ic: 'banknote', t: 'Antecipação da comissão', d: 'O corretor recebe a comissão na hora do fechamento, sem esperar o pagamento do gado. Com parceiro regulado.', fase: 'Fase 3' },
    { ic: 'landmark', t: 'Crédito para o comprador', d: 'Compra a prazo com risco coberto por parceiro financeiro, usando o histórico do app como garantia de reputação.', fase: 'Fase 3' },
    { ic: 'sparkles', t: 'IA que sugere lotes', d: 'Aprende o que cada comprador costuma fechar e avisa quando entra um lote parecido.', fase: 'Fase 2' },
    { ic: 'trending-up', t: 'Índice de preço regional', d: 'Preço real fechado por categoria e região, com base nos negócios do app. Útil para corretor, banco e frigorífico.', fase: 'Fase 3' },
    { ic: 'shield-check', t: 'Seguro de transporte integrado', d: 'Cotação de seguro junto com o frete, contratada em 1 toque.', fase: 'Fase 2' }
  ]
};
