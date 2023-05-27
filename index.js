require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const dns = require('dns');
const bodyParser = require('body-parser')
const url = require('url');
const port = process.env.PORT || 3000;

function verificarDNS(url) {
  const hostname = new URL(url).href
  dns.lookup(hostname, (err, address) => {
    if (err) {
      return 0
    }
    return 1
  });
}
function verificarURL(url) {
  var urlPattern = /^(https?:\/\/)?(www\.)?([a-z0-9-]+\.)+[a-z]{2,}(\/.*)?$/i;

  if (!urlPattern.test(url)) {
    return 0
  } else {
    verificarDNS(url)
    return 1;
  }
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
app.post('/api/shorturl', (req, res, next) => {
  const { url } = req.body;
  // Verifica se a URL original foi fornecida
  if (!url) {
    return res.status(400).json({ error: 'A URL é obrigatória.' });
  }
  // Verifica se o url válido possui ip válido
  const validarUrl = verificarURL(url);
  // console.log('validarUrl ', validarUrl);
  if (validarUrl === 0) {
    return res.json({ error: 'invalid url' });
  }
  // Gere um número aleatório como URL curto
  const shortUrl = Math.floor(Math.random() * 100000)
  // Salva a URL original e a URL curta
  urlData[shortUrl] = url;
  // Retorna a resposta em JSON com as propriedades original_url e short_url
  if (url && shortUrl) {
    return res.json({ original_url: url, short_url: shortUrl });
  }
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
