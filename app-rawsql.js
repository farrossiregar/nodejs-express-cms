const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const session = require('express-session');
const flash = require('connect-flash');
const path = require('path');
app.use(express.static(path.resolve('./public')));
const app = express();

// Database connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', // your MySQL username
    password: '', // your MySQL password
    database: 'cms_db'
});

db.connect(err => {
    if (err) {
        throw err;
    }
    console.log('MySQL Connected...');
});

// Middleware
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

// Set Global Variables
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    next();
});

// Routes
app.get('/', (req, res) => {
    const query = 'SELECT * FROM articles ORDER BY created_at DESC';
    db.query(query, (err, results) => {
        if (err) throw err;
        res.render('index', { articles: results });
    });
});

app.get('/articles/new', (req, res) => {
    res.render('new');
});

app.post('/articles', (req, res) => {
    const { title, content } = req.body;
    const query = 'INSERT INTO articles (title, content) VALUES (?, ?)';
    db.query(query, [title, content], (err, result) => {
        if (err) throw err;
        req.flash('success_msg', 'Article added successfully');
        res.redirect('/');
    });
});

app.get('/articles/:id/edit', (req, res) => {
    const query = 'SELECT * FROM articles WHERE id = ?';
    db.query(query, [req.params.id], (err, result) => {
        if (err) throw err;
        res.render('edit', { article: result[0] });
    });
});

app.put('/articles/:id', (req, res) => {
    const { title, content } = req.body;
    const query = 'UPDATE articles SET title = ?, content = ? WHERE id = ?';
    db.query(query, [title, content, req.params.id], (err, result) => {
        if (err) throw err;
        req.flash('success_msg', 'Article updated successfully');
        res.redirect('/');
    });
});

app.delete('/articles/:id', (req, res) => {
    const query = 'DELETE FROM articles WHERE id = ?';
    db.query(query, [req.params.id], (err, result) => {
        if (err) throw err;
        req.flash('success_msg', 'Article deleted successfully');
        res.redirect('/');
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
