const express = require('express');
const app = express();
const record = require('./actions/recorder');
app.use(express.static(__dirname + '/public'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get('/record' , record);

app.listen(3000, ()=> {console.log('Listening to PORT 3000')} );