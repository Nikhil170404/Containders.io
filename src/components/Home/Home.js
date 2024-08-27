import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchTournaments } from '../../redux/actions/tournamentActions';
import { purchaseTournament } from '../../redux/actions/authAction';
import TournamentCard from './TournamentCard';
import Loader from '../Loader/Loader';
import './Home.css';
import { FaSearch, FaSort, FaTrashAlt } from 'react-icons/fa';
import { collection, onSnapshot } from 'firebase/firestore';
import { firestore } from '../../firebase';

const Home = () => {
  const dispatch = useDispatch();
  const { isLoading } = useSelector((state) => state.tournament);
  const { purchasedTournaments = [] } = useSelector((state) => state.auth) || {};

  const [sortOption, setSortOption] = useState('title');
  const [filterText, setFilterText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [favorites, setFavorites] = useState([]);
  const [realTimeTournaments, setRealTimeTournaments] = useState([]);
  const [filterType, setFilterType] = useState('all');
  const tournamentsPerPage = 10;

  useEffect(() => {
    const tournamentsCollection = collection(firestore, 'tournaments');
    const unsubscribe = onSnapshot(tournamentsCollection, (snapshot) => {
      const tournamentsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));
      setRealTimeTournaments(tournamentsData);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    dispatch(fetchTournaments());
  }, [dispatch]);

  const handlePurchase = (tournamentName) => {
    dispatch(purchaseTournament(tournamentName));
  };

  const handleFavorite = (tournamentName) => {
    setFavorites((prevFavorites) =>
      prevFavorites.includes(tournamentName)
        ? prevFavorites.filter((fav) => fav !== tournamentName)
        : [...prevFavorites, tournamentName]
    );
  };

  const sortTournaments = (tournaments, option) => {
    return tournaments.slice().sort((a, b) => {
      switch (option) {
        case 'title':
          return (a.title || '').localeCompare(b.title || '');
        case 'participants':
          return (b.participants || 0) - (a.participants || 0);
        case 'entryFee':
          return (a.entryFee || 0) - (b.entryFee || 0);
        case 'prizeMoney':
          return (b.prizeMoney || 0) - (a.prizeMoney || 0);
        default:
          return 0;
      }
    });
  };

  const filterTournaments = (tournaments, text, type) => {
    const lowercasedText = text.toLowerCase();
    return tournaments.filter(
      (tournament) =>
        (tournament.title && tournament.title.toLowerCase().includes(lowercasedText)) ||
        (tournament.description && tournament.description.toLowerCase().includes(lowercasedText)) ||
        (type === 'all' || tournament.tournamentType === type)
    );
  };

  const handleClearFilters = () => {
    setFilterText('');
    setSortOption('title');
    setFilterType('all');
  };

  const sortedTournaments = sortTournaments(realTimeTournaments || [], sortOption);
  const filteredTournaments = filterTournaments(sortedTournaments || [], filterText, filterType);

  // Remove duplicate tournaments
  const uniqueTournaments = Array.from(new Set(filteredTournaments.map(t => t.id)))
    .map(id => {
      return filteredTournaments.find(tournament => tournament.id === id);
    });

  // Pagination logic
  const indexOfLastTournament = currentPage * tournamentsPerPage;
  const indexOfFirstTournament = indexOfLastTournament - tournamentsPerPage;
  const currentTournaments = uniqueTournaments.slice(indexOfFirstTournament, indexOfLastTournament);
  const totalPages = Math.ceil(uniqueTournaments.length / tournamentsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="home-container">
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <header className="home-header">
            <h1>🎮 Welcome to the Esports Platform!</h1>
            <p>Compete in exciting tournaments and win amazing prizes! 💰</p>
          </header>
          <section className="filters-section">
            <div className="filter-group">
              <FaSearch className="icon" />
              <input
                type="text"
                placeholder="Search tournaments..."
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                className="filter-input"
              />
            </div>
            <div className="filter-group">
              <FaSort className="icon" />
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="sort-select"
              >
                <option value="title">Title</option>
                <option value="participants">Participants</option>
                <option value="entryFee">Entry Fee</option>
                <option value="prizeMoney">Prize Money</option>
              </select>
            </div>
            <div className="filter-group">
              <label>Type:</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="type-select"
              >
                <option value="all">All</option>
                <option value="solo">Solo</option>
                <option value="duo">Duo</option>
                <option value="squad">Squad</option>
              </select>
            </div>
            <button onClick={handleClearFilters} className="clear-filters-btn">
              <FaTrashAlt className="icon" />
              Clear Filters
            </button>
          </section>
          <section className="featured-tournaments">
            <h2>🏆 Featured Tournaments:</h2>
            <div className="tournament-list">
              {currentTournaments.map((tournament) => (
                <TournamentCard
                  key={tournament.id}
                  {...tournament}
                  onPurchase={handlePurchase}
                  onFavorite={handleFavorite}
                  isFavorite={favorites.includes(tournament.title)}
                  isPurchased={purchasedTournaments.includes(tournament.title)}
                />
              ))}
            </div>
          </section>
          <div className="pagination">
            {[...Array(totalPages).keys()].map((number) => (
              <button
                key={number}
                onClick={() => handlePageChange(number + 1)}
                className={`page-btn ${currentPage === number + 1 ? 'active' : ''}`}
              >
                {number + 1}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Home;
