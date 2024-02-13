import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  auth,
  db,
  collection,
  ref,
  uploadBytes,
  getDownloadURL,
  storage,
  addDoc,
} from "../firebase";
import Navbar from "../components/navbar/Navbar";
import "../pages/PostCreationPage.css";
import uploadImageEmpty from "../images/uploadImageEmpty.png";
import uploadImageFull from "../images/uploadImageFull.png";

const PostCreationPage = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [showAlert, setShowAlert] = useState(false);
  const [alertStyle, setAlertStyle] = useState();
  const navigate = useNavigate();

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handlePostCreation = async () => {
    if (!title || !image) {
      setAlertStyle(true);
      setShowAlert(true);
      return;
    }

    const currentUser = auth.currentUser;
    const storageRef = ref(storage, image.name);
    await uploadBytes(storageRef, image);
    const imageUrl = await getDownloadURL(storageRef);
    await addDoc(collection(db, "posts"), {
      title,
      description,
      imageUrl,
      createdBy: currentUser.uid,
      createdAt: new Date(),
      votes: 0,
    });
    navigate("/");
  };

  const handleAlertClose = () => {
    setAlertStyle(false);
    // Wait for the slide-out animation to finish before removing the alert from the DOM
    setTimeout(() => {
      setShowAlert(false);
    }, 500); // Adjust the delay to match the animation duration
  };

  return (
    <>
      <Navbar />
      <div className="CreatePostcontainer">
        <h2>Create a Post</h2>
        <input
          type="text"
          placeholder="Write a title"
          value={title}
          maxLength={80}
          onChange={(e) => setTitle(e.target.value)}
        />
        <label className="custom-file-upload">
          <input type="file" onChange={handleImageChange} />
          {image ? (
            <img src={uploadImageFull} alt="Uploaded Image" />
          ) : (
            <img src={uploadImageEmpty} alt="No Image" />
          )}
          {image ? <span>File Selected</span> : <span>No file chosen</span>}
        </label>
        <textarea
          placeholder="Write a description"
          value={description}
          maxLength={2000}
          onChange={(e) => setDescription(e.target.value)}
        />
        <button className="PostCreationButton" onClick={handlePostCreation}>
          Create Post
        </button>
      </div>
      {showAlert && (
        <div className={`custom-alert ${alertStyle ? "" : "hide"}`}>
          <div className="alert-message">
            Please provide a title and select an image.
          </div>
          <button className="PostCreationButton" onClick={handleAlertClose}>
            Close
          </button>
        </div>
      )}
    </>
  );
};

export default PostCreationPage;
