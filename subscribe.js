class Publisher {
  constructor() {
    this.subscribes = []
  }
  subscribe(event) {
    this.subscribes.push(event)
  }
  unSubscribe(event) {
    const index = this.subscribes.indexOf(event)
    if (index > -1) {
      this.subscribes.splice(index, 1)
    }
  }
  publish(topic, args) {
    this.subscribes.forEach(event => {
      if (event.topic === topic) {
        event.receive(args)
      }
    })
  }
}
class SubsCriber {
  constructor(topic, callback) {
    this.topic = topic,
    this.callback = callback
  }
  receive(message) {
    this.callback(message)
  }
}

const publishers = new Publisher()

const event1 = new SubsCriber('click', (value) => {
  console.log(value)
})

const event2 = new SubsCriber('change', (value) => {
  console.log(value)
})

const event3 = new SubsCriber('click', (value) => {
  console.log(value, '****')
})

publishers.subscribe(event1)
publishers.subscribe(event2)
publishers.subscribe(event3)

publishers.publish('click', '点击事件')
publishers.publish('change', '自定义事件')

