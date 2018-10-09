const express = require('express');
var bodyParser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql');

var app = express();
const port = 1997;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

const conn = mysql.createConnection({
    host: 'localhost',
    user: 'saitama',
    password: 'abc123',
    database: 'manga',
    port: 3306
});

app.get('/', (req, res) => {
    res.send('<h1>API Manga Awesome Active!</h1>');
});

app.post('/category', (req,res) => {
    const { name } = req.body;
    var data = { 
        Name: name,
    };
    var sql = 'INSERT INTO category SET ?';
    conn.query(sql, data, (err, results) => {
        if(err) throw err;
        var sql1 = `select * from category;`;
        conn.query(sql1, (err1, results1) => {
            if(err1) throw err1;
            
            res.send(results1);
        })
    })
})

app.post('/book', (req,res) => {
    const { title, author, status, listcategory } = req.body;
    var data = { 
        Title: title,
        Author: author,
        Status: status
    };
    var sql = 'INSERT INTO book SET ?';
    conn.query(sql, data, (err, results) => {
        if(err) throw err;

        if(listcategory.length > 0) {
            sql = "INSERT INTO bookcat (BookId, CatId) VALUES ?";
            var values = [];
            for(var i=0; i < listcategory.length; i++) {
                values.push([results.insertId, listcategory[i]]);
            }
            conn.query(sql, [values], (err1, results1) => {
                if(err1) throw err1;
                sql = `select * from book;`;
                conn.query(sql, (err2, results2) => {
                    if(err2) throw err2;
            
                    res.send(results2);
                }) 
            })
        }
        else {
            sql = `select * from book;`;
            conn.query(sql, (err2, results2) => {
                if(err2) throw err2;
                
                res.send(results2);
            })
        }
    })
})

app.listen(port, () => console.log('API Active at localhost:1997!'));