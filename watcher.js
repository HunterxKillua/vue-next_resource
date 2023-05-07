class Watcher {
  constructor() {
    this.deeps = [];
  }
  addObserver(observer) {
    this.deeps.push(observer)
  }
  removeObserver(observer) {
    const index = this.deeps.indexOf(observer)
    if (index > -1) {
      this.deeps.splice(index, 1)
    }
  }
  notify() {
    this.deeps.forEach(element => {
      element.update()
    });
  }
}

class Observe {
  constructor(name, cache = '') {
    this.name = name
    this.cache = cache
    this.id = 1
  }
  update() {
    console.log(`oldValue is ${this.cache} and newValue is ${this.name}`)
  }
}

const subJect = new Watcher()

const observeData = (obj) => {
  const value = obj.name
  return Object.defineProperty(obj, 'name', {
    get() {
      const observer = subJect.deeps.find(item => item.hasOwnProperty('name'))
      console.log(observer)
      if (!observer) {
        const observers = new Observe(value)
        subJect.addObserver(observers)
      }
      return value 
    },
    set(values) {
      if (values !== this._name) {
        const observers = subJect.deeps.find(item => item.hasOwnProperty('name'))
        if (observers) {
          observers.name = values
          observers.cache = this._name || value
        }
        subJect.notify()
      }
      this._name = values
    }
  })
}

const obj = {
  name: 'js'
}

const data = observeData(obj)