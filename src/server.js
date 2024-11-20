// const express = require('express')
import express from "express"
const app = express()
import { port } from "./secrets.js"
import { validate } from "./utils/data-validation.js"
import { profiler } from "./profiler/index.js";

app.get('/report', (req, res, next) => {
  const { badSamples, product } = req.query;
  const { error, message, data } = validate(product, badSamples);
  if (error) {
    res.status(400).json({ message });
  }
  profiler(data.product, data.badSamples)
  res.json({ message: 'Hello World!', badSamples, product })
})

app.get('/', (req, res) => {
  res.json({ message: 'Yes we are up!!' })
})

app.listen(port, () => {
  console.log(`Risk profiler listening on port ${port}`)
})