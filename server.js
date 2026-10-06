const express = require('express');

const app = express();
const PORT = 3000;

// Permite receber JSON nas requisições
app.use(express.json());

// ============================================================
// BANCO DE DADOS EM MEMÓRIA
// ============================================================

let livros = [
  {
    id: 1,
    titulo: 'Dom Casmurro',
    autor: 'Machado de Assis',
    genero: 'Romance',
    anoPublicacao: 1899
  },
  {
    id: 2,
    titulo: 'O Hobbit',
    autor: 'J.R.R. Tolkien',
    genero: 'Fantasia',
    anoPublicacao: 1937
  },
  {
    id: 3,
    titulo: 'O Namorado',
    autor: 'Freida McFadden',
    genero: 'Suspense',
    anoPublicacao: 2024
  },
  {
    id: 4,
    titulo: 'A Culpa é das Estrelas',
    autor: 'John Green',
    genero: 'Romance',
    anoPublicacao: 2012
  }
];

let exemplares = [
  {
    id: 101,
    livroId: 1,
    situacao: 'disponivel'
  },
  {
    id: 102,
    livroId: 1,
    situacao: 'disponivel'
  },
  {
    id: 201,
    livroId: 2,
    situacao: 'disponivel'
  },
  {
    id: 301,
    livroId: 3,
    situacao: 'disponivel'
  },
  {
    id: 401,
    livroId: 4,
    situacao: 'disponivel'
  }
];

let leitores = [
  {
    id: 1,
    nome: 'Nicolly Cruz Vieira',
    email: 'nicolly.06@gmail.com',
    limiteEmprestimos: 3
  },
  {
    id: 2,
    nome: 'Geovana Saldanha do Amaral',
    email: 'Geovana.24@gmail.com',
    limiteEmprestimos: 3
  },
  {
    id: 3,
    nome: 'Daylla Maria da Silva Lopes Nobrega Sãovesso',
    email: 'Daylla.sãovesso05@gmail.com',
    limiteEmprestimos: 3
  }
];

let emprestimos = [];

const multaPorDia = 1;

// ============================================================
// ROTA INICIAL
// ============================================================

app.get('/', (req, res) => {
  res.json({
    mensagem: 'API da Biblioteca funcionando!',
    status: 'online'
  });
});

// ============================================================
// ROTAS DE LIVROS
// ============================================================

// Listar todos os livros
app.get('/livros', (req, res) => {
  res.json(livros);
});

// Cadastrar livro
app.post('/livros', (req, res) => {
  const {
    titulo,
    autor,
    genero,
    anoPublicacao
  } = req.body;

  if (!titulo || !autor) {
    return res.status(400).json({
      erro: 'Título e autor são obrigatórios.'
    });
  }

  const livro = {
    id: livros.length + 1,
    titulo,
    autor,
    genero: genero || 'Geral',
    anoPublicacao: anoPublicacao || null
  };

  livros.push(livro);

  res.status(201).json({
    mensagem: 'Livro cadastrado com sucesso!',
    livro
  });
});

// ============================================================
// ROTAS DE EXEMPLARES
// ============================================================

// Listar exemplares
app.get('/exemplares', (req, res) => {
  res.json(exemplares);
});

// Cadastrar exemplar
app.post('/exemplares', (req, res) => {
  const livroId = Number(req.body.livroId);

  const livroExiste = livros.find(
    livro => livro.id === livroId
  );

  if (!livroExiste) {
    return res.status(404).json({
      erro: 'Livro não encontrado para este exemplar.'
    });
  }

  const exemplar = {
    id: exemplares.length
      ? exemplares[exemplares.length - 1].id + 1
      : 101,
    livroId,
    situacao: 'disponivel'
  };

  exemplares.push(exemplar);

  res.status(201).json({
    mensagem: 'Exemplar cadastrado com sucesso!',
    exemplar
  });
});

// ============================================================
// ROTAS DE LEITORES
// ============================================================

// Listar leitores
app.get('/leitores', (req, res) => {
  res.json(leitores);
});

// Cadastrar leitor
app.post('/leitores', (req, res) => {
  const {
    nome,
    email,
    limiteEmprestimos
  } = req.body;

  if (!nome || !email) {
    return res.status(400).json({
      erro: 'Nome e email são obrigatórios.'
    });
  }

  const leitor = {
    id: leitores.length + 1,
    nome,
    email,
    limiteEmprestimos: limiteEmprestimos || 3
  };

  leitores.push(leitor);

  res.status(201).json({
    mensagem: 'Leitor cadastrado com sucesso!',
    leitor
  });
});

// Histórico de empréstimos do leitor
app.get('/leitores/:id/historico', (req, res) => {
  const id = Number(req.params.id);

  const leitor = leitores.find(
    leitor => leitor.id === id
  );

  if (!leitor) {
    return res.status(404).json({
      erro: 'Leitor não encontrado.'
    });
  }

  res.json({
    leitor: leitor.nome,
    historico: emprestimos.filter(
      emprestimo => emprestimo.leitorId === id
    )
  });
});

// ============================================================
// ROTAS DE EMPRÉSTIMOS
// ============================================================

// Listar todos os empréstimos
app.get('/emprestimos', (req, res) => {
  res.json(emprestimos);
});

// Realizar empréstimo
app.post('/emprestimos', (req, res) => {
  const {
    leitorId,
    exemplarId,
    diasPrazo
  } = req.body;

  const leitor = leitores.find(
    leitor => leitor.id === Number(leitorId)
  );

  const exemplar = exemplares.find(
    exemplar => exemplar.id === Number(exemplarId)
  );

  // Verifica se leitor e exemplar existem
  if (!leitor || !exemplar) {
    return res.status(404).json({
      erro: 'Leitor ou Exemplar não encontrado.'
    });
  }

  // Verifica se o exemplar está disponível
  if (exemplar.situacao !== 'disponivel') {
    return res.status(400).json({
      erro: 'Este exemplar já está emprestado.'
    });
  }

  // Busca os empréstimos ativos do leitor
  const ativos = emprestimos.filter(
    emprestimo =>
      emprestimo.leitorId === leitor.id &&
      emprestimo.status === 'ativo'
  );

  // Verifica se existe algum empréstimo atrasado
  const possuiAtraso = ativos.some(
    emprestimo =>
      new Date(emprestimo.prazoDevolucao) < new Date()
  );

  if (possuiAtraso) {
    return res.status(400).json({
      erro: 'Empréstimo bloqueado: A leitora possui livros em atraso.'
    });
  }

  // Verifica o limite de empréstimos
  if (ativos.length >= leitor.limiteEmprestimos) {
    return res.status(400).json({
      erro: `Limite atingido: A leitora já possui ${ativos.length} de ${leitor.limiteEmprestimos} empréstimos permitidos.`
    });
  }

  // Datas
  const hoje = new Date();

  const prazo = new Date();

  prazo.setDate(
    hoje.getDate() + (diasPrazo || 7)
  );

  // Criação do empréstimo
  const emprestimo = {
    id: emprestimos.length + 1,
    leitorId: leitor.id,
    exemplarId: exemplar.id,
    dataEmprestimo: hoje.toLocaleDateString('pt-BR'),
    prazoDevolucao: prazo.toLocaleDateString('pt-BR'),
    dataDevolucao: null,
    multa: 0,
    status: 'ativo'
  };

  // Altera situação do exemplar
  exemplar.situacao = 'emprestado';

  // Salva empréstimo
  emprestimos.push(emprestimo);

  res.status(201).json({
    mensagem: 'Empréstimo realizado com sucesso!',
    emprestimo
  });
});

// ============================================================
// DEVOLUÇÃO DE EMPRÉSTIMO
// ============================================================

app.post('/emprestimos/:id/devolucao', (req, res) => {
  const emprestimo = emprestimos.find(
    emprestimo =>
      emprestimo.id === Number(req.params.id) &&
      emprestimo.status === 'ativo'
  );

  if (!emprestimo) {
    return res.status(404).json({
      erro: 'Empréstimo ativo não encontrado.'
    });
  }

  const hoje = new Date();

  const prazo = new Date(
    emprestimo.prazoDevolucao
  );

  let multa = 0;

  // Calcula multa caso haja atraso
  if (hoje > prazo) {
    const dias = Math.ceil(
      (hoje - prazo) /
        (1000 * 60 * 60 * 24)
    );

    multa = dias * multaPorDia;
  }

  // Finaliza empréstimo
  emprestimo.dataDevolucao =
    hoje.toLocaleDateString('pt-BR');

  emprestimo.multa = multa;

  emprestimo.status = 'finalizado';

  // Libera o exemplar
  const exemplar = exemplares.find(
    exemplar =>
      exemplar.id === emprestimo.exemplarId
  );

  if (exemplar) {
    exemplar.situacao = 'disponivel';
  }

  res.json({
    mensagem: 'Devolução registrada com sucesso!',
    multa: `R$ ${multa.toFixed(2)}`,
    emprestimo
  });
});

// ============================================================
// ROTA PARA ENDEREÇOS NÃO ENCONTRADOS
// ============================================================

app.use((req, res) => {
  res.status(404).json({
    erro: 'Rota não encontrada na API.'
  });
});

// ============================================================
// INICIAR SERVIDOR
// ============================================================

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`Acesse: http://localhost:${PORT}`);
});
