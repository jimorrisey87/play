const path = require('path');

function send404(req, res) {
    res.status(404);

    return req.accepts('html')
        ? res.sendFile(path.join(__dirname, '..', 'views', '404.html'))
        : req.accepts('json') 
            ? res.json({ "error": "404 Not Found" }) 
            : res.type('txt').send("404 Not Found");
}

module.exports = send404;