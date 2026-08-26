export function TipButton() {
  const KOFI_URL = 'https://ko-fi.com/yankdufn';

  return (
    <a
      href={KOFI_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-vintage-accent/10 border border-vintage-accent/30 text-vintage-accent text-sm font-mono hover:bg-vintage-accent/20 transition-all"
    >
      <span>☕</span>
      <span>Offrir un café</span>
    </a>
  );
}