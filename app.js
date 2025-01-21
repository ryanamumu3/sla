// app.js

const express = require('express');
const { Sequelize, DataTypes } = require('sequelize');
const exphbs = require('express-handlebars');
const path = require('path');

// Inicializar app e banco de dados
const app = express();
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'database.sqlite'
});

// Definir modelo de Usuário
const User = sequelize.define('User', {
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

// Definir modelo de Anotação
const Annotation = sequelize.define('Annotation', {
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  }
});

// Sincronizar banco de dados
sequelize.sync();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.engine('handlebars', exphbs.engine());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// Rotas

// Rota inicial
app.get('/', (req, res) => {
  res.render('home');
});

// Formulário de registro
app.get('/register', (req, res) => {
  res.render('register');
});

// Processo de registro
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  try {
    await User.create({ username, password });
    res.redirect('/login');
  } catch (error) {
    res.status(500).send('Erro ao registrar usuário');
  }
});

// Formulário de login
app.get('/login', (req, res) => {
  res.render('login');
});

// Processo de login
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ where: { username } });
    if (user && user.password === password) {
      res.send('Login bem-sucedido');
    } else {
      res.status(401).send('Nome de usuário ou senha inválidos');
    }
  } catch (error) {
    res.status(500).send('Erro ao fazer login');
  }
});

// Rota para listar todas as anotações
app.get('/annotations', async (req, res) => {
  try {
    const annotations = await Annotation.findAll();
    res.render('annotations', { annotations });
  } catch (error) {
    res.status(500).send('Erro ao carregar anotações');
  }
});

// Rota para criar anotação
app.get('/create', (req, res) => {
  res.render('create');
});

// Rota para processar criação de anotação
app.post('/create', async (req, res) => {
  const { title, content } = req.body;
  try {
    await Annotation.create({ title, content });
    res.redirect('/annotations');
  } catch (error) {
    res.status(500).send('Erro ao criar anotação');
  }
});

// Rota para editar anotação
app.get('/edit/:id', async (req, res) => {
  const annotation = await Annotation.findByPk(req.params.id);
  res.render('edit', { annotation });
});

// Rota para atualizar anotação
app.post('/edit/:id', async (req, res) => {
  const { title, content } = req.body;
  try {
    const annotation = await Annotation.findByPk(req.params.id);
    annotation.title = title;
    annotation.content = content;
    await annotation.save();
    res.redirect('/annotations');
  } catch (error) {
    res.status(500).send('Erro ao atualizar anotação');
  }
});

// Rota para excluir anotação
app.post('/delete/:id', async (req, res) => {
  try {
    const annotation = await Annotation.findByPk(req.params.id);
    await annotation.destroy();
    res.redirect('/annotations');
  } catch (error) {
    res.status(500).send('Erro ao excluir anotação');
  }
});

app.listen(3000, () => {
  console.log('Servidor em execução...');
});
