import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  auth,
  db,
  collection,
  ref,
  uploadBytes,
  getDownloadURL,
  storage, // Add storage import
  addDoc, // Add addDoc import
} from "../firebase";

const PostCreationPage = () => {
  const [title, setTitle] = useState("");
  const [image, setImage] = useState(null);
  const navigate = useNavigate();

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handlePostCreation = async () => {
    const currentUser = auth.currentUser;
    const storageRef = ref(storage, image.name);
    await uploadBytes(storageRef, image);
    const imageUrl = await getDownloadURL(storageRef);
    await addDoc(collection(db, "posts"), {
      title,
      imageUrl,
      createdBy: currentUser.uid,
      createdAt: new Date(),
      upvotes: 0,
      downvotes: 0,
      comments: [],
    });
    navigate("/"); // Navigate to the home page after post creation
  };

  return (
    <div>
      <h2>Create a Post</h2>
      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <input type="file" onChange={handleImageChange} />
      <button onClick={handlePostCreation}>Create Post</button>
    </div>
  );
};

export default PostCreationPage;
