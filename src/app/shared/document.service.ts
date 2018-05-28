import { Injectable } from '@angular/core';
import { Observable, AsyncSubject } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { DocumentationItemsService } from './documentation-items.service';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError } from 'rxjs/operators';

@Injectable()
export class DocumentService {

  private cache = new Map<string, Observable<string>>();

  constructor(
    private http: HttpClient,
    private docItemsService: DocumentationItemsService
  ) {
  }

  getDocument(doc: string): Observable<string> {
    const url = `/assets/documents/${doc}.html`;
    if (!this.cache.has(url)) {
      this.cache.set(url, this.fetchDocument(url));
    }
    return this.cache.get(url)!;
  }

  private fetchDocument(url: string): Observable<string> {
    const subject = new AsyncSubject<string>();
    this.http.get(url, { responseType: 'text' })
      .pipe(catchError((error: HttpErrorResponse) => {
        console.log(error);
        return `Failed to load document: ${url}. Error: ${error.statusText}`;
      }))
      .subscribe(subject);
    return subject.asObservable();
  }
}
