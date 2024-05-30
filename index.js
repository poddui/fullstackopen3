const express = require('express')
const morgan = require('morgan');
const cors = require('cors')

const app = express();

app.use(cors())

app.use(express.json())

morgan.token('postData', (req, res) => {
    return JSON.stringify(req.body);
  });

app.use(morgan(':method :url :status :response-time ms - :postData'));


let persons = [
    {
        id: 1,
        name: "Arto Hellas",
        number: "040-123456"
      },
      {
        id: 2,
        name: "Ada Lovelace",
        number: "39-44-5323523",
      },
      {
        id: 3,
        name: "Dan Abramov",
        number: "12-43-234345",
      },
      {
        id: 4,
        name: "Mary Poppendieck",
        number: "39-23-6423122",
      },
      {
        id: 5,
        name: "Testi-ukko",
        number: "39-23-64122",
      }
]

const generateId = () => {
    const minId = 1;
    const maxId = 1000000;
    return Math.floor(Math.random()* (maxId - minId + 1) + minId)
  }

  app.post('/api/persons', (request, response) => {
    const body = request.body
    if (!body.name || !body.number) {
        return response.status(400).json({ error: 'name or number missing' });
      }
      const existingPerson = persons.find(person => person.name === body.name);
    if (existingPerson) {
        return response.status(400).json({ error: 'name must be unique' });
    }
    const newPerson = {
        id: generateId(),
        name: body.name,
        number: body.number || false,
    }
    persons = persons.concat(newPerson)
    response.json(newPerson)
  })


  app.get('/api/persons', (request, response) => {
    response.json(persons)
  })

  app.get('/info', (request, response) => {
    amount = persons.length
    const timestamp = new Date().toString();
    response.send(`<p>Phonebook has info for ${amount} people</p><p>${timestamp}</p>`);
  })

  app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const note = persons.find(note => note.id === id)
    if (note) {
      response.json(note)
    } else {
      response.status(404).end()
    }
  })

app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id);
    persons = persons.filter(person => person.id !== id);
    response.status(204).end();
})

app.use(morgan('tiny'));

  const PORT = process.env.PORT || 3001
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })