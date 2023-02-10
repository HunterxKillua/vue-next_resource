const bucket = new WeakMap();

let activeEffect = null;
const activeStack = [];
const jobQueue = new Set();
const p = Promise.resolve();
let isFlushing = false;

const flushJob = () => {
  if (isFlushing) return;
  isFlushing = true;
  p.then(() => {
    jobQueue.forEach(fn => fn())
  }).finally(() => {
    isFlushing = false
  })
}

const data = { text: 'hello world', ok: true, count: 1, num: 2 };
const obj = new Proxy(data, {
  get(target, key) {
    track(target, key);
    return target[key];
  },
  set(target, key, newValue) {
    target[key] = newValue;
    trigger(target, key);
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

const trigger = (target, key) => {
  const depsMap = bucket.get(target)
  if (!depsMap) return
  const effects = depsMap.get(key)
  const effectToRun = new Set()
  effects && effects.forEach(fn => {
    if (fn !== activeEffect) {
      effectToRun.add(fn)
    }
  })
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

let templ1, templ2

effect(() => {
  console.log(obj.count)
}, {
  scheduler(fn){
    jobQueue.add(fn)
    flushJob()
  }
})

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

const resp = computed(() => obj.count + 1)

watch(() => obj.text, (newValue, oldValue) => {
  console.log(newValue, oldValue)
}, {
  immediate: true
})

obj.text = ''
