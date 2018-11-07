import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Upload } from '../models/upload.model';

@Injectable({
  providedIn: 'root'
})

export class UploadsService {

  API_URL = 'http://localhost:3000/api/uploads/';
  uploads: Upload[];

  constructor(private httpClient: HttpClient) { }

  postUpload(upload: Upload) {
    return this.httpClient.post<Upload>(`${this.API_URL}`, upload);
  }

  deleteUpload(id: string) {
    return this.httpClient.delete(`${this.API_URL}` + id);
  }
}