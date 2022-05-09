import { Component, OnInit } from '@angular/core';
import { SharedGridService } from '../services/shared-grid.service';

@Component({
  selector: 'solution-options',
  templateUrl: './solution-options.component.html',
  styleUrls: ['./solution-options.component.css']
})
export class SolutionOptionsComponent implements OnInit {

  solvingMethod: string[] = ["satisfy","minimize","maximize"];
  selected: string = this.solvingMethod[0];

  constructor(private cem: SharedGridService) { }

  onSelectionChange(value: string){
    this.selected = value;
    const mainGrid = this.cem.mainGrid;
    if(mainGrid){
      mainGrid.data.solvingMethod = value;
    }
  }
  ngOnInit(): void {
  }

}
