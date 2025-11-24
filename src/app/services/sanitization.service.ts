import { Injectable } from '@angular/core';
import { DomSanitizer, SafeHtml, SafeUrl, SafeResourceUrl } from '@angular/platform-browser';

/**
 * Sanitization Service - Protects against XSS attacks
 * 
 * Provides methods to sanitize user input before displaying or using it
 */
@Injectable({
  providedIn: 'root'
})
export class SanitizationService {

  constructor(private sanitizer: DomSanitizer) {}

  /**
   * Sanitizes HTML content to prevent XSS attacks
   * 
   * @param html - Raw HTML string
   * @returns Sanitized HTML safe for rendering
   */
  sanitizeHtml(html: string): SafeHtml {
    return this.sanitizer.sanitize(1, html) || '';
  }

  /**
   * Sanitizes URLs to prevent XSS through malicious links
   * 
   * @param url - Raw URL string
   * @returns Sanitized URL safe for href attributes
   */
  sanitizeUrl(url: string): SafeUrl {
    return this.sanitizer.sanitize(4, url) || '';
  }

  /**
   * Sanitizes resource URLs (for iframes, etc.)
   * 
   * @param url - Raw resource URL string
   * @returns Sanitized resource URL
   */
  sanitizeResourceUrl(url: string): SafeResourceUrl {
    return this.sanitizer.sanitize(5, url) || '';
  }

  /**
   * Escapes HTML special characters in plain text
   * Useful for displaying user input as plain text
   * 
   * @param text - Raw text input
   * @returns Escaped text safe for HTML display
   */
  escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Removes all HTML tags from a string
   * 
   * @param html - HTML string
   * @returns Plain text without HTML tags
   */
  stripHtml(html: string): string {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  }

  /**
   * Validates and sanitizes email addresses
   * 
   * @param email - Email address to validate
   * @returns Sanitized email or null if invalid
   */
  sanitizeEmail(email: string): string | null {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const trimmedEmail = email.trim().toLowerCase();
    
    if (!emailRegex.test(trimmedEmail)) {
      return null;
    }
    
    return trimmedEmail;
  }

  /**
   * Sanitizes names (removes special characters and scripts)
   * 
   * @param name - Name to sanitize
   * @returns Sanitized name
   */
  sanitizeName(name: string): string {
    // Allow letters, spaces, hyphens, and apostrophes
    return name.replace(/[^a-zA-ZäöüÄÖÜß\s\-']/g, '').trim();
  }

  /**
   * Sanitizes account names and descriptions
   * 
   * @param text - Text to sanitize
   * @returns Sanitized text
   */
  sanitizeAccountText(text: string): string {
    // Remove potential script tags and dangerous characters
    return text
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/<[^>]+>/g, '')
      .trim();
  }

  /**
   * Validates and sanitizes numeric input
   * 
   * @param value - Numeric value as string or number
   * @returns Sanitized number or null if invalid
   */
  sanitizeNumber(value: string | number): number | null {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    
    if (isNaN(num) || !isFinite(num)) {
      return null;
    }
    
    return num;
  }

  /**
   * Sanitizes monetary amounts
   * 
   * @param amount - Amount to sanitize
   * @returns Sanitized amount with max 2 decimal places
   */
  sanitizeAmount(amount: string | number): number | null {
    const sanitized = this.sanitizeNumber(amount);
    
    if (sanitized === null || sanitized < 0) {
      return null;
    }
    
    return Math.round(sanitized * 100) / 100; // Round to 2 decimals
  }
}
