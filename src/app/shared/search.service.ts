import { Injectable, NgZone } from '@angular/core';
import { Observable, race, ReplaySubject, timer, ConnectableObservable } from 'rxjs';
import { WebWorkerClient } from './web-worker-client';
import { first, concatMap, publishReplay } from 'rxjs/operators';

export interface SearchResults {
  query: string;
  results: SearchResult[];
}

export interface SearchResult {
  path: string
  hash: string;
  title: string;
}

@Injectable()
export class SearchService {
  private ready: Observable<boolean>;
  private searchesSubject = new ReplaySubject<string>(1);
  private worker: WebWorkerClient;

  constructor(private zone: NgZone) {
  }

  initWorker(workerUrl: string, initDelay: number) {
    const ready = this.ready = race<any>(
      timer(initDelay),
      this.searchesSubject.asObservable().pipe(first()),
    ).pipe(
      concatMap(() => {
        this.worker = WebWorkerClient.create(workerUrl, this.zone);
        return this.worker.sendMessage<boolean>('load-index');
      }),
      publishReplay(1),
    );

    (ready as ConnectableObservable<boolean>).connect();
    return ready;
  }

  search(query: string): Observable<SearchResults> {
    this.searchesSubject.next(query);
    return this.ready.pipe(concatMap(() => this.worker.sendMessage<SearchResults>('query-index', query)));
  }
}
