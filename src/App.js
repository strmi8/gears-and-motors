import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext.js";
import './App.css'
import Gallery from "./pages/Gallery.jsx";
import PostCreationPage from "./pages/PostCreationPage.jsx";
import PostView from "./pages/PostView.jsx";
import PostsView from "./pages/PostsView.jsx";
import Garage from "./pages/Garage.jsx";


function App() {
  const { currentUser } = useContext(AuthContext);

  const ProtectedRoute = ({ children }) => {
    if (!currentUser) {
      return <Navigate to="/login" />;
    }

    return children
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/">
          <Route
            index
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route path="gallery" element={<Gallery />} />
          <Route path="create-post" element={<PostCreationPage />} />
          <Route path="post-view" element={<PostView />} />
          <Route path="posts-view" element={<PostsView />} />

          <Route path="home" element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="garage" element={<Garage />} />

        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
