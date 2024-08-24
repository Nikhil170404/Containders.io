import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTournaments } from '../../redux/actions/tournamentActions';
import { collection, getDocs, onSnapshot, setDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { firestore, storage } from '../../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import Modal from 'react-modal';
import './Admin.css';

Modal.setAppElement('#root');

// Tournament Form Component
const TournamentForm = ({ formData, handleChange, handleSubmit, formError, closeModal }) => (
  <div className="admin-form">
    {Object.values(formError).map((err, index) => (
      <p key={index} className="form-error">{err}</p>
    ))}
    {['title', 'tournamentName', 'description', 'participants', 'prizePool', 'roomId', 'roomPassword'].map((field, index) => (
      <div className="form-group" key={index}>
        <label>{field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</label>
        <input 
          type={field.includes('Fee') || field.includes('Pool') || field.includes('Participants') ? 'number' : 'text'}
          name={field}
          placeholder={field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
          value={formData[field]} 
          onChange={handleChange} 
          disabled={field === 'entryFee' && !formData.isPaid}
        />
      </div>
    ))}
    <div className="form-group">
      <label>Map Name</label>
      <select name="mapName" value={formData.mapName} onChange={handleChange}>
        <option value="">Select Map</option>
        <option value="Map1">Map 1</option>
        <option value="Map2">Map 2</option>
        <option value="Map3">Map 3</option>
      </select>
    </div>
    <div className="form-group">
      <label>Tournament Type</label>
      <select name="tournamentType" value={formData.tournamentType} onChange={handleChange}>
        <option value="">Select Type</option>
        <option value="solo">Solo</option>
        <option value="duo">Duo</option>
        <option value="squad">Squad</option>
      </select>
    </div>
    <div className="form-group">
      <label>Entry Fee</label>
      <select name="isPaid" value={formData.isPaid} onChange={handleChange}>
        <option value={true}>Paid</option>
        <option value={false}>Free</option>
      </select>
    </div>
    {formData.isPaid && (
      <div className="form-group">
        <label>Entry Fee</label>
        <input 
          type="number"
          name="entryFee"
          value={formData.entryFee}
          onChange={handleChange}
          placeholder="Enter entry fee"
        />
      </div>
    )}
    <div className="form-group">
      <label>Image</label>
      <input type="file" name="image" onChange={handleChange} />
    </div>
    <div className="form-actions">
      <button className="btn btn-primary" onClick={handleSubmit}>
        {formData.currentTournamentId ? 'Update Tournament' : 'Add Tournament'}
      </button>
      <button className="btn btn-close" onClick={closeModal}>Close</button>
    </div>
  </div>
);

// Tournament List Component
const TournamentList = ({ tournaments, handleEdit, handleDelete, openParticipantsModal }) => (
  <div className="tournament-list">
    {tournaments && tournaments.length > 0 ? (
      tournaments.map((tournament) => (
        <div key={tournament.id} className="tournament-item">
          <div className="tournament-header">
            <h3>{tournament.title}</h3>
            {tournament.imageUrl && <img src={tournament.imageUrl} alt={tournament.title} className="tournament-image" />}
          </div>
          <p>{tournament.description}</p>
          <p>Entry Fee: {tournament.isPaid ? tournament.entryFee : 'Free'}</p>
          <p>Participants: {tournament.participants}</p>
          <p>Prize Pool: {tournament.prizePool}</p>
          <p>Map: {tournament.mapName}</p>
          <p>Type: {tournament.tournamentType}</p>
          <div className="tournament-actions">
            <button className="btn btn-edit" onClick={() => handleEdit(tournament)}>Edit</button>
            <button className="btn btn-delete" onClick={() => handleDelete(tournament.id)}>Delete</button>
            <button className="btn btn-primary" onClick={() => openParticipantsModal(tournament.id)}>View Participants</button>
          </div>
        </div>
      ))
    ) : (
      <p>No tournaments available</p>
    )}
  </div>
);

// Participants Modal Component
const ParticipantsModal = ({ participants, closeModal }) => (
  <div className="participants-modal">
    <h3>Participants</h3>
    {participants && participants.length > 0 ? (
      <table className="participants-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Score</th>
          </tr>
        </thead>
        <tbody>
          {participants.map((participant, index) => (
            <tr key={index}>
              <td>{participant.name}</td>
              <td>{participant.email}</td>
              <td>{participant.score}</td>
            </tr>
          ))}
        </tbody>
      </table>
    ) : (
      <p>No participants available</p>
    )}
    <button className="btn btn-close" onClick={closeModal}>Close</button>
  </div>
);

// Admin Panel Component
const AdminPanel = () => {
  const dispatch = useDispatch();
  const { tournaments } = useSelector((state) => state.tournament);

  const [formData, setFormData] = useState({
    title: '',
    tournamentName: '',
    description: '',
    entryFee: 0,
    participants: 0,
    prizePool: 0,
    image: null,
    isPaid: true,
    roomId: '',
    roomPassword: '',
    mapName: '',
    tournamentType: '',
    currentTournamentId: null,
  });

  const [participantsData, setParticipantsData] = useState({});
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [participantsModalIsOpen, setParticipantsModalIsOpen] = useState(false);
  const [formError, setFormError] = useState({});

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(firestore, 'tournaments'), (snapshot) => {
      const tournamentsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      dispatch(fetchTournaments(tournamentsList));
    });

    return () => unsubscribe();
  }, [dispatch]);

  useEffect(() => {
    const fetchParticipantsData = async () => {
      const newParticipantsData = {};
      for (const tournament of tournaments) {
        try {
          const participantsRef = collection(firestore, 'tournaments', tournament.id, 'participants');
          const participantsSnapshot = await getDocs(participantsRef);
          newParticipantsData[tournament.id] = participantsSnapshot.docs.map(doc => doc.data());
        } catch (error) {
          console.error('Error fetching participants:', error);
        }
      }
      setParticipantsData(newParticipantsData);
    };

    if (tournaments.length > 0) {
      fetchParticipantsData();
    }
  }, [tournaments]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: name === 'isPaid' ? value === 'true' : files ? files[0] : value,
      entryFee: name === 'isPaid' && value === 'false' ? 0 : prevState.entryFee
    }));
  };

  const handleSubmit = async () => {
    setFormError({});

    if (!formData.title || !formData.tournamentName || !formData.description) {
      setFormError(prev => ({ ...prev, validationError: 'Please fill in all required fields.' }));
      return;
    }
    if (formData.isPaid && formData.entryFee <= 0) {
      setFormError(prev => ({ ...prev, entryFeeError: 'Entry fee must be greater than 0.' }));
      return;
    }

    try {
      let imageUrl = '';
      if (formData.image) {
        const imageRef = ref(storage, `tournament_images/${formData.image.name}`);
        await uploadBytes(imageRef, formData.image);
        imageUrl = await getDownloadURL(imageRef);
      }

      const tournamentData = {
        title: formData.title,
        tournamentName: formData.tournamentName,
        description: formData.description,
        entryFee: formData.entryFee,
        participants: formData.participants,
        prizePool: formData.prizePool,
        roomId: formData.roomId,
        roomPassword: formData.roomPassword,
        mapName: formData.mapName,
        tournamentType: formData.tournamentType,
        isPaid: formData.isPaid,
        imageUrl, // Save the image URL in Firestore
      };

      if (formData.currentTournamentId) {
        await updateDoc(doc(firestore, 'tournaments', formData.currentTournamentId), tournamentData);
      } else {
        const newTournamentId = Date.now().toString();
        await setDoc(doc(firestore, 'tournaments', newTournamentId), tournamentData);
      }

      closeModal();
    } catch (error) {
      console.error('Error saving tournament:', error);
    }
  };

  const handleEdit = (tournament) => {
    setFormData({
      ...tournament,
      currentTournamentId: tournament.id,
      image: null // Reset image to avoid re-uploading the existing image
    });
    setModalIsOpen(true);
  };

  const handleDelete = async (tournamentId) => {
    try {
      await deleteDoc(doc(firestore, 'tournaments', tournamentId));
    } catch (error) {
      console.error('Error deleting tournament:', error);
    }
  };

  const openParticipantsModal = (tournamentId) => {
    setParticipantsData(participantsData[tournamentId] || []);
    setParticipantsModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setFormData({
      title: '',
      tournamentName: '',
      description: '',
      entryFee: 0,
      participants: 0,
      prizePool: 0,
      image: null,
      isPaid: true,
      roomId: '',
      roomPassword: '',
      mapName: '',
      tournamentType: '',
      currentTournamentId: null,
    });
  };

  return (
    <div className="admin-panel">
      <h2>Admin Panel</h2>
      <button className="btn btn-primary" onClick={() => setModalIsOpen(true)}>Add Tournament</button>

      <TournamentList 
        tournaments={tournaments} 
        handleEdit={handleEdit} 
        handleDelete={handleDelete} 
        openParticipantsModal={openParticipantsModal}
      />

      <Modal isOpen={modalIsOpen} onRequestClose={closeModal} contentLabel="Tournament Modal">
        <TournamentForm 
          formData={formData} 
          handleChange={handleChange} 
          handleSubmit={handleSubmit} 
          formError={formError} 
          closeModal={closeModal} 
        />
      </Modal>

      <Modal isOpen={participantsModalIsOpen} onRequestClose={() => setParticipantsModalIsOpen(false)} contentLabel="Participants Modal">
        <ParticipantsModal participants={participantsData} closeModal={() => setParticipantsModalIsOpen(false)} />
      </Modal>
    </div>
  );
};

export default AdminPanel;
