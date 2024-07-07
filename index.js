const { faker } = require("@faker-js/faker");
const mysql = require("mysql2");
const express = require("express");
const app = express();
const path = require("path");
const methodOverride = require('method-override');
const { v4: uuidv4 } = require('uuid');




app.use(methodOverride('_method'));
app.use(express.urlencoded({extended : true}));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));

app.use(express.static(path.join(__dirname, "public/css")));


const connection = mysql.createConnection({
    host : "localhost",
    user : "root",
    password : "Hassam@5024",
    database: "test",
    
});

let getRandomUser = () =>  {
    return [
        faker.string.uuid(),
      faker.internet.userName(),
      faker.internet.email(),
      faker.internet.password(),
      
    ];
  }


  //home page
app.get("/", (req, res) => {
    let q = "SELECT count(*) FROM user";
    try {
    connection.query(q, (err, result, field) => {
        if(err) throw err;
        let count = result[0]["count(*)"];
        console.log(count);
        res.render("index.ejs", {count});
    });
    
} catch(err) {
    console.log(err);
    res.send("some error in DB");
}

});


//show rout

app.get("/user", (req, res) => {
    let q = "SELECT id, email, username FROM user";
    try {
    connection.query(q, (err, users, field) => {
        if(err) throw err;

        res.render("showusers.ejs", {users});
        
       
    });
    
} catch(err) {
    console.log(err);
    res.send("some error in DB");
}
})

//edit rout
app.get("/user/:id/edit", (req, res) => {
    let {id} = req.params;
    let q = `SELECT * FROM user WHERE id = '${id}'`;

    try {
    connection.query(q, (err, result) => {
        if(err) throw err;
        let user = result[0];
        res.render("edituser.ejs", {user});
    });
    
} catch(err) {
    console.log(err);
    res.send("some error in DB");
}
    
});

//UPDATE DB 

app.patch("/user/:id", (req, res) => {
    let {id} = req.params;
    let q = `SELECT * FROM user WHERE id = '${id}'`;
    let {password:formPass, username: newUsername} = req.body;
    
   try {
    connection.query(q, (err, result) => {
        if(err) throw err;
        let user = result[0];
        if(formPass != user.password) {
            res.send("Wrong Password");
        }else {
            let q2 = `UPDATE user SET username = "${newUsername}" WHERE id="${id}"`;
            connection.query(q2, (err, result) => {
                if(err) throw err;
                res.redirect("/user");
            });

        }
    });
    }catch(err) {
        console.log(err);
        res.send("some error in DB");
   }

});

app.get("/user/adduser", (req, res) => {
    res.render("adduser.ejs");

    
}); 

app.post("/user/adduser", (req, res) => {
    let id = uuidv4();
    let {username, email, password} = req.body;

    let q = `INSERT INTO user (id, username, email, password) VALUES ("${id}", "${username}", "${email}", "${password}")`;
    try {
        connection.query(q, (err, result) => {
            if(err) throw err;
            
            res.redirect("/user");
        })
    }catch(err) {
        res.send("some error in DB");
    }

});

app.get("/user/:id/delete", (req, res) => {
    let {id} = req.params;
    let q = `SELECT * FROM user WHERE id="${id}"`;
    try {
        connection.query(q, (err, result) => {
            if(err) throw err;
            let user = result[0];
            res.render("delete.ejs", {user});
        })
    }catch(err) {
        res.send("some error in DB");
    }
});

app.delete("/user/:id", (req, res) => {
    let {id} = req.params;
    let {password} = req.body;
    let q = `SELECT * FROM user WHERE id = "${id}"`;
    try {
        connection.query(q, (err, result) => {
            if(err) throw err;
            let user = result[0];
            if(user.password != password) {
                res.send("WRONG password entered!");
            }else {
                let q2 = `DELETE FROM user WHERE id="${id}"`;
                connection.query(q2, (err, result) => {
                    if(err) throw err;
                    else {
                        console.log(result);
                        console.log("Deleted");
                        res.redirect("/user");
                    }
                })
            }
            
            
        })
    }catch(err) {
        res.send("some error in DB");
    }
})
  
app.listen(8080, () => {
    console.log(`Server is listening on 8080`);
})