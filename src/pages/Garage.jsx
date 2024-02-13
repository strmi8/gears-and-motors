import React, { useState, useEffect } from "react";
import Navbar from "../components/navbar/Navbar";
import { db, collection, getDocs } from "../firebase";
import "../pages/Garage.css"; // Import the CSS file

const Garage = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersCollection = collection(db, "users");
        const usersSnapshot = await getDocs(usersCollection);
        const usersData = usersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsers(usersData);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  }, []);

  return (
    <>
      <Navbar />
      <div className="garageContainer">
        <h2 style={{ textAlign: "center" }}>
          Users that are a part of our community:
        </h2>
        <div className="profileGrid">
          {" "}
          {/* Apply the profileGrid class */}
          {users.map((user) => (
            <div key={user.id} className="profileCard">
              <div className="profileImage">
                <img src={user.photoURL} alt={user.displayName} />
              </div>
              <div className="profileInfo">
                <strong>Name:</strong> {user.displayName}
                <br />
                <strong>Email:</strong> {user.email}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Garage;
