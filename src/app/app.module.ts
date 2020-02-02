import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MapComponent } from './map/map.component';
import { FontAwesomeModule, FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faMapMarker } from '@fortawesome/free-solid-svg-icons';
import { MarkerComponent } from './marker/marker.component';
import { ControlPanelCardComponent } from './control-panel-card/control-panel-card.component';
import { MomentModule } from 'ngx-moment';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxLoadingModule } from 'ngx-loading';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';
import { RecordsTableComponent } from './records-table/records-table.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  declarations: [
    AppComponent,
    MapComponent,
    MarkerComponent,
    ControlPanelCardComponent,
    RecordsTableComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FontAwesomeModule,
    MomentModule,
    FormsModule,
    ReactiveFormsModule,
    NgxLoadingModule.forRoot({}),
    BrowserAnimationsModule,
    ToastrModule.forRoot(),
    NgbModule
  ],
  providers: [],
  bootstrap: [AppComponent],
  entryComponents: [MarkerComponent, RecordsTableComponent]
})
export class AppModule {

  constructor(private faIconLibrary: FaIconLibrary) {
    faIconLibrary.addIcons(faMapMarker);
  }
}
