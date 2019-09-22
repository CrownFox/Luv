const express = require('express')
const app = express()
const port = 3000
const path = require('path')
const _workdir = path.join(__dirname, '../..')
console.log('internal path is: ' + _workdir)

app.get('/userdata/*', function(req, res)
{
    res.sendFile(_workdir + req.url)
})

app.listen(port, () =>
{
    console.log(`Local filehost listening on port ${port}!`)
})

module.exports = {express: express, app: app, port: port}