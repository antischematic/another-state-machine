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
   $invoke?: []
   $done?: []
   $schema?: AnotherSchema
   [key: string]: AdditionalProperty<AnotherEventSchema>
}

interface AnotherSchemaAttributes {}

interface AnotherSchema {
   $start?: string
   [key: string]: AdditionalProperty<AnotherStateSchema>
}

interface AnotherConfig<T extends AnotherEventMap<any>> {
   events?: T
}

type ExtractEvents<T extends AnotherEventMap<any>> = {
   [key in keyof T]?: key extends keyof ReturnType<T[key]> ? ReturnType<T[key]>[key] : never
}

const $event = true

class AnotherStateMachine<T extends AnotherEventMap<any>> {
   externalQueue: AnotherEvent[] = []
   state: string = "#empty"

   next(event: ExtractEvents<T>) {
      this.externalQueue.push(event as AnotherEvent)
   }

   constructor(private schema: AnotherSchema, public config?: AnotherConfig<T>) {}
}

function asm<T extends AnotherEventMap<any>>(
   schema: AnotherSchema,
   config?: AnotherConfig<T>,
): AnotherStateMachine<T> {
   return new AnotherStateMachine<T>(schema, config)
}

interface AnotherEvent<TName = unknown, TValue = unknown> {
   name: TName
   value: TValue
}

interface AnotherEventFactory<TKey extends string | number | symbol, TData> {
   (event: AnotherEvent): event is AnotherEvent<TKey, TData>
   (data: TData): { [key in TKey]: TData }
}

type AnotherEventMap<T> = {
   [key in keyof T]: AnotherEventFactory<key, T[key]>
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
      $invoke: [],
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

   it("should transition to next state", () => {
      const mx = asm(schema, {
         events: { add, load },
      })

      mx.next({ load: null })

      expect(mx.state).toBe("loading")
   })
})
