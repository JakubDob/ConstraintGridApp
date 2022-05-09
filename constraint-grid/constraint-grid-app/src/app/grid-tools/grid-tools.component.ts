import { Component, OnInit } from '@angular/core';
import { ActiveView, AddGroupEvent, DeleteEmptyGroupsEvent, FillEvent, SharedGridService, SharedQuery, TileEvent } from '../services/shared-grid.service';

@Component({
  selector: 'grid-tools',
  templateUrl: './grid-tools.component.html',
  styleUrls: ['./grid-tools.component.css']
})
export class GridToolsComponent {

  private ereaser = false;

  constructor(private cem: SharedGridService) { }

  onEreaserClick(){
    this.ereaser = !this.ereaser;
    this.cem.set(SharedQuery.EREASER_SELECTED, this.ereaser);
  }
  onAddGroup(){
    const av = this.cem.get(SharedQuery.ACTIVE_VIEW) as ActiveView;
    if(av){
      const group = this.cem.Group(av);
      this.cem.mainGrid?.addGroup(group);
      this.cem.emit(new AddGroupEvent(group));
    }
  }
  onDeleteEmptyGroups(){
    this.cem.emit(new DeleteEmptyGroupsEvent());
  }
  onTileClick(){
    this.cem.emit(new TileEvent());
    console.log("Tile button clicked");
  }
  onFillClick(){
    this.cem.emit(new FillEvent());
  }
  getEreaserColor(){
    return this.ereaser ? "warn" : "";
  }

}
