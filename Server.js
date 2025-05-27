const express = require('express');
const app = express();
const port = process.env.PORT || 3000; // Render define a porta via process.env.PORT

// Middleware para processar JSON no corpo das requisições
app.use(express.json());

// --- Variável para "simular" um comando pendente (PARA TESTES INICIAIS) ---
// Em produção, isso viria de um banco de dados ou de um mecanismo de fila.
let pendingCommandForEsp = null; // Ex: { deviceId: 'esp8266-portao', command: 'abrir_portao' }

// --- Endpoint Existente para receber comandos do ESP (POST) ---
app.post('/comando', (req, res) => {
  const { acao, id_dispositivo } = req.body;
  console.log(`[POST /comando] Recebido do ESP: Ação=${acao}, ID=${id_dispositivo}`);
  // Aqui você processaria o comando recebido do ESP, talvez salvando em um DB
  // ou acionando outra lógica.
  res.status(200).json({ status: 'Comando recebido com sucesso', acao_recebida: acao });
});

// --- NOVO ENDPOINT: Para o ESP buscar comandos (GET) ---
// O ESP fará uma requisição GET para este endpoint periodicamente.
// Ex: GET https://servidor-portao-1.onrender.com/check_commands/esp8266-portao
app.get('/check_commands/:deviceId', (req, res) => {
  const deviceId = req.params.deviceId;
  console.log(`[GET /check_commands/${deviceId}] ESP solicitou comandos.`);

  if (pendingCommandForEsp && pendingCommandForEsp.deviceId === deviceId) {
    const commandToSend = { ...pendingCommandForEsp }; // Cria uma cópia para não alterar o original ainda
    pendingCommandForEsp = null; // Limpa o comando após enviar (muito importante!)
    console.log(`[GET /check_commands/${deviceId}] Enviando comando:`, commandToSend.command);
    return res.status(200).json({ command: commandToSend.command });
  } else {
    console.log(`[GET /check_commands/${deviceId}] Nenhum comando pendente.`);
    return res.status(200).json({ command: null }); // Retorna nulo se não houver comando
  }
});

// --- NOVO ENDPOINT: Para uma interface (web/app) solicitar um comando (POST) ---
// Esta rota seria chamada por sua interface de usuário (app ou web) para enviar um comando ao ESP.
app.post('/solicitar_comando', (req, res) => {
  const { deviceId, command } = req.body; // Espera { deviceId: '...', command: '...' }
  if (!deviceId || !command) {
    return res.status(400).json({ error: 'ID do dispositivo e comando são necessários.' });
  }

  // Armazena o comando para que o ESP possa buscá-lo no próximo polling
  pendingCommandForEsp = { deviceId, command };
  console.log(`[POST /solicitar_comando] Comando "${command}" agendado para o dispositivo: ${deviceId}`);
  res.status(202).json({ status: 'Comando agendado para envio', command_scheduled: command });
});


// Rota principal (opcional, apenas para testar se o servidor está no ar)
app.get('/', (req, res) => {
  res.send('Servidor do Portão Online!');
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
