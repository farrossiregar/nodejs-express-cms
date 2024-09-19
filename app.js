const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const session = require('express-session');
const flash = require('connect-flash');
const { Sequelize, DataTypes } = require('sequelize');
const app = express();

// Database setup
const sequelize = new Sequelize('cms_db', 'root', '', {
    host: 'localhost',
    dialect: 'mysql'
});

// Define Article model
const Article = sequelize.define('Article', {
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false
    }
});

// Middleware setup
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false
}));
app.use(flash());

// Routes
app.get('/', async (req, res) => {
    try {
        const articles = await Article.findAll();
        // const articles = await Article.findAll(where : {title:'Title1'}},{order:['id','DESC']});
        res.render('index', { articles, success_msg: req.flash('success_msg'), error_msg: req.flash('error_msg') });
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Unable to fetch articles');
        res.redirect('/');
    }
});

app.get('/articles/new', (req, res) => {
    res.render('new');
});

app.post('/articles', async (req, res) => {
    try {
        const { title, content } = req.body;
        await Article.create({ title, content });
        req.flash('success_msg', 'Article added successfully');
        res.redirect('/');
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Error adding article');
        res.redirect('/articles/new');
    }
});

app.get('/articles/:id/edit', async (req, res) => {
    try {
        const article = await Article.findByPk(req.params.id);
        res.render('edit', { article });
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Error fetching article');
        res.redirect('/');
    }
});

app.put('/articles/:id', async (req, res) => {
    try {
        const { title, content } = req.body;
        await Article.update({ title, content }, {
            where: { id: req.params.id }
        });
        req.flash('success_msg', 'Article updated successfully');
        res.redirect('/');
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Error updating article');
        res.redirect(`/articles/${req.params.id}/edit`);
    }
});

app.delete('/articles/:id', async (req, res) => {
    try {
        await Article.destroy({
            where: { id: req.params.id }
        });
        req.flash('success_msg', 'Article deleted successfully');
        res.redirect('/');
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Error deleting article');
        res.redirect('/');
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
