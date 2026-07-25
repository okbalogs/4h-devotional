'use client'
import { useState } from 'react'
import { Sparkles, ChevronDown, Book, Lightbulb, History } from 'lucide-react'
import './ai-insights.css'

export default function AiInsightsPanel({ verseText, verseRef, activeTab }) {
  const [expanded, setExpanded] = useState(false)
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)

  const handleToggle = async () => {
    const isExpanding = !expanded
    setExpanded(isExpanding)

    if (isExpanding && !data && !loading && !error) {
      setLoading(true)
      try {
        const res = await fetch('/api/insights', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ verseRef, verseText })
        })
        const json = await res.json()
        if (!res.ok) {
          throw new Error(json.error || 'Failed to fetch insights')
        }
        setData(json)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
  }

  if (!verseText) return null

  return (
    <div className="ai-insights-panel">
      <button 
        className="ai-insights-header" 
        onClick={handleToggle}
        aria-expanded={expanded}
      >
        <span className="ai-insights-icon">
          <Sparkles size={16} />
        </span>
        Generate AI Insights
        <span className="ai-insights-chevron">
          <ChevronDown size={16} />
        </span>
      </button>

      {expanded && (
        <div className="ai-insights-content">
          {loading && (
            <div className="ai-insights-skeleton">
              <div className="ai-skel-line full"></div>
              <div className="ai-skel-line medium"></div>
              <div className="ai-skel-line short"></div>
            </div>
          )}

          {error && (
            <div className="ai-error">
              {error} (Check your Gemini API Key)
            </div>
          )}

          {data && !loading && (
            <div className="ai-insights-data animate-fade-in-up">
              
              {/* Head / Hear Tab */}
              {activeTab === 'hear' && data.hear && (
                <>
                  {data.hear.context && (
                    <div className="ai-section">
                      <div className="ai-section-title">
                        <History size={13} /> Historical Context
                      </div>
                      <div className="ai-section-body">
                        {data.hear.context}
                      </div>
                    </div>
                  )}
                  {data.hear.crossReferences && data.hear.crossReferences.length > 0 && (
                    <div className="ai-section">
                      <div className="ai-section-title">
                        <Book size={13} /> Cross References
                      </div>
                      <div className="ai-section-body">
                        <ul>
                          {data.hear.crossReferences.map((ref, idx) => (
                            <li key={idx}>{ref}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Heart / Heed Tab */}
              {activeTab === 'heed' && data.heed && data.heed.reflection && (
                <div className="ai-section">
                  <div className="ai-section-title">
                    <Lightbulb size={13} /> Reflection Prompt
                  </div>
                  <div className="ai-section-body" style={{ fontStyle: 'italic', color: 'var(--clr-primary)' }}>
                    &ldquo;{data.heed.reflection}&rdquo;
                  </div>
                </div>
              )}

              {/* Hand / Hold Tab */}
              {activeTab === 'hold' && data.hold && data.hold.action && (
                <div className="ai-section">
                  <div className="ai-section-title">
                    <Sparkles size={13} /> Practical Action
                  </div>
                  <div className="ai-section-body">
                    {data.hold.action}
                  </div>
                </div>
              )}

              {/* Help / Help Tab */}
              {activeTab === 'help' && data.help && data.help.sharing && (
                <div className="ai-section">
                  <div className="ai-section-title">
                    <Sparkles size={13} /> Sharing & Prayer
                  </div>
                  <div className="ai-section-body">
                    {data.help.sharing}
                  </div>
                </div>
              )}
              
            </div>
          )}
        </div>
      )}
    </div>
  )
}
