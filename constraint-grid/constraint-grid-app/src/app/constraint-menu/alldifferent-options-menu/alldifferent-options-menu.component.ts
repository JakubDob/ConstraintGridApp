import { Component, Input } from '@angular/core';
import { ActiveConstraint, AddViewEvent, SharedGridService, SharedQuery } from 'src/app/services/shared-grid.service';

@Component({
  selector: 'alldifferent-options-menu',
  templateUrl: './alldifferent-options-menu.component.html',
  styleUrls: ['./alldifferent-options-menu.component.css']
})
export class AlldifferentOptionsMenuComponent {
  @Input()
  selectedConstraint: string = "";

  constructor(private cem: SharedGridService) {}

  onAddView(label: string){
    const ac = this.cem.get(SharedQuery.ACTIVE_CONSTRAINT) as ActiveConstraint;
    if(ac){
      if(label === ""){
        label = "unnamed";
      }
      const newView = this.cem.View(ac, label, {constraint: "alldifferent", label: label});
      this.cem.mainGrid?.addView(newView);
      this.cem.emit(new AddViewEvent(newView));
    }
  }

}
