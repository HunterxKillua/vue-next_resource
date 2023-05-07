const printVar = function() {
  let a = 1
  a += 1
  console.log(a)
}
const toCache = function() {
  let a = 1
  const updateStatus = function() {
    const element = document.getElementById('status')
    element.innerText = a
  }
  const add = function () {
    a+= 1
    updateStatus()
  }
  const del = function() {
    a-= 1
    updateStatus()
  }
  const mount = function() {
    const element = document.createElement('div')
    element.id = "status"
    element.innerText = a
    document.body.append(element)
  }

  const unMount = () => {
    document.body.removeChild(document.getElementById('status'))
  }
  return { add, del, mount, unMount }
}

const { add, del, mount, unMount } = toCache()