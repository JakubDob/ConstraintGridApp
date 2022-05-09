import { Component, QueryList, ViewChildren, ElementRef, AfterViewInit, OnDestroy, Renderer2, Input, OnInit } from '@angular/core';
import { 
  SharedGridService,
  CellIndex,
  SharedQuery,
  Style,
  ActiveGroup,
  ActiveView,
  CellSelectedEvent,
  Grid,
  GroupMetadata,
  CellContent,
  AddGroupEvent,
  ConstraintMetadata,
  ViewMetadata,
  GroupData
} 
  from '../services/shared-grid.service';
import { SolverResult } from '../services/solution.service';

export type Markable = {dirty: boolean};
export type HasUniqueId = {id: number | string};
type Point = {x: number, y: number};
type MovedTile = {movedTilesSet: Set<CellIndex>, missing: number};
const enum TileDirection {
  UP,RIGHT,DOWN,LEFT, __SIZE__
}
@Component({
  selector: 'constraint-grid',
  templateUrl: './constraint-grid.component.html',
  styleUrls: ['./constraint-grid.component.css']
})
export class ConstraintGridComponent implements OnInit, AfterViewInit, OnDestroy {

  @Input()
  cols: number = 3;
  @Input()
  rows: number = 3;

  @ViewChildren("cells")
  queriedGridCells?: QueryList<ElementRef>;
  private _grid: Grid = {
    constraints: {}, 
    content: new Map(), 
    maxValue: 10, 
    minValue: 0, 
    cols: 3, 
    rows: 3,
    solvingMethod: "satisfy"
  };
  private gridCellElements: Array<HTMLElement> = [];
  private elemToIdx: Map<HTMLElement, CellIndex> = new Map();
  private eventHandlerIds: number[] = [];
  public mouseDown = false;
  public selectedCell: CellIndex | undefined;

  constructor(private cem: SharedGridService, private renderer: Renderer2){}

  ngOnInit(): void {
    this.setSize(this.rows, this.cols);
    this.gridCellElements = this.sizeAsArray();
  }

  ngOnDestroy(): void {
    this.eventHandlerIds.forEach(i=>this.cem.removeHandler(i));
  }
  
  ngAfterViewInit(): void {
    this.queriedGridCells?.forEach((e,i)=>{
      this.gridCellElements[i] = e.nativeElement;
      this.elemToIdx.set(e.nativeElement, i);
    });
  }

  setCellContent(index: CellIndex, content: CellContent){
    this.gridCellElements[index].textContent = content;
  }
  targetIsGridCell(target: EventTarget | null){
    return target && this.elemToIdx.has(target as HTMLElement);
  }
  onGridMouseover(event: MouseEvent) {
    if (this.mouseDown && this.targetIsGridCell(event.target)) {
      this.uiSelectGridCell(event.target as HTMLElement);
    }
  }
  onGridMouseDown(event: MouseEvent) {
    this.mouseDown = true;
    if(this.targetIsGridCell(event.target)){
      this.uiSelectGridCell(event.target as HTMLElement);
    }
    //prevents from being dragged
    event.preventDefault();
  }
  onGridMouseUp() {
    this.mouseDown = false;
  }

  uiSelectGridCell(element: HTMLElement): void{
    // ! because index can be 0
    const index = this.elemToIdx.get(element)!;
    const erease = this.cem.get(SharedQuery.EREASER_SELECTED) as boolean;
    console.log("Cell selected",element, this.indexToXY(index));
    
    if(this.selectedCell !== undefined){
      this.renderer.removeClass(this.gridCellElements[this.selectedCell], "selected");
    }
    if(this.selectedCell === index){
      this.selectedCell = undefined;
    }
    else{
      this.selectedCell = index;
      this.renderer.addClass(element, "selected");
    }
    this.cem.emit(new CellSelectedEvent(this.selectedCell));

    if(erease){
      this.ereaseCell(element, index);
    }
    else{
      this.insertCell(element, index);
    }
  }
  ereaseCell(element: HTMLElement, index: CellIndex){
    console.log("Ereaser");
    this.resetStyle(element);
    this.removeFromActiveGroup(index);
  }
  insertCell(element: HTMLElement, index: CellIndex){
    this.insertIntoActiveGroup(index);
    this.setStyleOfElementToActiveGroup(element);
  }
  setGridStyle(){
    return {
      'grid-template-columns': `repeat(${this.cols}, 1fr)`,
      'grid-template-rows': `repeat(${this.rows}, 1fr)`
    }
  }
  sizeAsArray(){
    return new Array(this.rows*this.cols);
  }

  setStyleOfGroup(group: GroupData, style: {[key: string]: string}){
    group.forEach(i=>{
      const element = this.gridCellElements[i];
      for(const [k,v] of Object.entries(style)){
        this.renderer.setStyle(element,k,v);
      }
    })
  }

  addClassToGroup(group: GroupData, styleClass: string){
    group.forEach(i=>{
      const element = this.gridCellElements[i];
      this.renderer.addClass(element, styleClass);
    });
  }

  removeClassFromGroup(group: GroupData, styleClass: string){
    group.forEach(i=>{
      const element = this.gridCellElements[i];
      this.renderer.removeClass(element, styleClass);
    });
  }

  setStyleOfElementToActiveGroup(element: HTMLElement): void{
    const style = this.getActiveGroupStyle();
    if(style){
      for(const [property,value] of Object.entries(style)){
        this.renderer.setStyle(element, property, value);
      }
    }
  }
  getActiveGroupStyle(): Style | null {
    const activeGroup = this.cem.get(SharedQuery.ACTIVE_GROUP) as ActiveGroup;
    if(activeGroup){
      return activeGroup.style;
    }
    return null;
  }

  resetStyle(element: HTMLElement): void{
    this.renderer.removeAttribute(element, "style");
    this.renderer.removeClass(element, "group-selected");
  }

  clearAllCells(){
    this.gridCellElements.forEach(elem=>{
      this.resetStyle(elem);
    });
  }
  drawAllCells(){
    const activeView = this.cem.get(SharedQuery.ACTIVE_VIEW) as ActiveView;
    if(activeView){
      activeView.indexToGroup.forEach((group, cellIdx) =>{
        for(const [prop,val] of Object.entries(group.style)){
          this.renderer.setStyle(this.gridCellElements[cellIdx], prop, val);
        }
      });
    }
  }
  public loadSolution(solution: Array<CellContent>, result: SolverResult): void{
    console.log("Load Solution", solution);
    if(result != SolverResult.OK){
      this.gridCellElements.forEach((cell, index)=>{
        this.renderer.setStyle(cell, "background-color", "white");
        if(result === SolverResult.UNKNOWN){
          this.setCellContent(index, "?");
        }
        else if(result === SolverResult.UNSATISFIABLE){
          this.setCellContent(index, ":(");
        }
      });
      return;
    }
    const valueToColor: Map<CellContent, string> = new Map();
    valueToColor.set("0", "#fff");
    // valueToColor.set(1, "#000");
    solution.forEach(cell=>{
      if(!valueToColor.has(cell)){
        valueToColor.set(cell, this.cem.randomRGBColorHex());
        console.log("valueToColor doesnt have",cell, "setting to random color");
      }
    });
    solution.forEach((cellContent, index)=>{
      let color = valueToColor.get(cellContent);
      this.renderer.setStyle(this.gridCellElements[index], "background-color", color);
      this.setCellContent(index,cellContent);
    });
  }

  public get constraintsMetadata(){
    return this._grid.constraints;
  }
  public get data(){
    return this._grid;
  }

  public setSize(rows: number, cols: number){
    this._grid.cols = cols;
    this._grid.rows = rows;
  }

  public addConstraint(constraint: ConstraintMetadata){
    this._grid.constraints[constraint.id] = constraint;
  }

  public addView(view: ViewMetadata){
    this._grid.constraints[view.parentConstraint.id].views[view.id] = view;
  }

  public addGroup(group: GroupMetadata){
    const pv = group.parentView;
    const pc = pv.parentConstraint;
    group.indices.forEach(i=>{
      pv.indexToGroup.set(i, group);
    });
    this._grid.constraints[pc.id].views[pv.id].groups[group.id] = group;
    this.drawAllCells();
  }

  insertIntoActiveGroup(i: CellIndex){
    const view = this.cem.get(SharedQuery.ACTIVE_VIEW) as ActiveView;
    const group = this.cem.get(SharedQuery.ACTIVE_GROUP) as ActiveGroup;
    if(!view || !group){
      return;
    }
    if(!view.indexToGroup){
      view.indexToGroup = new Map();
    }
    const oldGroup = view.indexToGroup.get(i);
    if(oldGroup !== undefined){
      oldGroup.indices.delete(i);
    }
    view.indexToGroup.set(i, group);
    group.indices.add(i);
  }
  removeFromActiveGroup(i: CellIndex){
    const view = this.cem.get(SharedQuery.ACTIVE_VIEW) as ActiveView;
    if(!view){
      return;
    }
    const oldGroup = view.indexToGroup?.get(i);
    if(oldGroup !== undefined){
      oldGroup.indices.delete(i);
      view.indexToGroup?.delete(i);
    }
    else{
      console.log("Ereaser: Old group is undefined");
    }
  }
  public deleteGroup(group: GroupMetadata){
    const parent = group.parentView;
    group.indices.forEach(cell =>{
      parent.indexToGroup.delete(cell);
    });
    delete parent.groups[group.id];
  }

  public markObject(obj: Markable){
    if(obj.hasOwnProperty("dirty")){
      obj.dirty = true;
    }
  }
  public cleanConstraints(){
    for(let c of Object.values(this._grid.constraints)){
      if(c.dirty){
        delete this._grid.constraints[c.id];
      }
    }

    for(let c of Object.values(this._grid.constraints)){
      for(let v of Object.values(c.views)){
        if(v.dirty){
          delete c.views[v.id];
        }
      }
    }
  }

  private indexToXY(index: CellIndex): Point {
    const col = Math.floor(index % this.rows);
    const row = Math.floor(index / this.rows);
    return {x: col, y: row};
  }
  private XYtoIndex(pos: Point): CellIndex {
    return pos.y * this.cols + pos.x;
  }

  private tileIntersects(total: Set<CellIndex>, next: Array<CellIndex>): boolean{
    return next.some((cell) => total.has(cell));
  }

  private moveFlatCells(cells: Array<CellIndex>, dir: TileDirection){
    for(let i = 0; i< cells.length;i++){
      if(dir === TileDirection.DOWN){
        cells[i] += this.cols;
      }
      else if(dir === TileDirection.LEFT){
        //left boundry without wrapping
        const val = Math.floor(cells[i] % this.cols);
        cells[i] = val > 0 ? cells[i] - 1 : -1;
      }
      else if(dir === TileDirection.RIGHT){
        //right boundry without wrapping
        const val = Math.floor(cells[i] % this.cols) + 1;
        cells[i] = val === this.cols ? this.rows*this.cols : cells[i] + 1;
      }
      else if(dir === TileDirection.UP){
        cells[i] -= this.cols;
      }
    }
    return cells;
  }

  //returns coords for new spot or null if all tiles are outside of board
  private tileFindSpot(pattern: Set<CellIndex>, total: Set<CellIndex>, dir: TileDirection): Set<CellIndex> | null{
    let movedTiles = Array.from(pattern);
    while(true){
      this.moveFlatCells(movedTiles, dir);
      if(!this.tileIntersects(total, movedTiles)){
        break;
      }
    }
    const movedTilesSet = new Set(movedTiles.filter((i => i >= 0 && i < this.rows*this.cols)));
    if(movedTilesSet.size === 0){
      return null;
    }
    return movedTilesSet;
  }

  public tile(){
    const activeGroup = this.cem.get(SharedQuery.ACTIVE_GROUP) as ActiveGroup;
    const activeView = this.cem.get(SharedQuery.ACTIVE_VIEW) as ActiveView;
    if(!activeGroup || !activeView) return;
    const theShape = new Set(activeGroup.indices);
    const totalIndices = new Set<CellIndex>();
    const queue: Set<CellIndex>[] = [];
    activeView.indexToGroup.forEach((group, cell)=>{
      totalIndices.add(cell);
    });
    for(let i = 0; i< TileDirection.__SIZE__; i++){
      const move = this.tileFindSpot(theShape, totalIndices, i);
      if(move) queue.push(move);
    }
    queue.sort((a,b) => a.size - b.size );

    while(queue.length > 0){
      const next = queue.pop();
      if(next){
        if(this.tileIntersects(totalIndices, [...next])){
          continue;
        }
        next.forEach(i=>totalIndices.add(i));
        const newGroup = this.cem.Group(activeView, next);
        this.addGroup(newGroup);
        this.cem.emit(new AddGroupEvent(newGroup));
        for(let i =0; i< TileDirection.__SIZE__; i++){
          const move = this.tileFindSpot(next, totalIndices, i);
          if(move) queue.push(move);
        }
        queue.sort((a,b) => a.size - b.size );
      }
    }
  }

  fill(){
    const activeView = this.cem.get(SharedQuery.ACTIVE_VIEW) as ActiveView;
    const activeGroup = this.cem.get(SharedQuery.ACTIVE_GROUP) as ActiveGroup;
    if(!activeGroup || !activeView) return;
    this.gridCellElements.forEach((elem, index)=>{
      if(!activeView.indexToGroup?.has(index)){
        this.setStyleOfElementToActiveGroup(elem);
        this.insertCell(elem,index);
      }
    })
  }


  public loadFromJson(json: any){
    console.log(json);
  }

  public toJson(): string{
    const json = JSON.stringify(this._grid, (key,val)=>{
      //circular references
      if(
        key === "parentConstraint" || 
        key === "parentView" || 
        key === "style" || 
        key === "indexToGroup" || 
        key === "viewLabel" || 
        key === "dirty" ||
        key === "id"){
        return undefined;
      }
      else if(val instanceof Set){
        return Array.from(val);
      }
      else if(key === "content" && val instanceof Map){
        const jsonObj: any = {};
        console.log("toJson() map",val);
        val.forEach((v,k)=>{
          jsonObj[k] = v;
        });
        return jsonObj;
      }
      return val;
    });
    return json;
  }
}