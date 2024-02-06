import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
} from "../firebase";

const PostView = () => {
  const [post, setPost] = useState(null);
  const [comment, setComment] = useState("");
  const [commentsList, setCommentsList] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPost = async () => {
      const q = query(
        collection(db, "posts"),
        where("createdBy", "==", "NZMgF7fB3HYGVKdd2B4aYDSlIwk1")
      );

      try {
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const postDoc = querySnapshot.docs[0];
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
          } else {
            console.log("User document not found");
          }
        } else {
          console.log("No matching post found");
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
            comments.push({
              id: commentDoc.id,
              ...commentData,
              authorDisplayName: userData.displayName,
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

  const handleUpvote = async () => {
    try {
      await updateDoc(collection(db, "posts", post.id), {
        upvotes: post.upvotes + 1,
      });
    } catch (error) {
      console.error("Error updating upvotes:", error);
    }
  };

  const handleDownvote = async () => {
    try {
      await updateDoc(collection(db, "posts", post.id), {
        downvotes: post.downvotes + 1,
      });
    } catch (error) {
      console.error("Error updating downvotes:", error);
    }
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
        }
      );
      setComment("");

      // Fetch the new comment data
      const newCommentDoc = await getDoc(newCommentRef);
      if (newCommentDoc.exists()) {
        const newCommentData = newCommentDoc.data();

        // Fetch the user's display name
        const userRef = doc(db, "users", newCommentData.authorId);
        const userSnapshot = await getDoc(userRef);
        if (userSnapshot.exists()) {
          const userData = userSnapshot.data();

          // Add the new comment to the comments list
          setCommentsList([
            ...commentsList,
            {
              id: newCommentDoc.id,
              ...newCommentData,
              authorDisplayName: userData.displayName,
            },
          ]);
        }
      }
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  if (!post) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h3>{post.title}</h3>
      <img src={post.imageUrl} alt={post.title} />
      <p>Created by: {post.createdBy}</p>
      <p>Upvotes: {post.upvotes}</p>
      <p>Downvotes: {post.downvotes}</p>
      <button onClick={handleUpvote}>Upvote</button>
      <button onClick={handleDownvote}>Downvote</button>
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
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PostView;
