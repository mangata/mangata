'use strict'

// line is 1-based; column is 0-based
export default class Position {
  constructor (line, column = 0) {
    this.line = line
    this.column = column
  }

  // REMIND: offset is a reserved attribute in TxtAST
  move (n) {
    return new Position(this.line, this.column + n)
  }

  toString () {
    return `${this.line}:${this.column}`
  }
}
