export default function FloatingWhatsApp() {
  return (
    <a
      href="https://wa.me/31612345678"
      target="_blank"
      rel="noreferrer"
      aria-label="WhatsApp chat openen"
      className="fixed right-6 bottom-6 z-40 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center shadow-lg px-4 py-3 group"
      style={{ minWidth: '56px', minHeight: '56px' }}
    >
      <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M20.52 3.48A11.88 11.88 0 0012 0C5.37 0 .02 5.35 0 12c0 2.11.55 4.17 1.6 6.01L0 24l6.2-1.58A11.94 11.94 0 0012 24c6.63 0 12-5.37 12-12 0-3.2-1.25-6.2-3.48-8.52zM12 21.5c-1.6 0-3.16-.39-4.53-1.13l-.32-.18-3.69.94.98-3.6-.2-.36A9.5 9.5 0 012.5 12 9.5 9.5 0 0112 2.5 9.5 9.5 0 0121.5 12 9.5 9.5 0 0112 21.5z"/>
        <path d="M17.5 14.3c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.95 1.15-.18.2-.36.22-.67.07-.3-.15-1.25-.46-2.38-1.48-.88-.79-1.47-1.77-1.64-2.07-.18-.3-.02-.46.13-.61.13-.13.3-.36.45-.54.15-.18.2-.3.3-.5.1-.2 0-.37-.05-.52-.07-.15-.67-1.62-.92-2.23-.24-.58-.48-.5-.67-.51l-.57-.01c-.2 0-.52.07-.8.37-.28.3-1.07 1.05-1.07 2.56 0 1.5 1.1 2.95 1.25 3.15.15.2 2.16 3.5 5.23 4.9 3.07 1.4 3.07.93 3.62.87.55-.06 1.75-.71 2-1.4.25-.69.25-1.28.18-1.4-.07-.12-.27-.18-.57-.33z"/>
      </svg>
      <span className="hidden sm:inline ml-2 font-semibold text-white text-base group-hover:underline">WhatsApp</span>
    </a>
  );
}
