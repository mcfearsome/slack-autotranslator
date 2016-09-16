const express = require('express');
const router = express.Router();

const {
  deleteCommand,
  recentCommand,
  translationsCommand
} = require('../controllers/slashCommands');

const {
  deleteValidator,
  recentValidator,
  tokenValidator
} = require('../validators/slashCommands');


// Slack commands are sometimes pinged to verify that SSL works.
router.use(function(req, res, next) {
  if (req.query.ssl_check) {
    return res.end('OK');
  }

  // Close all slack connections.
  res.set('Connection', 'Close');

  // Wrap call of slack functions so user gets nice message
  try {
    return next();
  } catch(err) {
    console.error(err);
    return res.json({
      text: 'There was an error while executing command. Please check server logs.'
    });
  }
});

router.post('/delete', tokenValidator('TOKEN_DELETE'), deleteValidator, deleteCommand);
router.post('/recent', tokenValidator('TOKEN_RECENT'), recentValidator, recentCommand);
router.post('/translations', tokenValidator('TOKEN_TRANSLATIONS'), translationsCommand);


module.exports = router;
