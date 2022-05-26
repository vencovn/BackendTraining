const { parse } = require ('node-html-parser');
const hmacSHA512 = require ('crypto-js/hmac-sha512');
const express = require('express');
const session = require('express-session');
const mysql = require("mysql2");
const multer = require('multer');
const cookieParser = require('cookie-parser');
const handlebars = require('express-handlebars');
const {engine} = require("express-handlebars");
const uuid = require('uuid');
const app = express()
const port = 3000

app.use(cookieParser('secret key'));
app.use(express.static(`${__dirname}/public`));
app.engine('handlebars',engine());
app.set('views', './views')
app.set('view engine', 'handlebars')

const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    database: "users",
    password: ""
});

app.use(
    session({
        secret: 'secret',
        saveUninitialized: true
    })
)

connection.connect(function (err) {
    if (err) {
        return console.error(err.message);
    } else
        console.log("success");
});

app.get('/', (req, res) => {
    res.render('home', { title: 'Greetings form Handlebars' })
})
app.get('/account', (req, res) => {
    console.log('Cookie: ', req.cookies['token']);
    let token = req.cookies['token']==null?undefined:req.cookies['token'];
    connection.query("SELECT * FROM users WHERE token = ?", [token], function (err, result){
        if (result.length) {
            let user = {
                name: result[0].name,
                lastname: result[0].lastname,
                email: result[0].email
            }
            res.render('account', {user});
        } else {
            res.send('Access denied');
        }
    });
})
app.get('/reg', (req, res)=>{
    res.sendFile(__dirname + "/reg.html")
})
app.get('/login', (req, res)=>{
    res.sendFile(__dirname + "/login.html")
})

app.post('/reg', multer().fields([]), (req, res) => {
    let sendResult = 'success';
    let email = req.body.email.toLowerCase();
    connection.query("SELECT id FROM users WHERE email=?", [email], function (err, res1){
        if(res1.length){
            console.log("exist");
            sendResult = 'exist';
            res.send(sendResult);
        }
        else{
            let password = (hmacSHA512(req.body.password, 'secret').toString());
            const user = [req.body.name, req.body.lastname, email, password];
            connection.query("INSERT INTO `users`(`name`, `lastname`, `email`, `password`) VALUES (?,?,?,?)", user,
                function (error, result, metadata) {
                    console.log(error);
                    console.log(result);
                    res.send(sendResult);
                })
        }
    })

})

app.post('/login', multer().fields([]), (req, res) => {
    let email = req.body.email.toLowerCase();
    connection.query("SELECT * FROM users WHERE email=?", [email], function (err, res1){
        console.log(res1)
        if (res1.length) {
            let password = (hmacSHA512(req.body.password, 'secret').toString());
            if (password === res1[0].password) {
                let uid = uuid.v4();
                connection.query("UPDATE users SET token = ? WHERE id = ?", [uid, res1[0].id]);
                res.cookie('token', uid);
                res.send('success');
            } else {
                res.send('error');
            }
        }
        else {
            res.send('error');
        }
    });
})

app.post('/addArticle', multer().fields([]), (req, res) => {
    const root = parse(req.body.content);
    console.log(root.querySelectorAll('img').getAttribute)
    const article = [req.body.title, req.body.content, req.body.author];
    console.log(article)
    connection.query("INSERT INTO `articles`(`title`, `content`, `author`) VALUES (?,?,?)", article, function (error, result){
        console.log(error);
        console.log(result);
        res.send('success');
    })
})

app.get('/logout', (req, res)=> {
    res.clearCookie('token');
    res.send('Cookies cleared successfully');
});

app.get('/addArticle', (req, res) => {
    res.render('addArticle', {});
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})