import express from 'express';
export const routes = express.Router();
routes.get('/', (req, res) => res.send({hello: 'badminton'}));
routes.get('/gettiles', (req, res) => {
  const fs = require('fs')
  let rawdata = fs.readFileSync('/home/jcgouleau/IdeaProjects/angular-three/server/game_test.json');
  let teams = JSON.parse(rawdata);

  return res.send(teams)})
routes.post('/savetiles', (req, res) => {
  const fs = require('fs')
  fs.writeFile("/home/jcgouleau/IdeaProjects/angular-three/server/game_test.json", JSON.stringify(req.body), (err: any) => {
    if (err) console.log("Error writing file:", err);
  });
  return res.send({body: req.body})});

