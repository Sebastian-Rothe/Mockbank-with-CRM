import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SharedService {
  private uid: string | null = null;

  setUid(uid: string | null): void {
    this.uid = uid;
  }

  getUid(): string | null {
    return this.uid;
  }
}
