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
// #endregion

// #region rendering
// #endregion

// #region main
// #endregion