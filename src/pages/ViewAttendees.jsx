import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "../components/navbar/Navbar";
import { db, collection, getDocs, doc, getDoc } from "../firebase";
import "./ViewAttendees.css";

const ViewAttendees = () => {
  const location = useLocation();
  const { eventId } = location.state;
  const [attendees, setAttendees] = useState([]);

  useEffect(() => {
    const fetchAttendees = async () => {
      try {
        const attendeesRef = collection(db, "attending");
        const attendeesSnapshot = await getDocs(attendeesRef);
        const attendeesData = [];
        for (const docs of attendeesSnapshot.docs) {
          const userEventIds = docs.data().events;
          if (userEventIds.includes(eventId)) {
            const userId = docs.id;
            const userDoc = await getDoc(doc(db, "users", userId));
            const userData = userDoc.data();
            attendeesData.push({ id: userId, ...userData });
          }
        }
        setAttendees(attendeesData);
      } catch (error) {
        console.error("Error fetching attendees:", error);
      }
    };
    fetchAttendees();
  }, [eventId]);

  return (
    <>
      <Navbar />
      <div className="attendeesContainer">
        <h2 style={{ textAlign: "center" }}>Attendees for the event:</h2>
        <div className="attendeesGrid">
          {attendees.map((attendee) => (
            <div key={attendee.id} className="attendeeCard">
              <div className="attendeeImage">
                <img src={attendee.photoURL} alt={attendee.displayName} />
              </div>
              <div className="attendeeInfo">
                <strong>Name:</strong> {attendee.displayName}
                <br />
                <strong>Email:</strong> {attendee.email}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default ViewAttendees;
