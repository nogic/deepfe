/*
挂载数据
数据劫持 每个属性都创建依赖收集器dep，被get请求时登记依赖添加订阅，被set时通知依赖的watcher
将计算属性转成watcher
将watch转成watcher
模板编译在需要的地方创建watcher
*/
class MVVM {
  constructor(opt) {
    this.$el = opt.el

    if(typeof opt.data === 'function') {
      this.$data = opt.data.apply(this)
    }else {
      this.$data = opt.data
    }

    this.$methods = opt.methods
    this.$computed = opt.computed

    if(this.$el) {
      new Observer(this.$data)
      this.proxyData(this.$data)

      this.initComputed(this, this.$computed)
      this.initWatch(this, opt.watch)

      new Compile(this.$el, this)
    }
  }
  initComputed(vm, computed) {
    const watchers = vm._computedWatchers = Object.create(null)
    for(const key in computed) {
      const userDef = computed[key]
      const getter = typeof userDef === 'function' ? userDef : userDef.get
      const setter = typeof userDef === 'function' ?  noop : (userDef.set || noop)

      watchers[key] = new Watcher(vm, getter, noop, {computed: true})

      Object.defineProperty(vm, key, {
        get: () => {
          const watcher = vm._computedWatchers[key]
          if(watcher) {
            watcher.depend()
            return watcher.evaluate()
          }
        },
        set: setter
      })
    }
  }
  initWatch(vm, watch) {

    for(const key in watch) {
      const handler = watch[key]
      new Watcher(vm, key, handler)
    }

  }
  proxyData(data) {
    Object.keys(data).forEach(key => {
      Object.defineProperty(this, key, {
        get() {
          return data[key]
        },
        set(newVal) {
          data[key] = newVal
        }
      })
    })
  }
}

function noop() {}
