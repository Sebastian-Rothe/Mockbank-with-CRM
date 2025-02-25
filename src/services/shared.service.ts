import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SharedService {
  private uid: string | null = null;

  /**
   * Formats a Unix timestamp into the format MM/DD/YYYY.
   * @param {number} timestamp - The timestamp in milliseconds.
   * @returns {string} The formatted date as a string.
   */
  formatTimestampToDate(timestamp: number): string {
    const date = new Date(timestamp);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const year = date.getFullYear();

    return `${month}/${day}/${year}`;
  }

  /**
   * Formats a Unix timestamp into a detailed date string in the format MM/DD/YYYY HH:MM:SS.
   * @param {number} timestamp - The timestamp in milliseconds.
   * @returns {string} The formatted date and time as a string.
   */
  formatTimestampToDetailedDate(timestamp: number): string {
    const date = new Date(timestamp);

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const year = date.getFullYear();

    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${month}/${day}/${year} ${hours}:${minutes}:${seconds}`;
  }

  /**
   * Formats a number as currency in EUR (€) using German locale.
   * @param {number} value - The numeric value to be formatted.
   * @returns {string} The formatted currency string.
   */
  getFormattedCurrency(value: number): string {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      currencyDisplay: 'narrowSymbol',
    }).format(value).replace(/\s€/g, '€'); // Removes spaces before €
  }
}
