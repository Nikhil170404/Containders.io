import React, { useEffect, useState } from 'react';
import { Card, Image, Icon, Loader, Button } from 'semantic-ui-react';
import { FaTrophy, FaUserFriends, FaMapMarkedAlt, FaLock } from 'react-icons/fa';
import { getFirestore, doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

const TournamentCard = ({ tournamentId }) => {
  const [tournament, setTournament] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasJoined, setHasJoined] = useState(false);
  const [error, setError] = useState(null);

  const db = getFirestore();
  const auth = getAuth();
  const navigate = useNavigate();
  const currentUser = auth.currentUser;

  useEffect(() => {
    const fetchTournament = async () => {
      if (!tournamentId) {
        setError("Tournament ID is missing.");
        setIsLoading(false);
        return;
      }

      if (!currentUser) {
        setError("User not authenticated. Please log in.");
        setIsLoading(false);
        navigate('/login'); // Redirect to login if not authenticated
        return;
      }

      try {
        const docRef = doc(db, 'tournaments', tournamentId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const tournamentData = docSnap.data();
          setTournament(tournamentData);

          // Check if the current user has joined this tournament
          if (tournamentData.participants && tournamentData.participants.includes(currentUser.uid)) {
            setHasJoined(true);
          }
        } else {
          setError("No such tournament exists.");
        }
      } catch (error) {
        console.error("Error loading tournament data:", error);
        setError("Failed to load tournament data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTournament();
  }, [tournamentId, db, currentUser, navigate]);

  const handleJoinTournament = async () => {
    try {
      if (!hasJoined && currentUser) {
        const tournamentRef = doc(db, 'tournaments', tournamentId);
        await updateDoc(tournamentRef, {
          participants: arrayUnion(currentUser.uid)
        });
        setHasJoined(true);
      }
    } catch (error) {
      console.error("Error joining tournament:", error);
      setError("Failed to join the tournament.");
    }
  };

  if (isLoading) {
    return <Loader active inline="centered" />;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!tournament) {
    return <div>Error loading tournament data.</div>;
  }

  const {
    title,
    tournamentName,
    description,
    entryFee,
    prizePool,
    imageUrl,
    isPaid,
    mapName,
    participants,
    roomId,
    roomPassword,
    tournamentType,
  } = tournament;

  return (
    <Card fluid>
      <Image src={imageUrl} wrapped ui={false} alt={`${title} Tournament`} />
      <Card.Content>
        <Card.Header>{title} <FaTrophy style={{ color: 'gold' }} /></Card.Header>
        <Card.Meta>{tournamentName} • {tournamentType} 🕹️</Card.Meta>
        <Card.Description>{description || "Join the battle for glory!"}</Card.Description>
        <Card.Description>
          <Icon name="money bill alternate outline" /> Entry Fee: {isPaid ? `$${entryFee}` : 'Free'}
        </Card.Description>
        <Card.Description>
          <FaTrophy /> Prize Pool: ${prizePool}
        </Card.Description>
        <Card.Description>
          <FaMapMarkedAlt /> Map: {mapName}
        </Card.Description>
        <Card.Description>
          <FaUserFriends /> Participants: {participants}
        </Card.Description>
      </Card.Content>
      <Card.Content extra>
        {hasJoined ? (
          <div>
            <FaLock /> Room ID: {roomId} | Password: {roomPassword}
          </div>
        ) : (
          <Button primary onClick={handleJoinTournament}>Join Tournament</Button>
        )}
      </Card.Content>
    </Card>
  );
};

export default TournamentCard;
