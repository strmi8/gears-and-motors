import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { isUserAuthenticated } from "./firebase";
import { getAuth } from "firebase/auth";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Gallery from "./pages/Gallery";
import PostCreationPage from "./pages/PostCreationPage";
import PostView from "./pages/PostView";
import PostsView from "./pages/PostsView";
import OrganizeEvent from "./pages/OrganizeEvent";
import ViewEvents from "./pages/ViewEvents";
import Garage from "./pages/Garage";

function App() {
  const [authenticated, setAuthenticated] = useState(null);

  useEffect(() => {
    const checkAuthentication = async () => {
      const isAuthenticated = await isUserAuthenticated();
      setAuthenticated(isAuthenticated);
    };
    checkAuthentication();

    // Listen for authentication state changes
    const unsubscribe = getAuth().onAuthStateChanged((user) => {
      if (user) {
        setAuthenticated(true);
      } else {
        setAuthenticated(false);
      }
    });

    // Clean up the listener
    return () => unsubscribe();
  }, []);

  const ProtectedRoute = ({ children }) => {
    if (authenticated === null) {
      // Authentication state is being checked, render nothing or a loading indicator
      return null;
    } else if (!authenticated) {
      // User is not authenticated, redirect to login page
      return <Navigate to="/login" />;
    } else {
      // User is authenticated, render the children
      return children;
    }
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/">
        <Route index element={<Home />} />
          <Route path="home" element={<Home />} />
          <Route path="gallery" element={<Gallery />} />
          <Route path="create-post" element={<ProtectedRoute><PostCreationPage /></ProtectedRoute>} />
          <Route path="post-view" element={<ProtectedRoute><PostView /></ProtectedRoute>} />
          <Route path="posts-view" element={<PostsView />} />
          <Route path="organize-event" element={<ProtectedRoute><OrganizeEvent /></ProtectedRoute>} />
          <Route path="view-events" element={<ViewEvents />} />
          <Route path="garage" element={<Garage />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
