import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTournaments, addTournament, updateTournament, deleteTournament } from '../../redux/actions/tournamentActions';
import { fetchWalletTransactions, approveTransaction, rejectTransaction } from '../../redux/actions/walletAction';
import { collection, getDocs } from 'firebase/firestore';
import { firestore, storage } from '../../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import Modal from 'react-modal';
import './Admin.css';

Modal.setAppElement('#root');

const TournamentForm = ({ formData, handleChange, handleSubmit, formError, closeModal }) => (
  <div className="admin-form">
    {Object.values(formError).map((err, index) => (
      <p key={index} className="form-error">{err}</p>
    ))}
    {['title', 'tournamentName', 'description', 'entryFee', 'participants', 'prizePool', 'roomId', 'roomPassword'].map((field, index) => (
      <div className="form-group" key={index}>
        <label>{field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</label>
        <input 
          type={field.includes('Fee') || field.includes('Pool') || field.includes('Participants') ? 'number' : 'text'}
          name={field}
          placeholder={field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
          value={formData[field]} 
          onChange={handleChange} 
          disabled={!formData.isPaid && field === 'entryFee'}
        />
      </div>
    ))}
    <div className="form-group">
      <label>Image</label>
      <input type="file" name="image" onChange={handleChange} />
    </div>
    <button onClick={handleSubmit}>
      {formData.currentTournamentId ? 'Update Tournament' : 'Add Tournament'}
    </button>
    <button onClick={closeModal}>Close</button>
  </div>
);

const TournamentList = ({ tournaments, handleEdit, handleDelete, openParticipantsModal }) => (
  <div>
    {tournaments && tournaments.length > 0 ? (
      tournaments.map((tournament) => (
        <div key={tournament.id} className="tournament-item">
          <h3>{tournament.title}</h3>
          <p>{tournament.description}</p>
          <p>Entry Fee: {tournament.entryFee}</p>
          <p>Participants: {tournament.participants}</p>
          <p>Prize Pool: {tournament.prizePool}</p>
          <button onClick={() => handleEdit(tournament)}>Edit</button>
          <button onClick={() => handleDelete(tournament.id)}>Delete</button>
          <button onClick={() => openParticipantsModal(tournament.id)}>View Participants</button>
        </div>
      ))
    ) : (
      <p>No tournaments available</p>
    )}
  </div>
);

const WalletTransactions = ({ transactions, handleUpdateStatus, closeModal }) => (
  <div>
    {transactions && transactions.length > 0 ? (
      transactions.map(transaction => (
        <div key={transaction.id} className="transaction-item">
          <p>ID: {transaction.id}</p>
          <p>Amount: {transaction.amount}</p>
          <p>Status: {transaction.status}</p>
          <button onClick={() => handleUpdateStatus(transaction.id, 'Approved')}>Approve</button>
          <button onClick={() => handleUpdateStatus(transaction.id, 'Rejected')}>Reject</button>
        </div>
      ))
    ) : (
      <p>No transactions available</p>
    )}
    <button onClick={closeModal}>Close</button>
  </div>
);

const AdminPanel = () => {
  const dispatch = useDispatch();
  const { tournaments, isLoading, error } = useSelector((state) => state.tournament);
  const { walletTransactions } = useSelector((state) => state.wallet);

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
    currentTournamentId: null,
  });

  const [participantsData, setParticipantsData] = useState({});
  const [selectedParticipants, setSelectedParticipants] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [walletModalIsOpen, setWalletModalIsOpen] = useState(false);
  const [formError, setFormError] = useState({});

  useEffect(() => {
    dispatch(fetchTournaments());
    dispatch(fetchWalletTransactions());
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
    setFormData({
      ...formData,
      [name]: files ? files[0] : value,
    });
  };

  const handleSubmit = async () => {
    setFormError({});

    // Validation checks
    if (!formData.title || !formData.tournamentName || !formData.description) {
      setFormError(prev => ({ ...prev, validationError: 'Please fill in all required fields.' }));
      return;
    }
    if (formData.isPaid && formData.entryFee <= 0) {
      setFormError(prev => ({ ...prev, validationError: 'Entry Fee must be greater than 0 for paid tournaments.' }));
      return;
    }
    if (formData.participants <= 0 || formData.prizePool <= 0) {
      setFormError(prev => ({ ...prev, validationError: 'Participants and Prize Pool must be greater than 0.' }));
      return;
    }

    let imageUrl = '';

    if (formData.image) {
      try {
        const imageRef = ref(storage, `tournament-images/${formData.image.name}`);
        await uploadBytes(imageRef, formData.image);
        imageUrl = await getDownloadURL(imageRef);
      } catch (error) {
        setFormError(prev => ({ ...prev, imageError: 'Error uploading image. Please try again.' }));
        return;
      }
    }

    const tournamentData = {
      title: formData.title,
      tournamentName: formData.tournamentName,
      description: formData.description,
      entryFee: formData.isPaid ? formData.entryFee : 0,
      participants: formData.participants,
      prizePool: formData.prizePool,
      imageUrl,
      isPaid: formData.isPaid,
      roomId: formData.roomId,
      roomPassword: formData.roomPassword,
    };

    try {
      if (formData.currentTournamentId) {
        await dispatch(updateTournament(formData.currentTournamentId, tournamentData));
      } else {
        await dispatch(addTournament(tournamentData));
      }

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
        currentTournamentId: null,
      });
      closeModal();
    } catch (error) {
      setFormError(prev => ({ ...prev, submitError: 'An error occurred while processing your request.' }));
    }
  };

  const handleEditTournament = (tournament) => {
    setFormData({
      ...tournament,
      isPaid: tournament.entryFee > 0,
      image: null,
      currentTournamentId: tournament.id,
    });
    setModalIsOpen(true);
  };

  const handleDeleteTournament = async (tournamentId) => {
    try {
      await dispatch(deleteTournament(tournamentId));
    } catch (error) {
      console.error('Error deleting tournament:', error);
    }
  };

  const openParticipantsModal = (tournamentId) => {
    setSelectedParticipants(participantsData[tournamentId] || []);
    setModalIsOpen(true);
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
      currentTournamentId: null,
    });
    setFormError({});
  };

  const openWalletModal = () => setWalletModalIsOpen(true);
  const closeWalletModal = () => setWalletModalIsOpen(false);

  const handleUpdateTransactionStatus = async (transactionId, status) => {
    try {
      if (status === 'Approved') {
        await dispatch(approveTransaction(transactionId));
      } else if (status === 'Rejected') {
        await dispatch(rejectTransaction(transactionId));
      }
      closeWalletModal();
    } catch (error) {
      console.error('Error updating transaction status:', error);
    }
  };

  return (
    <div className="admin-panel">
      <h2>Admin Panel</h2>
      <button onClick={() => setModalIsOpen(true)}>Add Tournament</button>
      <button onClick={openWalletModal}>Manage Wallet</button>
      {isLoading ? <p>Loading tournaments...</p> : <TournamentList tournaments={tournaments} handleEdit={handleEditTournament} handleDelete={handleDeleteTournament} openParticipantsModal={openParticipantsModal} />}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        className="modal"
        overlayClassName="modal-overlay"
      >
        <TournamentForm
          formData={formData}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          formError={formError}
          closeModal={closeModal}
        />
      </Modal>
      <Modal
        isOpen={walletModalIsOpen}
        onRequestClose={closeWalletModal}
        className="modal"
        overlayClassName="modal-overlay"
      >
        <WalletTransactions
          transactions={walletTransactions}
          handleUpdateStatus={handleUpdateTransactionStatus}
          closeModal={closeWalletModal}
        />
      </Modal>
    </div>
  );
};

export default AdminPanel;
