import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SharedService {
  private uid: string | null = null;

  setUid(uid: string | null): void {
    this.uid = uid;
  }

  getUid(): string | null {
    return this.uid;
  }

  /**
   * Formatiert einen Unix-Timestamp in das Format DD/MM/YYYY.
   * @param timestamp Zeitstempel in Millisekunden
   * @returns Formatiertes Datum als String
   */
  formatTimestampToDate(timestamp: number): string {
    const date = new Date(timestamp);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Monate sind 0-basiert
    const year = date.getFullYear();

    return `${month}/${day}/${year}`;
  }
}
