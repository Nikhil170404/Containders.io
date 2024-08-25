import React, { useState, useEffect } from 'react';
import { collection, getDocs, onSnapshot, setDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { firestore, storage } from '../../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import Modal from 'react-modal';
import { v4 as uuidv4 } from 'uuid';
import './Admin.css';

Modal.setAppElement('#root');

const TournamentForm = ({ formData, handleChange, handleSubmit, formError, closeModal }) => (
  <div className="admin-form">
    {Object.values(formError).length > 0 && (
      <div className="form-errors">
        {Object.values(formError).map((err, index) => (
          <p key={index} className="form-error">{err}</p>
        ))}
      </div>
    )}
    <div className="form-group">
      <label>Title</label>
      <input 
        type="text"
        name="title"
        value={formData.title}
        onChange={handleChange}
        placeholder="Enter title"
      />
    </div>
    <div className="form-group">
      <label>Tournament Name</label>
      <input 
        type="text"
        name="tournamentName"
        value={formData.tournamentName}
        onChange={handleChange}
        placeholder="Enter tournament name"
      />
    </div>
    <div className="form-group">
      <label>Description</label>
      <textarea 
        name="description"
        value={formData.description}
        onChange={handleChange}
        placeholder="Enter description"
      />
    </div>
    <div className="form-group">
      <label>Participants</label>
      <input 
        type="number"
        name="participants"
        value={formData.participants}
        onChange={handleChange}
        placeholder="Number of participants"
      />
    </div>
    <div className="form-group">
      <label>Prize Pool</label>
      <input 
        type="number"
        name="prizePool"
        value={formData.prizePool}
        onChange={handleChange}
        placeholder="Prize pool amount"
      />
    </div>
    <div className="form-group">
      <label>Room ID</label>
      <input 
        type="text"
        name="roomId"
        value={formData.roomId}
        onChange={handleChange}
        placeholder="Room ID"
      />
    </div>
    <div className="form-group">
      <label>Room Password</label>
      <input 
        type="password"
        name="roomPassword"
        value={formData.roomPassword}
        onChange={handleChange}
        placeholder="Room Password"
      />
    </div>
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
        <option value={false}>Free</option>
        <option value={true}>Paid</option>
      </select>
    </div>
    {formData.isPaid && (
      <div className="form-group">
        <label>Entry Fee Amount</label>
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
      <input 
        type="file"
        name="image"
        accept="image/*"
        onChange={handleChange}
      />
    </div>
    <div className="form-actions">
      <button className="btn btn-primary" onClick={handleSubmit}>
        {formData.currentTournamentId ? 'Update Tournament' : 'Add Tournament'}
      </button>
      <button className="btn btn-close" onClick={closeModal}>Close</button>
    </div>
  </div>
);

const TournamentList = ({ tournaments, handleEdit, handleDelete, openParticipantsModal, handleDuplicate }) => (
  <div className="tournament-list">
    {tournaments.length > 0 ? (
      tournaments.map((tournament) => (
        <div key={tournament.id} className="tournament-item">
          <div className="tournament-header">
            <h3>{tournament.title}</h3>
            {tournament.imageUrl && <img src={tournament.imageUrl} alt={tournament.title} className="tournament-image" />}
          </div>
          <p>{tournament.description}</p>
          <p>Entry Fee: {tournament.isPaid ? `$${tournament.entryFee}` : 'Free'}</p>
          <p>Participants: {tournament.participants}</p>
          <p>Prize Pool: ${tournament.prizePool}</p>
          <p>Map: {tournament.mapName}</p>
          <p>Type: {tournament.tournamentType}</p>
          <div className="tournament-actions">
            <button className="btn btn-edit" onClick={() => handleEdit(tournament)}>Edit</button>
            <button className="btn btn-delete" onClick={() => handleDelete(tournament.id)}>Delete</button>
            <button className="btn btn-duplicate" onClick={() => handleDuplicate(tournament)}>Duplicate</button>
            <button className="btn btn-participants" onClick={() => openParticipantsModal(tournament)}>View Participants</button>
          </div>
        </div>
      ))
    ) : (
      <p>No tournaments available.</p>
    )}
  </div>
);

const AdminPanel = () => {
  const [tournaments, setTournaments] = useState([]);
  const [formData, setFormData] = useState({
    currentTournamentId: '',
    title: '',
    tournamentName: '',
    description: '',
    participants: '',
    prizePool: '',
    roomId: '',
    roomPassword: '',
    mapName: '',
    tournamentType: '',
    isPaid: false,
    entryFee: '',
    image: null,
    imageUrl: '',
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formError, setFormError] = useState({});
  const [isParticipantsModalOpen, setIsParticipantsModalOpen] = useState(false);
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(firestore, 'tournaments'), (snapshot) => {
      const tournamentData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTournaments(tournamentData);
    });

    return () => unsubscribe();
  }, []);

  const validateForm = () => {
    const errors = {};

    if (!formData.title) errors.title = "Title is required.";
    if (!formData.tournamentName) errors.tournamentName = "Tournament name is required.";
    if (!formData.description) errors.description = "Description is required.";
    if (!formData.participants) errors.participants = "Number of participants is required.";
    if (!formData.prizePool) errors.prizePool = "Prize pool is required.";
    if (formData.isPaid && !formData.entryFee) errors.entryFee = "Entry fee is required for paid tournaments.";
    if (!formData.roomId) errors.roomId = "Room ID is required.";
    if (!formData.roomPassword) errors.roomPassword = "Room password is required.";

    setFormError(errors);

    return Object.keys(errors).length === 0;
  };

  const handleAddOrUpdateTournament = async () => {
    if (!validateForm()) return;

    const tournamentData = { ...formData };
    delete tournamentData.image; // Remove image from the data object before saving to Firestore

    try {
      if (formData.image) {
        // Upload image and get URL
        const imageRef = ref(storage, `tournament_images/${uuidv4()}`);
        await uploadBytes(imageRef, formData.image);
        const imageUrl = await getDownloadURL(imageRef);
        tournamentData.imageUrl = imageUrl;
      }

      if (formData.currentTournamentId) {
        // Update existing tournament
        await updateDoc(doc(firestore, 'tournaments', formData.currentTournamentId), tournamentData);
      } else {
        // Add new tournament
        await setDoc(doc(firestore, 'tournaments', uuidv4()), tournamentData);
      }

      setSuccessMessage('Tournament saved successfully!');
      setIsModalOpen(false);
      setFormData({
        currentTournamentId: '',
        title: '',
        tournamentName: '',
        description: '',
        participants: '',
        prizePool: '',
        roomId: '',
        roomPassword: '',
        mapName: '',
        tournamentType: '',
        isPaid: false,
        entryFee: '',
        image: null,
        imageUrl: '',
      });
    } catch (error) {
      console.error("Error saving tournament: ", error);
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: name === 'image' ? files[0] : value
    }));
  };

  const handleEdit = (tournament) => {
    setFormData({
      ...tournament,
      currentTournamentId: tournament.id,
      image: null // Reset image field on edit
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(firestore, 'tournaments', id));
      setSuccessMessage('Tournament deleted successfully!');
    } catch (error) {
      console.error("Error deleting tournament: ", error);
    }
  };

  const handleDuplicate = async (tournament) => {
    try {
      const newTournamentData = { ...tournament, title: `${tournament.title} (Copy)`, currentTournamentId: '' };
      delete newTournamentData.id;
      await setDoc(doc(firestore, 'tournaments', uuidv4()), newTournamentData);
      setSuccessMessage('Tournament duplicated successfully!');
    } catch (error) {
      console.error("Error duplicating tournament: ", error);
    }
  };

  const openParticipantsModal = (tournament) => {
    setSelectedTournament(tournament);
    setIsParticipantsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({
      currentTournamentId: '',
      title: '',
      tournamentName: '',
      description: '',
      participants: '',
      prizePool: '',
      roomId: '',
      roomPassword: '',
      mapName: '',
      tournamentType: '',
      isPaid: false,
      entryFee: '',
      image: null,
      imageUrl: '',
    });
    setFormError({});
  };

  const closeParticipantsModal = () => {
    setIsParticipantsModalOpen(false);
    setSelectedTournament(null);
  };

  return (
    <div className="admin-panel">
      <button className="btn btn-add" onClick={() => setIsModalOpen(true)}>Add Tournament</button>
      {successMessage && <div className="success-message">{successMessage}</div>}
      <TournamentList
        tournaments={tournaments}
        handleEdit={handleEdit}
        handleDelete={handleDelete}
        handleDuplicate={handleDuplicate}
        openParticipantsModal={openParticipantsModal}
      />
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="Tournament Form"
        className="modal"
        overlayClassName="overlay"
      >
        <TournamentForm
          formData={formData}
          handleChange={handleChange}
          handleSubmit={handleAddOrUpdateTournament}
          formError={formError}
          closeModal={closeModal}
        />
      </Modal>
      <Modal
        isOpen={isParticipantsModalOpen}
        onRequestClose={closeParticipantsModal}
        contentLabel="Participants"
        className="modal"
        overlayClassName="overlay"
      >
        <div className="participants-modal">
          <h2>Participants for {selectedTournament?.title}</h2>
          {/* Add logic to list participants */}
          <button className="btn btn-close" onClick={closeParticipantsModal}>Close</button>
        </div>
      </Modal>
    </div>
  );
};

export default AdminPanel;
