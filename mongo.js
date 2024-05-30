const mongoose = require('mongoose');

if (process.argv.length < 3) {
  console.log('give password as argument');
  process.exit(1);
}

const password = process.argv[2];

const url = `mongodb+srv://bgx174:${password}@cluster0.rqlmf0l.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

mongoose.set('strictQuery', false);
mongoose.connect(url);

const noteSchema = new mongoose.Schema({
  name: String,
  number: String,
});

const Person = mongoose.model('Person', noteSchema);

if (process.argv.length === 3) {
    Person.find({}).then(result => {
      console.log('phonebook:');
      result.forEach(person => {
        console.log(person.name, person.number);
      });
      mongoose.connection.close();
    });
  } else if (process.argv.length === 5) {
    const person = new Person({
      name: process.argv[3],
      number: process.argv[4],
    });
  
    person.save().then(() => {
      console.log(`added ${person.name} number ${person.number} to phonebook`);
      mongoose.connection.close();
    });
  } else {
    console.log('Tarkasta muoto: "Nimi" ja "Numero"');
    process.exit(1);
  }