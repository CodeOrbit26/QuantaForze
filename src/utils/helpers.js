/**
  Helper utilities for DOM manipulation & theme management
 */
export function toggleClass(element, className, force) {
  if (!element) return;
  element.classList.toggle(className, force);
}

export function getStoredTheme() {
  return localStorage.getItem('quanta-theme') || 'light';
}

export function setStoredTheme(theme) {
  localStorage.setItem('quanta-theme', theme);
}
