import React, { useState, useEffect } from 'react';
<<<<<<< HEAD
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  TextField,
  Button,
  Avatar,
  IconButton,
  Box,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Menu,
  MenuItem,
  Divider,
  Paper,
  Tab,
  Tabs,
  Badge,
  LinearProgress,
  Tooltip,
} from '@mui/material';
import {
  Comment,
  Share,
  MoreVert,
  Send,
  Image as ImageIcon,
  EmojiEvents,
  SportsEsports,
  Group,
  Bookmark,
  BookmarkBorder,
  Forum,
  LocalFireDepartment,
  Whatshot,
  EmojiEventsOutlined,
  WorkspacePremium,
  Psychology,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useSelector } from 'react-redux';
import { db, storage } from '../../firebase';
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  addDoc,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
  increment,
  deleteField,
  where,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: theme.palette.gaming.neon,
    color: theme.palette.common.black,
    fontWeight: 'bold',
    boxShadow: `0 0 10px ${theme.palette.gaming.neon}`,
  },
}));

const XPProgress = styled(LinearProgress)(({ theme }) => ({
  height: 8,
  borderRadius: 4,
  backgroundColor: 'rgba(0, 255, 157, 0.1)',
  '& .MuiLinearProgress-bar': {
    background: `linear-gradient(45deg, ${theme.palette.gaming.neon}, ${theme.palette.gaming.cyan})`,
  },
}));

const Community = () => {
  const user = useSelector((state) => state.auth.user);
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState(null);
  const [comment, setComment] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [currentTab, setCurrentTab] = useState(0);
  const [bookmarkedPosts, setBookmarkedPosts] = useState([]);
  const [userStats, setUserStats] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [dailyChallenge, setDailyChallenge] = useState(null);

  // Fetch posts and user data
  useEffect(() => {
    let unsubscribeBookmarks = null;
    let unsubscribeStats = null;
    let unsubscribeAchievements = null;
    let unsubscribeChallenge = null;

    const fetchData = async () => {
      // Fetch posts
      const q = query(collection(db, 'posts'), orderBy('timestamp', 'desc'));
      const unsubscribePosts = onSnapshot(q, (snapshot) => {
        const postsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPosts(postsData);
        setLoading(false);
      });

      if (user?.uid) {
        // Fetch user stats
        const userRef = doc(db, 'users', user.uid);
        unsubscribeStats = onSnapshot(userRef, (doc) => {
          const userData = doc.data() || {};
          setUserStats(userData);
          setBookmarkedPosts(userData.bookmarkedPosts || []);
        });

        // Fetch achievements
        const achievementsRef = collection(db, 'achievements');
        const achievementsQuery = query(achievementsRef, where('userId', '==', user.uid));
        unsubscribeAchievements = onSnapshot(achievementsQuery, (snapshot) => {
          const achievementsData = snapshot.docs.map(doc => doc.data());
          setAchievements(achievementsData);
        });

        // Fetch daily challenge
        const challengeRef = collection(db, 'dailyChallenges');
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const challengeQuery = query(
          challengeRef,
          where('date', '>=', today),
          limit(1)
        );
        unsubscribeChallenge = onSnapshot(challengeQuery, (snapshot) => {
          if (!snapshot.empty) {
            setDailyChallenge(snapshot.docs[0].data());
          }
        });
      }

      return () => {
        unsubscribePosts();
        if (unsubscribeStats) unsubscribeStats();
        if (unsubscribeBookmarks) unsubscribeBookmarks();
        if (unsubscribeAchievements) unsubscribeAchievements();
        if (unsubscribeChallenge) unsubscribeChallenge();
      };
    };

    fetchData();
  }, [user?.uid]);

  const handlePostSubmit = async () => {
    if (!newPost.trim() && !image) return;

    try {
      let imageUrl = '';
      if (image) {
        const imageRef = ref(storage, `posts/${Date.now()}_${image.name}`);
        await uploadBytes(imageRef, image);
        imageUrl = await getDownloadURL(imageRef);
      }

      const postData = {
        content: newPost,
        imageUrl,
        author: {
          id: user.uid,
          name: user.displayName || user.email,
          avatar: user.photoURL,
          level: Math.floor((userStats?.xp || 0) / 100) + 1,
          achievements: achievements.map(a => a.name),
        },
        likes: [],
        comments: [],
        shares: 0,
        timestamp: serverTimestamp(),
        category: currentTab === 0 ? 'general' :
                 currentTab === 1 ? 'tournaments' :
                 currentTab === 2 ? 'teams' : 'gaming',
        tags: extractHashtags(newPost),
        mentions: extractMentions(newPost),
        reactions: {},
        isHighlight: false,
        powerups: [],
      };

      await addDoc(collection(db, 'posts'), postData);
      await handleAwardPoints(user.uid, 5, 'post_created');

      // Check for achievements
      if (posts.length === 0) {
        await unlockAchievement('first_post', 'Made your first post!', 50);
      }

      setNewPost('');
      setImage(null);
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  const unlockAchievement = async (id, name, xpReward) => {
    const achievementRef = collection(db, 'achievements');
    const userRef = doc(db, 'users', user.uid);

    await addDoc(achievementRef, {
      userId: user.uid,
      id,
      name,
      unlockedAt: serverTimestamp(),
    });

    await updateDoc(userRef, {
      xp: increment(xpReward),
      [`achievements.${id}`]: true,
    });
  };

  const handleAwardPoints = async (userId, points, reason) => {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      xp: increment(points),
      [`stats.${reason}`]: increment(1),
    });

    // Check level up
    const newXP = (userStats?.xp || 0) + points;
    const oldLevel = Math.floor((userStats?.xp || 0) / 100);
    const newLevel = Math.floor(newXP / 100);

    if (newLevel > oldLevel) {
      await unlockAchievement('level_up', `Reached Level ${newLevel}!`, 100);
    }
  };

  const renderDailyChallenge = () => (
    <Card sx={{ mb: 3, background: 'linear-gradient(45deg, #16213e 30%, #1a1a2e 90%)' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <LocalFireDepartment color="error" sx={{ mr: 1 }} />
          <Typography variant="h6">Daily Challenge</Typography>
        </Box>
        {dailyChallenge ? (
          <>
            <Typography variant="subtitle1" gutterBottom>
              {dailyChallenge.title}
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              {dailyChallenge.description}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip
                icon={<EmojiEventsOutlined />}
                label={`${dailyChallenge.xpReward} XP`}
                color="primary"
                variant="outlined"
              />
              <LinearProgress
                variant="determinate"
                value={(dailyChallenge.progress || 0) * 100}
                sx={{ flexGrow: 1, height: 8, borderRadius: 4 }}
              />
            </Box>
          </>
        ) : (
          <Typography variant="body2" color="text.secondary">
            No active challenge
          </Typography>
        )}
      </CardContent>
    </Card>
  );

  const renderUserStats = () => {
    const level = Math.floor((userStats?.xp || 0) / 100);
    const xpProgress = ((userStats?.xp || 0) % 100) / 100 * 100;

    return (
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'start', gap: 2 }}>
            <Box sx={{ position: 'relative' }}>
              <StyledBadge
                overlap="circular"
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                badgeContent={level}
              >
                <Avatar
                  src={user.photoURL}
                  sx={{
                    width: 64,
                    height: 64,
                    border: '2px solid',
                    borderColor: 'gaming.neon',
                  }}
                />
              </StyledBadge>
            </Box>
            <Box sx={{ ml: 2 }}>
              <Typography variant="h6">
                {user.displayName || user.email}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Level {level} Gamer
              </Typography>
            </Box>
          </Box>

          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="body2" color="text.secondary">
                XP Progress
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {userStats?.xp % 100}/100 XP
              </Typography>
            </Box>
            <XPProgress variant="determinate" value={xpProgress} />
          </Box>

          <Grid container spacing={1}>
            <Grid item xs={4}>
              <Tooltip title="Posts Created">
                <Box sx={{ textAlign: 'center' }}>
                  <Psychology sx={{ color: 'gaming.neon' }} />
                  <Typography variant="h6">
                    {userStats?.stats?.post_created || 0}
                  </Typography>
                </Box>
              </Tooltip>
            </Grid>
            <Grid item xs={4}>
              <Tooltip title="Achievements">
                <Box sx={{ textAlign: 'center' }}>
                  <WorkspacePremium sx={{ color: 'gaming.purple' }} />
                  <Typography variant="h6">
                    {achievements.length}
                  </Typography>
                </Box>
              </Tooltip>
            </Grid>
            <Grid item xs={4}>
              <Tooltip title="Reactions Received">
                <Box sx={{ textAlign: 'center' }}>
                  <Whatshot sx={{ color: 'gaming.orange' }} />
                  <Typography variant="h6">
                    {userStats?.stats?.reactions_received || 0}
                  </Typography>
                </Box>
              </Tooltip>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    );
  };

  const extractHashtags = (text) => {
    const hashtagRegex = /#(\w+)/g;
    return (text.match(hashtagRegex) || []).map(tag => tag.slice(1));
  };

  const extractMentions = (text) => {
    const mentionRegex = /@(\w+)/g;
    return (text.match(mentionRegex) || []).map(mention => mention.slice(1));
  };

  const handleReaction = async (postId, reaction) => {
    const postRef = doc(db, 'posts', postId);
    const post = posts.find(p => p.id === postId);
    const currentReactions = post.reactions || {};
    
    if (currentReactions[user.uid] === reaction) {
      await updateDoc(postRef, {
        [`reactions.${user.uid}`]: deleteField()
      });
    } else {
      await updateDoc(postRef, {
        [`reactions.${user.uid}`]: reaction
      });
      if (!currentReactions[user.uid]) {
        await handleAwardPoints(user.uid, 1, 'reaction_added');
      }
    }
  };

  const handleComment = async () => {
    if (!comment.trim()) return;

    const postRef = doc(db, 'posts', selectedPost.id);
    await updateDoc(postRef, {
      comments: arrayUnion({
        id: Date.now().toString(),
        content: comment,
        author: {
          id: user.uid,
          name: user.displayName || user.email,
          avatar: user.photoURL,
        },
        timestamp: new Date().toISOString(),
      })
    });
    await handleAwardPoints(user.uid, 2, 'comment_added');
    setComment('');
  };

  const handleBookmark = async (postId) => {
    const userRef = doc(db, 'users', user.uid);
    if (bookmarkedPosts.includes(postId)) {
      await updateDoc(userRef, {
        bookmarkedPosts: arrayRemove(postId)
      });
    } else {
      await updateDoc(userRef, {
        bookmarkedPosts: arrayUnion(postId)
      });
      await handleAwardPoints(user.uid, 1, 'post_bookmarked');
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      await deleteDoc(doc(db, 'posts', postId));
      setAnchorEl(null);
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const handleShare = async (postId) => {
    const postRef = doc(db, 'posts', postId);
    await updateDoc(postRef, {
      shares: posts.find(p => p.id === postId).shares + 1
    });
    await handleAwardPoints(user.uid, 3, 'post_shared');
  };

  const renderPost = (post) => (
    <Card key={post.id} sx={{ mb: 2, borderRadius: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ position: 'relative' }}>
              <Avatar
                src={post.author.avatar}
                alt={post.author.name}
                sx={{ 
                  width: 48, 
                  height: 48,
                  border: '2px solid gold'
                }}
              />
            </Box>
            <Box sx={{ ml: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold">
                {post.author.name}
              </Typography>
            </Box>
          </Box>
          {post.author.id === user.uid && (
            <IconButton onClick={(e) => {
              setSelectedPost(post);
              setAnchorEl(e.currentTarget);
            }}>
              <MoreVert />
            </IconButton>
          )}
        </Box>

        <Typography variant="body1" sx={{ mb: 2 }}>
          {post.content}
        </Typography>

        {post.imageUrl && (
          <Box sx={{ mb: 2, borderRadius: 1, overflow: 'hidden' }}>
            <img
              src={post.imageUrl}
              alt="Post content"
              style={{ width: '100%', maxHeight: 400, objectFit: 'cover' }}
            />
          </Box>
        )}

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
          {post.tags?.map((tag, index) => (
            <Chip
              key={index}
              label={`#${tag}`}
              size="small"
              color="primary"
              variant="outlined"
            />
          ))}
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Chip
            size="small"
            label={post.category}
            color="primary"
            icon={
              post.category === 'tournaments' ? <EmojiEvents /> :
              post.category === 'teams' ? <Group /> :
              post.category === 'gaming' ? <SportsEsports /> : null
            }
          />
        </Box>
      </CardContent>

      <CardActions sx={{ px: 2, pb: 2, flexWrap: 'wrap' }}>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {['👍', '❤️', '🎮', '🏆', '😮'].map((reaction) => (
            <IconButton
              key={reaction}
              size="small"
              onClick={() => handleReaction(post.id, reaction)}
              color={post.reactions?.[user.uid] === reaction ? 'primary' : 'default'}
            >
              {reaction}
            </IconButton>
          ))}
        </Box>
        <Button
          size="small"
          startIcon={<Comment />}
          onClick={() => setSelectedPost(post)}
        >
          {post.comments.length}
        </Button>
        <Button
          size="small"
          startIcon={<Share />}
          onClick={() => handleShare(post.id)}
        >
          {post.shares}
        </Button>
        <IconButton
          size="small"
          onClick={() => handleBookmark(post.id)}
          sx={{ ml: 'auto' }}
        >
          {bookmarkedPosts.includes(post.id) ? <Bookmark color="primary" /> : <BookmarkBorder />}
        </IconButton>
      </CardActions>
    </Card>
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ mb: 4 }}>
        <Tabs
          value={currentTab}
          onChange={(e, newValue) => setCurrentTab(newValue)}
          variant="fullWidth"
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label="General" icon={<Forum />} />
          <Tab label="Tournaments" icon={<EmojiEvents />} />
          <Tab label="Teams" icon={<Group />} />
          <Tab label="Gaming" icon={<SportsEsports />} />
        </Tabs>
      </Paper>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'start', gap: 2 }}>
                <Avatar src={user?.photoURL} />
                <Box sx={{ flexGrow: 1 }}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    placeholder="Share your thoughts..."
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                    variant="outlined"
                  />
                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                    <Button
                      component="label"
                      startIcon={<ImageIcon />}
                    >
                      Add Image
                      <input
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={(e) => setImage(e.target.files[0])}
                      />
                    </Button>
                    <Button
                      variant="contained"
                      endIcon={<Send />}
                      onClick={handlePostSubmit}
                      disabled={!newPost.trim() && !image}
                    >
                      Post
                    </Button>
                  </Box>
                  {image && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="caption">
                        Selected image: {image.name}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            </CardContent>
          </Card>

          {renderDailyChallenge()}
          {renderUserStats()}

          {posts
            .filter(post => currentTab === 0 || post.category === 
              (currentTab === 1 ? 'tournaments' :
               currentTab === 2 ? 'teams' :
               'gaming'))
            .map(renderPost)}
        </Grid>
      </Grid>

      {/* Comments Dialog */}
      <Dialog
        open={Boolean(selectedPost)}
        onClose={() => setSelectedPost(null)}
        maxWidth="sm"
        fullWidth
      >
        {selectedPost && (
          <>
            <DialogTitle>
              Comments
            </DialogTitle>
            <DialogContent dividers>
              {renderPost(selectedPost)}
              <Divider sx={{ my: 2 }} />
              {selectedPost.comments.map((comment) => (
                <Box key={comment.id} sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'start', gap: 2 }}>
                    <Avatar src={comment.author.avatar} />
                    <Box>
                      <Typography variant="subtitle2">
                        {comment.author.name}
                      </Typography>
                      <Typography variant="body2">
                        {comment.content}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(comment.timestamp).toLocaleString()}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              ))}
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', width: '100%', gap: 1 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Write a comment..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
                <Button
                  variant="contained"
                  onClick={handleComment}
                  disabled={!comment.trim()}
                >
                  Send
                </Button>
              </Box>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Post Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem
          onClick={() => {
            handleDeletePost(selectedPost.id);
          }}
          sx={{ color: 'error.main' }}
        >
          Delete Post
        </MenuItem>
      </Menu>
    </Container>
=======
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
>>>>>>> 4ea65ed11c095c112a7ad060e6544fcd1c0bfab2
  );
};

export default Community;
