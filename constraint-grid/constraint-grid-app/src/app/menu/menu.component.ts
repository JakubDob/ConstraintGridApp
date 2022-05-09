import { AfterViewInit, Component, ElementRef, ViewChild} from '@angular/core';
import { ConstraintGridComponent } from '../constraint-grid/constraint-grid.component';
import { ViewChangeEvent, SharedEventId, SharedGridService, SharedQuery, BeforeDeleteConstraintEvent, LoadSolutionEvent, TileEvent, ActiveView, FillEvent, ActiveConstraint } from '../services/shared-grid.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent implements AfterViewInit{
  @ViewChild('mainGrid', {read: ElementRef, static:false})
  mainGridElemRef?: ElementRef;
  @ViewChild('solutionGrid', {read: ElementRef, static:false})
  solutionGridElemRef?: ElementRef;

  @ViewChild('mainGrid')
  mainGridComponentRef?: ConstraintGridComponent;
  @ViewChild('solutionGrid')
  solutionGridComponentRef?: ConstraintGridComponent;

  @ViewChild('optionsAndTools', {read: ElementRef, static:false})
  optionsAndToolsRef?: ElementRef;

  clickedOnConstraint = "";
  clickedOnView = false;

  gridCols = 9;
  gridRows = 9;

  constructor(private cem: SharedGridService) {
    this.cem.on<ViewChangeEvent>(SharedEventId.VIEW_CHANGE, e=>{
      const ac = this.cem.get(SharedQuery.ACTIVE_CONSTRAINT) as ActiveConstraint;
      const av = this.cem.get(SharedQuery.ACTIVE_VIEW) as ActiveView;
      if(this.cem.mainGrid){
        if(ac !== undefined){
          this.clickedOnConstraint = ac.name;
        }
        if(av !== undefined){
          this.clickedOnView = true;
        }
        else{
          this.clickedOnView = false;
        }
      }
    });
    this.cem.on<BeforeDeleteConstraintEvent>(SharedEventId.BEFORE_DELETE_CONSTRAINT, e=>{
      if(this.clickedOnConstraint === e.data.name){
        this.clickedOnConstraint = "";
      }
      const av = this.cem.get(SharedQuery.ACTIVE_VIEW) as ActiveView;
      if(av?.parentConstraint === e.data){
        this.clickedOnView = false;
      }
    });

    this.cem.on<TileEvent>(SharedEventId.TILE, e=>{
      this.mainGridComponentRef?.tile();
    });
    this.cem.on<FillEvent>(SharedEventId.FILL, e=>{
      this.mainGridComponentRef?.fill();
    });
    this.cem.set(SharedQuery.EREASER_SELECTED, false);
  }
  ngAfterViewInit(): void {
    if(this.mainGridComponentRef && this.solutionGridComponentRef){
      this.cem.setMainGrid(this.mainGridComponentRef);
      this.cem.setSolutionGrid(this.solutionGridComponentRef);
    }

    console.log("main grid ref:", this.mainGridElemRef);
    console.log("solution grid ref:", this.mainGridElemRef);
  }

  getGroupListStyle(){
    const gridHeight = this.mainGridElemRef?.nativeElement.offsetHeight;
    const optionsHeight = this.optionsAndToolsRef?.nativeElement.offsetHeight;
    const matCardPadding = 16*2;
    const listHeight = gridHeight-optionsHeight-matCardPadding;
    return {
      'display':'block',
      'max-height': listHeight +'px',
      'overflow': 'auto'
    }
  }

  debugLog(){
    console.log("main grid data", this.cem.mainGrid?.data);
  }
  @ViewChild("debugText")
  debugDiv?: ElementRef;
  onToJson(){
    if(this.debugDiv){
      this.debugDiv.nativeElement.textContent = this.cem.mainGrid?.toJson();
    }
  }
  onFromJson(){
    this.cem.mainGrid?.loadFromJson("");
  }
  onLoadSolution(){
    this.cem.emit(new LoadSolutionEvent());   
  }

  minValueChange(event: unknown){
    if(this.cem.mainGrid){
      console.log("minValueChange",event);
      const value = event as string;
      this.cem.mainGrid.data.minValue = parseInt(value);
    }
  }
  maxValueChange(event: unknown){
    if(this.cem.mainGrid){
      const value = event as string;
      this.cem.mainGrid.data.maxValue = parseInt(value);
    }
  }
  shouldShowTools(){
    const av = this.cem.get(SharedQuery.ACTIVE_VIEW) as ActiveView;
    return av !== undefined;
  }
}
