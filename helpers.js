import { Queries, Conditions } from "./enums.js"

export function getQueryParamsAsString(query) {
  const fields = Object.keys(Queries)
  let stringifiedQueries = ""

  for (let index = 0; index < fields.length; index++) {
    const field = fields[index]
    const value = query[field]
    if (!value) continue
    if (!stringifiedQueries) {
      stringifiedQueries += "?"
    } else {
      stringifiedQueries += "&"
    }
    stringifiedQueries += `${field}=${value}`
  }
  return stringifiedQueries
}

export function getFilteredForms(forms, filters) {
  let filtersJson
  let limit

  // Guard against malformed JSON errors
  try {
    filtersJson = JSON.parse(filters)
    limit = filtersJson.limit ?? 150
  } 
  catch {
    filtersJson = []
    limit = 150
  } 
  finally {
    return filterForms(forms, filtersJson, limit)
  }
}

function filterForms(forms, filters, limit = 150) {
  const responses = filterResponses(forms.responses, filters)
  const totalResponses = responses.length
  const pageCount = Math.ceil(totalResponses / limit)

  return {
    responses,
    totalResponses,
    pageCount
  }
}

function filterResponses(responses, filters) {
  if (!responses) return []
  return responses.filter(it => evaluateResponse(it, filters))
}

function evaluateResponse(response, filters) {
  const filterChecks = filters.map(filter => {
    response.questions.forEach(question => {
      if (isMatch(question, filter)) return true
    })
    return false
  })
  return filterChecks.every(it => it === true)
}

function isMatch(question, { id, condition, value }) {
  if (question.id !== id) return false

  switch(condition) {
    case Conditions.equals:
      return x === value
    case Conditions.does_not_equal:
      return x !== value
    case Conditions.greater_than:
      return x > value
    case Conditions.less_than:
      return x < value
    default: 
      return false
  }
}