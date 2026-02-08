import { useEffect, useRef, useState } from "react";
import { photosApi } from "../lib/photosApi";

interface Photo {
  id: string;
  imageUrl: string;
  alt: string;
  title?: string;
}

interface PhotoState {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export const PhotoGallery = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [positions, setPositions] = useState<PhotoState[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const photoStatesRef = useRef<PhotoState[]>([]);
  const animationFrameRef = useRef<number>();

  const PHOTO_SIZE = 256; // w-64 = 256px
  const PHOTO_RADIUS = PHOTO_SIZE / 2;
  const FRICTION = 0.99;
  const BOUNCE_DAMPING = 0.95;
  const GRAVITY = 0.02;

  // Load photos and setup animation
  useEffect(() => {
    let mounted = true;

    const loadPhotos = async () => {
      try {
        const data = await photosApi.getAll();
        if (mounted) {
          setPhotos(data);
          // Initialize photo states only if we have photos
          if (data.length > 0) {
            const container = containerRef.current;
            if (container) {
              const width = container.clientWidth;
              const height = container.clientHeight;
              const newStates: PhotoState[] = data.map(() => ({
                x: Math.random() * (width - PHOTO_SIZE),
                y: Math.random() * (height - PHOTO_SIZE),
                vx: (Math.random() - 0.5) * 4,
                vy: (Math.random() - 0.5) * 4,
              }));
              photoStatesRef.current = newStates;
              setPositions([...newStates]);
            }
          }
        }
      } catch (error) {
        console.error("Failed to load photos:", error);
      }
    };

    loadPhotos();

    // Refresh photos every 5 seconds to pick up new uploads from admin panel
    const interval = setInterval(loadPhotos, 5000);

    // Animation loop
    const animate = () => {
      const container = containerRef.current;
      if (!container) return;

      const width = container.clientWidth;
      const height = container.clientHeight;
      const states = photoStatesRef.current;

      states.forEach((state) => {
        // Apply gravity
        state.vy += GRAVITY;

        // Apply friction
        state.vx *= FRICTION;
        state.vy *= FRICTION;

        // Update position
        state.x += state.vx;
        state.y += state.vy;

        // Bounce off walls
        if (state.x < 0) {
          state.x = 0;
          state.vx *= -BOUNCE_DAMPING;
        }
        if (state.x + PHOTO_SIZE > width) {
          state.x = width - PHOTO_SIZE;
          state.vx *= -BOUNCE_DAMPING;
        }
        if (state.y < 0) {
          state.y = 0;
          state.vy *= -BOUNCE_DAMPING;
        }
        if (state.y + PHOTO_SIZE > height) {
          state.y = height - PHOTO_SIZE;
          state.vy *= -BOUNCE_DAMPING;
        }
      });

      // Collision detection
      for (let i = 0; i < states.length; i++) {
        for (let j = i + 1; j < states.length; j++) {
          const state1 = states[i];
          const state2 = states[j];

          const dx = state2.x - state1.x;
          const dy = state2.y - state1.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const minDistance = PHOTO_RADIUS * 2;

          if (distance < minDistance) {
            const dvx = state2.vx - state1.vx;
            const dvy = state2.vy - state1.vy;

            // Don't collide if moving apart
            if (dx * dvx + dy * dvy < 0) {
              // Elastic collision response
              const speed = Math.sqrt(dvx * dvx + dvy * dvy);
              const nx = dx / distance;
              const ny = dy / distance;

              const impulse = speed * 0.5;
              state1.vx -= nx * impulse * BOUNCE_DAMPING;
              state1.vy -= ny * impulse * BOUNCE_DAMPING;
              state2.vx += nx * impulse * BOUNCE_DAMPING;
              state2.vy += ny * impulse * BOUNCE_DAMPING;
            }
          }
        }
      }

      setPositions([...states]);
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      mounted = false;
      clearInterval(interval);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <section className="py-20 bg-gradient-to-b from-white to-gray-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Ons Team in Actie
          </h2>
          <p className="text-lg text-gray-600">
            Ontmoet de dynamische pickleball gemeenschap van Almere
          </p>
        </div>

        {/* Animated Photo Grid */}
        <div
          ref={containerRef}
          className="relative w-full bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100"
          style={{ minHeight: "800px" }}
        >
          {positions.length > 0 &&
            positions.map((position, index) => {
              const photo = photos[index];
              if (!photo) return null;
              return (
                <div
                  key={photo.id}
                  className="absolute transition-none"
                  style={{
                    left: `${position.x}px`,
                    top: `${position.y}px`,
                    width: `${PHOTO_SIZE}px`,
                    height: `${PHOTO_SIZE}px`,
                  }}
                >
                  <div className="relative group h-full w-full">
                    {/* Outer glow ring - animated */}
                    <div
                      className={`
                        absolute inset-0 rounded-full
                        bg-gradient-to-r from-ap-blue-400 to-ap-blue-600
                        opacity-0 blur-xl
                        group-hover:opacity-75
                        transition-opacity duration-500
                        scale-110
                      `}
                    />

                    {/* Main photo circle with border */}
                    <div
                      className={`
                        relative w-full h-full rounded-full
                        border-4 border-ap-blue-200
                        overflow-hidden shadow-lg
                        transform transition-transform duration-500
                        group-hover:scale-105
                        group-hover:border-ap-blue-400
                        cursor-grab active:cursor-grabbing
                      `}
                    >
                      {/* Background image */}
                      <img
                        src={photo.imageUrl}
                        alt={photo.alt}
                        className={`
                          w-full h-full object-cover
                          transform transition-transform duration-700
                          group-hover:scale-110
                        `}
                      />

                      {/* Overlay gradient - animated on hover */}
                      <div
                        className={`
                          absolute inset-0
                          bg-gradient-to-t from-ap-blue-900/40 via-transparent to-transparent
                          opacity-0 group-hover:opacity-100
                          transition-opacity duration-500
                        `}
                      />

                      {/* Floating particles effect */}
                      <div className="absolute inset-0">
                        {[...Array(3)].map((_, i) => (
                          <div
                            key={i}
                            className={`
                              absolute w-2 h-2 bg-white rounded-full
                              animate-pulse
                            `}
                            style={{
                              left: `${30 + i * 25}%`,
                              top: `${20 + i * 30}%`,
                              animation: `float 3s ease-in-out ${i * 0.5}s infinite`,
                              opacity: 0,
                            }}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Bottom info card - slides up on hover */}
                    <div
                      className={`
                        absolute -bottom-16 left-1/2 -translate-x-1/2
                        w-full max-w-xs
                        bg-white rounded-lg shadow-lg p-4
                        transform transition-all duration-500
                        opacity-0 group-hover:opacity-100 group-hover:translate-y-2
                      `}
                    >
                      <p className="text-center text-sm text-gray-600 font-medium">
                        {photo.alt}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}

          {/* Loading state message */}
          {positions.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-gray-400">
                {photos.length === 0
                  ? "Geen foto's beschikbaar"
                  : "Foto's laden..."}
              </p>
            </div>
          )}
        </div>

        {/* Animated background elements */}
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
          <div
            className={`
              absolute -top-40 -right-40 w-80 h-80
              bg-ap-blue-100 rounded-full mix-blend-multiply filter blur-3xl
              opacity-20 animate-blob animation-delay-2000
            `}
          />
          <div
            className={`
              absolute -bottom-40 -left-40 w-80 h-80
              bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl
              opacity-20 animate-blob animation-delay-4000
            `}
          />
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
            opacity: 0;
          }
          50% {
            transform: translateY(-20px);
            opacity: 1;
          }
        }

        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </section>
  );
};
