import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  db,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  getDoc,
  addDoc,
  auth,
  setDoc,
  deleteDoc,
} from "../firebase";
import Navbar from "../components/navbar/Navbar";

const PostView = () => {
  const [post, setPost] = useState(null);
  const [comment, setComment] = useState("");
  const [commentsList, setCommentsList] = useState([]);
  const [processingVote, setProcessingVote] = useState(false);
  const [userVote, setUserVote] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchPost = async () => {
      const postId = location.state?.postId;
      if (!postId) {
        navigate("/posts-view");
        return;
      }

      try {
        const postDoc = await getDoc(doc(db, "posts", postId));
        if (postDoc.exists()) {
          const postData = postDoc.data();
          const userRef = doc(db, "users", postData.createdBy);
          const userSnapshot = await getDoc(userRef);
          if (userSnapshot.exists()) {
            const userData = userSnapshot.data();
            setPost({
              id: postDoc.id,
              ...postData,
              createdBy: userData.displayName,
            });
          }
        } else {
          console.log("Post not found");
        }
      } catch (error) {
        console.error("Error fetching post:", error);
      }
    };

    fetchPost();
  }, []);

  useEffect(() => {
    const fetchComments = async () => {
      if (!post) return;

      try {
        const commentsQuerySnapshot = await getDocs(
          collection(db, `posts/${post.id}/comments`)
        );
        const comments = [];

        for (const commentDoc of commentsQuerySnapshot.docs) {
          const commentData = commentDoc.data();
          const authorId = commentData.authorId;
          const userDoc = await getDoc(doc(db, "users", authorId));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            const likesQuerySnapshot = await getDocs(
              collection(db, `posts/${post.id}/comments/${commentDoc.id}/likes`)
            );
            const likes = likesQuerySnapshot.docs.map((doc) => doc.data().uid);
            comments.push({
              id: commentDoc.id,
              ...commentData,
              authorDisplayName: userData.displayName,
              likes: likes,
              updating: false,
            });
          }
        }

        setCommentsList(comments);
      } catch (error) {
        console.error("Error fetching comments:", error);
      }
    };

    fetchComments();
  }, [post]);

  useEffect(() => {
    const fetchUserVote = async () => {
      if (!post) return;

      try {
        const user = auth.currentUser;
        const userVoteRef = doc(db, `posts/${post.id}/userVotes`, user.uid);
        const userVoteDoc = await getDoc(userVoteRef);
        if (userVoteDoc.exists()) {
          setUserVote(userVoteDoc.data().vote);
        } else {
          setUserVote(null);
        }
      } catch (error) {
        console.error("Error fetching user's vote:", error);
      }
    };

    fetchUserVote();
  }, [post]);

  const handleVote = async (type) => {
    if (processingVote) return;

    try {
      setProcessingVote(true);

      const user = auth.currentUser;
      const userVoteRef = doc(db, `posts/${post.id}/userVotes`, user.uid);
      const userVoteDoc = await getDoc(userVoteRef);
      let voteChange = 0;

      if (userVoteDoc.exists()) {
        const userVoteData = userVoteDoc.data();
        if (userVoteData.vote === type) {
          await deleteDoc(userVoteRef);
          voteChange = type === "upvote" ? -1 : 1;
        } else {
          await updateDoc(userVoteRef, { vote: type });
          voteChange = type === "upvote" ? 2 : -2;
        }
      } else {
        await setDoc(userVoteRef, { vote: type });
        voteChange = type === "upvote" ? 1 : -1;
      }

      await updateDoc(doc(db, "posts", post.id), {
        votes: post.votes + voteChange,
      });

      const postRefetch = await getDoc(doc(db, "posts", post.id));
      if (postRefetch.exists()) {
        const postData = postRefetch.data();
        setPost({
          id: postRefetch.id,
          ...postData,
          createdBy: post.createdBy,
        });
      }

      setUserVote(type);
      setProcessingVote(false);
    } catch (error) {
      console.error("Error handling vote:", error);
      setProcessingVote(false);
    }
  };

  const handleUpvote = () => {
    handleVote("upvote");
  };

  const handleDownvote = () => {
    handleVote("downvote");
  };

  const handleCommentSubmit = async () => {
    try {
      const user = auth.currentUser;
      const newCommentRef = await addDoc(
        collection(db, `posts/${post.id}/comments`),
        {
          authorId: user.uid,
          text: comment,
          createdAt: new Date(),
          totalLikes: 0,
          updating: false,
        }
      );
      setComment("");

      const newCommentDoc = await getDoc(newCommentRef);
      if (newCommentDoc.exists()) {
        const newCommentData = newCommentDoc.data();
        const userRef = doc(db, "users", newCommentData.authorId);
        const userSnapshot = await getDoc(userRef);
        if (userSnapshot.exists()) {
          const userData = userSnapshot.data();
          setCommentsList([
            ...commentsList,
            {
              id: newCommentDoc.id,
              ...newCommentData,
              authorDisplayName: userData.displayName,
              likes: [],
            },
          ]);
        }
      }
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const handleLike = async (commentId, index) => {
    try {
      setCommentsList((prevCommentsList) => {
        return prevCommentsList.map((comment, i) => {
          if (i === index) {
            return { ...comment, updating: true };
          }
          return comment;
        });
      });

      const user = auth.currentUser;
      const commentRef = doc(db, `posts/${post.id}/comments`, commentId);
      const commentDoc = await getDoc(commentRef);
      if (commentDoc.exists()) {
        const commentData = commentDoc.data();
        const likesCollectionRef = collection(
          db,
          `posts/${post.id}/comments/${commentId}/likes`
        );
        const likeQuery = query(
          likesCollectionRef,
          where("uid", "==", user.uid)
        );
        const likeQuerySnapshot = await getDocs(likeQuery);
        if (likeQuerySnapshot.empty) {
          await addDoc(likesCollectionRef, { uid: user.uid });
          await updateDoc(commentRef, {
            totalLikes: commentData.totalLikes + 1,
          });
          setCommentsList((prevCommentsList) => {
            return prevCommentsList.map((comment, i) => {
              if (i === index) {
                return {
                  ...comment,
                  totalLikes: comment.totalLikes + 1,
                  likes: [...comment.likes, user.uid],
                  updating: false,
                };
              }
              return comment;
            });
          });
        } else {
          const likeDoc = likeQuerySnapshot.docs[0];
          await deleteDoc(likeDoc.ref);
          await updateDoc(commentRef, {
            totalLikes: commentData.totalLikes - 1,
          });
          setCommentsList((prevCommentsList) => {
            return prevCommentsList.map((comment, i) => {
              if (i === index) {
                return {
                  ...comment,
                  totalLikes: comment.totalLikes - 1,
                  likes: comment.likes.filter((uid) => uid !== user.uid),
                  updating: false,
                };
              }
              return comment;
            });
          });
        }
      }
    } catch (error) {
      console.error("Error handling like:", error);
      setCommentsList((prevCommentsList) => {
        return prevCommentsList.map((comment, i) => {
          if (i === index) {
            return { ...comment, updating: false };
          }
          return comment;
        });
      });
    }
  };

  if (!post) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <Navbar />
      <h3>{post.title}</h3>
      <img src={post.imageUrl} alt={post.title} />
      <p>Created by: {post.createdBy}</p>
      <p>Votes: {post.votes}</p>
      <button
        onClick={handleUpvote}
        disabled={processingVote}
        style={{ backgroundColor: userVote === "upvote" ? "green" : "white" }}
      >
        Upvote
      </button>
      <button
        onClick={handleDownvote}
        disabled={processingVote}
        style={{ backgroundColor: userVote === "downvote" ? "red" : "white" }}
      >
        Downvote
      </button>
      <input
        type="text"
        placeholder="Add comment"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />
      <button onClick={handleCommentSubmit}>Comment</button>
      <ul>
        {commentsList.map((comment, index) => (
          <li key={index}>
            <p>{comment.text}</p>
            <p>Author: {comment.authorDisplayName}</p>
            <p>Likes: {comment.totalLikes}</p>
            <button
              onClick={() => {
                if (!comment.updating) {
                  handleLike(comment.id, index);
                }
              }}
              disabled={comment.updating}
              style={{
                backgroundColor: comment.likes.includes(auth.currentUser.uid)
                  ? "green"
                  : "white",
              }}
            >
              {comment.likes.includes(auth.currentUser.uid) ? "Liked" : "Like"}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PostView;
