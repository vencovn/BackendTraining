const express = require('express')
const mysql = require("mysql2");
const app = express()
const port = 3000

const urlencodedParser = express.urlencoded({extended:false})

const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    database: "users",
    password: ""
});

connection.connect(function (err) {
    if (err) {
        return console.error(err.message);
    } else
        console.log("success");
});

app.get('/', (req, res) => {
    res.send('<a href="/reg">Registration</a>|<a href="/login">Login</a>')
})

app.get('/reg', (req, res)=>{
    res.sendFile(__dirname + "/reg.html")
})
app.get('/login', (req, res)=>{
    res.sendFile(__dirname + "/login.html")
})

app.post('/reg', urlencodedParser, (req, res) => {
    console.log(req.body)
    connection.query("SELECT id FROM users WHERE email=?", [req.body.email], function (err, res){
        if(res.length){console.log("exist")}
        else{
            const user = [req.body.name, req.body.lastname, req.body.email, req.body.password];
            connection.query("INSERT INTO `users`(`name`, `lastname`, `email`, `password`) VALUES (?,?,?,?)", user,
                function (error, result, metadata) {
                    console.log(error);
                    console.log(result);
                })
        }
    })
    res.send('success')
})

app.post('/login', urlencodedParser, (req, res) => {
    console.log(req.body)
    res.send('success')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})