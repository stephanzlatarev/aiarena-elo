import express from "express";

const app = express();

app.get("*", function (request, response) {
  const root = process.cwd();
  const path = request.originalUrl;

  if (path.length > 1) {
    response.sendFile(root + "/elo" + path);
  } else {
    response.sendFile(root + "/elo/elo.html");
  }
})

app.listen(3000);
console.log("Demo started at http://localhost:3000");
