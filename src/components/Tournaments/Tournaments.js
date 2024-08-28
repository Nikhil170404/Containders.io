import React, { useState, useEffect, useMemo } from 'react';
import { firestore } from '../../firebase';
import { collection, getDocs, query } from 'firebase/firestore';
import './Tournaments.css';

const Tournaments = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ gameType: '', dateRange: '', minPrizePool: '' });
  const [sortOption, setSortOption] = useState('');
  const [tournaments, setTournaments] = useState([]);

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const q = query(collection(firestore, 'tournaments'));
        const querySnapshot = await getDocs(q);
        const tournamentsList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTournaments(tournamentsList);
      } catch (error) {
        console.error('Error fetching tournaments:', error);
      }
    };

    fetchTournaments();
  }, []);

  const filteredTournaments = useMemo(() => {
    let filtered = tournaments;

    if (searchTerm) {
      filtered = filtered.filter(tournament =>
        tournament.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filters.gameType) {
      filtered = filtered.filter(tournament =>
        tournament.gameType === filters.gameType
      );
    }

    if (filters.dateRange) {
      const [startDate, endDate] = filters.dateRange.split('_to_').map(date => new Date(date));
      filtered = filtered.filter(tournament => {
        const tournamentDate = new Date(tournament.date);
        return tournamentDate >= startDate && tournamentDate <= endDate;
      });
    }

    if (filters.minPrizePool) {
      filtered = filtered.filter(tournament =>
        tournament.prizePool >= parseFloat(filters.minPrizePool)
      );
    }

    return filtered;
  }, [searchTerm, filters, tournaments]);

  const sortedTournaments = useMemo(() => {
    const sorted = [...filteredTournaments];
    if (sortOption === 'date') {
      sorted.sort((a, b) => new Date(a.date) - new Date(b.date));
    } else if (sortOption === 'prizePool') {
      sorted.sort((a, b) => b.prizePool - a.prizePool);
    }
    return sorted;
  }, [filteredTournaments, sortOption]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prevFilters => ({ ...prevFilters, [name]: value }));
  };

  const handleSortChange = (e) => {
    setSortOption(e.target.value);
  };

  return (
    <div className="tournaments-container">
      <h1>Tournaments</h1>
      <p>Explore upcoming tournaments and join the competition!</p>

      <div className="search-filter-container">
        <input
          type="text"
          placeholder="Search tournaments"
          value={searchTerm}
          onChange={handleSearchChange}
        />
        <select name="gameType" onChange={handleFilterChange} value={filters.gameType}>
          <option value="">All Game Types</option>
          <option value="FreeFire">FreeFire</option>
          <option value="Call of Duty">Call of Duty</option>
          <option value="BGMI">BGMI</option>
          {/* Add more game types as needed */}
        </select>
        <input
          type="text"
          name="dateRange"
          placeholder="Date Range (YYYY-MM-DD_to_YYYY-MM-DD)"
          value={filters.dateRange}
          onChange={handleFilterChange}
        />
        <input
          type="number"
          name="minPrizePool"
          placeholder="Min Prize Pool"
          value={filters.minPrizePool}
          onChange={handleFilterChange}
        />
        <select name="sortOption" onChange={handleSortChange} value={sortOption}>
          <option value="">Sort By</option>
          <option value="date">Date</option>
          <option value="prizePool">Prize Pool</option>
        </select>
      </div>

      <div className="tournament-list">
        {sortedTournaments.length > 0 ? (
          sortedTournaments.map(tournament => (
            <div key={tournament.id} className="tournament-card">
              <h2>{tournament.title}</h2>
              <p>Game: {tournament.gameType}</p>
              <p>Date: {new Date(tournament.date).toDateString()}</p>
              <p>Prize Pool: ₹{tournament.prizePool}</p>
              <p>{tournament.description}</p>
              <button>Join Tournament</button>
            </div>
          ))
        ) : (
          <p>No tournaments found.</p>
        )}
      </div>
    </div>
  );
};

export default Tournaments;
