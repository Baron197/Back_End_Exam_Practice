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
// const conn = mysql.createConnection({
//     host: 'www.db4free.net',
//     user: 'baron197',
//     password: 'Baron197;',
//     database: 'manga197',
//     port: 3306
// });

app.get('/', (req, res) => {
    res.send('<h1>API Manga Awesome Active!</h1>');
});

app.get('/book', (req,res) => {
    const { listcategory } = req.query;

    if (listcategory) {
        // var sql = `select b.* from book b join bookcat bc on b.Id = bc.BookId
        //             where bc.CatId = ${listcategory[0]}`;
        // for(var i = 1; i < listcategory.length; i++) {
        //     sql += ` or bc.CatId = ${listcategory[i]}`
        // }
        // sql += ` group by b.Id having count(*) > ${listcategory.length-1};`
        var sql = `select b.* from book b join bookcat bc on b.Id = bc.BookId
                    where bc.CatId in (?) group by b.Id having count(*) >= ${listcategory.length};`;
        conn.query(sql, [listcategory], (err, results) => {
            if(err) throw err;
            
            res.send(results);
        })
    }
    else {
        var sql = `select distinct b.* from book b join bookcat bc on b.Id = bc.BookId`;
        conn.query(sql, (err, results) => {
            if(err) throw err;

            res.send(results);
        })
    }
})

app.put('/book/:id', (req,res) => {
    var { id } = req.params;
    var { title, author, status, listcategory } = req.body;
    var data = { 
        Title: title,
        Author: author,
        Status: status
    }
    var sql = `UPDATE book SET ? WHERE Id = ${id}`;
    conn.query(sql,data,(err, results) => {
        if(err) throw err;

        sql = `DELETE FROM bookcat WHERE BookId = ${id}`;
        conn.query(sql, (err1, results1) => {
            if(err1) throw err1;

            if(listcategory.length > 0) {
                sql = "INSERT INTO bookcat (BookId, CatId) VALUES ?";
                var values = [];
                for(var i=0; i < listcategory.length; i++) {
                    values.push([id, listcategory[i]]);
                }
                conn.query(sql, [values], (err2, results2) => {
                    if(err2) throw err2;
                    sql = `select * from book;`;
                    conn.query(sql, (err3, results3) => {
                        if(err3) throw err3;
                
                        res.send(results3);
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
})

app.put('/category/:id', (req,res) => {
    var { id } = req.params;
    var { nama } = req.body;
    var data = {
        Name: nama
    }
    var sql = `UPDATE category SET ? WHERE Id = ${id}`;
    conn.query(sql, data, (err, results) => {
        if(err) throw err;

        sql = `SELECT * from category`;
        conn.query(sql, (err1, results1) => {
            if(err1) throw err1;

            res.send(results1);
        })
    })
})

app.delete('/book/:id', (req,res) => {
    var { id } = req.params;

    var sql = `DELETE FROM book b join bookcat 
                bc on b.Id = bc.BookId where b.Id = ${id}`;
    conn.query(sql, (err, results) => {
        if(err) throw err;

        sql = `SELECT * FROM book`;
        conn.query(sql, (err1, results1) => {
            if(err1) throw err1;

            res.send(results1);
        })
    })
})

app.delete('/category/:id', (req,res) => {
    var { id } = req.params;

    var sql = `DELETE FROM category where Id = ${id}`;
    conn.query(sql, (err, results) => {
        if(err) throw err;

        sql = `DELETE FROM bookcat where CatId = ${id}`;
        conn.query(sql, (err1, results1) => {
            if(err1) throw err1;

            sql = `SELECT * FROM category`;
            conn.query(sql, (err2, results2) => {
                if(err2) throw err2;

                res.send(results2);
            })
        })
    })
})

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