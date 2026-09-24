import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import { toast } from 'react-toastify'
import { getCropPrimaryImage } from '../features/crops/utils'

const slides = [
  {
    title: 'Direct farm supply for serious buyers',
    text: 'Connect verified farmers and merchants with transparent orders, payments, reports, and live status updates.',
  },
  {
    title: 'Fresh crops, visible stock, faster trade',
    text: 'Browse produce by category, price, quantity, and farmer details before adding products to cart.',
  },
  {
    title: 'Role-based operations in one platform',
    text: 'Admins manage the marketplace, merchants manage purchases, and farmers track demand from one secure workspace.',
  },
]

export default function Home() {
  const [crops, setCrops] = useState([])
  const [active, setActive] = useState(0)
  const [loading, setLoading] = useState(true)

  // Contact form state
  const [contactName, setContactName] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [contactMessage, setContactMessage] = useState('')
  const [contactSending, setContactSending] = useState(false)
  const [contactSent, setContactSent] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => setActive(index => (index + 1) % slides.length), 4500)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    api.get('/crops')
      .then(res => setCrops((res.data || []).filter(crop => crop.verified).slice(0, 6)))
      .finally(() => setLoading(false))
  }, [])

  const stats = useMemo(() => [
    ['Verified crops', crops.length],
    ['Platform roles', 3],
    ['Order workflow', 'Live'],
    ['Payments', 'Tracked'],
  ], [crops.length])

  const handleContactSubmit = async (e) => {
    e.preventDefault()
    if (!contactName.trim() || !contactEmail.trim() || !contactMessage.trim()) {
      toast.error('Please fill in all fields.')
      return
    }
    setContactSending(true)
    try {
      const res = await api.post('/enquiry', {
        name: contactName.trim(),
        email: contactEmail.trim(),
        message: contactMessage.trim(),
      })
      toast.success(res.data?.message || 'Message sent successfully!')
      setContactName('')
      setContactEmail('')
      setContactMessage('')
      setContactSent(true)
      setTimeout(() => setContactSent(false), 5000)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send message. Please try again.')
    } finally {
      setContactSending(false)
    }
  }

  return (
    <div className="home-page">
      <section className="home-hero">
        <div className="container hero-inner">
          <div className="hero-copy">
            <span className="eyebrow">Farmer Merchant Integration</span>
            <h1>FarmTrade</h1>
            <p>{slides[active].text}</p>
            <div className="hero-actions">
              <Link className="btn btn-primary" to="/search">Browse Crops</Link>
              <Link className="btn btn-light" to="/register">Create Account</Link>
            </div>
          </div>
          <div className="hero-panel">
            <div className="slider-card">
              <span>0{active + 1} / 03</span>
              <h2>{slides[active].title}</h2>
              <div className="slider-dots">
                {slides.map((slide, index) => <button key={slide.title} className={active === index ? 'active' : ''} onClick={() => setActive(index)} aria-label={`Show slide ${index + 1}`} />)}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container section-block">
        <div className="section-heading"><span>Features</span><h2>Built for marketplace operations</h2></div>
        <div className="feature-grid">
          {['Role-based dashboards', 'Searchable crop catalog', 'Filtered order tables', 'Cart and checkout flow', 'Payment history', 'Reports and notifications'].map(item => (
            <div className="feature-card" key={item}><h3>{item}</h3><p>Clean workflows, loading states, secure APIs, and responsive screens for daily use.</p></div>
          ))}
        </div>
      </section>

      <section className="container section-block">
        <div className="section-heading"><span>Top Crops</span><h2>Verified produce on the marketplace</h2></div>
        {loading ? <div className="loading-state">Loading crops...</div> : (
          <div className="crop-grid">
            {crops.map(crop => (
              <article className="crop-card" key={crop._id}>
                {getCropPrimaryImage(crop) ? <img src={getCropPrimaryImage(crop)} alt={crop.cropName} /> : <div className="crop-image-placeholder">{crop.category || 'Crop'}</div>}
                <div className="crop-card-body">
                  <h5>{crop.cropName}</h5>
                  <p>{crop.description || 'Fresh marketplace produce from a verified farmer.'}</p>
                  <dl className="crop-meta">
                    <div><dt>Price</dt><dd>Rs. {crop.price}</dd></div>
                    <div><dt>Stock</dt><dd>{crop.quantity}</dd></div>
                  </dl>
                </div>
              </article>
            ))}
            {crops.length === 0 && <div className="empty-state grid-empty">No verified crops available yet</div>}
          </div>
        )}
      </section>

      <section className="section-band">
        <div className="container split-section">
          <div><span className="eyebrow">Why choose us</span><h2>Less friction between harvest and market</h2><p>FarmTrade gives each role its own secure workspace while keeping orders, stock, payments, and reports connected.</p></div>
          <div className="stats-grid">{stats.map(([label, value]) => <div key={label}><strong>{value}</strong><span>{label}</span></div>)}</div>
        </div>
      </section>

      <section className="container section-block">
        <div className="testimonial-grid">
          <div><span className="eyebrow">Testimonials</span><h2>Designed for trust and speed</h2></div>
          <blockquote>"The dashboard makes it clear which orders need action and which crops are ready for merchants."</blockquote>
          <blockquote>"Filtering products and tracking payments from one place saves time during peak procurement."</blockquote>
        </div>
      </section>

      <section className="container section-block">
        <div className="faq-contact-grid">
          <div>
            <div className="section-heading"><span>FAQ</span><h2>Common questions</h2></div>
            {['How are roles protected?', 'Can merchants see admin data?', 'Are reports exportable?'].map((q, index) => (
              <details key={q} open={index === 0}><summary>{q}</summary><p>JWT-protected APIs and route guards scope data by Admin, Merchant, and Farmer roles.</p></details>
            ))}
          </div>
          <form className="contact-card contact-card-enhanced" onSubmit={handleContactSubmit}>
            <div className="contact-card-header">
              <div className="contact-card-icon">✉</div>
              <div>
                <h3>Get in Touch</h3>
                <p className="contact-card-subtitle">Have a question? We'd love to hear from you.</p>
              </div>
            </div>
            {contactSent ? (
              <div className="contact-success-msg">
                <div className="contact-success-icon">✓</div>
                <strong>Message Sent!</strong>
                <span>We'll get back to you shortly.</span>
              </div>
            ) : (
              <>
                <div className="contact-field">
                  <label className="form-label" htmlFor="contact-name">Full Name</label>
                  <input
                    id="contact-name"
                    className="form-control"
                    placeholder="Enter your name"
                    value={contactName}
                    onChange={e => setContactName(e.target.value)}
                    disabled={contactSending}
                    required
                  />
                </div>
                <div className="contact-field">
                  <label className="form-label" htmlFor="contact-email">Email Address</label>
                  <input
                    id="contact-email"
                    className="form-control"
                    type="email"
                    placeholder="you@example.com"
                    value={contactEmail}
                    onChange={e => setContactEmail(e.target.value)}
                    disabled={contactSending}
                    required
                  />
                </div>
                <div className="contact-field">
                  <label className="form-label" htmlFor="contact-message">Message</label>
                  <textarea
                    id="contact-message"
                    className="form-control"
                    rows="4"
                    placeholder="Write your message here..."
                    value={contactMessage}
                    onChange={e => setContactMessage(e.target.value)}
                    disabled={contactSending}
                    required
                  />
                </div>
                <button className="btn btn-primary contact-submit-btn" type="submit" disabled={contactSending}>
                  {contactSending ? (
                    <><span className="contact-spinner"></span> Sending...</>
                  ) : (
                    'Send Message'
                  )}
                </button>
              </>
            )}
          </form>
        </div>
      </section>
    </div>
  )
}

