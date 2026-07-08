const express = require('express');
const cors    = require('cors');
const app     = express();

app.use(cors());
app.use(express.json());

const articles    = require('./routes/articles');
const journalists = require('./routes/journalists');
const subscribersRouter = require('./routes/subscribers');
const editorsRouter     = require('./routes/editors'); // Added editors

app.use('/api/articles', articles);
app.use('/api/journalists', journalists);
app.use('/api/subscribers', subscribersRouter);
app.use('/api/editors', editorsRouter); // Registered editors route

app.listen(3000, () => console.log('NAMS API running on port 3000'));
