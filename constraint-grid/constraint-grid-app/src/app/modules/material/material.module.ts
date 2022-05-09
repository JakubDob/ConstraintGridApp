import { NgModule } from '@angular/core';
import {MatTabsModule} from '@angular/material/tabs';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatButtonModule} from '@angular/material/button';
import {MatSelectModule} from '@angular/material/select';
import {MatInputModule} from '@angular/material/input';
import {MatDividerModule} from '@angular/material/divider';
import {MatCardModule} from '@angular/material/card';
import {MatTreeModule} from '@angular/material/tree';
import {MatIconModule} from '@angular/material/icon';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatTableModule} from '@angular/material/table';
const materialModules = [
  MatTabsModule,
  MatSidenavModule,
  MatButtonModule,
  MatSelectModule,
  MatInputModule,
  MatDividerModule,
  MatCardModule,
  MatTreeModule,
  MatIconModule,
  MatCheckboxModule,
  MatTableModule
];

@NgModule({
  imports: materialModules,
  exports: materialModules
})
export class MaterialModule { }
