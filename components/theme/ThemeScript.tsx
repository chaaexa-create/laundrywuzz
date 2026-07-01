export function ThemeScript() {
  const script = `(function(){try{var t=localStorage.getItem('kasir-laundry-theme');if(t==='dark')document.documentElement.classList.add('dark');else document.documentElement.classList.remove('dark');}catch(e){}})();`;

  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
