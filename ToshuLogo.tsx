export function ToshuLogo() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Tomato body - red circle */}
      <circle cx="16" cy="17" r="11" fill="#E53E3E" />
      
      {/* Green crown/stem on top */}
      <path 
        d="M13 7 L13 9 L15 8 L16 10 L17 8 L19 9 L19 7 L17 8 L16 6 L15 8 Z" 
        fill="#48BB78" 
      />
      
      {/* Slight highlight for dimension */}
      <circle cx="13" cy="14" r="2" fill="#FC8181" opacity="0.5" />
    </svg>
  );
}
