export function hexToRgba(hex: string, alpha = 1) {
    // Remove # if present
    hex = hex.replace(/^#/, '');
  
    // Handle 3-digit hex
    if (hex.length === 3) {
      hex = hex.split('').map(char => char + char).join('');
    }
  
    if (hex.length !== 6) {
      throw new Error('Invalid HEX color.');
    }
  
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
  
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }