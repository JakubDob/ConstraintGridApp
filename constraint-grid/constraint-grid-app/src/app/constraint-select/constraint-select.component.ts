import { Component, OnInit } from '@angular/core';
import { AddConstraintEvent, SharedGridService } from '../services/shared-grid.service';

interface Constraint {
  name: string;
}

@Component({
  selector: 'constraint-select',
  templateUrl: './constraint-select.component.html',
  styleUrls: ['./constraint-select.component.css']
})
export class ConstraintSelectComponent implements OnInit {

  constructor(private cem: SharedGridService) {}
  
  constraints: Constraint[] =[
    {name: 'alldifferent'},
    {name: 'count'}
  ];

  onAddConstraint(name: string){
    if(!name){
      return;
    }
    const constraints = this.cem.mainGrid?.constraintsMetadata;
    if(constraints){
      for(let c of Object.values(constraints)){
        if(c.name === name){
          return;
        }
      }
    }
    const newConstraint = this.cem.Constraint(name);
    this.cem.mainGrid?.addConstraint(newConstraint);
    this.cem.emit(new AddConstraintEvent(newConstraint));
  }

  ngOnInit(): void {
  }

}
