const express =  require('express');
const nunjucks = require('nunjucks');
const Pool = require('pg').Pool;

const server = express();

//Configuração do servidor para arquivos estáticos
server.use(express.static('public'));

//Habilitar o body - corpo do formulário
server.use(express.urlencoded({extended: true}));

//Configuração com o banco de dados
const db = new Pool({
  user: 'postgres',
  password: 'root',
  host: 'localhost',
  port: '5432',
  database: 'doe'
});

//Configuração do servidor template
nunjucks.configure("./", {
  express: server,
  noCache: true, //0 ou 1 boolean-> para não ficar recebendo os dados do cache
});

//configuração para rendenização da página
server.get("/", function(req,res) {
  db.query("SELECT * FROM donors", function(err, result){
    if(err) return res.send("Erro de banco de dados.");

    const donors = result.rows;
    return res.render("index.html", { donors });
  });
});

server.post("/", function(req, res){
  const {name, email, blood} = req.body;
  //Adiciona ao banco de dados

  if(name == "" || email == "" || blood == ""){
    return res.send("Todos os campos são obrigatórios");
  }

  const query = `
    INSERT INTO donors ("name", "email", "blood") 
    VALUES ($1, $2, $3)
  `;

  const values = [name, email, blood];

  db.query(query, values, function(err){
    if(err) return res.send("Erro no banco de dados.");

    return res.redirect("/");
  });
});

server.listen(3001);