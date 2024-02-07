import React, { useEffect, useState } from "react";
import { db, collection, getDocs, query, doc, getDoc } from "../firebase";
import { orderBy, limit } from "firebase/firestore";
import Navbar from "../components/navbar/Navbar";
import { useNavigate } from "react-router-dom";
import "./PostsView.css";

const PostsView = () => {
  const [posts, setPosts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const postsCollection = collection(db, "posts");
        const q = query(
          postsCollection,
          orderBy("createdAt", "desc"),
          limit(10)
        );
        const querySnapshot = await getDocs(q);

        const postsData = [];
        for (const docSnapshot of querySnapshot.docs) {
          const postData = docSnapshot.data();
          const userDocRef = doc(db, "users", postData.createdBy);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            const createdAt = postData.createdAt.toDate();
            const formattedDate = formatDate(createdAt);

            // Accessing votes directly from postData
            const votes = postData.votes || 0;

            const commentsCollectionRef = collection(
              db,
              `posts/${docSnapshot.id}/comments`
            );
            const commentsQuery = query(
              commentsCollectionRef,
              orderBy("totalLikes", "desc"),
              limit(3)
            );
            const commentsSnapshot = await getDocs(commentsQuery);
            const topComments = [];
            for (const commentDoc of commentsSnapshot.docs) {
              const commentData = commentDoc.data();
              const authorDocRef = doc(db, "users", commentData.authorId);
              const authorDocSnap = await getDoc(authorDocRef);
              if (authorDocSnap.exists()) {
                const authorData = authorDocSnap.data();
                topComments.push({
                  id: commentDoc.id,
                  authorDisplayName: authorData.displayName,
                  authorPhotoURL: authorData.photoURL,
                  totalLikes: commentData.totalLikes,
                  text: commentData.text,
                });
              }
            }

            postsData.push({
              id: docSnapshot.id,
              ...postData,
              createdAt: formattedDate,
              createdBy: userData.displayName,
              creatorPhotoURL: userData.photoURL,
              topComments: topComments,
              votes: votes,
            });
          }
        }
        setPosts(postsData);
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    };

    fetchPosts();
  }, []);

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const hours = date.getHours();
    const minutes = date.getMinutes();

    return `${day}.${month}.${year}. ${hours}:${
      minutes < 10 ? "0" : ""
    }${minutes}`;
  };

  const handlePostClick = (postId) => {
    navigate(`/post-view`, { state: { postId } });
  };

  return (
    <>
      <Navbar />
      <div className="posts-view-container">
        <h1>All Posts</h1>
        {posts.map((post) => (
          <div
            key={post.id}
            className="post-container"
            onClick={() => handlePostClick(post.id)}
          >
            <div className="post-item">
              <div style={{ display: "flex", alignItems: "center" }}>
                {/* Display number of votes */}
                <p style={{ marginRight: "1rem" }}>Votes: {post.votes}</p>
                {/* Display post title */}
                <div className="post-header">
                  <h3 className="post-title">
                    <span>{post.title}</span>
                  </h3>
                </div>
              </div>
              <p className="created-by">
                Created by:{" "}
                <img
                  src={post.creatorPhotoURL}
                  alt={post.createdBy}
                  className="avatar"
                />
                {post.createdBy} {post.createdAt}
              </p>

              {post.imageUrl && (
                <img
                  src={post.imageUrl}
                  alt={post.title}
                  className="post-image"
                />
              )}

              {/* Render comments if any */}
              {post.topComments.length > 0 ? (
                <div>
                  <p className="comments-list">
                    {post.topComments.map((comment, index) => (
                      <span key={index} className="comment-item">
                        <p id={`comment-${index}`} className="comment-text">
                          <img
                            src={comment.authorPhotoURL}
                            alt={comment.authorDisplayName}
                            className="avatar"
                          />
                          {comment.authorDisplayName}: {comment.text} - Likes:{" "}
                          {comment.totalLikes}
                        </p>
                      </span>
                    ))}
                  </p>
                </div>
              ) : (
                <p id="no-comments" className="no-comments">
                  Be the first to comment
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default PostsView;
