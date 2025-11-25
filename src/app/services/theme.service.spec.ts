import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  let service: ThemeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ThemeService);
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should toggle theme', () => {
    const initial = service.isDarkMode();
    service.toggleTheme();
    expect(service.isDarkMode()).toBe(!initial);
  });

  it('should save theme preference', () => {
    service.setTheme(true);
    expect(localStorage.getItem('theme')).toBe('dark');
    
    service.setTheme(false);
    expect(localStorage.getItem('theme')).toBe('light');
  });
});
