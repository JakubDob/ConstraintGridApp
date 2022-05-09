import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ConstraintGridComponent } from './constraint-grid/constraint-grid.component';
import { MenuComponent } from './menu/menu.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from './modules/material/material.module';
import { CountOptionsMenuComponent } from './constraint-menu/count-options-menu/count-options-menu.component';
import { AlldifferentOptionsMenuComponent } from './constraint-menu/alldifferent-options-menu/alldifferent-options-menu.component';
import { SharedGridService } from './services/shared-grid.service';
import { GridToolsComponent } from './grid-tools/grid-tools.component';
import { GroupListComponent } from './group-list/group-list.component';
import { ConstraintSelectComponent } from './constraint-select/constraint-select.component';
import { ViewTreeComponent } from './view-tree/view-tree.component';
import { ValueOptionsMenuComponent } from './constraint-menu/value-options-menu/value-options-menu.component';
import { SolutionsComponent } from './solutions/solutions.component';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { ConfigService } from './services/config.service';
import { SolutionOptionsComponent } from './solution-options/solution-options.component';

@NgModule({
  declarations: [
    AppComponent,
    ConstraintGridComponent,
    MenuComponent,
    CountOptionsMenuComponent,
    AlldifferentOptionsMenuComponent,
    GridToolsComponent,
    GroupListComponent,
    ConstraintSelectComponent,
    ViewTreeComponent,
    ValueOptionsMenuComponent,
    SolutionsComponent,
    SolutionOptionsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MaterialModule,
    HttpClientModule,
    FormsModule
  ],
  providers: [
    SharedGridService,
    {
      provide: APP_INITIALIZER,
      deps: [ConfigService],
      useFactory: (configService: ConfigService)=>{
        return ()=>{
          return configService.loadAppConfig();
        }
      },
      multi: true
  }],
  bootstrap: [AppComponent]
})
export class AppModule { }
