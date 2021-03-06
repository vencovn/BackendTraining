const http = require("http");
const mysql = require("mysql2");

http.createServer(function(request, response){
    let data = [];
    let result;
    request.on("data", chunk => {
        data.push(chunk);
    });
    request.on("end", () => {
        if(data.length) {
            data = Buffer.concat(data).toString();
            let g = new URLSearchParams(data);
            result = Object.fromEntries(g);
            console.log(result);

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
            // connection.query("SELECT id FROM users WHERE email=?", [result.email], function (err, res){
            //     if(res.length){console.log("exist")}
            //     else{
            //         const user = [result.name, result.lastname, result.email, result.password];
            //         connection.query("INSERT INTO `users`(`name`, `lastname`, `email`, `password`) VALUES (?,?,?,?)", user,
            //             function (error, result, metadata) {
            //                 console.log(error);
            //                 console.log(result);
            //             })
            //     }
            // })
            connection.query("SELECT * FROM users WHERE email=? AND password=?", [result.email, result.password], function (err, res) {
                if (res.length){
                    console.log('Login successful')
                } else console.log('Login failed')
            })
        }
        response.end("Data received successfully");
    });
}).listen(3000);