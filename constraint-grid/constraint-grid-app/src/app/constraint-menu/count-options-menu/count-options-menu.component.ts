import { Component, Input} from '@angular/core';

import { 
  SharedGridService,
  SharedQuery,
  AddViewEvent,
  ActiveConstraint
 } 
  from 'src/app/services/shared-grid.service';

/* SELECT SYMBOL*/
interface RelationSymbol {
  value: string;
}

@Component({
  selector: 'count-options-menu',
  templateUrl: './count-options-menu.component.html',
  styleUrls: ['./count-options-menu.component.css']
})
export class CountOptionsMenuComponent {

  @Input()
  selectedConstraint: string = "";

  constructor(private cem: SharedGridService) {}

  onAddView(label: string, symbol: string, amount: string, countedValue: string){
    const ac = this.cem.get(SharedQuery.ACTIVE_CONSTRAINT) as ActiveConstraint;
    if(ac){
      if(label === ""){
        label = "unnamed";
      }
      const amountNum = parseInt(amount);
      const countedNum = parseInt(countedValue);
      const newView = this.cem.View(ac, label, {constraint: "count", label: label, relation: symbol, amount: amountNum, countedValue: countedNum});
      this.cem.mainGrid?.addView(newView);
      this.cem.emit(new AddViewEvent(newView));
    }
  }

  selectedSymbol = "=";

  symbols: RelationSymbol[] = [
    {value: '<'},
    {value: '<='},
    {value: '>'},
    {value: '>='},
    {value: '='}
  ];
}
