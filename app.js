/* Arrem@ta Bov v1 — protótipo navegável. Telas por rota (#/...). Dados de exemplo em dados.js */
(function () {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const app = $('#app');
  const R = AB.regras;
  const I = (n, c = '') => `<i data-lucide="${n}" class="ico ${c}"></i>`;
  const img = n => `img/${n}.jpg`;

  // ---------- estado (fica no aparelho) ----------
  const CH = 'ab1_';
  const guarda = {
    get(k, d) { try { const v = JSON.parse(localStorage.getItem(CH + k)); return v ?? d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem(CH + k, JSON.stringify(v)); } catch {} },
    limpa() { try { Object.keys(localStorage).filter(k => k.startsWith(CH)).forEach(k => localStorage.removeItem(k)); } catch {} }
  };
  const S = guarda.get('estado', null) || novoEstado();
  function novoEstado() {
    return { papel: null, cadastrado: false, etapas: {}, pagas: {}, perguntas: {}, msgs: {}, novos: [], negNovos: [], aceitos: {}, escolhido: {}, buscas: ['Boi gordo · 200 km de Rio Verde'], notas: {}, cotas: {} };
  }
  const salva = () => guarda.set('estado', S);

  // ---------- quem sou eu ----------
  const EU = { corretor: 'c1', produtor: 'p1', comprador: 'b1' };
  const meuId = () => EU[S.papel] || 'c1';
  const pessoa = id => AB.corretores.find(p => p.id === id) || AB.produtores.find(p => p.id === id) || AB.compradores.find(p => p.id === id);
  const eu = () => pessoa(meuId());
  const primeiro = n => n.split(' ')[0];

  // ---------- lotes e negócios ----------
  const lotes = () => [...S.novos, ...AB.lotes];
  const L = id => lotes().find(l => l.id === id);
  const corretorDe = l => l.corretor || S.escolhido[l.id] || null;
  const negocios = () => [...S.negNovos, ...AB.negocios];
  const N = id => negocios().find(n => n.id === id);
  const ETAPAS = ['proposta', 'visita', 'fechamento', 'frete', 'entrega', 'concluido'];
  const etapa = n => S.etapas[n.id] || n.etapa;
  const avanca = (n, para) => { S.etapas[n.id] = para; salva(); };
  const visitaPaga = n => S.pagas[n.id + 'v'] ?? n.visitaPaga;
  const meusNegocios = () => negocios().filter(n => {
    const l = L(n.lote), id = meuId();
    return corretorDe(l) === id || n.corretorComprador === id || l.produtor === id || n.comprador === id;
  });

  // ---------- contas ----------
  const valorLote = l => l.porArroba ? l.qtd * l.arrobas * l.porArroba : l.qtd * l.porCabeca;
  const valorNeg = n => { const l = L(n.lote); return l.porArroba ? n.qtd * l.arrobas * n.precoUnit : n.qtd * n.precoUnit; };
  const comissaoDe = (n, cid) => {
    const l = L(n.lote), v = valorNeg(n);
    return (corretorDe(l) === cid ? v * R.corretagemLado : 0) + ((n.corretorComprador || corretorDe(l)) === cid ? v * R.corretagemLado : 0);
  };
  const reais = v => 'R$ ' + Math.round(v).toLocaleString('pt-BR');
  const curto = v => v >= 1e6 ? 'R$ ' + (v / 1e6).toLocaleString('pt-BR', { maximumFractionDigits: 2 }) + ' mi' : v >= 1e4 ? 'R$ ' + Math.round(v / 1e3).toLocaleString('pt-BR') + ' mil' : reais(v);
  const precoTxt = (l, p) => l.porArroba ? `R$ ${(p ?? l.porArroba).toLocaleString('pt-BR')}/@` : `R$ ${(p ?? l.porCabeca).toLocaleString('pt-BR')}/cab.`;
  const pesoTxt = l => l.arrobas ? `${l.arrobas.toLocaleString('pt-BR')} @ em média` : `${l.kg} kg em média`;
  const nomeLote = l => `${l.cat} ${l.raca.startsWith('Cruzado') ? 'cruzado' : l.raca.toLowerCase()}`;

  // ---------- peças ----------
  function toast(msg, ic = 'circle-check') {
    $$('.toast').forEach(t => t.remove());
    const t = document.createElement('div'); t.className = 'toast'; t.innerHTML = I(ic) + `<span>${msg}</span>`;
    $('.aparelho').appendChild(t); lucide.createIcons(); setTimeout(() => t.remove(), 3200);
  }
  function folha(html) {
    $$('.folha').forEach(f => f.remove());
    const f = document.createElement('div'); f.className = 'folha';
    f.innerHTML = `<div><div class="grab"></div>${html}</div>`;
    f.addEventListener('click', e => { if (e.target === f || e.target.closest('[data-fecha]')) f.remove(); });
    $('.aparelho').appendChild(f); lucide.createIcons(); return f;
  }
  const faixa = f => `<span class="faixa ${f}">${I('award')}${f}</span>`;
  const av = (p, peq) => `<div class="av ${peq ? 'peq' : ''}">${p.ini}${peq ? '' : `<span class="ok">${I('check')}</span>`}</div>`;
  const tab = atual => {
    const pend = meusNegocios().filter(n => etapa(n) !== 'concluido').length;
    return `<nav class="tab ${atual === 'inicio' ? 'escura' : ''}">
    <a href="#/" class="${atual.startsWith('inicio') ? 'on' : ''}">${I('house')}Início</a>
    <a href="#/lotes" class="${atual === 'lotes' ? 'on' : ''}">${I('search')}Lotes</a>
    <a href="#/negocios" class="${atual === 'negocios' ? 'on' : ''}">${I('handshake')}Negócios${pend ? `<span class="bolha">${pend}</span>` : ''}</a>
    <a href="#/conversas" class="${atual === 'conversas' ? 'on' : ''}">${I('message-circle')}Conversas</a>
    <a href="#/eu" class="${atual === 'eu' ? 'on' : ''}">${I('user')}Eu</a></nav>`;
  };
  const topo = (titulo, volta = 'javascript:history.back()', extra = '', cls = '') =>
    `<div class="topo ${cls}"><a class="vol" href="${volta}" aria-label="Voltar">${I('arrow-left')}</a><h2>${titulo}</h2>${extra}</div>`;
  const selos = l => {
    const s = [];
    if (!l.verificado) s.push(`<span class="selo analise">${I('hourglass')}Em análise</span>`);
    else s.push(`<span class="selo">${I('badge-check')}Verificado</span>`);
    if (l.porta === 'aberta' && !corretorDe(l)) s.push(`<span class="selo aberto">${I('door-open')}Lote aberto</span>`);
    if (S.papel === 'corretor' && corretorDe(l) === meuId()) s.push(`<span class="selo prot">${I('lock')}Sua carteira</span>`);
    return s.join('');
  };
  const card = l => `<a class="card" href="#/l/${l.id}" style="background-image:url(${img(l.foto)})">
    <div class="selos">${selos(l)}</div>
    <div class="inf"><small>${l.cidade}-${l.uf} · ${l.qtd} cab.</small><strong>${nomeLote(l)}</strong><small class="preco">${precoTxt(l)} · ${pesoTxt(l)}</small></div></a>`;
  const item = l => `<a class="item" href="#/l/${l.id}"><div class="ft" style="background-image:url(${img(l.foto)})">${!l.verificado ? '<span class="selo analise">Em análise</span>' : l.porta === 'aberta' && !corretorDe(l) ? '<span class="selo aberto">Lote aberto</span>' : '<span class="selo">Verificado</span>'}</div>
    <div class="tx"><small>${l.cidade}-${l.uf} · ${l.publicado}</small><span class="nm">${l.qtd} cab. · ${nomeLote(l)}</span><small>${pesoTxt(l)} · ${l.idade}</small><strong>${precoTxt(l)}</strong><small>Lote: ${curto(valorLote(l))}</small></div></a>`;
  const linhaNeg = n => {
    const l = L(n.lote), id = meuId(), com = comissaoDe(n, id);
    const txt = { proposta: 'Proposta enviada', visita: visitaPaga(n) ? (n.quando || 'Visita agendada') : 'Agendar visita', fechamento: 'Contrato para assinar', frete: 'Contratar frete', entrega: 'Gado a caminho', concluido: 'Negócio concluído' }[etapa(n)];
    return `<a class="lin" href="#/n/${n.id}"><div class="ph" style="background-image:url(${img(l.foto)})"></div>
      <div class="tx"><strong>${l.cat} · ${n.qtd}</strong><small>${txt}</small></div>
      ${S.papel === 'corretor' && com ? `<div class="r"><b>${reais(com)}</b><em>sua comissão</em></div>` : `<div class="r"><b>${curto(valorNeg(n))}</b><em>${etapa(n) === 'concluido' ? 'fechado' : 'em negociação'}</em></div>`}</a>`;
  };

  // ---------- TELAS ----------
  const T = {};

  // abertura: escolha do papel
  T.entrar = () => `<div class="tela sem-tab fade" style="padding:0"><div class="boas">
    <div class="lg"><img src="img/logo-completo-branco.svg" alt="Arrem@ta Bov"></div>
    <div class="mid"><h1>Como você vai usar o app?</h1><p>Dá para trocar depois. Cada um vê o app do seu jeito.</p>
      <a class="papel" href="#/cadastro/corretor"><span class="ic">${I('briefcase')}</span><div><strong>Sou corretor</strong><small>Anuncio lotes dos meus clientes e atendo lotes abertos</small></div>${I('chevron-right', 'seta')}</a>
      <a class="papel" href="#/cadastro/produtor"><span class="ic">${I('wheat')}</span><div><strong>Sou produtor</strong><small>Quero vender ou comprar gado com corretor de confiança</small></div>${I('chevron-right', 'seta')}</a>
      <a class="papel" href="#/cadastro/comprador"><span class="ic">${I('shopping-bag')}</span><div><strong>Sou comprador</strong><small>Confinamento, recria, frigorífico: procuro lotes</small></div>${I('chevron-right', 'seta')}</a>
    </div></div></div>`;

  let cad = { passo: 1 };
  T.cadastro = papel => {
    const ex = { corretor: { nome: 'Carlos Mendes', doc: '123.456.789-00', regiao: 'Rio Verde-GO e 200 km' }, produtor: { nome: 'José Antônio Prado', doc: '12.345.678/0001-90', regiao: 'Fazenda Boa Vista · Rio Verde-GO' }, comprador: { nome: 'Marcelo Tavares', doc: '98.765.432/0001-10', regiao: 'Confinamento Rio Claro · Santa Helena-GO' } }[papel];
    const nomePapel = { corretor: 'corretor', produtor: 'produtor', comprador: 'comprador' }[papel];
    if (cad.passo === 3) return `<div class="tela sem-tab fade"><div class="verif" id="verif"><div class="roda"></div><h2>Verificando seu perfil</h2><p>Isso leva poucos segundos.</p></div></div>`;
    const passos = `<div class="passos"><i class="on"></i><i class="${cad.passo >= 2 ? 'on' : ''}"></i><i></i></div>`;
    const corpo = cad.passo === 1 ? `
      <div class="h-tela"><h1>Seus dados</h1><p>Perfil verificado é o que dá confiança entre quem não se conhece.</p></div>
      <div class="pad" style="margin-top:16px">
        <label class="campo"><span>Nome completo</span><input value="${ex.nome}"></label>
        <label class="campo"><span>${papel === 'corretor' ? 'CPF' : 'CPF ou CNPJ'}</span><input value="${ex.doc}" inputmode="numeric"></label>
        <label class="campo"><span>Celular</span><input value="(64) 9 9xxx-xxxx" inputmode="tel"><small>Enviamos um código por SMS para confirmar.</small></label>
        ${papel === 'produtor' ? `<label class="campo"><span>Inscrição estadual de produtor (se tiver)</span><input placeholder="Opcional"></label>` : ''}
      </div>` : `
      <div class="h-tela"><h1>${papel === 'corretor' ? 'Onde você atua' : papel === 'produtor' ? 'Sua fazenda' : 'O que você procura'}</h1><p>${papel === 'corretor' ? 'Os lotes abertos da sua região chegam primeiro para você.' : papel === 'produtor' ? 'Usamos para mostrar seus lotes a compradores da região.' : 'Avisamos quando entrar lote com o seu perfil.'}</p></div>
      <div class="pad" style="margin-top:16px">
        <label class="campo"><span>${papel === 'corretor' ? 'Cidade-base e raio' : papel === 'produtor' ? 'Fazenda e cidade' : 'Empresa e cidade'}</span><input value="${ex.regiao}"></label>
        <div class="campo"><span>${papel === 'corretor' ? 'Tipo de gado que você atende' : papel === 'produtor' ? 'O que você costuma vender' : 'O que você costuma comprar'}</span>
          <div class="opcoes" data-multi>${['Boi gordo', 'Boi magro', 'Garrote', 'Bezerro', 'Novilha', 'Vaca de cria', 'Vaca gorda'].map((c, i) => `<button class="${i < 3 ? 'on' : ''}">${c}</button>`).join('')}</div></div>
        ${papel === 'corretor' ? `<div class="info">${I('lock')}<div>Os produtores que você cadastrar ficam <b>protegidos na sua carteira</b>. Nenhum outro corretor vê o contato deles.</div></div>` : ''}
        ${papel === 'produtor' ? `<label class="campo"><span>Já tem corretor de confiança?</span><select><option>Sim: Carlos Mendes (Rio Verde)</option><option>Não, quero receber corretores da região</option></select></label>` : ''}
      </div>`;
    return `<div class="tela sem-tab fade">${topo(`Cadastro de ${nomePapel}`, cad.passo === 1 ? '#/entrar' : 'javascript:void(0)" data-cad-volta="1')}${passos}${corpo}
      <div class="barra-baixo"><button class="btn bloco" data-cad="${papel}">${cad.passo === 1 ? 'Continuar' : 'Verificar meu perfil'}</button></div></div>`;
  };

  // início (opção A · Pasto)
  T.inicio = () => {
    const p = eu(), papel = S.papel;
    const novos = lotes().filter(l => l.verificado && !(papel === 'produtor' && l.produtor === meuId())).slice(0, 6);
    const neg = meusNegocios().filter(n => etapa(n) !== 'concluido');
    const abertos = lotes().filter(l => l.porta === 'aberta' && !corretorDe(l) && l.verificado);
    const meusLotes = papel === 'produtor' ? lotes().filter(l => l.produtor === meuId()) : lotes().filter(l => corretorDe(l) === meuId());
    const atal = {
      corretor: [['#/meus-lotes', 'lock', 'Minha carteira', `${meusLotes.length} lotes protegidos`], ['#/abertos', 'door-open', 'Lotes abertos', `${abertos.length} na sua região`, abertos.filter(l => !S.aceitos[l.id]).length], ['#/negocios', 'handshake', 'Negócios', `${neg.length} em andamento`], ['#/novo', 'circle-plus', 'Novo lote', 'Anunciar para um cliente']],
      produtor: [['#/meus-lotes', 'layers', 'Meus lotes', `${meusLotes.length} anunciados`], ['#/novo', 'circle-plus', 'Novo lote', 'Vídeo + ficha padrão'], ['#/negocios', 'handshake', 'Negócios', `${neg.length} em andamento`], ['#/escolher/l8', 'users', 'Corretores', 'Escolher para lote aberto', S.escolhido.l8 ? 0 : 3]],
      comprador: [['#/lotes', 'search', 'Buscar lotes', `${lotes().filter(l => l.verificado).length} verificados`], ['#/buscas', 'bell-ring', 'Buscas salvas', `${S.buscas.length} com alerta`], ['#/negocios', 'handshake', 'Negócios', `${neg.length} em andamento`], ['#/negocios', 'truck', 'Frete', 'Cotação pelo app']]
    }[papel];
    return `<div class="tela escura fade">
    <section class="hero"><div class="hd"><img src="img/logo-completo-branco.svg" alt="Arrem@ta Bov"><button aria-label="Avisos" data-acao="avisos">${I('bell')}<span class="dot"></span></button></div>
      <div class="ttl"><small>Bom dia, ${primeiro(p.nome === 'Agropecuária Santa Rita' ? 'Santa Rita' : p.nome)}</small><h1>Lote bom<br>aparece aqui.<br><span>Arremate.</span></h1></div>
      <form class="busca" data-busca>${I('search')}<input name="q" placeholder="Boi gordo, 30+ cabeças…" aria-label="Buscar lotes"><button class="go">Buscar</button></form></section>
    <div class="inicio">
      <div class="chips">${['Perto de mim', 'Boi gordo', 'Boi magro', 'Garrote', 'Bezerro', 'Novilha', 'Vaca de cria'].map((c, i) => `<a class="chip ${i === 0 ? 'on' : ''}" href="#/lotes?cat=${i ? encodeURIComponent(c) : ''}">${c}</a>`).join('')}</div>
      <div class="sec"><h3>Lotes novos na região</h3><a href="#/lotes">Ver todos</a></div>
      <div class="trilho">${novos.map(card).join('')}</div>
      <div class="sec"><h3>Seu dia</h3></div>
      <div class="atal">${atal.map(a => `<a href="${a[0]}">${I(a[1])}${a[2]}<small>${a[3]}</small>${a[4] ? `<span class="n">${a[4]}</span>` : ''}</a>`).join('')}</div>
      ${papel === 'corretor' && abertos.some(l => !S.aceitos[l.id]) ? `<a class="faixa-aviso" href="#/abertos"><span class="ic">${I('door-open')}</span><div><strong>${abertos.filter(l => !S.aceitos[l.id]).length} lotes sem corretor perto de você</strong><small>Produtores que entraram sozinhos. Aceite e concorra.</small></div></a>` : ''}
      ${neg.length ? `<div class="sec"><h3>Negócios em andamento</h3><a href="#/negocios">Ver todos</a></div><div class="pad"><div class="caixa">${neg.slice(0, 3).map(linhaNeg).join('')}</div></div>` : ''}
      <a class="faixa-aviso" href="#/breve"><span class="ic">${I('sparkles')}</span><div><strong>Em breve no app</strong><small>Receber a comissão na hora, pagamento com split, IA que sugere lotes.</small></div></a>
    </div>${tab('inicio')}</div>`;
  };

  // descobrir lotes
  const filtro = { cat: '', texto: '', qtdMin: 0, vista: 'lista', raio: 0 };
  T.lotes = q => {
    if (q.cat !== undefined) filtro.cat = q.cat; if (q.q !== undefined) filtro.texto = q.q;
    const t = filtro.texto.toLowerCase();
    const lista = lotes().filter(l => (l.verificado || l.produtor === meuId()) && (!filtro.cat || l.cat === filtro.cat) && l.qtd >= filtro.qtdMin &&
      (!t || `${l.cat} ${l.raca} ${l.cidade}`.toLowerCase().split(/\s+/).some(w => t.split(/\s+/).some(x => x.length > 2 && w.startsWith(x.slice(0, 4))))));
    return `<div class="tela fade">${topo('Lotes', '#/', `<button class="vol" data-acao="filtros" aria-label="Filtros">${I('sliders-horizontal')}</button>`)}
      <div class="pad" style="margin-bottom:12px"><form data-busca style="display:flex;gap:8px"><label class="campo" style="flex:1;margin:0"><input name="q" value="${filtro.texto}" placeholder="Categoria, raça ou cidade" aria-label="Buscar"></label><button class="btn" style="min-height:48px;padding:0 16px" aria-label="Buscar">${I('search')}</button></form></div>
      <div class="chips" style="margin-bottom:12px">${['', 'Boi gordo', 'Boi magro', 'Garrote', 'Bezerro', 'Novilha', 'Vaca de cria', 'Vaca gorda'].map(c => `<a class="chip ${filtro.cat === c ? 'on' : ''}" href="#/lotes?cat=${encodeURIComponent(c)}">${c || 'Todos'}</a>`).join('')}</div>
      <div class="pad" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px"><b>${lista.length} ${lista.length === 1 ? 'lote' : 'lotes'}${filtro.qtdMin ? ` · ${filtro.qtdMin}+ cab.` : ''}</b>
        <div class="seg" style="width:150px"><button data-vista="lista" class="${filtro.vista === 'lista' ? 'on' : ''}">Lista</button><button data-vista="mapa" class="${filtro.vista === 'mapa' ? 'on' : ''}">Mapa</button></div></div>
      ${filtro.vista === 'mapa' ? `<div class="vista-mapa"><div id="mapa" class="mapa" style="height:100%"></div></div>` : lista.length ? lista.map(item).join('') : `<div class="vazio">${I('search-x')}Nenhum lote com esse filtro ainda.<br>Salve a busca e avisamos quando entrar.</div>`}
      <div class="pad" style="margin-top:14px"><button class="btn claro bloco" data-acao="salvar-busca">${I('bell-ring')}Salvar busca e me avisar</button></div>
      ${tab('lotes')}</div>`;
  };

  // anúncio
  T.lote = id => {
    const l = L(id); if (!l) return T.naoachou();
    const c = corretorDe(l) ? pessoa(corretorDe(l)) : null, pr = pessoa(l.produtor);
    const meu = (S.papel === 'corretor' && corretorDe(l) === meuId()) || (S.papel === 'produtor' && l.produtor === meuId());
    const perguntas = [...(S.perguntas[id] || []), ...l.perguntas];
    const negDoLote = meusNegocios().find(n => n.lote === id && etapa(n) !== 'concluido');
    let barra;
    if (!l.verificado) barra = `<div class="info ouro" style="margin:0;flex:1">${I('hourglass')}<div>A equipe está conferindo o vídeo e a ficha. Publica em até 24 h.</div></div>`;
    else if (meu) barra = `<a class="btn claro" href="${l.porta === 'aberta' && !corretorDe(l) ? '#/escolher/' + id : '#/meus-lotes'}">${I(l.porta === 'aberta' && !corretorDe(l) ? 'users' : 'layers')}${l.porta === 'aberta' && !corretorDe(l) ? 'Escolher corretor' : 'Meus lotes'}</a><button class="btn" data-acao="compartilhar">${I('share-2')}Divulgar</button>`;
    else if (S.papel === 'corretor' && l.porta === 'aberta' && !corretorDe(l)) barra = `<button class="btn ${S.aceitos[id] ? 'claro' : ''}" data-aceitar="${id}" ${S.aceitos[id] ? 'disabled' : ''}>${I(S.aceitos[id] ? 'check' : 'hand')}${S.aceitos[id] ? 'Você está na lista' : 'Quero atender este lote'}</button>`;
    else if (l.porta === 'aberta' && !corretorDe(l)) barra = `<button class="btn bloco" data-acao="seguir">${I('bell-ring')}Seguir lote: aviso quando tiver corretor</button>`;
    else if (negDoLote) barra = `<a class="btn bloco" href="#/n/${negDoLote.id}">${I('handshake')}Ver meu negócio deste lote</a>`;
    else barra = `<a class="btn claro" href="#/proposta/${id}">${I('message-square-text')}Fazer proposta</a><button class="btn ouro" data-arrematar="${id}">Arrematar</button>`;
    return `<div class="tela sem-tab fade">
      <div class="galeria" id="gal"><div class="kb" style="background-image:url(${img(l.foto)})"></div>
        <div class="bts"><a href="javascript:history.back()" aria-label="Voltar">${I('arrow-left')}</a><button data-acao="compartilhar" aria-label="Compartilhar">${I('share-2')}</button></div>
        <button class="play" data-acao="video"><span class="c">${I('play')}</span>Ver vídeo do lote</button>
        <div class="leg">${selos(l)}</div><div class="prog"><i></i></div></div>
      <div class="anuncio">
        <span class="ex-tag">Lote de exemplo · publicado ${l.publicado}</span>
        <h1 style="margin-top:4px">${l.qtd} cab. · ${nomeLote(l)}</h1>
        <div class="onde">${I('map-pin')}${l.cidade}-${l.uf} · ${l.disp}</div>
        <div class="valor"><div><small>Preço pedido</small><strong>${precoTxt(l)}</strong></div><div class="r"><small>Lote inteiro (estimado)</small><strong>${curto(valorLote(l))}</strong></div></div>
        <div class="ficha">
          <div><small>Categoria</small><b>${l.cat}</b></div><div><small>Quantidade</small><b>${l.qtd} cabeças</b></div>
          <div><small>Peso</small><b>${pesoTxt(l)}</b></div><div><small>Idade</small><b>${l.idade}</b></div>
          <div><small>Raça</small><b>${l.raca}</b></div><div><small>Sexo</small><b>${l.sexo}</b></div>
          <div class="w"><small>Sanidade</small><b>${l.sanidade}</b></div>
          <div class="w"><small>Observação do vendedor</small><b>${l.destaque}</b></div>
        </div>
        ${l.verificado ? `<div class="info" style="margin-top:14px">${I('shield-check')}<div><b>Verificado pela equipe:</b> vídeo gravado na fazenda, quantidade e peso conferidos com a ficha e documentos sanitários.</div></div>` : ''}
        <div class="sec" style="margin:22px 0 10px"><h3>Quem negocia</h3></div>
        ${c ? `<div class="pessoa">${av(c)}<div class="tx"><strong>${c.nome} ${faixa(c.faixa)}</strong><small>Corretor de registro · ${c.negocios} negócios no app · responde em ${c.resposta}</small></div></div>`
            : `<div class="pessoa"><div class="av" style="background:var(--ouro);color:var(--pasto-e)">${I('door-open')}</div><div class="tx"><strong>Escolhendo corretor</strong><small>Lote aberto: ${Object.keys(S.aceitos).includes(id) ? 4 : 3} corretores da região já pediram para atender.</small></div></div>`}
        <div class="pessoa">${av(pr)}<div class="tx"><strong>${pr.faz} ${faixa(pr.faixa)}</strong><small>Vendedor · ${pr.negocios} negócios · nota ${pr.nota.toLocaleString('pt-BR')}</small></div></div>
        <p class="mut" style="font-size:13px;margin:4px 2px 0">${I('lock', '')} Telefone e endereço da fazenda são liberados quando a visita é agendada pelo app.</p>
        <div class="sec" style="margin:24px 0 4px"><h3>Perguntas (${perguntas.length})</h3></div>
        <div>${perguntas.length ? perguntas.map(p => `<div class="pr"><div class="q">${I('message-circle-question')}${p.q}</div>${p.r ? `<div class="a">${p.r}</div>` : `<div class="a">Aguardando resposta do corretor…</div>`}<small>${p.de}</small></div>`).join('') : `<p class="mut" style="padding:10px 0">Ninguém perguntou ainda. As respostas ficam visíveis para todos.</p>`}</div>
        ${!meu ? `<form class="perguntar" data-perguntar="${id}"><input name="q" placeholder="Pergunte sobre o lote" aria-label="Pergunta"><button class="btn peq" style="min-height:46px">Enviar</button></form>` : ''}
        <div style="height:18px"></div>
      </div>
      <div class="barra-baixo">${barra}</div></div>`;
  };

  // proposta
  T.proposta = id => {
    const l = L(id);
    return `<div class="tela sem-tab fade">${topo('Fazer proposta')}
      <div class="pad">
        <div class="pessoa" style="margin-bottom:16px"><div class="av" style="border-radius:14px;background:url(${img(l.foto)}) center/cover"></div><div class="tx"><strong>${l.qtd} cab. · ${nomeLote(l)}</strong><small>Pedido: ${precoTxt(l)} · ${l.cidade}-${l.uf}</small></div></div>
        <form data-proposta="${id}">
          <div class="duas"><label class="campo"><span>Seu preço (${l.porArroba ? 'R$/@' : 'R$/cabeça'})</span><input name="preco" inputmode="numeric" value="${l.porArroba ? l.porArroba - 4 : l.porCabeca - 80}"></label>
          <label class="campo"><span>Quantidade</span><input name="qtd" inputmode="numeric" value="${l.qtd}"></label></div>
          <div class="campo"><span>Pagamento</span><div class="opcoes" data-um="prazo"><button type="button" class="on">À vista</button><button type="button">15 dias</button><button type="button">30 dias</button></div></div>
          <div class="info">${I('shield-check')}<div>No fechamento, o comprador paga <b>sinal de ${R.sinal * 100}% pelo app</b>. O resto vai direto ao vendedor no prazo combinado.</div></div>
          <label class="campo"><span>Mensagem ao corretor (opcional)</span><textarea name="msg" rows="3" placeholder="Ex.: posso buscar a partir do dia 20"></textarea><small>Telefone e link não passam: a conversa fica no app.</small></label>
          <button class="btn bloco">Enviar proposta</button>
        </form></div></div>`;
  };

  // linha do tempo do negócio
  T.negocio = id => {
    const n = N(id); if (!n) return T.naoachou();
    const l = L(n.lote), e = ETAPAS.indexOf(etapa(n)), v = valorNeg(n), comp = pessoa(n.comprador), vend = pessoa(l.produtor), c = pessoa(corretorDe(l));
    const st = i => i < e ? 'ok' : i === e ? 'agora' : '';
    const passo = (i, ic, t, d, link, rotulo) => `<div class="et ${st(i)}"><div class="b">${I(i < e ? 'check' : ic)}</div><div class="tx"><strong>${t}</strong><small>${d}</small>${i === e && link ? `<a class="btn peq ${i === 0 ? 'claro' : ''}" href="${link}">${rotulo}${I('arrow-right')}</a>` : ''}</div></div>`;
    return `<div class="tela fade">${topo('Negócio', '#/negocios', `<a class="vol" href="#/chat/${id}" aria-label="Conversa">${I('message-circle')}</a>`)}
      <div class="pad">
        <a class="pessoa" href="#/l/${l.id}"><div class="av" style="border-radius:14px;background:url(${img(l.foto)}) center/cover"></div><div class="tx"><strong>${n.qtd} cab. · ${nomeLote(l)}</strong><small>${precoTxt(l, n.precoUnit)} · ${n.prazo} · ${curto(v)}</small></div>${I('chevron-right')}</a>
        ${S.papel === 'corretor' && comissaoDe(n, meuId()) ? `<div class="faixa-aviso claro" style="margin:0 0 16px"><span class="ic">${I('wallet')}</span><div><strong>Sua comissão: ${reais(comissaoDe(n, meuId()))}</strong><small>${n.corretorComprador && n.corretorComprador !== corretorDe(l) ? 'Co-corretagem registrada no app: cada corretor fica com 1% do seu lado.' : 'Você atende os dois lados: 1% + 1%.'}</small></div></div>` : ''}
        <div class="tempo">
          ${passo(0, 'message-square-text', 'Proposta', `${comp.faz || comp.nome} ofereceu ${precoTxt(l, n.precoUnit)}`, `#/chat/${id}`, 'Ver conversa')}
          ${passo(1, 'map-pin', 'Visita ao lote', visitaPaga(n) ? `${n.quando || 'Agendada'} · taxa de visita paga` : `Taxa de ${reais(R.taxaVisita)}, abatida no fechamento`, `#/visita/${id}`, visitaPaga(n) ? 'Abrir visita e check-in' : 'Agendar visita')}
          ${passo(2, 'file-signature', 'Fechamento', 'Contrato digital e sinal pelo app', `#/fechar/${id}`, 'Fechou? Responder')}
          ${passo(3, 'truck', 'Frete', 'Transportadora parceira da região', `#/frete/${id}`, 'Pedir cotação')}
          ${passo(4, 'package-check', 'Entrega e nota', 'Conferência do lote, pagamento em dia e avaliação', `#/entrega/${id}`, 'Confirmar e avaliar')}
          ${passo(5, 'trophy', 'Concluído', 'Comissão registrada e reputação atualizada', null)}
        </div>
        <div class="sec" style="margin:14px 0 10px"><h3>Partes</h3></div>
        <div class="pessoa">${av(vend, 1)}<div class="tx"><strong>${vend.faz || vend.nome}</strong><small>Vendedor ${faixa(vend.faixa)}</small></div></div>
        <div class="pessoa">${av(comp, 1)}<div class="tx"><strong>${comp.faz || comp.nome}</strong><small>Comprador ${faixa(comp.faixa)}</small></div></div>
        <div class="pessoa">${av(c, 1)}<div class="tx"><strong>${c.nome}</strong><small>Corretor do vendedor</small></div></div>
        ${n.corretorComprador && n.corretorComprador !== corretorDe(l) ? `<div class="pessoa">${av(pessoa(n.corretorComprador), 1)}<div class="tx"><strong>${pessoa(n.corretorComprador).nome}</strong><small>Corretor do comprador (co-corretagem)</small></div></div>` : ''}
      </div>${tab('negocios')}</div>`;
  };

  T.negocios = () => {
    const ms = meusNegocios(), and = ms.filter(n => etapa(n) !== 'concluido'), fim = ms.filter(n => etapa(n) === 'concluido');
    const total = S.papel === 'corretor' ? ms.reduce((s, n) => s + comissaoDe(n, meuId()), 0) : 0;
    return `<div class="tela fade">${topo('Negócios', '#/')}
      ${S.papel === 'corretor' ? `<div class="pad"><div class="valor" style="margin-top:0"><div><small>Comissão prevista em novembro</small><strong>${reais(total)}</strong></div><div class="r"><small>${ms.length} negócios</small><strong>${and.length} abertos</strong></div></div></div>` : ''}
      <div class="sec" style="margin-top:6px"><h3>Em andamento</h3></div><div class="pad"><div class="caixa">${and.length ? and.map(linhaNeg).join('') : '<p class="mut" style="padding:14px 0">Nenhum negócio aberto.</p>'}</div></div>
      ${fim.length ? `<div class="sec"><h3>Concluídos</h3></div><div class="pad"><div class="caixa">${fim.map(linhaNeg).join('')}</div></div>` : ''}
      ${tab('negocios')}</div>`;
  };

  // conversas e chat
  const msgsDe = id => [...(AB.conversas[id] || []), ...(S.msgs[id] || [])];
  T.conversas = () => {
    const ms = meusNegocios();
    return `<div class="tela fade">${topo('Conversas', '#/')}
      <div class="pad"><div class="info">${I('lock')}<div>Toda conversa fica no app: proposta, contrato e histórico juntos. Telefone e link são liberados na visita.</div></div>
      <div class="caixa">${ms.map(n => { const l = L(n.lote), m = msgsDe(n.id).slice(-1)[0] || {}; return `<a class="lin" href="#/chat/${n.id}"><div class="ph" style="background-image:url(${img(l.foto)})"></div><div class="tx"><strong>${l.cat} · ${n.qtd} cab.</strong><small style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${m.tipo === 'proposta' ? 'Proposta: ' + precoTxt(l, m.valor) : m.t || ''}</small></div><div class="r"><em>${m.h || ''}</em></div></a>`; }).join('')}</div></div>
      ${tab('conversas')}</div>`;
  };
  T.chat = id => {
    const n = N(id); if (!n) return T.naoachou();
    const l = L(n.lote), me = meuId();
    const bolha = m => {
      if (m.tipo === 'sistema') return `<div class="sis">${I('info')}${m.t}</div>`;
      if (m.tipo === 'bloq') return `<div class="sis bloq">${I('shield-alert')}${m.t}</div>`;
      if (m.tipo === 'proposta') return `<div class="prop"><small>Proposta</small><strong>${precoTxt(l, m.valor)}</strong><p>${n.qtd} cabeças · ${m.prazo} · sinal ${m.sinal} pelo app</p></div>`;
      const p = pessoa(m.de) || eu(), mine = m.de === me;
      return `<div class="bl ${mine ? 'eu' : ''}">${mine ? '' : `<span class="quem">${p.nome}</span>`}${m.t}<small>${m.h}</small></div>`;
    };
    return `<div class="tela sem-tab fade" style="display:flex;flex-direction:column">${topo(`${l.cat} · ${n.qtd} cab.`, '#/conversas', `<a class="vol" href="#/n/${id}" aria-label="Negócio">${I('list-checks')}</a>`)}
      <div class="chat" style="flex:1">${msgsDe(id).map(bolha).join('')}</div>
      <form class="escrever" data-chat="${id}"><input name="t" placeholder="Escreva uma mensagem" aria-label="Mensagem" autocomplete="off"><button aria-label="Enviar">${I('send')}</button></form></div>`;
  };

  // visita
  T.visita = id => {
    const n = N(id), l = L(n.lote), pr = pessoa(l.produtor), c = pessoa(corretorDe(l));
    if (!visitaPaga(n)) return `<div class="tela sem-tab fade">${topo('Agendar visita', `#/n/${id}`)}
      <div class="pad">
        <div class="campo"><span>Dia da visita</span><div class="opcoes" data-um="dia"><button class="on">Amanhã</button><button>Qua, 12/11</button><button>Qui, 13/11</button></div></div>
        <div class="campo"><span>Horário</span><div class="opcoes" data-um="hora"><button>8h</button><button class="on">10h</button><button>14h</button><button>16h</button></div></div>
        <div class="conta" style="margin:6px 0 14px"><div class="l"><span>Taxa de visita</span><b>${reais(R.taxaVisita)}</b></div><div class="l dest"><span>Se fechar: abatida da taxa do app</span><b>− ${reais(R.taxaVisita)}</b></div><div class="l"><span>Se o lote não for como anunciado</span><b>devolvida</b></div></div>
        <div class="info">${I('lock-open')}<div>Pagando, liberamos o <b>endereço da fazenda e os contatos</b> de todos. O corretor faz o check-in no dia.</div></div>
        <div class="pix" id="pixBox" hidden><span class="mut">Pix · taxa de visita</span><strong>${reais(R.taxaVisita)}</strong><div class="qrbox" id="qr1"></div><button class="btn claro peq" data-acao="copiar">${I('copy')}Copiar código Pix</button></div>
      </div>
      <div class="barra-baixo"><button class="btn bloco" data-pagar-visita="${id}">${I('qr-code')}Pagar com Pix</button></div></div>`;
    const feito = S.etapas[id + 'ck'];
    return `<div class="tela sem-tab fade">${topo('Visita ao lote', `#/n/${id}`)}
      <div class="pad">
        <div class="mapa-mini" style="background-image:url(${img('sede')})"><span class="alvo"></span></div>
        <div class="pessoa" style="margin-top:12px">${I('map-pin')}<div class="tx"><strong>${pr.faz}</strong><small>Rod. GO-174, km 32 · ${l.cidade}-${l.uf} (exemplo)</small></div><button class="btn peq claro" data-acao="rota">Rota</button></div>
        <div class="pessoa">${av(pr, 1)}<div class="tx"><strong>${pr.nome}</strong><small>Vendedor · (64) 9 9xxx-xx13</small></div>${I('phone')}</div>
        <div class="pessoa">${av(c, 1)}<div class="tx"><strong>${c.nome}</strong><small>Corretor · ${c.tel}</small></div>${I('phone')}</div>
        <div class="info">${I('lock-open')}<div>Contatos liberados porque a visita foi agendada e paga pelo app.</div></div>
        ${feito ? `<div class="info">${I('circle-check')}<div><b>Check-in feito às ${feito}.</b> Localização confere com a fazenda do lote.</div></div>` : ''}
      </div>
      <div class="barra-baixo">${feito ? `<a class="btn bloco" href="#/fechar/${id}">Depois da visita: fechou?</a>` : `<button class="btn claro" data-acao="qr-lote">${I('scan-line')}QR do lote</button><button class="btn" data-checkin="${id}">${I('locate-fixed')}Fazer check-in</button>`}</div></div>`;
  };

  // fechamento: fechou? → contrato → assinatura → sinal → divisão
  const fech = {};
  T.fechar = id => {
    const n = N(id), l = L(n.lote), v = valorNeg(n), f = fech[id] || (fech[id] = { passo: etapa(n) === 'fechamento' ? 0 : 3 }), comp = pessoa(n.comprador), vend = pessoa(l.produtor);
    const plat = v * R.taxaPlataformaLado * 2 - (visitaPaga(n) ? R.taxaVisita : 0), sinal = v * R.sinal;
    if (f.passo === 0) return `<div class="tela sem-tab fade">${topo('Fechamento', `#/n/${id}`)}
      <div class="h-tela" style="text-align:center;padding-top:30px"><div class="faixa-aviso claro" style="margin:0 0 20px;justify-content:center"><span class="ic">${I('handshake')}</span></div><h1>Fechou o negócio?</h1><p>O app pergunta às duas partes depois da visita. Se as duas disserem sim, o contrato sai pronto.</p></div>
      <div class="pad" style="margin-top:22px"><div class="pessoa">${av(vend, 1)}<div class="tx"><strong>${vend.faz}</strong><small>Vendedor</small></div><span class="selo soft">${I('check')}Disse sim</span></div>
      <div class="pessoa">${av(comp, 1)}<div class="tx"><strong>${comp.faz || comp.nome}</strong><small>Comprador</small></div><span class="selo analise">Aguardando</span></div></div>
      <div class="barra-baixo"><button class="btn claro" data-fech="${id}" data-v="nao">Não fechou</button><button class="btn" data-fech="${id}" data-v="sim">Sim, fechou</button></div></div>`;
    if (f.passo === 1) return `<div class="tela sem-tab fade">${topo('Contrato digital', `#/n/${id}`)}
      <div class="pad">
        <div class="contrato"><h4>Contrato de compra e venda de bovinos (modelo de exemplo)</h4>
          <p><b>Vendedor:</b> ${vend.nome}, ${vend.faz}, ${vend.cidade}-${vend.uf}.</p><p><b>Comprador:</b> ${comp.nome}, ${comp.faz}.</p>
          <h4>1. Objeto</h4><p>${n.qtd} cabeças de ${l.cat.toLowerCase()}, ${l.raca}, ${pesoTxt(l)}, idade ${l.idade}, conforme ficha e vídeo verificados no app.</p>
          <h4>2. Preço e pagamento</h4><p>${precoTxt(l, n.precoUnit)}, total estimado de ${reais(v)}. Sinal de ${R.sinal * 100}% (${reais(sinal)}) pago pelo app na assinatura; saldo ${n.prazo === 'À vista' ? 'à vista na entrega' : 'em ' + n.prazo + ' após a entrega'}, direto ao vendedor.</p>
          <h4>3. Entrega</h4><p>${l.disp}. Pesagem e conferência na saída. GTA por conta do vendedor.</p>
          <h4>4. Corretagem</h4><p>1% do vendedor e 1% do comprador, registrados no app para ${pessoa(corretorDe(l)).nome}${n.corretorComprador && n.corretorComprador !== corretorDe(l) ? ' e ' + pessoa(n.corretorComprador).nome : ''}.</p>
          <h4>5. Divergência</h4><p>Se o lote não chegar conforme o anunciado, o comprador abre disputa no app em até 48 h.</p></div>
        <div class="sec" style="margin:18px 0 10px"><h3>Assinaturas</h3></div>
        <div class="assinantes"><div class="pessoa">${av(vend, 1)}<div class="tx"><strong>${vend.nome}</strong><span class="st">${I('circle-check')}Assinou às 09:41</span></div></div>
        <div class="pessoa">${av(comp, 1)}<div class="tx"><strong>${comp.nome}</strong><span class="st pend">${I('pen-line')}Falta assinar</span></div></div></div>
        <div class="assina" id="assina"><canvas></canvas><span>Assine aqui com o dedo</span></div>
        <p class="mut" style="font-size:12px;margin-top:6px">Assinatura eletrônica com registro de data, hora e aparelho (no app real, por um serviço de assinatura certificado).</p>
      </div>
      <div class="barra-baixo"><button class="btn bloco" data-assinar="${id}">${I('pen-line')}Assinar contrato</button></div></div>`;
    if (f.passo === 2) return `<div class="tela sem-tab fade">${topo('Sinal pelo app', `#/n/${id}`)}
      <div class="pad"><div class="pix"><span class="mut">Pix · sinal de ${R.sinal * 100}%</span><strong>${reais(sinal)}</strong><div class="qrbox" id="qr2"></div><button class="btn claro peq" data-acao="copiar">${I('copy')}Copiar código Pix</button></div>
        <div class="info" style="margin-top:14px">${I('shield-check')}<div>O sinal garante o negócio e reduz o calote. A <b>taxa do app sai daqui</b>; o restante do sinal vai ao vendedor.</div></div></div>
      <div class="barra-baixo"><button class="btn bloco" data-sinal="${id}">Já paguei (simular)</button></div></div>`;
    const cv = corretorDe(l), cc = n.corretorComprador || cv;
    return `<div class="tela sem-tab fade">${topo('Negócio fechado', `#/n/${id}`)}
      <div class="verif" style="padding:24px 24px 10px"><div class="feito">${I('check')}</div><h2>Negócio fechado no app</h2><p>Contrato assinado e sinal recebido.</p></div>
      <div class="pad"><div class="sec" style="margin:8px 0 10px"><h3>Como o dinheiro se divide</h3></div>
        <div class="conta">
          <div class="l"><span>Valor do lote</span><b>${reais(v)}</b></div>
          <div class="l"><span>Sinal pago pelo app (${R.sinal * 100}%)</span><b>${reais(sinal)}</b></div>
          <div class="l"><span>Taxa do app (${(R.taxaPlataformaLado * 100).toLocaleString('pt-BR')}% por lado)${visitaPaga(n) ? ', menos a visita' : ''}</span><b>${reais(plat)}</b></div>
          <div class="l"><span>Resto do sinal → vendedor</span><b>${reais(sinal - plat)}</b></div>
          <div class="l dest"><span>Corretagem lado vendedor (1%) · ${pessoa(cv).nome}</span><b>${reais(v * R.corretagemLado)}</b></div>
          <div class="l dest"><span>Corretagem lado comprador (1%) · ${pessoa(cc).nome}</span><b>${reais(v * R.corretagemLado)}</b></div>
          <div class="l tot"><span>Saldo ao vendedor (${n.prazo})</span><b>${reais(v - sinal)}</b></div>
        </div>
        <p class="mut" style="font-size:12px;margin-top:8px">A comissão do corretor não é tocada: a taxa do app é separada. Valores e percentuais de exemplo, a validar.</p></div>
      <div class="barra-baixo"><a class="btn bloco" href="#/frete/${id}">${I('truck')}Contratar frete</a></div></div>`;
  };

  // frete
  T.frete = id => {
    const n = N(id), l = L(n.lote), comp = pessoa(n.comprador), ct = S.cotas[id];
    if (ETAPAS.indexOf(etapa(n)) > 3) return `<div class="tela sem-tab fade">${topo('Frete', `#/n/${id}`)}<div class="verif"><div class="feito">${I('truck')}</div><h2>Frete contratado</h2><p>${AB.transportadoras.find(x => x.id === (ct?.t || 't1')).nome} leva o lote. Embarque combinado com o vendedor.</p></div><div class="barra-baixo"><a class="btn bloco" href="#/entrega/${id}">Ir para entrega e nota</a></div></div>`;
    const cot = [{ t: 't1', v: Math.round(n.qtd / 38) * 4200, c: Math.ceil(n.qtd / 38), prazo: 'Embarque em 2 dias' }, { t: 't2', v: Math.round(n.qtd / 30) * 3500, c: Math.ceil(n.qtd / 30), prazo: 'Embarque em 3 dias' }];
    return `<div class="tela sem-tab fade">${topo('Frete', `#/n/${id}`)}
      <div class="pad"><div class="ficha" style="margin-bottom:14px"><div><small>Origem</small><b>${l.cidade}-${l.uf}</b></div><div><small>Destino</small><b>${comp.cidade}-${comp.uf}</b></div><div><small>Animais</small><b>${n.qtd} · ${l.cat}</b></div><div><small>Peso</small><b>${pesoTxt(l)}</b></div></div>
      <div class="info">${I('info')}<div>O app não calcula o frete: manda o pedido pronto às transportadoras parceiras da região, e elas respondem com o preço. Nada é cobrado da transportadora para entrar.</div></div>
      ${ct ? `<div class="sec" style="margin:16px 0 10px"><h3>Cotações recebidas</h3></div>${cot.map((q, i) => { const t = AB.transportadoras.find(x => x.id === q.t); return `<button class="cota ${ct.esc === i ? 'on' : ''}" data-cota="${id}" data-i="${i}"><div class="av peq">${t.ini}</div><div class="tx"><strong>${t.nome}</strong><small>${q.c} × ${t.caminhao} · ${q.prazo} · nota ${t.nota.toLocaleString('pt-BR')}</small></div><div class="r"><b>${reais(q.v)}</b><small class="mut">total</small></div></button>`; }).join('')}
        <div class="toggle" style="margin-top:6px"><div class="tx"><b>Seguro de transporte</b><small>Cobre morte e acidente na viagem · cerca de ${reais(valorNeg(n) * 0.0012)}</small></div><button class="sw ${ct.seg ? 'on' : ''}" data-seguro="${id}" aria-label="Seguro"></button></div>` : `<div id="cotando" class="vazio" hidden><div class="verif" style="padding:10px"><div class="roda" style="width:56px;height:56px;border-width:5px"></div><p>Enviando para 2 transportadoras da região…</p></div></div>`}
      </div>
      <div class="barra-baixo">${ct ? `<button class="btn bloco" data-contratar="${id}" ${ct.esc === undefined ? 'disabled' : ''}>Contratar frete</button>` : `<button class="btn bloco" data-cotar="${id}">${I('send')}Pedir cotação às parceiras</button>`}</div></div>`;
  };

  // entrega e nota
  T.entrega = id => {
    const n = N(id), l = L(n.lote), nt = S.notas[id] || (S.notas[id] = { conforme: null, emDia: null, est: 0 });
    if (etapa(n) === 'concluido') {
      const cid = meuId();
      return `<div class="tela sem-tab fade">${topo('Negócio concluído', `#/n/${id}`)}
        <div class="verif"><div class="feito">${I('trophy')}</div><h2>Tudo certo</h2><p>Entrega conferida, pagamento confirmado e avaliações registradas.</p>
        <ul><li>${I('check')}Comprador: "pagou em dia" entra na nota dele</li><li>${I('check')}Vendedor: "lote conforme" entra na nota dele</li>${S.papel === 'corretor' && comissaoDe(n, cid) ? `<li>${I('check')}Sua comissão de ${reais(comissaoDe(n, cid))} ficou registrada</li>` : ''}<li>${I('check')}Histórico pronto para crédito no futuro</li></ul></div>
        <div class="barra-baixo"><a class="btn bloco" href="#/eu">Ver minha reputação</a></div></div>`;
    }
    const sn = (k, label) => `<div class="sn"><button class="${nt[k] === true ? 'on' : ''}" data-nt="${k}" data-v="1">Sim</button><button class="nao ${nt[k] === false ? 'on nao' : ''}" data-nt="${k}" data-v="0">${label}</button></div>`;
    return `<div class="tela sem-tab fade">${topo('Entrega e nota', `#/n/${id}`)}
      <div class="pad">
        <div class="caixa" style="padding:2px 14px">
          <div class="criterio"><div class="tx"><b>Chegaram ${n.qtd} cabeças, no peso anunciado?</b><small>Confirma o comprador · ${pessoa(n.comprador).faz}</small></div>${sn('conforme', 'Não')}</div>
          <div class="criterio"><div class="tx"><b>O saldo foi pago no prazo (${n.prazo.toLowerCase()})?</b><small>Confirma o vendedor · ${pessoa(l.produtor).faz}</small></div>${sn('emDia', 'Não')}</div>
        </div>
        ${nt.conforme === false || nt.emDia === false ? `<div class="erro" style="margin-top:12px">${I('flag')}<div>Vamos abrir uma <b>disputa</b>: a equipe ouve as duas partes antes de mexer na nota de alguém.</div></div>` : ''}
        <div class="sec" style="margin:22px 0 4px;justify-content:center"><h3>Como foi negociar com a outra parte?</h3></div>
        <div class="estrelas">${[1, 2, 3, 4, 5].map(i => `<button data-est="${i}" class="${nt.est >= i ? 'on' : ''}" aria-label="${i} estrelas">${I('star')}</button>`).join('')}</div>
        <p class="mut" style="text-align:center;font-size:13px">A nota aparece em faixas (Bronze, Prata, Ouro), nunca como "caloteiro".</p>
      </div>
      <div class="barra-baixo"><button class="btn bloco" data-concluir="${id}" ${nt.conforme === null || nt.emDia === null || !nt.est ? 'disabled' : ''}>Enviar e concluir</button></div></div>`;
  };

  // novo lote
  let nl = { passo: 1, cat: 'Boi gordo', qtd: 120, peso: 19, idade: '30–36 meses', raca: 'Nelore', preco: 315, cidade: 'Rio Verde', video: false, porta: '' };
  T.novo = () => {
    const p = nl.passo, tot = 5, porArroba = ['Boi gordo', 'Boi magro', 'Vaca gorda'].includes(nl.cat);
    const passos = `<div class="passos">${Array.from({ length: tot }, (_, i) => `<i class="${i < p ? 'on' : ''}"></i>`).join('')}</div>`;
    let corpo = '';
    if (p === 1) corpo = `<div class="h-tela"><h1>O lote</h1><p>Ficha padrão: todo lote no app tem os mesmos campos.</p></div><div class="pad" style="margin-top:14px">
      <div class="campo"><span>Categoria</span><div class="opcoes" data-nl="cat">${['Boi gordo', 'Boi magro', 'Garrote', 'Bezerro', 'Novilha', 'Vaca de cria', 'Vaca gorda'].map(c => `<button type="button" class="${nl.cat === c ? 'on' : ''}">${c}</button>`).join('')}</div></div>
      <div class="duas"><label class="campo"><span>Quantidade</span><input data-nlv="qtd" inputmode="numeric" value="${nl.qtd}"></label><label class="campo"><span>Peso médio (${porArroba ? '@' : 'kg'})</span><input data-nlv="peso" inputmode="decimal" value="${porArroba ? nl.peso : 280}"></label></div>
      <div class="duas"><label class="campo"><span>Raça</span><select data-nlv="raca"><option>Nelore</option><option>Cruzado (Nelore × Angus)</option><option>Anelorado</option><option>Outra</option></select></label><label class="campo"><span>Idade</span><input data-nlv="idade" value="${nl.idade}"></label></div>
      ${nl.qtd < R.loteMinimo ? `<div class="erro">${I('circle-alert')}<div>Lote mínimo de ${R.loteMinimo} cabeças. Assim a vitrine fica só com lotes que valem a viagem.</div></div>` : ''}</div>`;
    if (p === 2) corpo = `<div class="h-tela"><h1>Onde, quando e quanto</h1></div><div class="pad" style="margin-top:14px">
      <label class="campo"><span>Cidade da fazenda</span><input data-nlv="cidade" value="${nl.cidade}"></label>
      <div class="campo"><span>Disponível</span><div class="opcoes" data-um="disp"><button type="button" class="on">Imediata</button><button type="button">Em 15 dias</button><button type="button">Em 30 dias</button></div></div>
      <div class="campo"><span>Sanidade</span><div class="opcoes" data-multi><button type="button" class="on">Aftosa em dia</button><button type="button" class="on">Brucelose</button><button type="button">Clostridiose</button><button type="button">GTA pronta</button></div></div>
      <label class="campo"><span>Preço pedido (${porArroba ? 'R$/@' : 'R$/cabeça'})</span><input data-nlv="preco" inputmode="numeric" value="${porArroba ? nl.preco : 3200}"><small>Referência da região esta semana (exemplo): ${porArroba ? 'R$ 305 a R$ 318/@' : 'R$ 3.000 a R$ 3.500/cab.'}</small></label></div>`;
    if (p === 3) corpo = `<div class="h-tela"><h1>Vídeo do lote</h1><p>Obrigatório. É o que faz o comprador agir sem conhecer o vendedor.</p></div><div class="pad" style="margin-top:14px">
      <div class="info">${I('video')}<div><b>Como gravar:</b> 1 a 2 minutos, de dia, passando devagar pelo lote inteiro no curral. Mostre o brinco ou a marca de algum animal.</div></div>
      <div class="mapa-mini" style="background-image:url(${img(nl.video ? 'lote2' : 'curral')});height:200px;display:grid;place-items:center">${nl.video ? `<span class="selo soft" style="font-size:13px">${I('check')}Vídeo enviado · 1:42</span>` : `<button class="btn ouro" data-acao="gravar">${I('video')}Gravar ou escolher vídeo</button>`}</div>
      <div id="subindo" hidden style="margin-top:12px"><div class="trilha"><i class="o" id="barraVid" style="flex:0 0 0%;transition:flex-basis 2s linear"></i><i></i></div><small class="mut">Enviando vídeo…</small></div></div>`;
    if (p === 4) corpo = `<div class="h-tela"><h1>Corretor do lote</h1><p>Todo lote tem um corretor de registro. Nenhum negócio pula o corretor.</p></div><div class="pad" style="margin-top:14px">
      ${S.papel === 'corretor' ? `<div class="pessoa">${av(eu())}<div class="tx"><strong>Você, ${eu().nome}</strong><small>Corretor de registro · lote fica na sua carteira</small></div>${I('lock')}</div>
        <label class="campo"><span>Produtor (seu cliente)</span><select><option>José Antônio Prado · Faz. Boa Vista</option><option>Cadastrar novo produtor</option></select><small>O contato dele fica protegido: outros corretores não veem.</small></label>`
      : `<button class="cota ${nl.porta === 'meu' ? 'on' : ''}" data-porta="meu"><div class="av peq">CM</div><div class="tx"><strong>Meu corretor de confiança</strong><small>Carlos Mendes · o lote vai só para ele</small></div></button>
        <button class="cota ${nl.porta === 'aberta' ? 'on' : ''}" data-porta="aberta"><div class="av peq" style="background:var(--ouro);color:var(--pasto-e)">${I('door-open')}</div><div class="tx"><strong>Abrir para corretores da região</strong><small>Os corretores aceitam e você escolhe um, pela nota e pelo histórico</small></div></button>`}</div>`;
    if (p === 5) corpo = `<div class="h-tela"><h1>Revisar e enviar</h1><p>A equipe confere ficha e vídeo antes de publicar.</p></div><div class="pad" style="margin-top:14px">
      <div class="ficha"><div><small>Lote</small><b>${nl.qtd} · ${nl.cat}</b></div><div><small>Raça</small><b>${nl.raca}</b></div><div><small>Peso</small><b>${nl.peso}${porArroba ? ' @' : ' kg'}</b></div><div><small>Preço</small><b>R$ ${Number(nl.preco).toLocaleString('pt-BR')}${porArroba ? '/@' : '/cab.'}</b></div><div><small>Local</small><b>${nl.cidade}-GO</b></div><div><small>Vídeo</small><b>Enviado</b></div><div class="w"><small>Corretor</small><b>${S.papel === 'corretor' ? 'Você (carteira protegida)' : nl.porta === 'aberta' ? 'Lote aberto para a região' : 'Carlos Mendes'}</b></div></div>
      <div class="info" style="margin-top:14px">${I('clock')}<div>Análise em até 24 h. Se faltar algo, devolvemos com comentário.</div></div></div>`;
    const pode = p === 1 ? nl.qtd >= R.loteMinimo : p === 3 ? nl.video : p === 4 ? (S.papel === 'corretor' || nl.porta) : true;
    return `<div class="tela sem-tab fade">${topo('Novo lote', p === 1 ? '#/' : 'javascript:void(0)" data-nl-volta="1')}${passos}${corpo}
      <div class="barra-baixo"><button class="btn bloco" data-nl-ok ${pode ? '' : 'disabled'}>${p === tot ? 'Enviar para análise' : 'Continuar'}</button></div></div>`;
  };

  // lotes abertos (corretor)
  T.abertos = () => {
    const ab = lotes().filter(l => l.porta === 'aberta' && !corretorDe(l));
    return `<div class="tela fade">${topo('Lotes abertos', '#/')}
      <div class="pad"><div class="info ouro">${I('door-open')}<div>Produtores que entraram sozinhos. Quem aceita entra na lista, e o produtor escolhe. Contam a <b>sua nota, a taxa de fechamento e o tempo de resposta</b>.</div></div></div>
      ${ab.map(l => `<div class="item" style="flex-direction:column"><a href="#/l/${l.id}" style="display:flex;gap:12px"><div class="ft" style="background-image:url(${img(l.foto)});width:96px;height:96px"></div><div class="tx"><small>${l.cidade}-${l.uf} · ${l.publicado}</small><span class="nm">${l.qtd} cab. · ${nomeLote(l)}</span><small>${pesoTxt(l)}</small><strong>${precoTxt(l)}</strong></div></a>
        ${!l.verificado ? `<span class="selo analise" style="align-self:flex-start">${I('hourglass')}Em análise: aceite depois de publicado</span>` : `<button class="btn ${S.aceitos[l.id] ? 'verde-soft' : ''} bloco peq" data-aceitar="${l.id}" ${S.aceitos[l.id] ? 'disabled' : ''}>${S.aceitos[l.id] ? I('check') + 'Você está na lista · o produtor escolhe' : 'Quero atender · comissão estimada ' + curto(valorLote(l) * R.corretagemLado * 2)}</button>`}</div>`).join('')}
      ${tab('inicio-claro')}</div>`;
  };

  // produtor escolhe corretor
  T.escolher = id => {
    const l = L(id), esc = S.escolhido[id];
    const cand = ['c1', 'c3', 'c4'].map(pessoa).sort((a, b) => b.nota - a.nota);
    return `<div class="tela fade">${topo('Escolha o corretor', '#/meus-lotes')}
      <div class="pad"><div class="pessoa"><div class="av" style="border-radius:14px;background:url(${img(l.foto)}) center/cover"></div><div class="tx"><strong>${l.qtd} cab. · ${nomeLote(l)}</strong><small>Seu lote aberto · ${l.cidade}-${l.uf}</small></div></div>
      <p class="mut" style="margin:6px 2px 14px">${esc ? 'Corretor escolhido. O lote agora fica protegido na carteira dele.' : `${cand.length} corretores da região aceitaram. Ordem por nota, fechamento e tempo de resposta.`}</p>
      ${cand.map(c => `<div class="pessoa cand">${av(c)}<div class="tx"><strong>${c.nome} ${faixa(c.faixa)}</strong><small>${c.cidade} · ${c.negocios} negócios · fecha ${c.fecha}% das visitas · responde em ${c.resposta}</small></div>
        ${esc ? (esc === c.id ? `<span class="selo soft" style="margin-left:58px">${I('check')}Escolhido</span>` : '') : `<button class="btn peq" style="margin-left:58px" data-escolher="${id}" data-c="${c.id}">Escolher ${primeiro(c.nome)}</button>`}</div>`).join('')}</div>
      ${tab('inicio-claro')}</div>`;
  };

  // meus lotes / carteira
  T.meusLotes = () => {
    const lista = S.papel === 'produtor' ? lotes().filter(l => l.produtor === meuId()) : lotes().filter(l => corretorDe(l) === meuId());
    return `<div class="tela fade">${topo(S.papel === 'corretor' ? 'Minha carteira' : 'Meus lotes', '#/', `<a class="vol" href="#/novo" aria-label="Novo lote">${I('plus')}</a>`)}
      ${S.papel === 'corretor' ? `<div class="pad"><div class="info">${I('lock')}<div>Lotes e produtores da sua carteira são <b>seus para sempre</b>. Nenhum outro corretor vê o contato sem a sua permissão.</div></div></div>` : ''}
      ${lista.length ? lista.map(item).join('') : `<div class="vazio">${I('layers')}Nenhum lote ainda.</div>`}
      <div class="pad"><a class="btn bloco" href="#/novo" style="margin-top:6px">${I('plus')}Novo lote</a></div>${tab('eu')}</div>`;
  };

  T.buscas = () => `<div class="tela fade">${topo('Buscas salvas', '#/')}
    <div class="pad"><div class="info">${I('bell-ring')}<div>Quando entrar um lote parecido, você recebe um aviso. No futuro, a IA sugere lotes pelo que você costuma fechar.</div></div>
    <div class="caixa">${S.buscas.map((b, i) => `<div class="lin"><div class="av peq" style="background:var(--verde-soft);color:var(--pasto)">${I('search')}</div><div class="tx"><strong>${b}</strong><small>Aviso ligado</small></div><button data-tira-busca="${i}" aria-label="Apagar busca">${I('x')}</button></div>`).join('')}</div>
    <a class="btn claro bloco" href="#/lotes" style="margin-top:14px">${I('plus')}Nova busca</a></div>${tab('eu')}</div>`;

  // eu
  T.eu = () => {
    const p = eu(), papel = S.papel, f = p.faixa;
    const total = papel === 'corretor' ? meusNegocios().reduce((s, n) => s + comissaoDe(n, meuId()), 0) : 0;
    const trilha = `<div class="trilha"><i class="b"></i><i class="${f !== 'Bronze' ? 'p' : ''}"></i><i class="${f === 'Ouro' ? 'o' : ''}"></i></div><div style="display:flex;justify-content:space-between;font-size:11px;font-weight:700" class="mut"><span>Bronze</span><span>Prata</span><span>Ouro</span></div>`;
    return `<div class="tela fade" style="padding-top:0">
      <div class="perfil"><div class="av">${p.ini}<span class="ok">${I('check')}</span></div><h1>${p.nome}</h1><p>${{ corretor: 'Corretor', produtor: 'Produtor · ' + (p.faz || ''), comprador: 'Comprador · ' + (p.faz || '') }[papel]} · ${p.cidade}-${p.uf}</p><span class="medalha ${f}">${I('award')}Faixa ${f} · nota ${p.nota.toLocaleString('pt-BR')}</span></div>
      <div class="nums"><div><b>${p.negocios}</b><small>negócios no app</small></div><div><b>${papel === 'corretor' ? p.fecha + '%' : '100%'}</b><small>${papel === 'corretor' ? 'visitas que fecham' : papel === 'comprador' ? 'pagou em dia' : 'lotes conforme'}</small></div><div><b>${papel === 'corretor' ? p.resposta : '0'}</b><small>${papel === 'corretor' ? 'tempo de resposta' : 'disputas'}</small></div></div>
      ${papel === 'corretor' ? `<div class="pad" style="margin-top:16px"><a class="faixa-aviso claro" href="#/negocios" style="margin:0"><span class="ic">${I('wallet')}</span><div><strong>${reais(total)} em comissões</strong><small>Previstas em novembro · registradas no app</small></div></a></div>` : ''}
      <div class="sec"><h3>Sua reputação</h3></div>
      <div class="pad"><div class="caixa" style="padding:14px">${trilha}
        <div class="criterio" style="margin-top:6px"><div class="tx"><b>Pagou em dia</b><small>Confirmado pelo vendedor, no app</small></div>${I('circle-check', 'ouro-t')}</div>
        <div class="criterio"><div class="tx"><b>Lote conforme o anunciado</b><small>Confirmado pelo comprador, no app</small></div>${I('circle-check', 'ouro-t')}</div>
        <div class="criterio"><div class="tx"><b>Tempo de resposta e negócios fechados</b><small>Calculados pelo app</small></div>${I('circle-check', 'ouro-t')}</div>
        <div class="criterio"><div class="tx"><b>Disputas resolvidas</b><small>Pela equipe, ouvindo as duas partes</small></div>${I('circle-check', 'ouro-t')}</div></div>
        <p class="mut" style="font-size:12px;margin:8px 2px 0">Só negócio fechado no app conta. Você pode contestar qualquer avaliação.</p></div>
      <div class="sec"><h3>Atalhos</h3></div>
      <div class="pad"><div class="caixa menu">
        <a href="#/meus-lotes">${I(papel === 'corretor' ? 'lock' : 'layers')}${papel === 'corretor' ? 'Minha carteira' : 'Meus lotes'}${I('chevron-right', 'seta')}</a>
        ${papel === 'corretor' ? `<a href="#/abertos">${I('door-open')}Lotes abertos na região${I('chevron-right', 'seta')}</a>` : ''}
        <a href="#/buscas">${I('bell-ring')}Buscas salvas${I('chevron-right', 'seta')}</a>
        <a href="#/breve">${I('sparkles')}Em breve no app${I('chevron-right', 'seta')}</a>
        <button data-acao="trocar">${I('repeat')}Trocar perfil (corretor, produtor, comprador)${I('chevron-right', 'seta')}</button>
        <button data-acao="sobre">${I('info')}Sobre este protótipo${I('chevron-right', 'seta')}</button>
      </div></div>${tab('eu')}</div>`;
  };

  T.breve = () => `<div class="tela fade">${topo('Em breve', '#/')}
    <div class="h-tela" style="margin-bottom:14px"><p style="margin:0">O começo prova que o corretor fecha pelo app <b>sem depender de crédito</b>. Com histórico, entram estes:</p></div>
    ${AB.emBreve.map(b => `<div class="breve"><span class="ic">${I(b.ic)}</span><div><strong>${b.t}</strong><p>${b.d}</p><span class="fase">${b.fase}</span></div></div>`).join('')}${tab('eu')}</div>`;

  T.naoachou = () => `<div class="tela fade">${topo('Não encontrado', '#/')}<div class="vazio">${I('search-x')}Essa tela não existe.<br><a class="link" href="#/">Voltar ao início</a></div>${tab('')}</div>`;

  // ---------- roteador ----------
  let mapa = null;
  function rota() {
    const h = location.hash.replace(/^#\/?/, '');
    const [caminho, qs] = h.split('?');
    const q = Object.fromEntries(new URLSearchParams(qs || ''));
    const [a, b] = caminho.split('/');
    if ((!S.papel || !S.cadastrado) && a !== 'entrar' && a !== 'cadastro') { location.replace('#/entrar'); return; }
    if (a !== 'cadastro') cad = { passo: 1 };
    if (a !== 'novo' && nl.passo > 1 && nl.fim) nl = { passo: 1, cat: 'Boi gordo', qtd: 120, peso: 19, idade: '30–36 meses', raca: 'Nelore', preco: 315, cidade: 'Rio Verde', video: false, porta: '' };
    if (mapa) { try { mapa.remove(); } catch {} mapa = null; }
    const telas = { '': T.inicio, entrar: T.entrar, cadastro: () => T.cadastro(b || 'corretor'), lotes: () => T.lotes(q), l: () => T.lote(b), proposta: () => T.proposta(b), n: () => T.negocio(b), negocios: T.negocios, conversas: T.conversas, chat: () => T.chat(b), visita: () => T.visita(b), fechar: () => T.fechar(b), frete: () => T.frete(b), entrega: () => T.entrega(b), novo: T.novo, abertos: T.abertos, escolher: () => T.escolher(b || 'l8'), 'meus-lotes': T.meusLotes, buscas: T.buscas, eu: T.eu, breve: T.breve };
    const fn = telas[a];
    let html;
    try { html = fn ? fn() : T.naoachou(); } catch (e) { console.error(e); html = T.naoachou(); }
    app.innerHTML = html;
    const tb = $('.tela > .tab'); if (tb) app.appendChild(tb);
    lucide.createIcons();
    $$('.folha').forEach(f => f.remove());
    depois(a, b);
    marcaLado();
  }
  function depois(a, b) {
    if (a === 'lotes' && filtro.vista === 'mapa') montaMapa();
    if (a === 'chat') { const c = $('.tela'); c.scrollTop = c.scrollHeight; }
    if (a === 'fechar' && fech[b]?.passo === 1) assinatura();
    if (a === 'fechar' && fech[b]?.passo === 2) qr('qr2', 'ARREMATABOV-SINAL-EXEMPLO-' + b);
    if (a === 'cadastro' && cad.passo === 3) setTimeout(() => {
      const v = $('#verif'); if (!v) return;
      v.innerHTML = `<div class="feito">${I('check')}</div><h2>Perfil verificado</h2><p>Seu selo aparece em tudo que você faz no app.</p><ul><li>${I('check')}Documento conferido</li><li>${I('check')}Celular confirmado por SMS</li><li>${I('check')}${S.papel === 'corretor' ? 'Região de atuação registrada' : S.papel === 'produtor' ? 'Fazenda localizada' : 'Perfil de compra salvo'}</li></ul><a class="btn bloco" style="margin-top:26px" href="#/">Entrar no app</a>`;
      lucide.createIcons(); S.cadastrado = true; salva(); marcaLado();
    }, 1800);
  }
  function qr(id, txt) { try { const el = document.getElementById(id); if (el && window.QRCode) { el.innerHTML = ''; new QRCode(el, { text: txt, width: 146, height: 146, colorDark: '#0E4A2B', colorLight: '#ffffff' }); } } catch {} }

  function montaMapa() {
    if (!window.maplibregl) { $('#mapa').innerHTML = '<div class="vazio">Mapa indisponível sem internet.</div>'; return; }
    mapa = new maplibregl.Map({ container: 'mapa', attributionControl: { compact: true }, center: [-51.4, -17.7], zoom: 6.4,
      style: { version: 8, sources: { sat: { type: 'raster', tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'], tileSize: 256, attribution: 'Esri, Maxar, Earthstar Geographics' } }, layers: [{ id: 'sat', type: 'raster', source: 'sat' }] } });
    const vis = lotes().filter(l => l.verificado && l.lat && (!filtro.cat || l.cat === filtro.cat));
    if (vis.length > 1) { const b = new maplibregl.LngLatBounds(); vis.forEach(l => b.extend([l.lng, l.lat])); mapa.fitBounds(b, { padding: 50, duration: 0 }); }
    vis.forEach(l => {
      const el = document.createElement('div'); el.className = 'pino' + (l.porta === 'aberta' && !corretorDe(l) ? ' ab' : ''); el.textContent = `${l.qtd} · ${l.cat}`;
      new maplibregl.Marker({ element: el }).setLngLat([l.lng, l.lat]).setPopup(new maplibregl.Popup({ offset: 16, closeButton: false }).setHTML(`<b>${l.qtd} cab. · ${nomeLote(l)}</b><br>${precoTxt(l)} · ${l.cidade}<br><a href="#/l/${l.id}" style="color:#1E7A47;font-weight:700">Abrir anúncio →</a>`)).addTo(mapa);
    });
  }

  function assinatura() {
    const box = $('#assina'); if (!box) return;
    const cv = $('canvas', box), ctx = cv.getContext('2d'), r = devicePixelRatio || 1;
    cv.width = box.clientWidth * r; cv.height = box.clientHeight * r; ctx.scale(r, r);
    ctx.lineWidth = 2.4; ctx.lineCap = 'round'; ctx.strokeStyle = '#0E4A2B';
    let des = false;
    const pt = e => { const b = cv.getBoundingClientRect(); return [e.clientX - b.left, e.clientY - b.top]; };
    cv.addEventListener('pointerdown', e => { des = true; box.dataset.ok = '1'; const [x, y] = pt(e); ctx.beginPath(); ctx.moveTo(x, y); cv.setPointerCapture(e.pointerId); });
    cv.addEventListener('pointermove', e => { if (!des) return; const [x, y] = pt(e); ctx.lineTo(x, y); ctx.stroke(); });
    cv.addEventListener('pointerup', () => des = false);
  }

  // ---------- papel (lado do PC) ----------
  function marcaLado() { $$('#papelLado button').forEach(b => b.classList.toggle('on', S.cadastrado && b.dataset.papel === S.papel)); }
  function trocaPapel(p) { S.papel = p; S.cadastrado = true; salva(); toast(`Agora você vê o app como ${p}`, 'repeat'); if (location.hash === '#/' || location.hash === '') rota(); else location.hash = '#/'; }
  $$('#papelLado button').forEach(b => b.addEventListener('click', () => trocaPapel(b.dataset.papel)));
  $('#recomeca')?.addEventListener('click', () => { guarda.limpa(); location.hash = '#/entrar'; location.reload(); });

  // ---------- ações ----------
  const agora = () => new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const BLOQ = /(\(?\d{2}\)?\s?9?\s?\d{4}[-\s]?\d{4})|(https?:\/\/)|(www\.)|(wa\.me)|(@\w+\.\w+)|(\bzap\b)|(whats)/i;
  function novoNegocio(lid, preco, qtd, prazo) {
    const l = L(lid), id = 'n' + Date.now().toString(36);
    const comprador = S.papel === 'comprador' ? 'b1' : S.papel === 'produtor' ? 'b2' : 'b1';
    const n = { id, lote: lid, comprador, corretorComprador: S.papel === 'corretor' && corretorDe(l) !== meuId() ? meuId() : null, etapa: 'proposta', qtd, precoUnit: preco, quando: 'Visita a agendar', prazo, visitaPaga: false };
    S.negNovos.unshift(n);
    S.msgs[id] = [{ tipo: 'proposta', valor: preco, unid: l.porArroba ? '@' : 'cab', prazo, sinal: R.sinal * 100 + '%', h: agora() }];
    salva();
    setTimeout(() => {
      const c = corretorDe(l) || 'c1';
      S.msgs[id].push({ de: c, t: `Levei sua proposta ao vendedor. Ele aceitou ${precoTxt(l, preco)} se a visita confirmar o lote. Pode agendar pelo app.`, h: agora() });
      S.msgs[id].push({ tipo: 'sistema', t: 'Proposta aceita em princípio. Próximo passo: agendar a visita.' });
      S.etapas[id] = 'visita'; salva();
      if (location.hash === '#/chat/' + id) rota();
      toast('O vendedor respondeu sua proposta', 'message-circle');
    }, 2600);
    return id;
  }

  document.addEventListener('submit', e => {
    const f = e.target; e.preventDefault();
    if (f.matches('[data-busca]')) { const v = f.q.value.trim(); filtro.texto = v; location.hash = '#/lotes?q=' + encodeURIComponent(v); if (location.hash.startsWith('#/lotes')) rota(); return; }
    if (f.matches('[data-perguntar]')) {
      const id = f.dataset.perguntar, v = f.q.value.trim(); if (!v) return;
      if (BLOQ.test(v)) { toast('Pergunta sem telefone ou link, por favor', 'shield-alert'); return; }
      (S.perguntas[id] = S.perguntas[id] || []).unshift({ q: v, r: '', de: 'Você · agora' }); salva(); rota(); toast('Pergunta enviada. A resposta fica visível para todos.');
      return;
    }
    if (f.matches('[data-proposta]')) {
      const lid = f.dataset.proposta, l = L(lid), preco = Number(String(f.preco.value).replace(/\D/g, '')) || (l.porArroba || l.porCabeca);
      const qtd = Math.min(Number(f.qtd.value) || l.qtd, l.qtd), prazo = $('[data-um="prazo"] .on', f)?.textContent || 'À vista';
      if (f.msg.value && BLOQ.test(f.msg.value)) { toast('A mensagem tem telefone ou link: tire para enviar', 'shield-alert'); return; }
      const id = novoNegocio(lid, preco, qtd, prazo);
      if (f.msg.value.trim()) S.msgs[id].push({ de: meuId(), t: f.msg.value.trim(), h: agora() });
      salva(); location.hash = '#/chat/' + id; toast('Proposta enviada ao corretor');
      return;
    }
    if (f.matches('[data-chat]')) {
      const id = f.dataset.chat, v = f.t.value.trim(); if (!v) return;
      S.msgs[id] = S.msgs[id] || [];
      if (BLOQ.test(v)) S.msgs[id].push({ tipo: 'bloq', t: 'Telefone e link ficam bloqueados. O contato é liberado quando a visita é agendada pelo app.' });
      else S.msgs[id].push({ de: meuId(), t: v.replace(/</g, '&lt;'), h: agora() });
      salva(); rota(); return;
    }
  });

  document.addEventListener('input', e => {
    const k = e.target.dataset?.nlv; if (!k) return;
    nl[k] = ['qtd', 'peso', 'preco'].includes(k) ? Number(String(e.target.value).replace(',', '.')) || 0 : e.target.value;
    if (k === 'qtd') { const ok = nl.qtd >= R.loteMinimo, bt = $('[data-nl-ok]'); if (bt) bt.disabled = !ok; const er = $('.erro'); if (ok && er) er.remove(); if (!ok && !er) { const d = document.createElement('div'); d.className = 'erro'; d.innerHTML = I('circle-alert') + `<div>Lote mínimo de ${R.loteMinimo} cabeças. Assim a vitrine fica só com lotes que valem a viagem.</div>`; e.target.closest('.pad').appendChild(d); lucide.createIcons(); } }
  });

  document.addEventListener('click', e => {
    const t = e.target.closest('button, a'); if (!t) return;
    const d = t.dataset;
    // opções
    const grupo = t.closest('.opcoes');
    if (grupo && t.tagName === 'BUTTON') {
      e.preventDefault();
      if (grupo.hasAttribute('data-multi')) t.classList.toggle('on');
      else { $$('button', grupo).forEach(b => b.classList.remove('on')); t.classList.add('on'); }
      if (d.qmin !== undefined) filtro.qtdMin = Number(d.qmin);
      if (grupo.dataset.nl) { nl[grupo.dataset.nl] = t.textContent; rota(); }
      return;
    }
    if (d.vista) { filtro.vista = d.vista; rota(); return; }
    if (d.cad) {
      if (cad.passo === 1) { cad.passo = 2; S.papel = d.cad; salva(); rota(); return; }
      cad.passo = 3; S.papel = d.cad; salva(); rota(); return;
    }
    if (d.cadVolta) { e.preventDefault(); cad.passo = 1; rota(); return; }
    if (d.arrematar) {
      const l = L(d.arrematar);
      folha(`<h3>Arrematar pelo preço pedido</h3><p class="mut">Vai como proposta firme ao corretor: ${l.qtd} cabeças a ${precoTxt(l)}, à vista, com sinal de ${R.sinal * 100}% no fechamento.</p>
        <div class="conta" style="margin:14px 0"><div class="l"><span>Lote inteiro (estimado)</span><b>${reais(valorLote(l))}</b></div><div class="l"><span>Sinal no fechamento</span><b>${reais(valorLote(l) * R.sinal)}</b></div><div class="l"><span>Taxa de visita (abatida)</span><b>${reais(R.taxaVisita)}</b></div></div>
        <button class="btn ouro bloco" data-arremata-ok="${l.id}">Arrematar</button><button class="btn claro bloco" style="margin-top:8px" data-fecha>Voltar</button>`);
      return;
    }
    if (d.arremataOk) { const l = L(d.arremataOk); const id = novoNegocio(l.id, l.porArroba || l.porCabeca, l.qtd, 'À vista'); $$('.folha').forEach(f => f.remove()); location.hash = '#/chat/' + id; toast('Arrematado! Proposta firme enviada.', 'gavel'); return; }
    if (d.aceitar) { S.aceitos[d.aceitar] = true; salva(); rota(); toast('Você entrou na lista. O produtor escolhe.'); return; }
    if (d.escolher) { S.escolhido[d.escolher] = d.c; salva(); rota(); toast(`${pessoa(d.c).nome} é o corretor de registro do lote`); return; }
    if (d.pagarVisita) {
      const box = $('#pixBox'); if (box.hidden) { box.hidden = false; qr('qr1', 'ARREMATABOV-VISITA-EXEMPLO-' + d.pagarVisita); t.innerHTML = 'Já paguei (simular)'; box.scrollIntoView({ behavior: 'smooth', block: 'center' }); return; }
      const n = N(d.pagarVisita); S.pagas[n.id + 'v'] = true; n.quando = 'Visita amanhã, 10h'; if (S.negNovos.includes(n)) n.quando = 'Visita amanhã, 10h'; S.etapas[n.id] = 'visita';
      (S.msgs[n.id] = S.msgs[n.id] || []).push({ tipo: 'sistema', t: 'Visita paga e agendada. Endereço e contatos liberados.' }); salva(); rota(); toast('Visita agendada. Endereço liberado.'); return;
    }
    if (d.checkin) {
      t.disabled = true; t.innerHTML = 'Conferindo localização…';
      setTimeout(() => { S.etapas[d.checkin + 'ck'] = agora(); const n = N(d.checkin); if (etapa(n) === 'visita') avanca(n, 'fechamento'); salva(); rota(); toast('Check-in feito na fazenda'); }, 1400);
      return;
    }
    if (d.fech) {
      if (d.v === 'nao') { folha(`<h3>Não fechou</h3><p class="mut">Conte o motivo. Se o lote não era como anunciado, a taxa de visita volta para você e o anúncio é revisto.</p><div class="opcoes" style="margin:14px 0"><button>Lote diferente do anúncio</button><button>Preço</button><button>Prazo de pagamento</button><button>Outro</button></div><button class="btn bloco" data-fecha>Enviar</button>`); return; }
      fech[d.fech].passo = 1; rota(); return;
    }
    if (d.assinar) { if (!$('#assina')?.dataset.ok) { toast('Assine no quadro antes', 'pen-line'); return; } fech[d.assinar].passo = 2; rota(); toast('Contrato assinado pelas duas partes'); return; }
    if (d.sinal) { fech[d.sinal].passo = 3; const n = N(d.sinal); avanca(n, 'frete'); (S.msgs[n.id] = S.msgs[n.id] || []).push({ tipo: 'sistema', t: 'Contrato assinado e sinal recebido. Negócio fechado no app.' }); salva(); rota(); return; }
    if (d.cotar) { const c = $('#cotando'); c.hidden = false; t.disabled = true; setTimeout(() => { S.cotas[d.cotar] = { seg: true }; salva(); rota(); toast('2 cotações recebidas'); }, 1800); return; }
    if (d.cota) { S.cotas[d.cota].esc = Number(d.i); S.cotas[d.cota].t = Number(d.i) ? 't2' : 't1'; salva(); rota(); return; }
    if (d.seguro) { S.cotas[d.seguro].seg = !S.cotas[d.seguro].seg; salva(); rota(); return; }
    if (d.contratar) { const n = N(d.contratar); avanca(n, 'entrega'); n.quando = 'Gado a caminho'; (S.msgs[n.id] = S.msgs[n.id] || []).push({ tipo: 'sistema', t: 'Frete contratado com transportadora parceira.' }); salva(); rota(); toast('Frete contratado'); return; }
    if (d.nt) { const id = location.hash.split('/')[2]; S.notas[id][d.nt] = d.v === '1'; salva(); rota(); return; }
    if (d.est) { const id = location.hash.split('/')[2]; S.notas[id].est = Number(d.est); salva(); rota(); return; }
    if (d.concluir) { const n = N(d.concluir); avanca(n, 'concluido'); salva(); rota(); return; }
    if (d.porta) { nl.porta = d.porta; rota(); return; }
    if (d.nlVolta !== undefined) { e.preventDefault(); nl.passo = Math.max(1, nl.passo - 1); rota(); return; }
    if (d.nlOk !== undefined) {
      if (nl.passo < 5) { nl.passo++; rota(); $('.tela')?.scrollTo(0, 0); return; }
      const porArroba = ['Boi gordo', 'Boi magro', 'Vaca gorda'].includes(nl.cat);
      const novo = { id: 'x' + Date.now().toString(36), cat: nl.cat, raca: nl.raca, sexo: /Vaca|Novilha/.test(nl.cat) ? 'Fêmea' : 'Macho', qtd: nl.qtd, idade: nl.idade, cidade: nl.cidade || 'Rio Verde', uf: 'GO', lat: -17.8, lng: -50.95, disp: 'Imediata', sanidade: 'Aftosa e brucelose em dia', foto: 'lote2', fotos: ['lote2'], corretor: S.papel === 'corretor' ? meuId() : nl.porta === 'meu' ? 'c1' : null, produtor: S.papel === 'produtor' ? meuId() : 'p1', porta: S.papel === 'corretor' || nl.porta === 'meu' ? 'corretor' : 'aberta', verificado: false, publicado: 'agora', destaque: 'Em análise pela equipe: vídeo recebido', perguntas: [] };
      if (porArroba) { novo.arrobas = nl.peso; novo.porArroba = nl.preco; } else { novo.kg = nl.peso > 100 ? nl.peso : 280; novo.porCabeca = nl.preco > 1000 ? nl.preco : 3200; }
      S.novos.unshift(novo); salva(); nl.fim = true;
      app.innerHTML = `<div class="tela sem-tab fade"><div class="verif"><div class="feito">${I('send')}</div><h2>Lote enviado para análise</h2><p>A equipe confere o vídeo e a ficha em até 24 h. Você recebe um aviso quando publicar.</p>
        <ul><li>${I('check')}Ficha padrão completa</li><li>${I('check')}Vídeo recebido</li><li>${I('check')}${novo.porta === 'aberta' ? 'Vai para os corretores da região' : 'Corretor de registro definido'}</li></ul>
        <a class="btn bloco" style="margin-top:26px" href="#/meus-lotes">Ver meus lotes</a></div></div>`;
      lucide.createIcons(); return;
    }
    if (d.tiraBusca !== undefined) { S.buscas.splice(Number(d.tiraBusca), 1); salva(); rota(); return; }

    switch (d.acao) {
      case 'video': { const g = $('#gal'); g.classList.add('tocando'); const fotos = L(location.hash.split('/')[2])?.fotos || []; let i = 0; const kb = $('.kb', g); const iv = setInterval(() => { i++; if (i >= fotos.length || !document.body.contains(g)) { clearInterval(iv); setTimeout(() => g.classList.remove('tocando'), 2400); return; } kb.style.backgroundImage = `url(${img(fotos[i])})`; }, 2300); toast('Vídeo de exemplo: no app real é o vídeo gravado na fazenda', 'video'); break; }
      case 'filtros': folha(`<h3>Filtros</h3><div class="campo" style="margin-top:10px"><span>Quantidade mínima</span><div class="opcoes" data-um="qmin">${[0, 50, 100, 200, 300].map(v => `<button class="${filtro.qtdMin === v ? 'on' : ''}" data-qmin="${v}">${v ? v + '+' : 'Qualquer'}</button>`).join('')}</div></div>
        <div class="campo"><span>Distância de Rio Verde</span><div class="opcoes" data-um="raio"><button>100 km</button><button class="on">200 km</button><button>300 km</button><button>Todo GO</button></div></div>
        <div class="campo"><span>Situação</span><div class="opcoes" data-multi><button class="on">Só verificados</button><button>Com GTA pronta</button><button>Disponível já</button></div></div>
        <button class="btn bloco" data-aplica>Ver lotes</button>`); break;
      case 'salvar-busca': { const b = (filtro.cat || 'Todos os lotes') + (filtro.qtdMin ? ` · ${filtro.qtdMin}+ cab.` : '') + ' · 200 km de Rio Verde'; if (!S.buscas.includes(b)) S.buscas.unshift(b); salva(); toast('Busca salva. Avisamos quando entrar lote assim.', 'bell-ring'); break; }
      case 'seguir': toast('Você segue o lote. Avisamos quando o produtor escolher o corretor.', 'bell-ring'); break;
      case 'compartilhar': toast('Link do anúncio copiado (exemplo)', 'share-2'); break;
      case 'copiar': toast('Código Pix copiado (exemplo)', 'copy'); break;
      case 'rota': toast('Abriria a rota no mapa do celular', 'navigation'); break;
      case 'qr-lote': toast('O QR fica numa placa no curral: ler confirma a visita', 'scan-line'); break;
      case 'avisos': folha(`<h3>Avisos</h3><div class="caixa" style="margin-top:10px">
        <a class="lin" href="#/n/n1"><div class="av peq">${I('map-pin')}</div><div class="tx"><strong>Visita hoje, 14h</strong><small>Boi gordo · Faz. Boa Vista</small></div></a>
        <a class="lin" href="#/l/l4"><div class="av peq" style="background:var(--ouro);color:var(--pasto-e)">${I('door-open')}</div><div class="tx"><strong>Lote aberto perto de você</strong><small>90 vacas de cria · Montividiu</small></div></a>
        <a class="lin" href="#/lotes?cat=Boi%20gordo"><div class="av peq">${I('bell-ring')}</div><div class="tx"><strong>Busca salva: 1 lote novo</strong><small>Boi gordo · 200 km de Rio Verde</small></div></a></div>`); break;
      case 'gravar': { const s = $('#subindo'); s.hidden = false; t.disabled = true; requestAnimationFrame(() => { $('#barraVid').style.flexBasis = '100%'; }); setTimeout(() => { nl.video = true; rota(); toast('Vídeo enviado'); }, 2100); break; }
      case 'trocar': folha(`<h3>Ver o app como</h3><p class="mut">No app real cada pessoa tem um perfil. Aqui dá para trocar e ver os três lados.</p><div style="margin-top:14px">${[['corretor', 'briefcase', 'Corretor', 'Carlos Mendes · Rio Verde'], ['produtor', 'wheat', 'Produtor', 'José Antônio · Faz. Boa Vista'], ['comprador', 'shopping-bag', 'Comprador', 'Marcelo · Confinamento Rio Claro']].map(p => `<button class="cota ${S.papel === p[0] ? 'on' : ''}" data-troca="${p[0]}"><div class="av peq">${I(p[1])}</div><div class="tx"><strong>${p[2]}</strong><small>${p[3]}</small></div></button>`).join('')}</div>`); break;
      case 'sobre': folha(`<h3>Sobre este protótipo</h3><p class="mut" style="margin-top:6px">Versão 1 do Arrem@ta Bov para João e Augusto discutirem o produto. Mostra o caminho inteiro de um negócio: anúncio verificado, proposta, visita com taxa, contrato e sinal pelo app, frete com parceira, entrega e nota.</p>
        <div class="info ouro" style="margin-top:14px">${I('triangle-alert')}<div>Tudo aqui é exemplo: lotes, pessoas, preços, Pix, contrato e assinatura. Taxa do app (0,15% por lado), sinal (5%), taxa de visita (R$ 150) e lote mínimo (30 cab.) são propostas a validar com corretores.</div></div>
        <button class="btn claro bloco" data-recomeca>Apagar o que fiz e recomeçar</button>`); break;
    }
    if (d.qmin !== undefined) { filtro.qtdMin = Number(d.qmin); }
    if (d.aplica !== undefined) { $$('.folha').forEach(f => f.remove()); rota(); }
    if (d.troca) { $$('.folha').forEach(f => f.remove()); trocaPapel(d.troca); }
    if (d.recomeca !== undefined) { guarda.limpa(); location.hash = '#/entrar'; location.reload(); }
  });

  addEventListener('hashchange', () => { rota(); $('.tela')?.scrollTo(0, 0); });
  rota();
})();
