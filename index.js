import express from "express"
import "dotenv/config"
import fetch from "node-fetch"
import { getFilteredForms, getQueryParamsAsString } from "./helpers.js"

const app = express()
app.use(express.json())

app.get("/", getFilteredResults)
app.get("/:formId/filteredResponses", getFilteredResults)

app.listen(process.env.PORT)
console.log(`Server is listening on port ${process.env.PORT}`)

async function getFilteredResults(req, res) {
  try {
    const formId = req.params?.formId ?? process.env.FORM_ID
    const stringifiedQueries = getQueryParamsAsString(req.query)
    const response = await fetch(`${process.env.URL}/${formId}/submissions${stringifiedQueries}`, {
      headers: {
        "Authorization": `Bearer ${process.env.API_KEY}`,
        "Content-Type": "application/json"
      }
    })
    const data = await response.json()
    const filteredData = getFilteredForms(data, req.query.filters)
    res.status(200).send(filteredData)
  } catch(e) {
    console.log(e)
    res.status(404).send("Not found")
  }
}