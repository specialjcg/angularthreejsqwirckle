import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { CubeComponent } from './cube/cube.component';
import {HttpClientModule} from "@angular/common/http";
import {ButtonModule} from 'primeng/button';

@NgModule({
  imports: [
    BrowserModule,
    HttpClientModule,
    ButtonModule,

  ],
  declarations: [
    AppComponent,CubeComponent
  ],
  providers: [],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ],
  bootstrap: [AppComponent],
  exports:[ButtonModule]
})
export class AppModule { }
