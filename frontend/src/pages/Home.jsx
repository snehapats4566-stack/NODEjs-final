import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import PetCard from '../components/PetCard';
import { Search, SlidersHorizontal } from 'lucide-react';

const STATUS_FILTERS = ['all', 'available', 'adopted', 'pending'];
const SPECIES_FILTERS = ['all', 'dog', 'cat', 'bird', 'rabbit', 'other'];

export default function Home() {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('available');
  const [species, setSpecies] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchPets = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 12 };
      if (status !== 'all') params.status = status;
      if (species !== 'all') params.species = species;
      const { data } = await api.get('/pets', { params });
      setPets(data.data);
      setPages(data.pages);
      setTotal(data.total);
    } catch {
      setPets([]);
    } finally {
      setLoading(false);
    }
  }, [status, species, page]);

  useEffect(() => {
    setPage(1);
  }, [status, species]);

  useEffect(() => {
    fetchPets();
  }, [fetchPets]);

  const filtered = search.trim()
    ? pets.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.breed.toLowerCase().includes(search.toLowerCase())
      )
    : pets;

  return (
    <>
      {/* ── Hero ── */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="container hero-content">
          <div className="hero-eyebrow">
            🐾 Find Your Perfect Companion
          </div>
          <h1>
            Every Pet Deserves a <br />
            <span className="highlight">Loving Home</span>
          </h1>
          <p>
            Browse hundreds of adorable pets waiting for adoption.
            Give them a second chance at a happy life.
          </p>
          <div className="hero-cta">
            <a href="#pets" className="btn btn-primary btn-lg">
              Browse Pets
            </a>
            <Link to="/register" className="btn btn-ghost btn-lg">
              Create Account
            </Link>
          </div>
          <div className="hero-stats">
            <div className="stat-item">
              <div className="stat-number">{total}+</div>
              <div className="stat-label">Pets Listed</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">100%</div>
              <div className="stat-label">Care Guaranteed</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">24h</div>
              <div className="stat-label">Response Time</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Pet Listing ── */}
      <section className="section" id="pets">
        <div className="container">
          <div className="section-header">
            <h2>Available Pets</h2>
            <p>Filter by species, status, or search by name / breed</p>
          </div>

          {/* Filter Bar */}
          <div className="filter-bar">
            {/* Status chips */}
            <div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</p>
              <div className="filter-chips">
                {STATUS_FILTERS.map(s => (
                  <button
                    key={s}
                    className={`chip ${status === s ? 'active' : ''}`}
                    onClick={() => setStatus(s)}
                  >
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Species chips */}
            <div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Species</p>
              <div className="filter-chips">
                {SPECIES_FILTERS.map(sp => (
                  <button
                    key={sp}
                    className={`chip ${species === sp ? 'active' : ''}`}
                    onClick={() => setSpecies(sp)}
                  >
                    {sp.charAt(0).toUpperCase() + sp.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Search */}
            <div className="filter-search">
              <div style={{ position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                <input
                  className="form-control"
                  style={{ paddingLeft: '40px' }}
                  placeholder="Search by name or breed…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Pet Grid */}
          {loading ? (
            <div className="page-loader"><div className="spinner" /></div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🐾</div>
              <h3>No pets found</h3>
              <p>Try adjusting your filters or check back later.</p>
            </div>
          ) : (
            <>
              <div className="pet-grid">
                {filtered.map(pet => <PetCard key={pet._id} pet={pet} />)}
              </div>

              {/* Pagination */}
              {pages > 1 && (
                <div className="pagination">
                  <button className="page-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                    ‹
                  </button>
                  {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
                    <button
                      key={p}
                      className={`page-btn ${page === p ? 'active' : ''}`}
                      onClick={() => setPage(p)}
                    >
                      {p}
                    </button>
                  ))}
                  <button className="page-btn" disabled={page === pages} onClick={() => setPage(p => p + 1)}>
                    ›
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </>
  );
}
