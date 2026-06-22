import { useEffect, useState } from 'react';
import Modal from './Modal';

type Review = { name: string; rating: number; text: string; date: string; photo?: string };

const STORAGE_KEY = 'ap_reviews';
const TRIALS_KEY = 'trialsCompleted';
const TRIAL_SIGNED_KEY = 'trialSigned';

function readReviews(): Review[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeReviews(reviews: Review[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
}

export default function ReviewsCarousel() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [rating, setRating] = useState(5);
  const [text, setText] = useState('');
  const [photoData, setPhotoData] = useState<string | undefined>(undefined);
  const [canPost, setCanPost] = useState(false);

  useEffect(() => {
    setReviews(readReviews());
    setCanPost(localStorage.getItem(TRIALS_KEY) === 'true' || localStorage.getItem(TRIAL_SIGNED_KEY) === 'true');
  }, []);

  const handleFile = (file?: File) => {
    if (!file) { setPhotoData(undefined); return; }
    const fr = new FileReader();
    fr.onload = () => setPhotoData(String(fr.result));
    fr.readAsDataURL(file);
  };

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!name || !text) return alert('Vul naam en review in.');
    if (!canPost) return alert('Je kunt pas een review plaatsen nadat je proeflessen afgerond zijn.');
    const r: Review = { name, rating, text, date: new Date().toISOString(), photo: photoData };
    const next = [r, ...reviews];
    writeReviews(next);
    setReviews(next);
    setOpen(false);
    setName(''); setRating(5); setText(''); setPhotoData(undefined);
    alert('Bedankt voor je review!');
  };

  return (
    <section className="w-full bg-white">
      <div className="w-full overflow-hidden">
        <div className="flex items-center justify-between w-full px-4 py-6">
          <h3 className="text-2xl font-bold max-w-screen-xl mx-auto">Reviews</h3>
          <div className="max-w-screen-xl mx-auto px-4 hidden sm:block" />
        </div>

        <div className="w-full">
          {reviews.length === 0 ? (
            <div className="w-full text-center text-gray-600 py-8">Nog geen reviews — wees de eerste na je proeflessen!</div>
          ) : (
            <div className="relative w-full overflow-hidden">
              <div
                className="flex gap-6 items-stretch py-6"
                style={{ width: `${reviews.length * 100}vw`, animation: 'reviews-scroll 25s linear infinite' }}
              >
                {reviews.map((r, i) => (
                  <article key={i} className="min-w-[100vw] flex-shrink-0 bg-primary-50 p-6">
                    <div className="max-w-screen-xl mx-auto">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                          {r.photo ? <img src={r.photo} alt={r.name} className="w-full h-full object-cover"/> : <span className="text-gray-600 text-xl">{r.name.charAt(0)}</span>}
                        </div>
                        <div>
                          <div className="font-semibold text-lg">{r.name}</div>
                          <div className="text-sm text-yellow-500">{'★'.repeat(r.rating)}</div>
                        </div>
                      </div>
                      <p className="text-gray-700 text-base leading-relaxed whitespace-pre-wrap">{r.text}</p>
                      <div className="text-xs text-gray-500 mt-4">{new Date(r.date).toLocaleDateString()}</div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <Modal open={open} title="Plaats review" onClose={() => setOpen(false)}>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm">Naam</label>
            <input value={name} onChange={e => setName(e.target.value)} className="w-full border px-3 py-2 rounded" required />
          </div>
          <div>
            <label className="block text-sm">Rating</label>
            <select value={rating} onChange={e => setRating(Number(e.target.value))} className="w-full border px-3 py-2 rounded">
              {[5,4,3,2,1].map(v => <option key={v} value={v}>{v} sterren</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm">Review</label>
            <textarea value={text} onChange={e => setText(e.target.value)} rows={4} className="w-full border px-3 py-2 rounded" required />
          </div>
          <div>
            <label className="block text-sm mb-1">Foto (optioneel)</label>
            <input type="file" accept="image/*" onChange={(e) => handleFile(e.target.files ? e.target.files[0] : undefined)} />
            {photoData && <div className="mt-2 w-24 h-24 rounded overflow-hidden"><img src={photoData} alt="preview" className="w-full h-full object-cover" /></div>}
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setOpen(false)} className="bg-gray-200 px-4 py-2 rounded">Annuleren</button>
            <button type="submit" className="bg-primary-500 text-white px-4 py-2 rounded">Verstuur</button>
          </div>
        </form>
      </Modal>

      <style>{`
        @keyframes reviews-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  );
}