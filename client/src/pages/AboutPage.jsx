import React from 'react';
import { Utensils, HeartHandshake, ShieldCheck, Sparkles, ChefHat, Clock, Award, Leaf, Smile, CheckCircle2 } from 'lucide-react';
import SEOHead from '../components/SEOHead';

const AboutPage = () => {
  const featureCards = [
    { title: 'Authentic South Indian Taste', desc: 'Handed down over generations using traditional spice ratios and authentic stone-ground batters.', icon: Utensils },
    { title: 'Traditional Recipes', desc: 'Inspired by authentic culinary heritage from Mylapore, Kumbakonam, Mysore, and Udupi.', icon: Award },
    { title: 'Fresh Ingredients', desc: 'No preservatives or artificial coloring. Stone-ground batter prepared fresh twice daily.', icon: Leaf },
    { title: 'Experienced Chefs', desc: 'South Indian culinary masters specialized in cast-iron dosa roasting and brass filter coffee brewing.', icon: ChefHat },
    { title: 'Hygiene & Quality', desc: 'Strict FSSAI compliance, eco-friendly banana leaf containers, and automated kitchen sanitization.', icon: ShieldCheck },
    { title: 'Customer Satisfaction', desc: 'Dedicated to serving hot, crispy, delicious meals with memorable South Indian hospitality.', icon: Smile }
  ];

  return (
    <div>
      <SEOHead title="About Us | Dakshin Bhavan South Indian Restaurant" />

      {/* Hero Header */}
      <section style={{
        background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
        color: '#FFFFFF',
        textAlign: 'center',
        padding: '4rem 1rem'
      }}>
        <div className="container">
          <span style={{ backgroundColor: 'rgba(217, 119, 6, 0.2)', color: 'var(--color-gold)', padding: '6px 16px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 700 }}>
            Our Story & Restaurant Heritage
          </span>
          <h1 style={{ fontSize: '3rem', fontFamily: 'var(--font-heading)', color: '#FFFFFF', margin: '1rem 0 0.8rem 0' }}>
            Rooted in South Indian Culinary Tradition
          </h1>
          <p style={{ maxWidth: '700px', margin: '0 auto', fontSize: '1.1rem', color: '#E2E8F0', lineHeight: 1.6 }}>
            At Dakshin Bhavan, food is a celebration of culture and hospitality. We bring the rich, authentic flavors of South India straight to your table.
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section style={{ backgroundColor: 'var(--color-cream)', padding: '4rem 0' }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '3rem',
            alignItems: 'center'
          }}>
            
            <div>
              <span style={{ fontSize: '0.85rem', color: 'var(--color-gold)', fontWeight: 700, textTransform: 'uppercase' }}>
                Our Story
              </span>
              <h2 style={{ fontSize: '2.2rem', fontFamily: 'var(--font-heading)', color: 'var(--color-emerald)', marginBottom: '1rem', marginTop: '4px' }}>
                The Art of Perfect Dosas & Kumbakonam Filter Coffee
              </h2>
              <p style={{ fontSize: '1rem', color: 'var(--color-text-muted)', marginBottom: '1rem', lineHeight: 1.7 }}>
                Our restaurant journey began with a simple philosophy: true South Indian food requires zero compromise on authentic ingredients. Every morning at 4:00 AM, our chefs begin grinding high-grade urad dal and rice in traditional stone wet-grinders to achieve natural, fluffy batter fermentation.
              </p>
              <p style={{ fontSize: '1rem', color: 'var(--color-text-muted)', marginBottom: '1.5rem', lineHeight: 1.7 }}>
                Every dosa is roasted on seasoned cast-iron tawas with pure A2 cow ghee, served alongside three freshly prepared coconut, coriander, and spiced tomato-garlic chutneys.
              </p>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ padding: '1rem', borderLeft: '4px solid var(--color-gold)', backgroundColor: '#FFFFFF', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                  <h4 style={{ fontSize: '1rem', color: 'var(--color-emerald)', fontWeight: 800 }}>100% Pure Veg</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: 0 }}>Strictly vegetarian kitchen environment</p>
                </div>
                <div style={{ padding: '1rem', borderLeft: '4px solid #16A34A', backgroundColor: '#FFFFFF', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                  <h4 style={{ fontSize: '1rem', color: 'var(--color-emerald)', fontWeight: 800 }}>Zero Preservatives</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: 0 }}>Batter prepared fresh twice daily</p>
                </div>
              </div>
            </div>

            <div>
              <img
                src="https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=800&q=80"
                alt="Authentic South Indian Dosa"
                style={{
                  borderRadius: '24px',
                  boxShadow: '0 12px 30px rgba(0,0,0,0.12)',
                  width: '100%',
                  height: '420px',
                  objectFit: 'cover'
                }}
              />
            </div>

          </div>
        </div>
      </section>

      {/* Feature Cards Grid */}
      <section style={{ backgroundColor: '#FFFFFF', padding: '4rem 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-gold)', fontWeight: 700, textTransform: 'uppercase' }}>
              Why Guests Love Dakshin Bhavan
            </span>
            <h2 style={{ fontSize: '2.2rem', fontFamily: 'var(--font-heading)', color: 'var(--color-emerald)', margin: '4px 0' }}>
              Quality, Hygiene & Customer Satisfaction
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {featureCards.map((card, idx) => {
              const Icon = card.icon;
              return (
                <div key={idx} style={{
                  padding: '2rem 1.5rem',
                  borderRadius: '20px',
                  backgroundColor: 'var(--color-cream-alt)',
                  border: '1px solid var(--color-border)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                  transition: 'transform 0.2s'
                }}>
                  <div style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '16px',
                    backgroundColor: 'var(--color-emerald)',
                    color: 'var(--color-gold)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1rem'
                  }}>
                    <Icon size={26} />
                  </div>
                  <h3 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-heading)', color: 'var(--color-emerald)', marginBottom: '0.5rem', fontWeight: 800 }}>
                    {card.title}
                  </h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', lineHeight: 1.6, margin: 0 }}>
                    {card.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

    </div>
  );
};

export default AboutPage;
