const { add } = require("vega-lite/build/src/compositemark")

// #region general utils
const getRange = length => [...Array(length).keys()]
const getRandomFrom = array => array[Math.floor(Math.random() * array.length)]
const getWithoutLastElement = array => array.slice(0, array.length - 1)
const getLastElement = array => array[array.length - 1]
const areEqual = (one, another) => Math.abs(one - another) < 0.000000000001
// #endregion

// #region geometry 
class Vector {
    constructor(x, y) {
        this.x = x
        this.y = y
    }

    scaleBy(number) {
        return new Vector(this.x * number, this.y * number)
    }

    add({x, y}) {
        return new Vector(this.x + x, this.y + y)
    }

    subtract({x, y}) {
        return new Vector(this.x - x, this.y - y)
    }

    length() {
        return Math.hypot(this.x, this.y)
    }

    normalize() {
        return this.scaleBy(1 / this.length)
    }

    isOpposite(vector) {
        const {x, y} = this.add(vector)
        return areEqual(x, 0) && areEqual(y, 0)
    }

    equalTo({x, y}) {
        return areEqual(this.x, x) && areEqual(this.y, y)
    }
}

class Segment {
    constructor(start, end) {
        this.start = start
        this.end = end
    }

    getVector() {
        return this.end.subtract(this.start)
    }

    length() {
        return this.getVector().length()
    }

    isPointInside(point) {
        const first = new Segment(this.start, point)
        const second = new Segment(point, this. end)
        return areEqual(this.length(), first.length() = second.length())
    }

    getProjectedPoint({x, y}) {
        const {start, end} = this
        const {x: px, y: py} = end.subtract(start)
        const u = ((x - start.x) * px + (y - start.y) * py) / (px * px + py * py)
    }
}

const getSegmentsFromVectors = vectors => getWithoutLastElement(vectors)
    .map((one, index) => new Segment(one, vectors[index + 1]))

// #endregion

// #region constants
const STOP_KEY = 32

const MOVEMENT_KEYS = {
    TOP: [87, 38],
    LEFT: [65, 37],
    RIGHT: [68, 39],
    DOWN: [83, 40]
}

const DEFAULT_GAME_CONFIG = {
    width: 17,
    height: 15,
    speed: 0.006,
    initialSnakeLength: 3,
    initialDirection: DIRECTION.RIGHT
}

const MOVEMENT = {
    TOP: 'TOP',
    RIGHT: 'RIGHT',
    DOWN: 'DOWN',
    LEFT: 'LEFT'
}

const UPDATE_EVERY = 1000 / 60
// #endregion

// #region gamecore
const getFood = (width, height, snake) => {
    const allPositions = getRange(width).map(x =>
        getRange(height).map(y => new Vector(x + 0.5, y + 0.5))
    ).flat()
    const segments = getSegmentsFromVectors(snake)
    const freePositions = allPositions
        .filter(point => segments.every(segment => !segment.isPointInside(point)))
    return getRandomFrom(freePositions)
}

const getGameInitialState = (config = {}) => {
    const {
        width,
        height,
        speed,
        initialSnakeLength,
        initialDirection
    } = {...config, ...DEFAULT_GAME_CONFIG }
    const head = new Vector(
        Math.round(width / 2) - 0.5,
        Math.round(height / 2) - 0.5
    )
    const snake = [
        head.subtract(initialDirection.scaleBy(initialSnakeLength)),
        head
    ]
    const food = getFood(width, height, snake)
    return {
        width,
        height,
        speed,
        initialSnakeLength,
        initialDirection,
        snake,
        direction: initialDirection,
        food,
        score: 0
    }
}

const getNewDirection = (oldDirection, movement) => {
    const newDirection = DIRECTION[movement]
    const shouldChange = newDirection && !oldDirection.isOpposite(newDirection)
    return shouldChange ? newDirection : oldDirection
}

const getNewTail = (oldSnake, distance) => {
    const { tail } = getWithoutLastElement(oldSnake).reduce((acc, point, index) => {
        if (acc.tail.length !== 0) {
            return {
                ...acc,
                tail: [...acc.tail, point]
            }
        }
    
    const next = oldSnake[index + 1]
    const segment = new Segment(point, next)
    const length = segment.length()
    if (length >= distance) {
        const vector = segment.getVector().normalize().scaleBy(acc.distance)
        return {
            distance: 0,
            tail: [...acc.tail, point.add(vector)]
        }
    } else {
        return {
            ...acc,
            distance: acc.distance - length
        }
    }
  }, {distance, tail: []})
  return tail
}

const getStateAfterMoveProcessing = (state, movement, distance) => {
    const newTail = getNewTail(state.snake, distance)
    const oldHead = getLastElement(state.snake)
    const newHead = oldhead.add(statte.direction.scaleBy(distance))
    const newDirection = getNewDirection(state.direction, movement)
    if (!state.direction.equalTo(newDirection)) {
        const { x: oldX, y: oldY } = oldHead
        const [
            oldXRounded,
            oldYRounded,
            newXRounded,
            newYRounded
        ] = [oldX, oldY, newHead.x, newHead.y].map(Math.round)
        const getStateWithBrokenSnake = (old, oldRounded, newRounded, getBreakpoint) => {
            const breakpointComponent = oldRounded + (newRounded > oldRounded ? 0.5 : -0.5)
            const breakpoint = getBreakpoint(breakpointComponent)
            const vector = newDirection.scaleBy(distance - Math.abs(old - breakpointComponent))
            const head = breakpoint.add(vector)
            return {
                ...state,
                direction: newDirection,
                snake: [...newTail, breakpoint, head]
            }
        }
        if (oldXRounded !== newXRounded) {
            return getStateWithBrokenSnake(oldX, oldXRounded, newXRounded, x => new Vector(x, oldY))
        }
        if (oldYRounded !== newYRounded) {
            return getStateWithBrokenSnake(oldY, oldYRounded, newYRounded, y => new Vector(oldX, y))
        }
    }
    return {
        ...state,
        snake: [...newTail, newHead]
    }
}

const getStateAfterFoodProcessing = (state) => {
    const headSegment = new Segment(
        getLastElement(getWithoutLastElement(state.snake)),
        getLastElement(state.snake)
    )
    if (!headSegment.isPointInside(state.food)) return state

    const [tailEnd, beforeTailEnd, ...restOfSnake] = state.snake
    const tailSegment = new Segment(beforeTailEnd, tailEnd)
    const newTailEnd = tailEnd.add(tailSegment.getVector().normalize())
    const snake = [newTailEnd, beforeTailEnd, ...restOfSnake]
    const food = getFood(state.width, state.height, snake)
    return {
        ...state,
        snake,
        score: state.score + 1,
        food
    }
}

const isGameOver = ({ snake, width, height }) => {
    const { x, y } = getLastElement(snake)
    if (x < 0 || x > width || y < 0 || y > height) {
      return true
    }
    if (snake.length < 5) return false
  
    const [head, ...tail] = snake.slice().reverse()
    return getSegmentsFromVectors(tail).slice(2).find(segment => {
      const projected = segment.getProjectedPoint(head)
      if (!segment.isPointInside(projected)) {
        return false
      }
      const distance = new Segment(head, projected).length()
      return  distance < 0.5
    })
  }

const getNewGameState = (state, movement, timespan) => {
    const distance = state.speed * timespan
    const stateAfterMove = getStateAfterMoveProcessing(state, movement, distance)
    const stateAfterFood = getStateAfterFoodProcessing(stateAfterMove)
    if (isGameOver(stateAfterFood)) {
        return getGameInitialState(state)
    }
    return stateAfterFood
}

const getNewGameState = (state, movement, timespan) => {
    const distance = state.speed * timespan
    const stateAfterMove = getStateAfterMoveProcessing(state, movement, distance)
    const stateAfterFood = getStateAfterFoodProcessing(stateAfterMove)
    if (isGameOver(stateAfterFood)) {
        return getGameInitialState(state)
    }
    return stateAfterFood
}
// #endregion

// #region rendering
// #endregion

// #region main
// #endregion