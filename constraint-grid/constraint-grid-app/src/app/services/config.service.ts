import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
//https://stackoverflow.com/questions/43193049/app-settings-the-angular-way
export class ConfigService {

  private appConfig: any;
  constructor(private http: HttpClient) {}
  
  async loadAppConfig(){
    return this.http.get("/assets/config.json")
    .toPromise()
    .then(data=>{
      this.appConfig = data;
    });
  }

  get apiBaseUrl(){
    if(!this.appConfig){
      throw Error("Config file not loaded");
    }
    return this.appConfig.environment === "dev" ? this.appConfig.apiDevBaseUrl : this.appConfig.apiProdBaseUrl;
  }
}
