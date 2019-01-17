var express = require('express')
var app = express()
var Crawler = require('crawler');
var crawler = new Crawler({
  maxConnections: 10,
});
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
app.get('/', function (req, res) {
  crawler.direct({
    uri: req.query.page,
    skipEventRequest: false, // default to true, direct requests won't trigger Event:'request'
    callback: function (error, { $, body, headers }) {
      if (error) {
        console.log(error);
      } else {
        if (['DENY', 'deny', 'same-origin', 'SAME-ORIGIN'].indexOf(headers['x-frame-options']) !== -1) {
          res.send({ embeddable: false, body });
        } else {
          res.send({ embeddable: true, body })
        }

      }
    }
  });
});

app.listen(3001, () => console.log(`Example app listening on port 3001`))
