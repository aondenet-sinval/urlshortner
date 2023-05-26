require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const dns = require('dns');
const bodyParser = require('body-parser')
const port = process.env.PORT || 3000;

function verificarURL(url) {
  const hostname = new URL(url).hostname;

  dns.lookup(hostname, (err, address) => {
    if (err) {
      console.error(err);
      return;
    }
    return url
  });
}
app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Primeiro endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});
app.use(bodyParser.urlencoded({extended: false}))

// Armazenamento temporário para os URLs curtos e originais
const urlData = {};

// Rota POST para /api/shorturl
app.post('/api/shorturl', (req, res) => {
  const { url } = req.body;
  // Verifica se a URL original foi fornecida
  if (!url) {
    return res.status(400).json({ error: 'A URL é obrigatória.' });
  }
  const validarUrl = verificarURL(url);
  // console.log('validarUrl ', validarUrl);
  if (validarUrl === url) {
    return res.status(400).json({ error: 'invalid url' });
  }
  // Gere um número aleatório como URL curto
  const shortUrl = Math.floor(Math.random() * 100000)
  // Salva a URL original e a URL curta
  urlData[shortUrl] = url;
  // Retorna a resposta em JSON com as propriedades original_url e short_url
  res.json({ original_url: url, short_url: shortUrl });
});
// Rota GET para redirecionar o usuário para a URL original
app.get('/api/shorturl/:short_url', (req, res) => {
  const { short_url } = req.params;
  // Verifica se a URL curta existe no armazenamento
  if (urlData.hasOwnProperty(short_url)) {
    // Redireciona para a URL original
    res.redirect(urlData[short_url]);
  } else {
    // Retorna um erro se a URL curta não existir
    res.status(404).json({ error: 'URL curta não encontrada.' });
  }
});
app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
