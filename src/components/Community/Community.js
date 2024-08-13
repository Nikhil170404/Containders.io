import React, { useState, useEffect } from 'react';
import { firestore, auth, storage } from '../../firebase';
import {
  collection,
  query,
  onSnapshot,
  addDoc,
  Timestamp,
  orderBy,
  doc,
  updateDoc,
  deleteDoc,
  arrayUnion,
  arrayRemove,
  getDoc
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAuthState } from 'react-firebase-hooks/auth';
import { v4 as uuidv4 } from 'uuid';
import Modal from 'react-modal';
import './Community.css';
import { FaHeart, FaComment, FaShare, FaTimes, FaEdit, FaEye } from 'react-icons/fa';

const Community = () => {
  const [user] = useAuthState(auth);
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [newImage, setNewImage] = useState(null);
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [editingPost, setEditingPost] = useState(null);
  const [editPostText, setEditPostText] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editTags, setEditTags] = useState('');

  useEffect(() => {
    const postsRef = collection(firestore, 'communityPosts');
    const q = query(postsRef, orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPosts(postList);
    });

    // Restore selected post and commentText from localStorage
    const savedPostId = localStorage.getItem('selectedPostId');
    if (savedPostId) {
      const savedPost = posts.find(post => post.id === savedPostId);
      setSelectedPost(savedPost);
    }

    const savedCommentText = localStorage.getItem('commentText');
    if (savedCommentText) {
      setCommentText(savedCommentText);
    }

    return () => unsubscribe();
  }, []);

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (newPost.trim() || newImage) {
      setLoading(true);
      let imageUrl = '';
      if (newImage) {
        const imageRef = ref(storage, `communityImages/${uuidv4()}`);
        await uploadBytes(imageRef, newImage);
        imageUrl = await getDownloadURL(imageRef);
      }
      await addDoc(collection(firestore, 'communityPosts'), {
        text: newPost,
        userId: user.uid,
        userName: user.displayName,
        timestamp: Timestamp.now(),
        imageUrl,
        category,
        tags: tags.split(',').map(tag => tag.trim()),
        likes: [],
        comments: {},
        kudos: 0
      });
      resetPostForm();
    }
  };

  const handleLike = async (postId) => {
    const postRef = doc(firestore, 'communityPosts', postId);
    const postDoc = await getDoc(postRef);
    const currentLikes = postDoc.data().likes || [];
    const userHasLiked = currentLikes.includes(user.uid);
    await updateDoc(postRef, {
      likes: userHasLiked
        ? arrayRemove(user.uid)
        : arrayUnion(user.uid)
    });
  };

  const handleDeletePost = async (postId) => {
    const postRef = doc(firestore, 'communityPosts', postId);
    await deleteDoc(postRef);
  };

  const handleEditPost = (post) => {
    setEditingPost(post);
    setEditPostText(post.text);
    setEditCategory(post.category || '');
    setEditTags(post.tags ? post.tags.join(', ') : '');
    setModalOpen(true);
  };

  const handleUpdatePost = async (e) => {
    e.preventDefault();
    if (editingPost && (editPostText.trim() || newImage)) {
      setLoading(true);
      let imageUrl = '';
      if (newImage) {
        const imageRef = ref(storage, `communityImages/${uuidv4()}`);
        await uploadBytes(imageRef, newImage);
        imageUrl = await getDownloadURL(imageRef);
      }
      const postRef = doc(firestore, 'communityPosts', editingPost.id);
      await updateDoc(postRef, {
        text: editPostText,
        category: editCategory,
        tags: editTags.split(',').map(tag => tag.trim()),
        imageUrl: imageUrl || editingPost.imageUrl
      });
      resetPostForm();
    }
  };

  const handleImageUpload = (e) => {
    setNewImage(e.target.files[0]);
  };

  const handleCommentSubmit = async (postId) => {
    if (commentText.trim()) {
      const postRef = doc(firestore, 'communityPosts', postId);
      await updateDoc(postRef, {
        comments: {
          ...selectedPost.comments,
          [uuidv4()]: {
            userName: user.displayName,
            text: commentText,
            timestamp: Timestamp.now()
          }
        }
      });
      setCommentText('');
      setSelectedPost(null);
      localStorage.removeItem('selectedPostId');
      localStorage.removeItem('commentText');
    }
  };

  const handleShare = (post) => {
    navigator.clipboard.writeText(`${window.location.origin}/posts/${post.id}`);
    alert('Post link copied to clipboard!');
  };

  const handleCloseModal = () => setModalOpen(false);

  const resetPostForm = () => {
    setNewPost('');
    setNewImage(null);
    setCategory('');
    setTags('');
    setLoading(false);
    setModalOpen(false);
  };

  const renderPostModal = () => (
    <Modal
      isOpen={modalOpen}
      onRequestClose={handleCloseModal}
      className="post-modal"
      overlayClassName="modal-overlay"
    >
      <div className="post-form">
        <h3>{editingPost ? 'Edit Post' : 'New Post'}</h3>
        <textarea
          value={editingPost ? editPostText : newPost}
          onChange={(e) => editingPost ? setEditPostText(e.target.value) : setNewPost(e.target.value)}
          placeholder="Share your thoughts..."
        />
        <input type="file" onChange={handleImageUpload} />
        <input
          type="text"
          value={editingPost ? editCategory : category}
          onChange={(e) => editingPost ? setEditCategory(e.target.value) : setCategory(e.target.value)}
          placeholder="Category"
        />
        <input
          type="text"
          value={editingPost ? editTags : tags}
          onChange={(e) => editingPost ? setEditTags(e.target.value) : setTags(e.target.value)}
          placeholder="Tags (comma separated)"
        />
        <button onClick={editingPost ? handleUpdatePost : handlePostSubmit} disabled={loading}>
          {loading ? 'Saving...' : (editingPost ? 'Update Post' : 'Post')}
        </button>
        <button onClick={handleCloseModal} className="close-modal-button">
          <FaTimes /> Close
        </button>
      </div>
    </Modal>
  );

  const renderPost = (post) => (
    <div key={post.id} className="community-post">
      <h3>{post.userName}</h3>
      {post.imageUrl && <img src={post.imageUrl} alt="Post" />}
      <p>{post.text}</p>
      <small>{new Date(post.timestamp.seconds * 1000).toLocaleString()}</small>
      <div className="community-post-meta">
        {post.category && <span className="post-category">Category: {post.category}</span>}
        {post.tags && <div className="post-tags">Tags: {post.tags.join(', ')}</div>}
      </div>
      <div className="community-post-actions">
        <button onClick={() => handleLike(post.id)}>
          <FaHeart /> {post.likes ? post.likes.length : 0}
        </button>
        <button onClick={() => {
          setSelectedPost(post);
          localStorage.setItem('selectedPostId', post.id);
        }}>
          <FaComment /> {post.comments ? Object.keys(post.comments).length : 0}
        </button>
        <button onClick={() => handleShare(post)}>
          <FaShare />
        </button>
        {user.uid === post.userId && (
          <>
            <button onClick={() => handleEditPost(post)}>
              <FaEdit />
            </button>
            <button onClick={() => handleDeletePost(post.id)}>
              <FaTimes />
            </button>
          </>
        )}
      </div>
      {selectedPost && selectedPost.id === post.id && (
        <div className="community-comments">
          <h4>Comments</h4>
          {Object.values(post.comments || {}).map((comment, index) => (
            <div key={index} className="community-comment">
              <p><strong>{comment.userName}:</strong> {comment.text}</p>
              <small>{new Date(comment.timestamp.seconds * 1000).toLocaleString()}</small>
            </div>
          ))}
          <textarea
            value={commentText}
            onChange={(e) => {
              setCommentText(e.target.value);
              localStorage.setItem('commentText', e.target.value);
            }}
            placeholder="Add a comment..."
          />
          <button onClick={() => handleCommentSubmit(post.id)} disabled={loading}>
            {loading ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="community">
      <h2>Community</h2>
      <button onClick={() => setModalOpen(true)}>New Post</button>
      {posts.map(renderPost)}
      {renderPostModal()}
    </div>
  );
};

export default Community;
