import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ConfigService } from './config.service';
import { CellContent, CellIndex, SharedGridService } from './shared-grid.service';

class MyEventSource extends EventSource {
  private _id: number = 0;
  constructor(url: string, eventSourceInitDict?: EventSourceInit){
    super(url, eventSourceInitDict);
  }
  public get id(){
    return this._id;
  }
  public set id(newId: number){
    this._id = newId;
  }
}
export const enum SolverResult{
  UNSATISFIABLE,
  UNKNOWN,
  ERROR,
  OK
}
@Injectable({
  providedIn: 'root'
})
export class SolutionService {
  private url: string = "";
  private subscriberCount: number = 0;
  private _uniqueUserId: string = (Math.floor(Math.random()*100000000)).toString();
  public get userId(){
    return this._uniqueUserId;
  }
  constructor(private cem: SharedGridService, config: ConfigService){
    const baseUrl = config.apiBaseUrl;
    const link = `${baseUrl}/api/model?userId=${this.userId}`;
    this.url = link;
  }

  getSolutionStream(): Observable<string> {
    return new Observable<string>((subscriber)=>{
      let eventSource = new MyEventSource(this.url);
      this.subscriberCount++;
      eventSource.id = this.subscriberCount;
      eventSource.onmessage = (event)=>{
        console.debug("Received event: ", event);

        subscriber.next("Subscriber "+ eventSource.id +": "+ event.data);
        const str = event.data as string;
        let solutionData: CellContent[] = [];
        let result: SolverResult = SolverResult.OK;
        if(str.match("UNSATISFIABLE")){
          result = SolverResult.UNSATISFIABLE;
        }
        else if(str.match("ERROR")){
          result = SolverResult.ERROR;
        }
        else if(str.match("UNKNOWN") || str.match("UNSATorUNBOUNDED") || str.match("UNBOUNDED")){
          result = SolverResult.UNKNOWN;
        }
        else{
          solutionData = str.substring(1, str.length-1).split(",");
          console.log("Solution data",solutionData);
        }
        this.cem.solutionGrid?.loadSolution(solutionData, result);
      };
      eventSource.onerror = (error) =>{
        if(eventSource.readyState === 0){
          console.log("The stream has been closed by the server.");
          eventSource.close();
          subscriber.complete();
        }
        else{
          subscriber.error("EventSource error: " + error);
        }
      }
    })
  }
}
