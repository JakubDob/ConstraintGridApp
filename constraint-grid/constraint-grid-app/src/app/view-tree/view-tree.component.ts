import { Component } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { FlatTreeControl } from '@angular/cdk/tree';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { ActiveConstraint, ActiveView, AddConstraintEvent, AddViewEvent, BeforeDeleteConstraintEvent, ConstraintMetadata, SharedEventId, SharedGridService, SharedQuery, ViewChangeEvent, ViewMetadata } from 'src/app/services/shared-grid.service';
import { HasUniqueId, Markable } from '../constraint-grid/constraint-grid.component';



class FlatNode{
  static _id_ = 0;
  public id;
  constructor(public name: string, public data: Markable & HasUniqueId, public level: number, public expandable: boolean){
    this.id = FlatNode._id_;
    FlatNode._id_++;
  };
}

type NestedNode = {name: string, data: Markable & HasUniqueId, children: NestedNode[]};

@Component({
  selector: 'view-tree',
  templateUrl: './view-tree.component.html',
  styleUrls: ['./view-tree.component.css']
})
export class ViewTreeComponent {
  checklistSelection = new SelectionModel<FlatNode>(true /* multiple */);
  dataSource: MatTreeFlatDataSource<NestedNode, FlatNode>;
  treeControl: FlatTreeControl<FlatNode>;
  treeFlattener: MatTreeFlattener<NestedNode, FlatNode>;
  
  constructor(private cem: SharedGridService) {
    this.treeControl = new FlatTreeControl<FlatNode>(this.getLevel, this.isExpandable);
    this.treeFlattener = new MatTreeFlattener(this.transform, this.getLevel, this.isExpandable, this.getChildren);
    this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

    cem.on<AddConstraintEvent>(SharedEventId.ADD_CONSTRAINT, e=>{
      this.addFirstLevelNode({name: e.data.name, data: e.data, children: []});
    });
    cem.on<AddViewEvent>(SharedEventId.ADD_VIEW, e=>{
      const parentId = e.data.parentConstraint.id;
      let parentNodeIndex = this.dataSource.data.findIndex(node => node.data.id === parentId);
      
      if(parentNodeIndex !== -1){
        this.addSecondLevelNode({children: [], data: e.data, name: e.data.name}, parentNodeIndex);
        const i = this.dataSource.data.findIndex(node => node.name === e.data.parentConstraint.name);
        this.treeControl.expand(this.treeControl.dataNodes[this.getFlatParentIndex(i)]);
      }
    });
  }

  transform = (node: NestedNode, level: number): FlatNode => {
    return new FlatNode(node.name, node.data, level, node.children.length > 0);
  };
  
  getChildren = (node: NestedNode): NestedNode[] => node.children;
  getLevel = (node: FlatNode) => node.level;
  isExpandable = (node: FlatNode) => node.expandable;
  hasChild = (index: number, node: FlatNode) => node.expandable;

  onClickItem(node: FlatNode){
    const av = this.cem.get(SharedQuery.ACTIVE_VIEW) as ActiveView;
    let newView: ViewMetadata | undefined = undefined;
    if(node.data.hasOwnProperty("views")){
      const data = node.data as ConstraintMetadata;
      this.cem.set(SharedQuery.ACTIVE_CONSTRAINT_ID, data.id);
      this.cem.set(SharedQuery.ACTIVE_VIEW_ID, undefined);
    }
    else if(node.data.hasOwnProperty("groups")){
      const data = node.data as ViewMetadata;
      this.cem.set(SharedQuery.ACTIVE_CONSTRAINT_ID, data.parentConstraint.id);
      this.cem.set(SharedQuery.ACTIVE_VIEW_ID, data.id);
      newView = data;
    }
    this.cem.set(SharedQuery.ACTIVE_GROUP_ID, undefined);
    this.cem.emit(new ViewChangeEvent({oldView: av, newView: newView}));
  }
  descendantsAllSelected(node: FlatNode): boolean{
    const descendants = this.treeControl.getDescendants(node);
    const allSelected = descendants.length > 0 && descendants.every(node=>this.checklistSelection.isSelected(node));
    return allSelected;
  }
  descendantsPartiallySelected(node: FlatNode): boolean{
    const descendants = this.treeControl.getDescendants(node);
    const someSelected = descendants.some(node => this.checklistSelection.isSelected(node));
    return someSelected && !this.descendantsAllSelected(node);
  }
  parentSelectionToggle(node: FlatNode): void{
    this.checklistSelection.toggle(node);
    const descendants = this.treeControl.getDescendants(node);
    this.checklistSelection.isSelected(node) ? this.checklistSelection.select(...descendants) : this.checklistSelection.deselect(...descendants);
    descendants.forEach(child => this.checklistSelection.isSelected(child));
    console.log(this.checklistSelection.selected);
  }
  leafSelectionToggle(node: FlatNode): void {
    this.checklistSelection.toggle(node);
    this.checkParentSelection(node);
    console.log(this.checklistSelection.selected);
  }
  checkParentSelection(node: FlatNode){
    //all child nodes selected -> parent selected; otherwise parent not selected
    const parent = this.getParentNode(node);
    if(!parent) return;
    const nodeSelected = this.checklistSelection.isSelected(parent);
    const descendants = this.treeControl.getDescendants(parent);
    const descAllSelected = descendants.length > 0 
    && descendants.every(child => this.checklistSelection.isSelected(child));
    if(!nodeSelected && descAllSelected){
      this.checklistSelection.select(parent);
    }
    else if(nodeSelected && !descAllSelected){
      this.checklistSelection.deselect(parent);
    }
  }
  /* 
  transforms flat node to nested parent index and nested child index (if node is not a root node)
  not recursive, works only on 0 and 1 level
  */
  getNestedParentChildIdx(node: FlatNode) {
    let ret: {parentIdx: number, childIdx: number | undefined}  = {parentIdx: 0, childIdx: undefined};
    const flatNodes = this.treeControl.dataNodes;
    for(let i = 0;i<flatNodes.length;i++){
      if(i > 0 && flatNodes[i].level === 0){
        ret.parentIdx++;
      }
      if(flatNodes[i].id === node.id){
        break;
      }
    }
    if(node.level === 1){
      const flatCIdx = flatNodes.indexOf(node);
      let flatPIdx = 0;
      for(let i=flatCIdx-1; i >= 0; i--){
        const currentNode = flatNodes[i];
        if(currentNode.level === 0){
          flatPIdx = i;
          break;
        }
      }
      ret.childIdx = flatCIdx - flatPIdx - 1;
    }
    return ret;
  }
  getParentNode(node: FlatNode): FlatNode | null {
    const currentLevel = this.getLevel(node);
    if(currentLevel < 1){
      return null;
    }
    const startIndex = this.treeControl.dataNodes.indexOf(node) -1;
    for(let i = startIndex; i>= 0; i--){
      const currentNode = this.treeControl.dataNodes[i];
      if(this.getLevel(currentNode) < currentLevel){
        return currentNode;
      }
    }
    return null;
  }

  getFlatParentIndex(nestedParentIndex: number){
    let currI = 0, total = 0;
    while(currI < nestedParentIndex){
      total += this.dataSource.data[currI].children.length + 1;
      currI++;
    }
    return total;
  }
  addFirstLevelNode(parent: NestedNode){
    this.dataSource.data.push(parent);
    this.refreshData();
  }
  addSecondLevelNode(child: NestedNode, parentIndex: number){
    console.log("Adding ",child,"to",parentIndex);
    this.dataSource.data[parentIndex].children.push(child);
    this.refreshData();
  }
  addNode(node: NestedNode, parentIndex?: number){
    if(parentIndex !== undefined){
      this.dataSource.data[parentIndex].children.push(node);
      this.refreshData();
      this.treeControl.expand(this.treeControl.dataNodes[this.getFlatParentIndex(parentIndex)]);
    }
    else{
      this.dataSource.data.push(node);
      this.refreshData();
    }
  }
  flatToNested(flatNodes: FlatNode[]){
    const arr: NestedNode[] = [];
    flatNodes.forEach(n=>{
      n.level === 0 ? 
      arr.push({name: n.name, data: n.data, children: []}) : 
      arr[arr.length-1].children.push({name:n.name, data: n.data, children: []});
    });
    return arr;
  }
  onDeleteSelected(){
    if(this.checklistSelection.selected.length === 0) return;
    this.checklistSelection.selected.forEach(flat=>{
      this.cem.mainGrid?.markObject(flat.data);
    });
    const currentView = this.cem.get(SharedQuery.ACTIVE_VIEW) as ActiveView;
    const currentConstraint = this.cem.get(SharedQuery.ACTIVE_CONSTRAINT) as ActiveConstraint;
    if(currentView?.dirty){
      this.cem.set(SharedQuery.ACTIVE_VIEW_ID, undefined);
    }
    if(currentConstraint?.dirty){
      this.cem.set(SharedQuery.ACTIVE_CONSTRAINT_ID, undefined);
    }
    this.cem.mainGrid?.cleanConstraints();
    const newFlatDs = this.treeControl.dataNodes.filter(node => !this.checklistSelection.isSelected(node));
    this.treeControl.dataNodes = newFlatDs;
    const newNestedDs = this.flatToNested(newFlatDs);
    this.dataSource.data = newNestedDs;
    console.log(this.dataSource.data);
    this.checklistSelection.clear();
    this.refreshData();

    const newView = this.cem.get(SharedQuery.ACTIVE_VIEW) as ActiveView;
    this.cem.emit(new ViewChangeEvent({oldView: currentView, newView: newView}));
  }

  refreshData(){
    const data = this.dataSource.data;
    this.dataSource.data = [];
    this.dataSource.data = data;
  }
}
