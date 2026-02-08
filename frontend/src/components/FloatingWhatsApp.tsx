import { useEffect, useState } from "react";

export const FloatingWhatsApp = () => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleWhatsAppClick = () => {
    const phoneNumber = "31634956678"; // Replace with actual WhatsApp number
    const message = "Hallo! Ik wil meer informatie over Almere Pickleball.";
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <>
      {/* Floating WhatsApp Button */}
      <button
        onClick={handleWhatsAppClick}
        className={`
          fixed right-6 z-40
          w-16 h-16 rounded-full
          bg-gradient-to-br from-green-400 to-green-600
          hover:from-green-500 hover:to-green-700
          shadow-lg hover:shadow-2xl
          transform transition-all duration-300 ease-out
          flex items-center justify-center
          group
        `}
        style={{
          bottom: `${Math.max(24, 120 + scrollY * 0.05)}px`,
        }}
        title="Stuur ons een WhatsApp bericht"
      >
        {/* Pulse animation background */}
        <div
          className={`
            absolute inset-0 rounded-full
            bg-green-400 opacity-0
            group-hover:opacity-20
            animate-pulse
          `}
        />

        {/* WhatsApp Icon SVG */}
        <svg
          className="w-8 h-8 text-white relative z-10 group-hover:scale-110 transition-transform"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.272-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-5.031 1.378c-3.055 2.281-3.585 6.144-1.177 9.322 1.46 1.957 3.631 3.09 5.9 3.09 1.624 0 3.213-.56 4.51-1.591l.324-.213 3.383.886 1.071-3.2-.075-.12c1.396-2.215 1.628-5.003.39-7.516-2.282-4.693-7.604-6.778-12.371-4.636z" />
        </svg>

        {/* Tooltip */}
        <div
          className={`
            absolute right-full mr-3 -top-2
            bg-gray-900 text-white text-sm font-medium
            px-3 py-2 rounded-lg whitespace-nowrap
            opacity-0 group-hover:opacity-100
            transition-opacity duration-300
            pointer-events-none
          `}
        >
          WhatsApp ons
          <div
            className={`
              absolute left-full top-1/2 -translate-y-1/2
              border-4 border-transparent border-l-gray-900
            `}
          />
        </div>
      </button>

      {/* Floating decoration particles */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute right-8 top-1/2 -translate-y-1/2 w-1 h-1 bg-green-400 rounded-full animate-pulse opacity-30" />
        <div className="absolute right-12 top-1/3 w-1.5 h-1.5 bg-green-300 rounded-full animate-pulse opacity-20 animation-delay-1000" />
      </div>
    </>
  );
};
