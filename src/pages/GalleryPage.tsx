import { useState } from 'react';
import { useCmsGallery } from '../lib/cms-hooks';
import { Section, LoadingState } from '../components/ui';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

export default function GalleryPage() {
  const { data: gallery, loading } = useCmsGallery();
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [selectedCat, setSelectedCat] = useState<string>('all');

  const categories = ['all', ...Array.from(new Set(gallery.map((g) => g.category).filter(Boolean) as string[]))];
  const filtered = selectedCat === 'all' ? gallery : gallery.filter((g) => g.category === selectedCat);

  const openLightbox = (index: number) => setLightbox(index);
  const closeLightbox = () => setLightbox(null);
  const nextImage = () => setLightbox((prev) => (prev === null ? null : (prev + 1) % filtered.length));
  const prevImage = () => setLightbox((prev) => (prev === null ? null : (prev - 1 + filtered.length) % filtered.length));

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.pexels.com/photos/207692/pexels-photo-207692.jpeg?auto=compress&cs=tinysrgb&w=1920"
            alt="Gallery"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-ink-950/80 via-ink-950/70 to-ink-950/90" />
        </div>
        <div className="container-wide relative z-10">
          <div className="section-eyebrow text-gold-400 mb-4">Campus Gallery</div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.1] max-w-3xl text-balance">
            Moments that define Meridian
          </h1>
          <p className="mt-6 text-lg lg:text-xl text-ink-200 leading-relaxed max-w-2xl text-pretty">
            Explore our campus, events, and the vibrant life of our university community through these captured moments.
          </p>
        </div>
      </section>

      {/* Category filter */}
      {categories.length > 1 && (
        <div className="bg-white border-b border-ink-100 sticky top-20 z-30">
          <div className="container-wide py-4 flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCat(cat)}
                className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                  selectedCat === cat ? 'bg-ink-900 text-white' : 'bg-ink-100 text-ink-700 hover:bg-ink-200'
                }`}
              >
                {cat === 'all' ? 'All' : cat}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Gallery grid */}
      <Section className="bg-ink-50">
        {loading ? (
          <LoadingState />
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-ink-500">No gallery items available.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((item, i) => (
              <button
                key={item.id}
                onClick={() => openLightbox(i)}
                className="group relative aspect-square rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 animate-fade-in-up"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <img
                  src={item.image_url}
                  alt={item.title || 'Gallery image'}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink-950/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                {item.title && (
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-left translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                    <p className="text-white font-medium text-sm">{item.title}</p>
                    {item.category && (
                      <p className="text-white/70 text-xs capitalize mt-0.5">{item.category}</p>
                    )}
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </Section>

      {/* Lightbox */}
      {lightbox !== null && filtered[lightbox] && (
        <div
          className="fixed inset-0 bg-ink-950/90 z-[100] flex items-center justify-center animate-fade-in"
          onClick={closeLightbox}
        >
          <button
            onClick={closeLightbox}
            className="absolute top-6 right-6 text-white/80 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X size={28} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); prevImage(); }}
            className="absolute left-4 lg:left-8 text-white/80 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <ChevronLeft size={36} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); nextImage(); }}
            className="absolute right-4 lg:right-8 text-white/80 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <ChevronRight size={36} />
          </button>
          <div className="max-w-5xl max-h-[85vh] px-16" onClick={(e) => e.stopPropagation()}>
            <img
              src={filtered[lightbox].image_url}
              alt={filtered[lightbox].title || 'Gallery image'}
              className="max-w-full max-h-[80vh] object-contain rounded-lg"
            />
            {filtered[lightbox].title && (
              <p className="text-center text-white/90 mt-4 font-medium">{filtered[lightbox].title}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
