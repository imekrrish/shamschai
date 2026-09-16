import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';
import { useProduct } from '../context/CatalogContext';
import { CatalogNotice, Eyebrow, Reveal } from '../components/ui';
import { openLaunchEmail } from '../utils/launchMail';

export function PackagingFeedback() {
  const [params] = useSearchParams();
  const recipeParam = params.get('recipe') || 'recipe-01';
  const { product: currentRecipe, loading, error, reload } = useProduct(recipeParam);

  const [vote, setVote] = useState<'keep' | 'refine' | 'retire' | null>(null);
  const [notes, setNotes] = useState('');
  const [voted, setVoted] = useState(false);

  const handleVoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentRecipe) return;
    const voteLabel = vote === 'keep' ? 'KEEP IT (🔥)' : vote === 'refine' ? 'REFINE IT (😐)' : 'RETIRE IT (💀)';
    const subject = encodeURIComponent(`Packaging QR Feedback: ${currentRecipe.recipeNumber} - ${voteLabel}`);
    const body = encodeURIComponent(
      `RECIPE FEEDBACK FROM PACKAGING QR\n\n` +
      `Recipe: ${currentRecipe.recipeNumber} (${currentRecipe.variantNameSlot})\n` +
      `Verdict: ${voteLabel}\n` +
      `Tasting Notes: ${notes || 'No notes provided.'}\n`
    );
    window.location.href = `mailto:support@shamschai.com?subject=${subject}&body=${body}`;
    setVoted(true);
  };

  if (!currentRecipe) {
    return (
      <section className="section packaging-feedback-page">
        <CatalogNotice loading={loading} error={error} reload={reload} heading />
      </section>
    );
  }

  return (
    <div className="packaging-feedback-page">
      <section className="page-hero feedback-hero">
        <Eyebrow>PACKAGING TASTING VERDICT</Eyebrow>
        <span className="holding-tag">YOU’RE HOLDING:</span>
        <div className="pack-recipe-identity">
          <h1>{currentRecipe.variantNameSlot}</h1>
          <span className="recipe-num-badge">{currentRecipe.recipeNumber}</span>
        </div>

        <div className="pack-intro-statement">
          <p>This recipe started as an experiment.</p>
          <p>It became a cup.</p>
          <strong>Now it’s yours.</strong>
        </div>
      </section>

      <section className="section feedback-action-section">
        <div className="feedback-card">
          <h2>WHAT DID YOU THINK?</h2>
          <p className="verdict-helper">
            Your feedback directly informs whether this recipe remains in The Collection, undergoes lab refinement, or gets retired.
          </p>

          {!voted ? (
            <form onSubmit={handleVoteSubmit} className="feedback-vote-form">
              <div className="vote-options-row">
                <button
                  type="button"
                  className={`vote-btn vote-keep ${vote === 'keep' ? 'selected' : ''}`}
                  onClick={() => setVote('keep')}
                >
                  <span className="vote-emoji">🔥</span>
                  <strong>KEEP IT</strong>
                  <small>Permanent staple in my ritual</small>
                </button>

                <button
                  type="button"
                  className={`vote-btn vote-refine ${vote === 'refine' ? 'selected' : ''}`}
                  onClick={() => setVote('refine')}
                >
                  <span className="vote-emoji">😐</span>
                  <strong>REFINE IT</strong>
                  <small>Almost there, tweak the spices</small>
                </button>

                <button
                  type="button"
                  className={`vote-btn vote-retire ${vote === 'retire' ? 'selected' : ''}`}
                  onClick={() => setVote('retire')}
                >
                  <span className="vote-emoji">💀</span>
                  <strong>RETIRE IT</strong>
                  <small>Send it back to the laboratory</small>
                </button>
              </div>

              <div className="feedback-notes-input">
                <label htmlFor="tasting-notes">What stood out to you? (Aroma, tea body, sweetness, spice bite)</label>
                <textarea
                  id="tasting-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Share your honest first sip impression..."
                  rows={4}
                />
              </div>

              <button
                type="submit"
                disabled={!vote}
                className="btn btn-light submit-verdict-btn"
              >
                Submit Your Verdict <ArrowRight size={14} />
              </button>
            </form>
          ) : (
            <div className="voted-confirmation">
              <CheckCircle2 size={24} />
              <h3>Verdict Recorded.</h3>
              <p>Thank you for contributing to the craft of Shams. Your feedback helps shape our collection.</p>
            </div>
          )}

          <div className="next-drop-callout">
            <span>WANT TO SEE WHAT WE’RE MAKING NEXT?</span>
            <Link to="/the-lab" className="btn btn-outline">
              Join The Next Drop <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
