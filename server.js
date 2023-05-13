const express = require('express');
const app = express();
const cors = require('cors');
const path = require('path');
const verifyJWT = require('./middleware/verifyJWT');
require('dotenv').config();
const errorHandler = require('./middleware/errorHandler');
const { logEvents } = require('./middleware/logEvents');

const PORT = process.env.LISTENING_PORT;

// custom middleware logger
app.use(logEvents);

// Cross Origin Resource Sharing
//app.use(cors(corsOptions));
app.use(cors());

// built-in middleware to handle urlencoded form data
app.use(express.urlencoded({ extended: false }));

// built-in middleware for json 
app.use(express.json());

//serve static files
//app.use('/', express.static(path.join(__dirname, '/public')));


// routes
app.use('/auth', require('./routes/auth'));
app.use('/device', require('./routes/device'));
//app.use(verifyJWT);
app.use('/devicevar', require('./routes/devicevar'));
app.use('/schedule', require('./routes/schedule'));
app.use('/user', require('./routes/user'));
app.use('/project', require('./routes/project'));
app.use('/widgettype', require('./routes/widgettype'));
app.use('/dashboard', require('./routes/dashboard'));
app.use('/dashdevice', require('./routes/dashdevice'));
app.use('/dashwidget', require('./routes/dashwidget'));
app.use('/iotdata', require('./routes/iotdata'));
app.use('/generate', require('./routes/generateCode'));

/* app.all('*', (req, res) => {
    res.status(404);
    if (req.accepts('html')) {
        res.sendFile(path.join(__dirname, 'views', '404.html'));
    } else if (req.accepts('json')) {
        res.json({ "error": "404 Not Found" });
    } else {
        res.type('txt').send("404 Not Found");
    }
});
 */

// should be in the last line BEFORE app.listen()
app.use(errorHandler);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

