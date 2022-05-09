import { Component, OnDestroy } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { AddGroupEvent, ViewChangeEvent, SharedEventId, SharedGridService, SharedQuery, ViewSettings, ActiveView, AfterDeleteGroupEvent, ActiveGroup, DeleteEmptyGroupsEvent, GroupChangeEvent, GroupMetadata, UniqueGroupId} from '../services/shared-grid.service';


@Component({
  selector: 'group-list',
  templateUrl: './group-list.component.html',
  styleUrls: ['./group-list.component.css']
})
export class GroupListComponent implements OnDestroy {

  dataSource: ViewSettings[] = [];
  headers: string[] = [];
  headersWithDel: string[] = [];
  tableDataSource: MatTableDataSource<ViewSettings> = new MatTableDataSource();
  clickedRowIdx: number | undefined;
  handlerIds: number[] = [];
  groups: GroupMetadata[] = [];

  constructor(private cem: SharedGridService) {
    this.loadData();

    this.handlerIds.push(cem.on<ViewChangeEvent>(SharedEventId.VIEW_CHANGE, e=>{
      this.cem.set(SharedQuery.ACTIVE_GROUP_ID, undefined);
      this.clickedRowIdx = undefined;
      this.loadData();
    }));
    
    this.handlerIds.push(cem.on<AddGroupEvent>(SharedEventId.ADD_GROUP, e=>{
      this.addGroup();
    }));

    this.handlerIds.push(cem.on<DeleteEmptyGroupsEvent>(SharedEventId.DELETE_EMPTY_GROUPS, e=>{
      let checkedAll = false;
      while(!checkedAll){
        let i = 0;
        for(; i < this.groups.length; i++){
          if(this.groups[i].indices.size === 0){
            this.onDeleteGroupClick(i);
            break;
          }
        }
        if(i === this.groups.length){
          checkedAll = true;
        }
      }
    }));
  }

  ngOnDestroy(): void {
    this.handlerIds.forEach(i=>this.cem.removeHandler(i));
  }

  onClickedRow(rowIdx: number){
    console.log(rowIdx);
    if(rowIdx === this.clickedRowIdx){
      this.resetActiveGroup();
      this.clickedRowIdx = undefined;
      return;
    }
    this.clickedRowIdx = rowIdx;
    const currentGroup = this.cem.get(SharedQuery.ACTIVE_GROUP) as ActiveGroup;
    this.cem.set(SharedQuery.ACTIVE_GROUP_ID, this.groups[rowIdx].id);
    const newGroup = this.cem.get(SharedQuery.ACTIVE_GROUP) as ActiveGroup;
    this.cem.emit(new GroupChangeEvent({oldGroup: currentGroup, newGroup: newGroup}));
    console.log("group id", this.groups[rowIdx].id);
  }

  onDeleteGroupClick(rowIdx: number){
    const ag = this.cem.get(SharedQuery.ACTIVE_GROUP) as ActiveGroup;
    const av = this.cem.get(SharedQuery.ACTIVE_VIEW) as ActiveView;
    if(!av) return;
    const id = this.groups[rowIdx].id;
    if(ag?.id === id){
      this.resetActiveGroup();
    }
    this.groups.splice(rowIdx, 1);
    this.dataSource.splice(rowIdx, 1);
    this.cem.mainGrid?.deleteGroup(av.groups[id]);
    this.refreshData();
    this.cem.emit(new AfterDeleteGroupEvent());
  }

  private resetActiveGroup(): void{
    this.clickedRowIdx = undefined;
    const currentGroup = this.cem.get(SharedQuery.ACTIVE_GROUP) as ActiveGroup;
    this.cem.set(SharedQuery.ACTIVE_GROUP_ID, undefined);
    this.cem.emit(new GroupChangeEvent({oldGroup: currentGroup}));
  }

  isRowSelected(rowIdx: number): boolean{
    return rowIdx === this.clickedRowIdx;
  }
  refreshData(){
    const data = this.tableDataSource.data;
    this.tableDataSource.data = [];
    this.tableDataSource.data = data;
  }

  loadData(){
    const activeView = this.cem.get(SharedQuery.ACTIVE_VIEW) as ActiveView;
    if(activeView){
      this.dataSource = [];
      this.groups = [];
      this.headers = Object.getOwnPropertyNames(activeView.settings);
      this.headersWithDel = [...this.headers,"delete"];
      for(const group of Object.values(activeView.groups)){
        this.dataSource.push(activeView.settings);
        this.groups.push(group);
      }
    }
    this.tableDataSource = new MatTableDataSource(this.dataSource);
    this.refreshData();
  }

  addGroup(){
    this.loadData();
  }
}