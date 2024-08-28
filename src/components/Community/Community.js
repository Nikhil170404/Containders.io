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
import { FaHeart, FaComment, FaShare, FaTimes, FaEdit } from 'react-icons/fa';

// Post component
const Post = ({ post, user, handleLike, handleEdit, handleDelete, handleCommentSubmit }) => {
  const [commentText, setCommentText] = useState('');
  const [isCommentsVisible, setCommentsVisible] = useState(false);

  const handleCommentChange = (e) => setCommentText(e.target.value);

  const handleCommentSubmitLocal = () => {
    handleCommentSubmit(post.id, commentText);
    setCommentText('');
  };

  return (
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
        <button onClick={() => setCommentsVisible(!isCommentsVisible)}>
          <FaComment /> {post.comments ? Object.keys(post.comments).length : 0}
        </button>
        <button onClick={() => navigator.clipboard.writeText(`${window.location.origin}/posts/${post.id}`)}>
          <FaShare />
        </button>
        {user.uid === post.userId && (
          <>
            <button onClick={() => handleEdit(post)}>
              <FaEdit />
            </button>
            <button onClick={() => handleDelete(post.id)}>
              <FaTimes />
            </button>
          </>
        )}
      </div>
      {isCommentsVisible && (
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
            onChange={handleCommentChange}
            placeholder="Add a comment..."
          />
          <button onClick={handleCommentSubmitLocal}>
            Submit
          </button>
        </div>
      )}
    </div>
  );
};

// PostForm component
const PostForm = ({ isOpen, onRequestClose, onSubmit, loading, postData }) => {
  const [text, setText] = useState(postData?.text || '');
  const [category, setCategory] = useState(postData?.category || '');
  const [tags, setTags] = useState(postData?.tags?.join(', ') || '');
  const [image, setImage] = useState(null);

  const handleImageChange = (e) => setImage(e.target.files[0]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSubmit(text, category, tags, image);
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      className="post-modal"
      overlayClassName="modal-overlay"
    >
      <div className="post-form">
        <h3>{postData ? 'Edit Post' : 'New Post'}</h3>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Share your thoughts..."
        />
        <input type="file" onChange={handleImageChange} />
        <input
          type="text"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="Category"
        />
        <input
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="Tags (comma separated)"
        />
        <button onClick={handleSubmit} disabled={loading}>
          {loading ? 'Saving...' : (postData ? 'Update Post' : 'Post')}
        </button>
        <button onClick={onRequestClose} className="close-modal-button">
          <FaTimes /> Close
        </button>
      </div>
    </Modal>
  );
};

// Community component
const Community = () => {
  const [user] = useAuthState(auth);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [editingPost, setEditingPost] = useState(null);

  useEffect(() => {
    const postsRef = collection(firestore, 'communityPosts');
    const q = query(postsRef, orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPosts(postList);
    });

    return () => unsubscribe();
  }, []);

  const handlePostSubmit = async (text, category, tags, image) => {
    setLoading(true);
    let imageUrl = '';
    if (image) {
      const imageRef = ref(storage, `communityImages/${uuidv4()}`);
      await uploadBytes(imageRef, image);
      imageUrl = await getDownloadURL(imageRef);
    }
    await addDoc(collection(firestore, 'communityPosts'), {
      text,
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
  };

  const handleEditPost = (post) => {
    setEditingPost(post);
    setModalOpen(true);
  };

  const handleUpdatePost = async (text, category, tags, image) => {
    setLoading(true);
    let imageUrl = '';
    if (image) {
      const imageRef = ref(storage, `communityImages/${uuidv4()}`);
      await uploadBytes(imageRef, image);
      imageUrl = await getDownloadURL(imageRef);
    }
    const postRef = doc(firestore, 'communityPosts', editingPost.id);
    await updateDoc(postRef, {
      text,
      category,
      tags: tags.split(',').map(tag => tag.trim()),
      imageUrl: imageUrl || editingPost.imageUrl
    });
    resetPostForm();
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
    await deleteDoc(doc(firestore, 'communityPosts', postId));
  };

  const handleCommentSubmit = async (postId, commentText) => {
    if (commentText.trim()) {
      const postRef = doc(firestore, 'communityPosts', postId);
      await updateDoc(postRef, {
        comments: {
          ...posts.find(post => post.id === postId).comments,
          [uuidv4()]: {
            userName: user.displayName,
            text: commentText,
            timestamp: Timestamp.now()
          }
        }
      });
    }
  };

  const resetPostForm = () => {
    setLoading(false);
    setModalOpen(false);
    setEditingPost(null);
  };

  return (
    <div className="community">
      <h2>Community</h2>
      <button onClick={() => setModalOpen(true)}>New Post</button>
      {posts.map(post => (
        <Post
          key={post.id}
          post={post}
          user={user}
          handleLike={handleLike}
          handleEdit={handleEditPost}
          handleDelete={handleDeletePost}
          handleCommentSubmit={handleCommentSubmit}
        />
      ))}
      <PostForm
        isOpen={modalOpen}
        onRequestClose={resetPostForm}
        onSubmit={editingPost ? handleUpdatePost : handlePostSubmit}
        loading={loading}
        postData={editingPost}
      />
    </div>
  );
};

export default Community;
