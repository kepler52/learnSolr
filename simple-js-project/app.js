const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const solr = require('solr-client');
const app = express();

app.use(bodyParser.json());

// MySQL connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'testuser',
  password: 'testpassword',
  database: 'testdb'
});

db.connect(err => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL');
});

// Solr client
const solrClient = solr.createClient({
  host: 'localhost',
  port: '8983',
  core: 'mycore'
});

// Endpoint to add data to MySQL and Solr
app.post('/add', (req, res) => {
  const { id, name } = req.body;

  // Insert into MySQL
  const query = 'INSERT INTO users (id, name) VALUES (?, ?)';
  db.query(query, [id, name], (err, result) => {
    if (err) {
      console.error('Error inserting into MySQL:', err);
      return res.status(500).send('Error inserting into MySQL');
    }

    // Add to Solr
    const solrDoc = { id, name };
    solrClient.add(solrDoc, (err, obj) => {
      if (err) {
        console.error('Error adding to Solr:', err);
        return res.status(500).send('Error adding to Solr');
      }

      solrClient.commit((err, res) => {
        if (err) {
          console.error('Error committing to Solr:', err);
          return res.status(500).send('Error committing to Solr');
        }

        console.log('Document added to Solr');
      });

      res.send('Data added to MySQL and Solr');
    });
  });
});




// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
