//imports
var express = require('express');
var bodyParser = require('body-parser');
var apiRouter = require('../apiRouter').router;

//instantitate server
var router = express.Router();

//Body Parser configuration
router.use(bodyParser.urlencoded({extended: true}));
router.use(bodyParser.json());

/* GET home page. */
router.get('/', function(req, res, next) {
  res.setHeader('Content-Type', 'text/html');
  res.render('index', { title: 'Test' });
});

router.use('/api', apiRouter);


module.exports = router;