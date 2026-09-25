import express from 'express';
const app = express();
const PORT = 3000;

app.use(express.json());

let tarefas = [
    { id: 1, titulo: "O namorado", concluida: false },
    { id: 2, titulo: "Cosmos", concluida: false },
    { id: 3, titulo: "Dom Casmurro", concluida: true }
];

app.get('/', (req, res) => {
    res.send("API de Tarefas no ar");
});

app.get('/tarefas', (req, res) => {
    const { concluida } = req.query;

    if (concluida !== undefined) {
        const filtrarConcluida = concluida === 'true';
        const tarefasFiltradas = tarefas.filter(t => t.concluida === filtrarConcluida);
        return res.json(tarefasFiltradas);
    }

    res.json(tarefas);
});

app.get('/tarefas/:id', (req, res) => {
    const idParam = parseInt(req.params.id);
    const tarefaEncontrada = tarefas.find(t => t.id === idParam);

    if (!tarefaEncontrada) {
        return res.status(404).json({ error: "Tarefa não encontrada." });
    }

    res.json(tarefaEncontrada);
});

app.post('/tarefas', (req, res) => {
    const { titulo } = req.body;

    if (!titulo) {
        return res.status(400).json({ error: "O título é obrigatório." });
    }

    const novaTarefa = {
        id: tarefas.length + 1,
        titulo: titulo,
        concluida: false
    };

    tarefas.push(novaTarefa);
    res.status(201).json(novaTarefa);
});

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});