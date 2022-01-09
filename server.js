const express = require('express');
const app = express();
const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`🚀 Server is now running on port ${port}`));

app.get('/health', (req, res) => {
  res.send("OK");
});