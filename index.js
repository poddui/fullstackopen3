const express = require('express')
const morgan = require('morgan');
const cors = require('cors')
const mongoose = require('mongoose');
require('dotenv').config()
const Person = require('./models/person.js')

const app = express();

app.use(cors())
app.use(express.json())
app.use(express.static('dist'))

const validatePhoneNumber = (req, res, next) => {
  const { number } = req.body;
  const phoneNumberRegex = /^(\d{2,3})-(\d{5,})$/;

  if (!phoneNumberRegex.test(number)) {
    return res.status(400).json({ error: 'Phone number must be in the format XX-XXXXXXX or XXX-XXXXXXX' });
  }
  next();
};

morgan.token('postData', (req, res) => {
    return JSON.stringify(req.body);
});

app.use(morgan(':method :url :status :response-time ms - :postData'));


app.post('/api/persons', validatePhoneNumber, (request, response, next) => {
  const body = request.body
  if (!body.name) {
    return response.status(400).json({ error: 'name missing' })
  }
  const person = new Person({
    name: body.name,
    number: body.number,
  })
  person.save().then(savedPerson => {
    response.json(savedPerson);
  }).catch(error => {
    console.error('Error saving person:', error);
  })
});

app.get('/api/persons', (request, response, next) => {
  Person.find({}).then(persons => {
    response.json(persons)
  })
  .catch(error => next(error));
});

app.get('/info', (request, response) => {
  Person.countDocuments({})
  .then(count => {
    const timestamp = new Date().toString();
    response.send(`<p>Phonebook has info for ${count} people</p><p>${timestamp}</p>`);
  })
})

app.get('/api/persons/:id', (request, response) => {
  Person.findById(request.params.id)
  .then(person => {
    if (person) {
      response.json(person)
    } else {
      response.status(404).end()
    }
  })
  .catch(error => {
    console.log(error)
    response.status(400).send({ error: 'malformatted id' })
  })
});

// Jos henkilön nimi löytyy tietokannasta tämä päivittää numeron uusiksi.
app.put('/api/persons/:id', validatePhoneNumber, (request, response, next) => {
  const id = request.params.id;
  const body = request.body;
  const person = {
    name: body.name,
    number: body.number,
  };
  Person.findByIdAndUpdate(id, person, { new: true, runValidators: true, context: 'query' })
    .then(updatedPerson => {
      response.json(updatedPerson);
    })
    .catch(error => next(error));
});

app.delete('/api/persons/:id', (request, response, next) => {
  const id = request.params.id;
  Person.findByIdAndDelete(id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }
  next(error)
}

app.use(errorHandler)

  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })

