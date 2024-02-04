const express = require('express');
const path = require('path');
const fs = require('fs');


const PORT = process.env.PORT || 3001;

const app = express();


// Middleware for parsing JSON and urlencoded form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(express.static('public'));

 // Send the contents of the 'db.json' file as a response
  // __dirname is a variable that holds the absolute path of the current script
  // path.join is used to construct the absolute path to the 'db.json' file
app.get('/api/notes', (req, res) => {
  res.sendFile(path.join(__dirname, '/db/db.json'));
});

// route for handling POST requests to '/api/notes'
app.post('/api/notes', (req, res) => {
  // Check if the request body contains data
  // generates an ID for the note and adds it to the request body - the number is multiplied by 1000 to ensure they are unique
  if (req.body) { const { title, text } = req.body;
    const newNote = {
      title,
      text,
      id: Math.floor(Math.random() * 1000),
    };
    // Read the contents of the 'db.json' file asynchronously
// 'utf8' specifies the encoding of the file content (text format)
    fs.readFile('./db/db.json', 'utf8', (err, data) => {
      if (err) {
        console.error(err);
      } else {
         // Check for errors during file reading
           // If file reading is successful, parse the JSON data from the file
        const allNotes = JSON.parse(data);
         // Add the newly created note (newNote) TO THE EXISTING ARRAY OF NOTES (allNotes)
        allNotes.push(newNote);
           // Write the updated array of notes back to the 'db.json' file
    // 'JSON.stringify' converts the array of notes to a JSON-formatted string
    // 'null, 4' makes it more pretty and legible for people to read
        fs.writeFile('./db/db.json', JSON.stringify(allNotes, null, 4), (err) =>
          // Check for errors during file writing - if its successful, log a success message
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

// a route for handling DELETE requests to '/api/notes/:id'
app.delete('/api/notes/:id', (req, res) => {
   // take the 'id' parameter from the request URL
  const noteId = req.params.id;
   // Read the contents of the 'db.json' file asynchronously
  fs.readFile('./db/db.json', 'utf8', (err, data) => {
    if (err) {
        // Check for errors
      console.error(err);
      const response = {
        status: 'error',
        body: err,
      };
       // If an error occurs, send a JSON response with error status and details
      res.json(response);
    } else {
      try {
         // If file reading is SUCCESSFUL, parse the JSON data from the file
        const allNotes = JSON.parse(data);
        // Filter out the note with the specified 'id' from the array of notes - CREATING A NEW ARRAY OF NOTES - exxentially presenting a new array of notes that does not include the note with the specified 'id'
        const newAllNotes = allNotes.filter((note) => note.id != noteId);
        fs.writeFile('./db/db.json', JSON.stringify(newAllNotes, null, 4), (err) => {
          if (err) {
            // the whole way through we are going to be checking for error and if there is an error we are going to console log it and send a response back to the client
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


