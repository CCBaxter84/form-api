import { Queries, Conditions } from "./enums.js"

export function getQueryParamsAsString(query) {
  const fields = Object.keys(Queries)
  let stringifiedQueries = ""

  for (let index = 0; index < fields.length; index++) {
    const field = fields[index]
    const value = query[field]
    const prefix = !stringifiedQueries ? "?" : "&"
    
    if (!!value) {
      stringifiedQueries += `${prefix}${field}=${value}`
    }
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
  if (!Array.isArray(responses) || !responses) return []
  if (!Array.isArray(filters) || !filters) return responses
  return responses.filter(it => evaluateResponse(it, filters))
}

function evaluateResponse(response, filters) {
  const filterChecks = filters.map(filter => {
    return response.questions.some(question => {
      return isMatch(question, filter)
    })
  })
  return filterChecks.every(it => it === true)
}

function isMatch(question, { id, condition, value }) {
  if (question.id !== id) return false

  switch(condition) {
    case Conditions.equals:
      return question.value === value
    case Conditions.does_not_equal:
      return question.value !== value
    case Conditions.greater_than:
      return question.value > value
    case Conditions.less_than:
      return question.value < value
    default: 
      return false
  }
}