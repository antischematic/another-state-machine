import createSpy = jasmine.createSpy

type Dict<T> = Record<string, T>
type AdditionalProperty<T> = T | undefined | {}

interface AnotherEventSchema {
   action: []
   target: string
}

interface AnotherStateSchema {
   $final?: boolean
   $enter?: []
   $leave?: []
   $invoke?: (string | AnotherInvoke)[]
   $done?: []
   $schema?: AnotherSchema
   [key: string]: AdditionalProperty<AnotherEventSchema>
}

interface AnotherSchemaAttributes {}

interface AnotherSchema {
   $start?: string
   [key: string]: AdditionalProperty<AnotherStateSchema>
}

interface InvokeMap {
   [key: string]: AnotherInvoke
}

type AnotherInvoke = ((...args: any) => any)

interface AnotherConfig<T extends AnotherEventMap<any>> {
   events?: T
   invoke?: InvokeMap
}

type ExtractEvents<T extends AnotherEventMap<any>> = {
   [key in keyof T]?: key extends keyof ReturnType<T[key]> ? ReturnType<T[key]>[key] : never
}

const $event = true

class AnotherStateMachine<T extends AnotherEventMap<any>> {
   externalQueue: AnotherEvent[] = []
   state: string[]

   next(event: ExtractEvents<T>) {
      this.externalQueue.push(toEvent(event))
      this.tick()
   }

   tick() {
      const event = this.externalQueue.shift()
      if (event) {
         this.leave()
         this.transition()
         this.enter(event)
      }
   }

   enter(event: AnotherEvent) {
      const state = this.schema[this.state[0]] as AnotherStateSchema
      this.state = getTarget(state[event.name] as AnotherEventSchema)
      const nextState = this.schema[this.state[0]] as AnotherStateSchema
      for (let invoke of nextState.$invoke ?? []) {
         invoke = this.config?.invoke?.[invoke as string] ?? invoke
         if (typeof invoke === "function") {
            invoke()
         }
      }
   }

   transition() {}

   leave() {}

   getInitialState() {
      return [keys(this.schema)[0]]
   }

   constructor(private schema: AnotherSchema, public config?: AnotherConfig<T>) {
      this.state = this.getInitialState()
   }
}

function keys(object: {}) {
   return Object.keys(object).filter(k => !k.startsWith("$"))
}

function getTarget(obj: string | AnotherEventSchema) {
   return [typeof obj === "string" ? obj : obj.target]
}

function toEvent(obj: { [key: string]: any }): AnotherEvent {
   const name = key(obj)
   return {
      name,
      value: obj[name]
   }
}

function key<T>(obj: T): string {
   let key: string
   // noinspection LoopStatementThatDoesntLoopJS
   for (key in obj) break
   return key!
}

function asm<T extends AnotherEventMap<any>>(
   schema: AnotherSchema,
   config?: AnotherConfig<T>,
): AnotherStateMachine<T> {
   return new AnotherStateMachine<T>(schema, config)
}

interface AnotherEvent<TName = string, TValue = unknown> {
   name: TName
   value: TValue
}

interface AnotherEventFactory<TKey extends string, TData> {
   (event: AnotherEvent): event is AnotherEvent<TKey, TData>
   (data: TData): { [key in TKey]: TData }
}

type AnotherEventMap<T> = {
   [key in keyof T]: key extends string ? AnotherEventFactory<key, T[key]> : never
}

function on<T extends { [key: string]: any }>(): AnotherEventMap<T> {
   return new Proxy(Object.freeze({}) as AnotherEventMap<T>, {
      get(_: AnotherEventMap<T>, name: string | symbol): any {
         return function (value: unknown) {
            return { [name]: value }
         }
      },
   })
}

const schema: AnotherSchema = {
   $start: "",
   initial: {
      $schema: {
         nested: {
            add: {}
         },
      },
      load: {
         target: "loading",
      },
   },
   loading: {
      $invoke: ["invoke"],
      $done: "done",
   },
   done: {
      $final: true,
   },
}

type none = void | null

interface Events {
   add: number
   load: none
}

const { add, load } = on<Events>()


describe("asm", () => {
   it("should create", () => {
      const mx = asm(schema)
      expect(mx).toBeTruthy()
   })

   it("should be in initial state", () => {
      const mx = asm(schema)
      expect(mx.state).toEqual(["initial"])
   })

   it("should return the next state", () => {
      const mx = asm(schema, {
         events: { add, load },
      })

      mx.next({ load: null })

      expect(mx.state).toEqual(["loading"])
   })

   it("should invoke", () => {
      const invoke = createSpy("invoke")
      const mx = asm(schema, {
         events: { add, load },
         invoke: { invoke }
      })

      expect(invoke).toHaveBeenCalledTimes(0)

      mx.next({ load: null })

      expect(invoke).toHaveBeenCalledTimes(1)
   })
})
