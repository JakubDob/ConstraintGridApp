import { Injectable, OnDestroy } from '@angular/core';
import { ConstraintGridComponent } from '../constraint-grid/constraint-grid.component';
import { HandlerUniqueIdType, HasUniqueId, SharedDataEventService } from './shared-data-event.service';

/* ===================================== Event declarations =========================================== */

export const enum SharedQuery {
  EREASER_SELECTED,
  ACTIVE_CONSTRAINT,
  ACTIVE_VIEW,
  ACTIVE_GROUP,
  ACTIVE_GROUP_ID,
  ACTIVE_VIEW_ID,
  ACTIVE_CONSTRAINT_ID,
  __LENGTH__
}

export const enum SharedEventId {
  ADD_CONSTRAINT,
  ADD_VIEW,
  ADD_GROUP,
  VIEW_CHANGE,
  GROUP_CHANGE,
  BEFORE_DELETE_CONSTRAINT,
  AFTER_DELETE_GROUP,
  LOAD_SOLUTION,
  DELETE_EMPTY_GROUPS,
  CELL_SELECTED,
  CELL_CONTENT_CHANGED,
  TILE,
  FILL,
  __LENGTH__
}

abstract class CsGridEvent implements HasUniqueId { constructor(readonly __id__: SharedEventId) { if (__id__ < 0 || __id__ >= SharedEventId.__LENGTH__) throw Error(`Event id ${__id__} out of range`) }; }

//intellisense type branding hack to correctly hint type aliases (& {})
export type CellIndex = number & {};
export type UniqueGroupId = number & {};
export type UniqueViewId = number & {};
export type UniqueConstraintId = number;
export type ConstraintName = string & {};
export type Style = object;
export type ViewSettings = any;
export type GroupData = Set<CellIndex>;
export type CellContent = string & {};

export type GroupMetadata = {
  id: UniqueGroupId,
  indices: GroupData,
  style: Style,
  parentView: ViewMetadata
};
export type ViewMetadata = {
  id: UniqueViewId,
  name: string,
  parentConstraint: ConstraintMetadata,
  settings: ViewSettings,
  /**@type {Object.<UniqueGroupId, GroupMetadata} */
  groups: {[key: number]: GroupMetadata},
  indexToGroup: Map<CellIndex, GroupMetadata>,
  dirty: boolean
};
export type ConstraintMetadata = {
  id: UniqueConstraintId,
  name: string,
  /**@type {Object.<UniqueViewId, ViewMetadata} */
  views: {[key: number]: ViewMetadata},
  dirty: boolean
};
export type Grid = {
  /**@type {Object.<UniqueConstraintId, ConstraintMetadata} */
  constraints: {[key: number]: ConstraintMetadata }
  content: Map<CellIndex, CellContent | undefined>,
  minValue: number,
  maxValue: number,
  cols: number,
  rows: number,
  solvingMethod: string
};

export type CellData = { index: CellIndex, data: CellContent };
export type ActiveConstraintId = UniqueConstraintId | undefined;
export type ActiveViewId = UniqueViewId | undefined;
export type ActiveGroupId = UniqueGroupId | undefined;
export type ActiveConstraint = ConstraintMetadata | undefined;
export type ActiveGroup = GroupMetadata | undefined;
export type ActiveView = ViewMetadata | undefined;
export type GroupChangeData = { oldGroup?: GroupMetadata, newGroup?: GroupMetadata };
export type ViewChangeData = { oldView?: ViewMetadata, newView?: ViewMetadata };
export class AddGroupEvent extends CsGridEvent { constructor(private _data: GroupMetadata) { super(SharedEventId.ADD_GROUP); } get data() { return this._data } };
export class AddConstraintEvent extends CsGridEvent { constructor(private _data: ConstraintMetadata) { super(SharedEventId.ADD_CONSTRAINT); } get data() { return this._data; } };
export class AddViewEvent extends CsGridEvent { constructor(private _data: ViewMetadata) { super(SharedEventId.ADD_VIEW); } get data() { return this._data; } };
export class ViewChangeEvent extends CsGridEvent { constructor(private _data: ViewChangeData) { super(SharedEventId.VIEW_CHANGE); } get data() { return this._data; } };
export class BeforeDeleteConstraintEvent extends CsGridEvent { constructor(private _data: ConstraintMetadata) { super(SharedEventId.BEFORE_DELETE_CONSTRAINT); } get data() { return this._data; } };
export class AfterDeleteGroupEvent extends CsGridEvent { constructor() { super(SharedEventId.AFTER_DELETE_GROUP); } };
export class LoadSolutionEvent extends CsGridEvent { constructor() { super(SharedEventId.LOAD_SOLUTION); } };
export class DeleteEmptyGroupsEvent extends CsGridEvent { constructor() { super(SharedEventId.DELETE_EMPTY_GROUPS); } };
export class CellSelectedEvent extends CsGridEvent { constructor(private _data?: CellIndex) { super(SharedEventId.CELL_SELECTED); } get index() { return this._data; } };
export class CellContentChangedEvent extends CsGridEvent { constructor(private _data: CellData) { super(SharedEventId.CELL_CONTENT_CHANGED); } get data() { return this._data; } };
export class GroupChangeEvent extends CsGridEvent { constructor(private _data: GroupChangeData) { super(SharedEventId.GROUP_CHANGE); } get data() { return this._data; } };
export class TileEvent extends CsGridEvent { constructor() { super(SharedEventId.TILE); } };
export class FillEvent extends CsGridEvent { constructor() { super(SharedEventId.FILL); } };

@Injectable({
  providedIn: 'root'
})
export class SharedGridService extends SharedDataEventService<CsGridEvent> implements OnDestroy {
  private _mainGrid?: ConstraintGridComponent;
  private _solutionGrid?: ConstraintGridComponent;
  private eventHandlerIds: HandlerUniqueIdType[] = [];


  get mainGrid() {
    return this._mainGrid;
  }
  get solutionGrid() {
    return this._solutionGrid;
  }

  constructor() {
    super();

    this.set(SharedQuery.ACTIVE_CONSTRAINT, () => {
      const cId = this.get(SharedQuery.ACTIVE_CONSTRAINT_ID) as ActiveConstraintId;
      if(cId !== undefined && this.mainGrid){
        return this.mainGrid.constraintsMetadata[cId];
      }
      return undefined;
    });

    this.set(SharedQuery.ACTIVE_VIEW, () => {
      const ac = this.get(SharedQuery.ACTIVE_CONSTRAINT) as ActiveConstraint;
      if(ac){
        const aVid = this.get(SharedQuery.ACTIVE_VIEW_ID) as ActiveViewId;
        if(aVid !== undefined){
          return ac.views[aVid];
        }
      }
      return undefined;
    });

    this.set(SharedQuery.ACTIVE_GROUP, () => {
      const av = this.get(SharedQuery.ACTIVE_VIEW) as ActiveView;
      if(av){
        const aGid = this.get(SharedQuery.ACTIVE_GROUP_ID) as ActiveGroupId;
        if(aGid){
          return av.groups[aGid];
        }
      }
      return undefined;
    });

    this.eventHandlerIds.push(this.on<LoadSolutionEvent>(SharedEventId.LOAD_SOLUTION, () => {
      // this._solutionGrid?.loadSolution();
      console.log("LOAD_SOLUTION NOT IMPLEMENTED");
    }));

    this.eventHandlerIds.push(this.on<GroupChangeEvent>(SharedEventId.GROUP_CHANGE, e => {
      const oldGroup = e.data.oldGroup?.indices;
      const newGroup = e.data.newGroup?.indices;
      oldGroup && this.mainGrid?.removeClassFromGroup(oldGroup, "group-selected");
      newGroup && this.mainGrid?.addClassToGroup(newGroup, "group-selected");
    }));

    this.eventHandlerIds.push(this.on<ViewChangeEvent>(SharedEventId.VIEW_CHANGE, e => {
      const av = this.get(SharedQuery.ACTIVE_VIEW) as ActiveView;
      if (!av) {
        this._mainGrid?.clearAllCells();
        return;
      }
      if (e.data.newView) {
        this._mainGrid?.clearAllCells();
        this._mainGrid?.drawAllCells();
        console.log("Redrawing all cells after view change");
      }
    }));

    this.eventHandlerIds.push(this.on<AfterDeleteGroupEvent>(SharedEventId.AFTER_DELETE_GROUP, e => {
      this._mainGrid?.clearAllCells();
      this._mainGrid?.drawAllCells();
      console.log("Redrawing cells after group delete");
    }));

    this.eventHandlerIds.push(this.on<CellContentChangedEvent>(SharedEventId.CELL_CONTENT_CHANGED, e => {
      this._mainGrid?.setCellContent(e.data.index, e.data.data);
    }));

  }
  ngOnDestroy(): void {
    this.eventHandlerIds.forEach(e => this.removeHandler(e));
  }

  setMainGrid(grid: ConstraintGridComponent) {
    this._mainGrid = grid;
  }
  setSolutionGrid(grid: ConstraintGridComponent) {
    this._solutionGrid = grid;
  }

  Group = (()=>{
    let _id = 0;
    return (parentView: ViewMetadata, indices?: GroupData) => {
      _id++;
      return <GroupMetadata>{
        id: _id,
        indices: indices ? indices : new Set(),
        parentView: parentView,
        style: {"background-color":this.randomRGBColorHex()}, 
      }
    }
  })();
  
  View = (()=>{
    let _id = 0;
    return (
      parentConstraint: ConstraintMetadata, 
      name?: string, 
      settings?: ViewSettings, 
      /**@type {Object.<UniqueGroupId, GroupMetadata} */
      groups?: {[key: number]: GroupMetadata},
      indexToGroup?: Map<CellIndex, GroupMetadata>) =>{
       
        _id++;

        return <ViewMetadata>{
          id: _id,
          name: name ? name : "",
          parentConstraint: parentConstraint,
          groups: groups ? groups : {},
          indexToGroup: indexToGroup ? indexToGroup : new Map(),
          settings: settings ? settings : {},
          dirty: false
        }
      }
  })();
  
  Constraint = (()=>{
    let _id = 0;
    /**@type {Object.<UniqueViewId, ViewMetadata} */
    return (name: string, views?: {[key: number]: ViewMetadata})=>{
      _id++;
      return <ConstraintMetadata>{
        id: _id,
        name: name,
        views: views ? views : {},
        dirty: false
      }
    }
  })();

  public randomRGBColorHex(){
    const r = Math.floor(Math.random()*256);
    const g = Math.floor(Math.random()*256);
    const b = Math.floor(Math.random()*256);
    return `rgb(${r},${g},${b})`;
  }
}

