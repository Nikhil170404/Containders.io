import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, setDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { firestore, storage } from '../../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import Modal from 'react-modal';
import { v4 as uuidv4 } from 'uuid';
import { Button, TextField, Select, MenuItem, FormControl, InputLabel, IconButton } from '@mui/material';
import { Edit, Delete, EmojiEvents, Add, FileCopy } from '@mui/icons-material';
import './Admin.css';

Modal.setAppElement('#root');

// Tournament Form Component
const TournamentForm = ({ formData, handleChange, handleSubmit, formError, closeModal }) => (
  <div className="admin-form">
    {Object.values(formError).length > 0 && (
      <div className="form-errors">
        {Object.values(formError).map((err, index) => (
          <p key={index} className="form-error">{err}</p>
        ))}
      </div>
    )}
    <TextField
      label="Title"
      name="title"
      value={formData.title}
      onChange={handleChange}
      fullWidth
      margin="normal"
      variant="outlined"
      error={!!formError.title}
      helperText={formError.title}
    />
    <TextField
      label="Tournament Name"
      name="tournamentName"
      value={formData.tournamentName}
      onChange={handleChange}
      fullWidth
      margin="normal"
      variant="outlined"
      error={!!formError.tournamentName}
      helperText={formError.tournamentName}
    />
    <TextField
      label="Description"
      name="description"
      value={formData.description}
      onChange={handleChange}
      fullWidth
      margin="normal"
      variant="outlined"
      multiline
      rows={4}
      error={!!formError.description}
      helperText={formError.description}
    />
    <TextField
      label="Participants"
      name="participants"
      type="number"
      value={formData.participants}
      onChange={handleChange}
      fullWidth
      margin="normal"
      variant="outlined"
      error={!!formError.participants}
      helperText={formError.participants}
    />
    <TextField
      label="Prize Pool"
      name="prizePool"
      type="number"
      value={formData.prizePool}
      onChange={handleChange}
      fullWidth
      margin="normal"
      variant="outlined"
      error={!!formError.prizePool}
      helperText={formError.prizePool}
    />
    <TextField
      label="Room ID"
      name="roomId"
      value={formData.roomId}
      onChange={handleChange}
      fullWidth
      margin="normal"
      variant="outlined"
      error={!!formError.roomId}
      helperText={formError.roomId}
    />
    <TextField
      label="Room Password"
      name="roomPassword"
      type="password"
      value={formData.roomPassword}
      onChange={handleChange}
      fullWidth
      margin="normal"
      variant="outlined"
      error={!!formError.roomPassword}
      helperText={formError.roomPassword}
    />
    <FormControl fullWidth margin="normal" variant="outlined">
      <InputLabel>Map Name</InputLabel>
      <Select
        name="mapName"
        value={formData.mapName}
        onChange={handleChange}
        label="Map Name"
      >
        <MenuItem value="">Select Map</MenuItem>
        <MenuItem value="Map1">Map 1</MenuItem>
        <MenuItem value="Map2">Map 2</MenuItem>
        <MenuItem value="Map3">Map 3</MenuItem>
      </Select>
    </FormControl>
    <FormControl fullWidth margin="normal" variant="outlined">
      <InputLabel>Tournament Type</InputLabel>
      <Select
        name="tournamentType"
        value={formData.tournamentType}
        onChange={handleChange}
        label="Tournament Type"
      >
        <MenuItem value="">Select Type</MenuItem>
        <MenuItem value="solo">Solo</MenuItem>
        <MenuItem value="duo">Duo</MenuItem>
        <MenuItem value="squad">Squad</MenuItem>
      </Select>
    </FormControl>
    <FormControl fullWidth margin="normal" variant="outlined">
      <InputLabel>Entry Fee</InputLabel>
      <Select
        name="isPaid"
        value={formData.isPaid}
        onChange={handleChange}
        label="Entry Fee"
      >
        <MenuItem value={false}>Free</MenuItem>
        <MenuItem value={true}>Paid</MenuItem>
      </Select>
    </FormControl>
    {formData.isPaid && (
      <TextField
        label="Entry Fee Amount"
        name="entryFee"
        type="number"
        value={formData.entryFee}
        onChange={handleChange}
        fullWidth
        margin="normal"
        variant="outlined"
        error={!!formError.entryFee}
        helperText={formError.entryFee}
      />
    )}
    <input
      type="file"
      name="image"
      accept="image/*"
      onChange={handleChange}
      className="image-upload"
    />
    <div className="form-actions">
      <Button variant="contained" color="primary" onClick={handleSubmit}>
        {formData.currentTournamentId ? 'Update Tournament' : 'Add Tournament'}
      </Button>
      <Button variant="outlined" color="secondary" onClick={closeModal}>
        Close
      </Button>
    </div>
  </div>
);

// Tournament List Component
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
            <IconButton color="primary" onClick={() => handleEdit(tournament)}><Edit /></IconButton>
            <IconButton color="secondary" onClick={() => handleDelete(tournament.id)}><Delete /></IconButton>
            <IconButton color="info" onClick={() => openParticipantsModal(tournament)}><EmojiEvents /></IconButton>
            <IconButton color="primary" onClick={() => handleDuplicate(tournament)}><FileCopy /></IconButton>
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
    if (formData.isPaid && !formData.entryFee) errors.entryFee = "Entry fee is required.";
    if (!formData.roomId) errors.roomId = "Room ID is required.";
    if (!formData.roomPassword) errors.roomPassword = "Room password is required.";
    if (!formData.mapName) errors.mapName = "Map name is required.";
    if (!formData.tournamentType) errors.tournamentType = "Tournament type is required.";

    setFormError(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;

    setFormData((prevData) => ({
      ...prevData,
      [name]: type === 'file' ? files[0] : value,
    }));
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      if (formData.currentTournamentId) {
        // Update tournament
        const tournamentRef = doc(firestore, 'tournaments', formData.currentTournamentId);
        await updateDoc(tournamentRef, {
          title: formData.title,
          tournamentName: formData.tournamentName,
          description: formData.description,
          participants: parseInt(formData.participants, 10),
          prizePool: parseFloat(formData.prizePool),
          roomId: formData.roomId,
          roomPassword: formData.roomPassword,
          mapName: formData.mapName,
          tournamentType: formData.tournamentType,
          isPaid: formData.isPaid,
          entryFee: formData.isPaid ? parseFloat(formData.entryFee) : null,
          imageUrl: formData.imageUrl,
        });
        setSuccessMessage('Tournament updated successfully!');
      } else {
        // Add new tournament
        let imageUrl = '';
        if (formData.image) {
          const imageRef = ref(storage, `tournament_images/${uuidv4()}`);
          await uploadBytes(imageRef, formData.image);
          imageUrl = await getDownloadURL(imageRef);
        }
        const newTournament = {
          title: formData.title,
          tournamentName: formData.tournamentName,
          description: formData.description,
          participants: parseInt(formData.participants, 10),
          prizePool: parseFloat(formData.prizePool),
          roomId: formData.roomId,
          roomPassword: formData.roomPassword,
          mapName: formData.mapName,
          tournamentType: formData.tournamentType,
          isPaid: formData.isPaid,
          entryFee: formData.isPaid ? parseFloat(formData.entryFee) : null,
          imageUrl,
        };
        await setDoc(doc(firestore, 'tournaments', uuidv4()), newTournament);
        setSuccessMessage('Tournament added successfully!');
      }

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
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error saving tournament:", error);
    }
  };

  const handleEdit = (tournament) => {
    setFormData({
      currentTournamentId: tournament.id,
      title: tournament.title,
      tournamentName: tournament.tournamentName,
      description: tournament.description,
      participants: tournament.participants,
      prizePool: tournament.prizePool,
      roomId: tournament.roomId,
      roomPassword: tournament.roomPassword,
      mapName: tournament.mapName,
      tournamentType: tournament.tournamentType,
      isPaid: tournament.isPaid,
      entryFee: tournament.entryFee,
      image: null,
      imageUrl: tournament.imageUrl,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(firestore, 'tournaments', id));
      setSuccessMessage('Tournament deleted successfully!');
    } catch (error) {
      console.error("Error deleting tournament:", error);
    }
  };

  const handleDuplicate = async (tournament) => {
    const duplicatedTournament = { ...tournament, id: uuidv4() };
    delete duplicatedTournament.id;
    try {
      await setDoc(doc(firestore, 'tournaments', uuidv4()), duplicatedTournament);
      setSuccessMessage('Tournament duplicated successfully!');
    } catch (error) {
      console.error("Error duplicating tournament:", error);
    }
  };

  const openParticipantsModal = (tournament) => {
    // Handle opening participants modal if necessary
  };

  return (
    <div className="admin-panel">
      <div className="header">
        <h1>Admin Panel</h1>
        <Button variant="contained" color="primary" onClick={() => setIsModalOpen(true)}>
          Add Tournament
        </Button>
      </div>
      <TournamentList
        tournaments={tournaments}
        handleEdit={handleEdit}
        handleDelete={handleDelete}
        handleDuplicate={handleDuplicate}
        openParticipantsModal={openParticipantsModal}
      />
      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        contentLabel="Tournament Form"
        className="modal"
        overlayClassName="modal-overlay"
      >
        <TournamentForm
          formData={formData}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          formError={formError}
          closeModal={() => setIsModalOpen(false)}
        />
      </Modal>
      {successMessage && <div className="success-message">{successMessage}</div>}
    </div>
  );
};

export default AdminPanel;
