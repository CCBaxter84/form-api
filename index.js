import express from "express"
import "dotenv/config"
import fetch from "node-fetch"
import { getFilteredForms, getQueryParamsAsString } from "./helpers.js"

const app = express()
app.use(express.json())

app.get("/:formId/filteredResponses", async (req, res) => {
  try {
    const { formId } = req.params
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
})

app.listen(process.env.PORT)
console.log(`Server is listening on port ${process.env.PORT}`)