const express = require('express');
const app = express();

app.use(express.static(__dirname + '/public'));


app.listen(3000, ()=> {console.log('Listening to PORT 3000')} );