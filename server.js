const express = require('express');
const path = require('path');
const fs = require('fs');


const PORT = process.env.PORT || 3001;

const app = express();


// Middleware for parsing JSON and urlencoded form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(express.static('public'));

app.get('/api/notes', (req, res) => {
  res.sendFile(path.join(__dirname, '/db/db.json'));
});

app.post('/api/notes', (req, res) => {
 
  if (req.body) { const { title, text } = req.body;
    const newNote = {
      title,
      text,
      id: Math.floor(Math.random() * 1000),
    };
    fs.readFile('./db/db.json', 'utf8', (err, data) => {
      if (err) {
        console.error(err);
      } else {
        const allNotes = JSON.parse(data);
        allNotes.push(newNote);
        fs.writeFile('./db/db.json', JSON.stringify(allNotes, null, 4), (err) =>
          err ? console.error(err) : console.info('Note added!')
        );
      }
    });
    const response = {
      status: 'success',
      body: newNote,
    };
    res.json(response);
  } else {
    res.json('Error in posting note');
  }
});

app.delete('/api/notes/:id', (req, res) => {
  const noteId = req.params.id;
  fs.readFile('./db/db.json', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      const response = {
        status: 'error',
        body: err,
      };
      res.json(response);
    } else {
      try {
        const allNotes = JSON.parse(data);
        const newAllNotes = allNotes.filter((note) => note.id != noteId);
        fs.writeFile('./db/db.json', JSON.stringify(newAllNotes, null, 4), (err) => {
          if (err) {
            console.error(err)
            const response = {
              status: 'error',
              body: err,
            };
            res.json(response);
          }else {
            console.info('Note deleted!')
            const response = {
              status: 'success',
              body: noteId,
            };
            res.json(response);
          }
        });
      } catch (err) {
        console.error(err)
        const response = {
          status: 'error',
          body: err,
        };
        res.json(response);
      }
    }
  });
});

// GET Route for feedback page
app.get('/notes', (req, res) =>
  res.sendFile(path.join(__dirname, '/public/notes.html'))
);


// Wildcard route to direct users to a 404 page
app.get('*', (req, res) =>
  res.sendFile(path.join(__dirname, '/public/index.html'))
);



app.listen(PORT, () =>
  console.log(`App listening at http://localhost:${PORT}`)
);


