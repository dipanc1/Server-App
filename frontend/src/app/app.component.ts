import { Component, OnInit } from '@angular/core';
import { BehaviorSubject, startWith } from 'rxjs';
import { map } from 'rxjs';
import { catchError } from 'rxjs';
import { of } from 'rxjs';
import { Observable } from 'rxjs';
import { DataState } from './enum/data-state.enum';
import { Status } from './enum/status.enum';

import { AppState } from './interface/app-state';
import { CustomResponse } from './interface/custom-reponse';
import { ServerService } from './service/server.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  appState$: Observable<AppState<CustomResponse>>

  constructor(private serverService: ServerService) { }

  readonly DataState = DataState;
  readonly Status = Status;

  private filterSubject = new BehaviorSubject<string>('');
  private dataSubject = new BehaviorSubject<CustomResponse>(null);
  filterStatus$ = this.filterSubject.asObservable();

  ngOnInit(): void {
    this.appState$ = this.serverService.servers$
      .pipe(
        map(response => {
          return {
            dataState: DataState.LOADED_STATE, appData: response
          }
        }),
        startWith({
          dataState: DataState.LOADING_STATE
        }),
        catchError((error: string) => {
          return of({
            dataState: DataState.ERROR_STATE,
            error
          })
        })
      )
  }

  pingServer(ipAddress: string): void {
    this.filterSubject.next(ipAddress);
    this.appState$ = this.serverService.ping$(ipAddress)
      .pipe(
        map(response => {
          this.dataSubject.next()
          return {
            dataState: DataState.LOADED_STATE, appData: response
          }
        }),
        startWith({
          dataState: DataState.LOADING_STATE
        }),
        catchError((error: string) => {
          return of({
            dataState: DataState.ERROR_STATE,
            error
          })
        })
      )
  }

}
