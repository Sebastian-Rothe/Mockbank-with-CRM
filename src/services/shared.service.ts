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
  formatTimestampToDetailedDate(timestamp: number): string {
    const date = new Date(timestamp);
  
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Monate sind 0-basiert
    const year = date.getFullYear();
  
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
  
    return `${month}/${day}/${year} ${hours}:${minutes}:${seconds}`;
  }

  getFormattedCurrency(value: number): string {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      currencyDisplay: 'narrowSymbol',
    }).format(value).replace(/\s€/g, '€'); // 🔹 Entfernt Leerzeichen vor €
  }
  
}
