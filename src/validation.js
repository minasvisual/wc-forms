import { validations } from './config.js'
export class Validate {
  constructor(ruleString) {
    this.rule = ''
    this.params = []
    this.errors = []
    this.rule = this.parseRule(ruleString)
    this.sourceRule = this.getSourceRule()
    this.params = this.parseParams(ruleString) 
  }

  parseRule(ruleString) {
    if (typeof ruleString !== 'string') throw new Error('Rule invalid')
    if (!ruleString.includes(':')) return ruleString
    if (ruleString.includes(':')) return ruleString.split(':')[0]
  }

  parseParams(ruleString) {
    if (!ruleString.includes(':')) return []
    let paramsString = ruleString.split(':')[1]
    let params = [paramsString]
    if (paramsString.includes(',')) params = paramsString.split(',')
    return params
  }

  getSourceRule() {
    if (!validations[this.rule]) 
      throw new Error(`Rule not found: ${this.rule}`)
    return validations[this.rule]
  }

  validate(value, el, values) {
    let valid = true
    let isValid = this.sourceRule.handle({
      value,
      params: this.params,
      el,
      values,
      rule: this.rule
    })
    if (!isValid) {
      valid = false
      this.errors.push(this.sourceRule.message(this.params, value, values))
    }
    return valid
  }
}