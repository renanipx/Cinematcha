const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const suggestRouter = require('./modules/suggest/controller/suggest.controller');
dotenv.config({ path: path.join(__dirname, '../.env') });

const app = express();
app.use(cors());
app.use(express.json());

app.use('/suggest', suggestRouter);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 