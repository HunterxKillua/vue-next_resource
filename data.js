const bucket = new WeakMap();

let activeEffect = null;
const activeStack = [];
const jobQueue = new Set();
const p = Promise.resolve();
let isFlushing = false;
let ITERATE_KEY = Symbol();

const flushJob = () => {
  if (isFlushing) return;
  isFlushing = true;
  p.then(() => {
    jobQueue.forEach(fn => fn())
  }).finally(() => {
    isFlushing = false
  })
}

const isShallowReactive = (source) => reactive(source, true)
const readOnly = (source) => reactive(source, false, true)

const reactive = (source, isShallow = false, isReadOnly) => new Proxy(source, {
  get(target, key, receiver) {
    if (key === 'raw') {
      return target
    }
    if (!isReadOnly) {
      track(target, key)
    }
    const res = Reflect.get(target, key, receiver);
    if (isShallow) {
      return res
    }
    if (typeof res === 'object' && res !== null) {
      return isReadOnly ? readOnly(res) : reactive(res)
    } 
    return res
  },
  set(target, key, newValue, receiver) {
    if (isReadOnly) {
      console.warn(`属性 ${key} 是只读的`)
      return true
    }
    const oldValue = target[key]
    const type = Object.prototype.hasOwnProperty.call(target, key) ? 'SET' : 'ADD'
    const res = Reflect.set(target, key, newValue, receiver)
    if (target === receiver.raw) {
      if (oldValue !== newValue && (oldValue === oldValue || newValue === newValue)) { // 后面条件为了排除NaN
        trigger(target, key, type);
      }
    }
    return res
  },
  deleteProperty(target, key) {
    if (isReadOnly) {
      console.warn(`属性 ${key} 是只读的`)
      return true
    }
    const hadKey = Object.prototype.hasOwnProperty.call(target, key)
    const res = Reflect.deleteProperty(target, key)
    if (res && hadKey) {
      trigger(target, key, 'DELETE')
    }
    return res
  },
  has(target, key) {
    track(target, key)
    return Reflect.has(target, key)
  },
  ownKeys(target) {
    track(target, ITERATE_KEY)
    return Reflect.ownKeys(target)
  }
})

const track = (target, key) => {
  if (!activeEffect) return;
  let depsMap = bucket.get(target)
  if (!depsMap) 
    bucket.set(target, (depsMap = new Map()))
  let deps = depsMap.get(key)
  if (!deps) {
    depsMap.set(key, (deps = new Set()))
  }
  deps.add(activeEffect)
  activeEffect.deps.push(deps)
}

const trigger = (target, key, type) => {
  const depsMap = bucket.get(target)
  if (!depsMap) return
  const effects = depsMap.get(key)
  const iterateEffects = depsMap.get(ITERATE_KEY)
  const effectToRun = new Set()
  effects && effects.forEach(fn => {
    if (fn !== activeEffect) {
      effectToRun.add(fn)
    }
  })
  if (type === 'ADD' || type === 'DELETE') {
    iterateEffects && iterateEffects.forEach(fn => {
      if (fn !== activeEffect) {
        effectToRun.add(fn)
      }
    })
  }
  effectToRun.forEach(fn => {
    if (fn.options.scheduler) {
      fn.options.scheduler(fn)
    } else {
      fn()
    }
  })
}

const cleanUp = (effectFn) => {
  for(let i = 0; i < effectFn.deps.length; i++) {
    const deps = effectFn.deps[i];
    deps.delete(effectFn)
  }
  effectFn.deps.length = 0;
}

const effect = (fn, options = {}) => {
  const effectFn = () => {
    cleanUp(effectFn); // 清除之前的所有副作用函数，然后修改值的时候会触发真正的执行内容(fn方法中)然后又会建立新的关系
    activeEffect = effectFn;
    activeStack.push(effectFn); // 建立一个栈存储，防止外部的effect被内部的清掉，先进后出
    const res = fn();
    activeStack.pop();
    activeEffect = activeStack[activeStack.length - 1];
    return res;
  }
  effectFn.options = options;
  effectFn.deps = [];
  if (!options.lazy) {
    effectFn(); 
  }
  return effectFn;
}

const computed = (getter) => {
  let value // 作为缓存
  let dirty = true // 作为标识位
  const effectFn = effect(getter, {
    lazy: true,
    scheduler() {
      if (!dirty) {
        dirty = true
        trigger(res, 'value')
      }
    }
  })
  const res = {
    get value() {
      if (dirty) {
        value = effectFn()
        dirty = false
      }
      track(res, 'value')
      return value
    }
  }
  return res
}

const traverse = (value, seen = new Set()) => {
  if (typeof value !== 'object' || value === null || seen.has(value)) return;
  seen.add(value);
  for (const key in value) {
    traverse(value[key], seen)
  }
  return value
}

const watch = (source, callback, options = {}) => {
  let getter;
  let newValue, oldValue;
  const job = () => {
    newValue = effectFn()
    callback(newValue, oldValue)
    oldValue = newValue
  }
  if (typeof source === 'function') {
    getter = source
  } else {
    getter = () => traverse(source)
  }
  const effectFn = effect(() => getter(), 
  {
    lazy: true,
    scheduler: () => {
      if (options.flush === 'post') {
        p.then(job)
      } else {
        job()
      }
    }
  })
  if (options.immediate) {
    job()
  } else {
    oldValue = effectFn()
  }
}

const data = { text: 'hello world', get print() {
  return this.text
}};

const obj = isShallowReactive({
  foo: 'hello',
  props: {
    num: 1
  }
})

const deeps = readOnly({
  foo: {
    bar: '123'
  }
})

effect(() => {
  console.log(obj.foo)
  console.log(deeps.foo.bar)
})
