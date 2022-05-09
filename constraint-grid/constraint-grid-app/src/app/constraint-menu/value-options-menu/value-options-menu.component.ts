import { Component, Output, EventEmitter, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { HandlerUniqueIdType } from 'src/app/services/shared-data-event.service';
import { CellContentChangedEvent, CellSelectedEvent, SharedEventId, SharedGridService } from 'src/app/services/shared-grid.service';

@Component({
  selector: 'value-options-menu',
  templateUrl: './value-options-menu.component.html',
  styleUrls: ['./value-options-menu.component.css']
})
export class ValueOptionsMenuComponent implements OnDestroy {
  @Output()
  minChange = new EventEmitter();
  @Output()
  maxChange = new EventEmitter();
  @ViewChild("selectedCellValue")
  selectedRef?: ElementRef;

  private handlerIds: HandlerUniqueIdType[] = [];
  private selectedCellIndex: number | undefined;

  constructor(private cem: SharedGridService) {
    this.handlerIds.push(cem.on<CellSelectedEvent>(SharedEventId.CELL_SELECTED, e=>{
      this.selectedCellIndex = e.index;
      if(this.selectedRef && this.selectedCellIndex !== undefined){
        const elem = this.selectedRef.nativeElement as HTMLInputElement;
        const currContent = this.cem.mainGrid?.data.content.get(this.selectedCellIndex);
        console.log("currContent",currContent);
        if(currContent !== undefined){
          elem.value = currContent;
        }
        else{
          elem.value = "";
        }
      }
    }));
  }

  ngOnDestroy(): void {
    this.handlerIds.forEach(h => this.cem.removeHandler(h));
  }

  minInput(event: Event){
    const input = event.target as HTMLInputElement;
    this.minChange.emit(input.value);
  }
  maxInput(event: Event){
    const input = event.target as HTMLInputElement;
    this.maxChange.emit(input.value);
  }
  selectedInput(value: string){
    if(this.selectedCellIndex !== undefined){
      this.cem.mainGrid?.data.content.set(this.selectedCellIndex, value);
      console.log("Changing cell content to",value);
      this.cem.emit(new CellContentChangedEvent({data: value, index: this.selectedCellIndex}));
    }
  }
}
