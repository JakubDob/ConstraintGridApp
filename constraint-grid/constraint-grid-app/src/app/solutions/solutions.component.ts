import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ChangeDetectorRef, Component } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { ConfigService } from '../services/config.service';
import { SharedGridService } from '../services/shared-grid.service';
import { SolutionService } from '../services/solution.service';

@Component({
  selector: 'solutions',
  templateUrl: './solutions.component.html',
  styleUrls: ['./solutions.component.css']
})
export class SolutionsComponent {
  
  solutions: string[] = [];
  solutionStream?: Observable<string>;
  subscription?: Subscription;
  constructor(
    private http: HttpClient,
    private solutionService: SolutionService,
    private cem: SharedGridService,
    private cdr: ChangeDetectorRef,
    private config: ConfigService
    ) {}

  private requestSolutionStream(){
    if(this.solutionStream === undefined){
      this.solutionStream = this.solutionService.getSolutionStream();
      this.subscription = this.solutionStream.subscribe(value => {
        this.solutions.push(value);
        console.log(this.solutions);
        this.cdr.detectChanges();
      }, error =>{
        console.log("Some error!",error);
      });
    }
  }

  public reset(){
    this.solutions = [];
    this.subscription?.unsubscribe();
    this.solutionStream = undefined;
  }

  public postModel(){
    const value = this.cem.mainGrid?.toJson();
    const baseUrl = this.config.apiBaseUrl;
    const link = `${baseUrl}/api/model?userId=${this.solutionService.userId}`;
    this.http.post(link, value).subscribe(v => console.log(v));
    console.log("Posting to "+link);
    this.requestSolutionStream();

  }
}
