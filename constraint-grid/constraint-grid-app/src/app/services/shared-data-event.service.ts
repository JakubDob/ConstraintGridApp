export interface HasUniqueId { readonly __id__: number;}
type ComponentEventCb<T extends HasUniqueId> = {(event: T): void};
type EventIdType = number | string;
type QueryIdType = number | string;
type EventHandlerType = {handler: any, id: number, once: boolean};
type QueryResponseType = any;
export type HandlerUniqueIdType = number & {};
type EventType = any;

export abstract class SharedDataEventService <BaseEventType extends HasUniqueId>{
    //Type erasure (type any) is necessary here, callbacks have different generic types
    private eventHandlers: Map<EventIdType, EventHandlerType[]> = new Map();
    private data: Map<QueryIdType, QueryResponseType> = new Map();
    private pendingEvents: Map<EventIdType, EventType> = new Map();
    private _handlerId: HandlerUniqueIdType = 0;
    constructor(){}

    emit<E extends BaseEventType>(event: E){
      const listeners = this.eventHandlers.get(event.__id__);
      if(listeners && listeners.length > 0){
        listeners.forEach((cb, index)=>{
          cb.handler(event);
          if(cb.once){
            listeners.splice(index, 1);
          }
        });
      }
      else{
        // throw Error(`Listener not provided for ${event.__id__} event.`);
        this.pendingEvents.set(event.__id__, event);
      }
    };
    //here the ereased type is provided
    on<E extends BaseEventType>(id: EventIdType, cb: ComponentEventCb<E>, once: boolean = false){
      this._handlerId++;
      const oldEvent = this.pendingEvents.get(id) as E | undefined;
      if(oldEvent){
        cb(oldEvent);
        this.pendingEvents.delete(id);
        if(once){
          return this._handlerId;
        }
      }

      let handlers = this.eventHandlers.get(id);
      if(handlers){
        handlers.push({id: this._handlerId, handler: cb, once: once});
      }
      else{
        this.eventHandlers.set(id, [{id: this._handlerId, handler: cb, once: once}]);
      }
      return this._handlerId;
    }
    removeHandler(id: HandlerUniqueIdType){
      let eventTypeOfDelHandler: EventIdType | null = null;
      let found = false;
      this.eventHandlers.forEach((handler, eventId)=>{
        if(!found){
          const index = handler.findIndex(h => h.id === id);
          if(index >= 0){
            handler.splice(index, 1);
            if(handler.length === 0){
              eventTypeOfDelHandler = eventId;
            }
            found = true;
          }
        }
      });
      if(eventTypeOfDelHandler){
        this.eventHandlers.delete(eventTypeOfDelHandler);
      }
    }
    set(key: QueryIdType, value: unknown): void {
      this.data.set(key, value);
    }
  
    get(key: QueryIdType, ...args: unknown[]): unknown {
      const v = this.data.get(key);
      if(typeof v === "function"){
        return v.apply(null, args);
      }
      else{
        return v;
      }
    }
  }

