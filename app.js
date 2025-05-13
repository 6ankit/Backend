const express = require("express");
const { Client } = require("pg");
const cors = require("cors");
const cookieParser = require('cookie-parser');

const app = express();
app.use(cors());
app.use(cookieParser());
app.use(express.json());

// External PostgreSQL connection using the external database URL
const connection = new Client({
  connectionString: "postgresql://root:IwwZUnHsePtgC5MaRpJtev0kb1BviY5h@dpg-d0hcmtruibrs739k0jo0-a.oregon-postgres.render.com/source_app",
  ssl: { rejectUnauthorized: false } // Enabling SSL
});

const connection2 = new Client({
  connectionString: "postgresql://root:IwwZUnHsePtgC5MaRpJtev0kb1BviY5h@dpg-d0hcmtruibrs739k0jo0-a.oregon-postgres.render.com/source_app",
  ssl: { rejectUnauthorized: false } // Enabling SSL
});

connection.connect();
connection2.connect();

app.get("/Post", (req, res) => {
  connection2.query("SELECT * FROM post", (err, result) => {
    if (err) {
      console.error("Error fetching posts:", err);
      res.status(500).send("Error fetching posts");
    } else {
      res.send(result.rows);  // PostgreSQL result.rows
    }
  });
});

app.post("/newPost", (req, res) => {
  const { name, description } = req.body;

  if (!name || !description) {
    return res.status(400).send("Missing name or description");
  }

  const query = "INSERT INTO post (name, description) VALUES ($1, $2)";
  connection2.query(query, [name, description], (err, result) => {
    if (err) {
      console.error("Database insert error:", err);
      res.status(500).send("Failed to save post");
    } else {
      res.send("Post saved successfully");
    }
  });
});

app.post("/Login", (req, res) => {
  const { email, password } = req.body;

  // Using parameterized query to prevent SQL Injection
  connection.query('SELECT * FROM "user" WHERE email = $1 AND password = $2', [email, password], (err, result) => {
    if (err) {
      console.error("Error executing query:", err);
      return res.status(500).send("Error during login");
    }

    if (result.rows.length > 0) {
      res.send(true); // User found
    } else {
      res.send(false); // No user found
    }
  });
});

app.post("/Singup", (req, res) => {
  const { email, password } = req.body;

  // Use placeholders to prevent SQL injection
  connection.query('INSERT INTO "user" (email, password) VALUES ($1, $2)', [email, password], (err, result) => {
    if (err) {
      console.error("Error during signup:", err);
      res.status(500).send("Signup failed");
    } else {
      res.send(true);
      console.log("Signup successful");
    }
  });
});

app.get("/", (req, res) => {
  try {
    connection.query('SELECT * FROM "user"', (err, result) => {
      if (err) {
        console.error("Error fetching users:", err);
        res.status(500).send("Error fetching users");
      } else {
        res.send(result.rows); // PostgreSQL result.rows
      }
    });
  } catch (err) {
    console.error("Error during fetch:", err);
    res.status(500).send("Internal Server Error");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
