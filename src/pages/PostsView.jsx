import React, { useEffect, useState } from "react";
import { db, collection, getDocs, query, doc, getDoc } from "../firebase"; // Import doc explicitly
import { orderBy, limit } from "firebase/firestore";
import Navbar from "../components/navbar/Navbar";
import { useNavigate } from "react-router-dom"; // Import useNavigate

const PostsView = () => {
  const [posts, setPosts] = useState([]);
  const navigate = useNavigate(); // Use useNavigate hook

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
          const userDocRef = doc(db, "users", postData.createdBy); // Use doc function from firebase
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            const createdAt = postData.createdAt.toDate();
            const formattedDate = formatDate(createdAt);

            // Fetch top 3 comments for each post
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
              const authorDocRef = doc(db, "users", commentData.authorId); // Use doc function from firebase
              const authorDocSnap = await getDoc(authorDocRef);
              if (authorDocSnap.exists()) {
                const authorData = authorDocSnap.data();
                topComments.push({
                  id: commentDoc.id,
                  authorDisplayName: authorData.displayName, // Author's display name
                  totalLikes: commentData.totalLikes,
                  text: commentData.text,
                });
              }
            }

            postsData.push({
              id: docSnapshot.id,
              ...postData,
              createdAt: formattedDate,
              createdBy: userData.displayName, // Post creator's display name
              topComments: topComments, // Include top 3 comments
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
    navigate(`/post-view`, { state: { postId } }); // Navigate to post view page with postId as state
  };

  return (
    <div>
      <Navbar />
      <h1>All Posts</h1>
      {posts.map((post) => (
        <div key={post.id}>
          <h3>
            <a href="#" onClick={() => handlePostClick(post.id)}>
              {post.title}
            </a>
          </h3>
          {post.imageUrl && (
            <img
              src={post.imageUrl}
              alt={post.title}
              onClick={() => handlePostClick(post.id)}
              style={{ cursor: "pointer" }}
            />
          )}
          <p>
            Created by: {post.createdBy} {post.createdAt}
          </p>
          {post.topComments.length > 0 ? (
            <div>
              <p>Top liked comments:</p>
              <ul>
                {post.topComments.map((comment, index) => (
                  <li key={index}>
                    <p>{comment.text}</p>
                    <p>Author: {comment.authorDisplayName}</p>
                    <p>Likes: {comment.totalLikes}</p>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p>No comments</p>
          )}
        </div>
      ))}
    </div>
  );
};

export default PostsView;
