import React, { useState, useEffect } from "react";
import {
  GoogleMap,
  Marker,
  InfoWindow,
  useJsApiLoader,
} from "@react-google-maps/api";
import Navbar from "../components/navbar/Navbar";
import {
  collection,
  getDocs,
  db,
  doc,
  setDoc,
  getDoc,
  query,
  where,
  deleteDoc,
} from "../firebase";
import LocationPinBlueSVG from "../images/location_pin_blue.svg";
import LocationPinRedSVG from "../images/location_pin_red.svg";
import LocationPinGreenSVG from "../images/location_pin_green.svg";
import { getAuth } from "firebase/auth";
import { useNavigate } from "react-router-dom"; // Import useNavigate

const center = {
  lat: 45.55664942442688,
  lng: 18.712179284866384,
};

const ViewEvents = () => {
  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
  });

  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [attendingEvents, setAttendingEvents] = useState([]);
  const [userEvents, setUserEvents] = useState([]);
  const navigate = useNavigate(); // Initialize useNavigate

  useEffect(() => {
    // Function to fetch events for the current user
    const fetchUserEvents = async () => {
      try {
        const user = getAuth().currentUser;

        if (user) {
          // Query events collection to get events authored by the current user
          const q = query(
            collection(db, "events"),
            where("authorId", "==", user.uid)
          );
          const querySnapshot = await getDocs(q);

          const userEventsData = [];
          querySnapshot.forEach((doc) => {
            const eventData = doc.data();
            const eventDateTime = new Date(eventData.eventDateTime);

            userEventsData.push({
              id: doc.id,
              ...eventData,
              formattedDateTime: eventDateTime.toLocaleDateString("en-US", {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "numeric",
                minute: "numeric",
              }),
            });
          });

          setUserEvents(userEventsData);
          console.log("Events for the current user:", userEventsData);
        }
      } catch (error) {
        console.error("Error fetching events for the current user:", error);
      }
    };

    fetchUserEvents();
  }, []);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const eventsCollection = collection(db, "events");
        const eventsSnapshot = await getDocs(eventsCollection);
        const currentDate = new Date();
        const validEvents = [];
        const userPromises = [];
        eventsSnapshot.forEach((doc) => {
          const eventData = doc.data();
          const eventDateTime = new Date(eventData.eventDateTime);
          if (eventDateTime > currentDate) {
            const userPromise = getUserDisplayName(eventData.authorId).then(
              (displayName) => {
                validEvents.push({
                  id: doc.id,
                  ...eventData,
                  authorDisplayName: displayName,
                  formattedDateTime: eventDateTime.toLocaleDateString("en-US", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "numeric",
                    minute: "numeric",
                  }),
                });
              }
            );
            userPromises.push(userPromise);
          }
        });
        await Promise.all(userPromises);
        setMarkers(validEvents);
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };

    fetchEvents();
  }, []);

  useEffect(() => {
    const fetchAttendingEvents = async () => {
      try {
        const user = getAuth().currentUser;

        if (user) {
          const attendingRef = doc(db, "attending", user.uid);
          const attendingDoc = await getDoc(attendingRef);

          if (attendingDoc.exists()) {
            // If the user is attending events, fetch the details of those events
            const attendingEventsData = [];
            const userPromises = [];

            for (const eventId of attendingDoc.data().events) {
              const eventDocRef = doc(db, "events", eventId);
              const eventDoc = await getDoc(eventDocRef);

              if (eventDoc.exists()) {
                const eventData = eventDoc.data();
                const eventDateTime = new Date(eventData.eventDateTime);

                const userPromise = getUserDisplayName(eventData.authorId).then(
                  (displayName) => {
                    attendingEventsData.push({
                      id: eventDoc.id,
                      ...eventData,
                      authorDisplayName: displayName,
                      formattedDateTime: eventDateTime.toLocaleDateString(
                        "en-US",
                        {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "numeric",
                          minute: "numeric",
                        }
                      ),
                    });
                  }
                );

                userPromises.push(userPromise);
              }
            }

            // Wait for all user promises to resolve before updating state
            await Promise.all(userPromises);

            setAttendingEvents(attendingEventsData);
          }
        } else {
          console.error("No user is currently logged in.");
        }
      } catch (error) {
        console.error("Error fetching attending events:", error);
      }
    };

    fetchAttendingEvents();
  }, []);

  const handleAttendEvent = async (event) => {
    try {
      const user = getAuth().currentUser;
      if (user) {
        const attendingRef = doc(db, "attending", user.uid);
        const attendingDoc = await getDoc(attendingRef);
        if (attendingDoc.exists()) {
          let updatedEvents = attendingDoc.data().events;
          const isAttending = updatedEvents.includes(event.id);
          if (isAttending) {
            updatedEvents = updatedEvents.filter(
              (eventId) => eventId !== event.id
            );
            await setDoc(attendingRef, { events: updatedEvents });
            setAttendingEvents((prevAttendingEvents) =>
              prevAttendingEvents.filter(
                (attendingEvent) => attendingEvent.id !== event.id
              )
            );
          } else {
            updatedEvents.push(event.id);
            await setDoc(attendingRef, { events: updatedEvents });
            setAttendingEvents((prevAttendingEvents) => [
              ...prevAttendingEvents,
              event,
            ]);
          }
        } else {
          await setDoc(attendingRef, { events: [event.id] });
          setAttendingEvents((prevAttendingEvents) => [
            ...prevAttendingEvents,
            event,
          ]);
        }
      } else {
        console.error("No user is currently logged in.");
      }
    } catch (error) {
      console.error("Error handling attendance:", error);
    }
  };

  const onMapClick = () => {
    setSelectedEvent(null);
  };

  const onMarkerClick = (event) => {
    setSelectedEvent(event);
  };

  const onLoad = (map) => {
    setMap(map);
  };

  const onUnmount = () => {
    setMap(null);
  };

  const getUserDisplayName = async (userId) => {
    try {
      const userDocRef = doc(db, "users", userId);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        return userDoc.data().displayName;
      } else {
        console.error(`User with ID ${userId} not found.`);
        return "Unknown Author";
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      return "Unknown Author";
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return ""; // Handle the case where timestamp is not available
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

  const allInteractedEvents = attendingEvents.concat(userEvents);

  const onAttendButtonClick = (event) => {
    const isAttending = attendingEvents.some(
      (attendingEvent) => attendingEvent.id === event.id
    );

    if (isAttending) {
      // If already attending, remove from the attending list
      handleAttendEvent(event);
    } else {
      // If not attending, add to the attending list
      handleAttendEvent(event);
    }
  };

  const onCancelEventButtonClick = async (selectedEvent) => {
    try {
      const user = getAuth().currentUser;

      if (user) {
        // Check if the current user is the author of the event
        if (selectedEvent.authorId === user.uid) {
          // Delete the event document
          await deleteDoc(doc(db, "events", selectedEvent.id));

          // Delete the event ID from the attending list of all users
          const attendingSnapshot = await getDocs(collection(db, "attending"));
          attendingSnapshot.forEach(async (doc) => {
            if (doc.data().events.includes(selectedEvent.id)) {
              const updatedEvents = doc
                .data()
                .events.filter((eventId) => eventId !== selectedEvent.id);
              await setDoc(doc.ref, { events: updatedEvents });
            }
          });

          // Remove the event from the markers state
          setMarkers((prevMarkers) =>
            prevMarkers.filter((marker) => marker.id !== selectedEvent.id)
          );

          // Remove the event from the userEvents state
          setUserEvents((prevUserEvents) =>
            prevUserEvents.filter(
              (userEvent) => userEvent.id !== selectedEvent.id
            )
          );

          // Remove the event from the attendingEvents state
          setAttendingEvents((prevAttendingEvents) =>
            prevAttendingEvents.filter(
              (attendingEvent) => attendingEvent.id !== selectedEvent.id
            )
          );

          console.log("Event canceled successfully.");
        } else {
          console.error("User is not authorized to cancel this event.");
        }
      } else {
        console.error("No user is currently logged in.");
      }
    } catch (error) {
      console.error("Error canceling event:", error);
    }
  };

  const onViewAttendeesButtonClick = (eventId) => {
    // Navigate to the View Attendees page with the event ID passed as a parameter
    navigate(`/View-attendees`, { state: { eventId } });
  };
  
  return (
    <>
      <Navbar />
      <div className="organize-event-container">
        <div
          className="form-container"
          style={{
            height: "85vh",
            overflow: "hidden",
            marginBottom: 0,
          }}
        >
          <div
            className="attending-events-container"
            style={{
              maxHeight: "100%",
              overflowY: "auto",
            }}
          >
            {getAuth().currentUser ? (
              <div>
                <h2>Attending Events</h2>
                {allInteractedEvents.length > 0 ? (
                  allInteractedEvents.map((event) => (
                    <div
                      key={`attending-${event.id}`}
                      className="attending-event-container"
                      style={{
                        border: "2px solid #ddd",
                        borderRadius: "8px",
                        marginBottom: "16px",
                        padding: "16px",
                      }}
                    >
                      <h3>{event.eventName}</h3>
                      <p>
                        <strong>Author:</strong> {event.authorDisplayName}
                      </p>
                      <p>
                        <strong>Date and Time:</strong>{" "}
                        {formatDate(event.eventDateTime)}
                      </p>
                      <p>
                        <strong>Type of Event:</strong>{" "}
                        {event.eventType.join(", ")}
                      </p>
                      {!userEvents.some(
                        (userEvent) => userEvent.id === event.id
                      ) && ( // Only render the buttons if the event is not authored by the user
                        <button
                          onClick={() => onAttendButtonClick(event)}
                          className="remove-attendee-btn"
                          style={{
                            padding: "8px 16px",
                            backgroundColor: attendingEvents.some(
                              (attendingEvent) => attendingEvent.id === event.id
                            )
                              ? "#dc3545"
                              : "#007bff",
                            color: "#fff",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                            transition: "background-color ease",
                          }}
                        >
                          {attendingEvents.some(
                            (attendingEvent) => attendingEvent.id === event.id
                          )
                            ? "I won't attend"
                            : "Attend"}
                        </button>
                      )}
                      <button
                        onClick={() => onViewAttendeesButtonClick(event.id)} // Pass event ID as a parameter
                        className="view-attendees-btn"
                        style={{
                          padding: "8px 16px",
                          backgroundColor: "#007bff",
                          color: "#fff",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                          transition: "background-color ease",
                          marginLeft: "10px",
                        }}
                      >
                        View Attendees
                      </button>
                    </div>
                  ))
                ) : (
                  <p>You are not currently attending any events.</p>
                )}
              </div>
            ) : (
              <p className="login-message">
                Please login to see the events you're attending.
              </p>
            )}
          </div>
        </div>
        <div className="map-container">
          {isLoaded ? (
            <GoogleMap
              mapContainerStyle={{
                flex: "1",
                height: "80vh",
              }}
              center={center}
              zoom={12}
              onClick={onMapClick}
              onLoad={onLoad}
              onUnmount={onUnmount}
            >
              {markers.map((marker) => (
                <Marker
                  key={marker.id}
                  position={{
                    lat: parseFloat(marker.coordinates.lat),
                    lng: parseFloat(marker.coordinates.lng),
                  }}
                  onClick={() => onMarkerClick(marker)}
                  icon={
                    attendingEvents.some((attendingEvent) => {
                      return attendingEvent.id === marker.id;
                    })
                      ? {
                          url: LocationPinBlueSVG,
                          scaledSize: new window.google.maps.Size(40, 40),
                        }
                      : userEvents.some(
                          (userEvent) => userEvent.id === marker.id
                        ) // Check if the event is authored by the current user
                      ? {
                          url: LocationPinGreenSVG, // Use the green pin for the user's events
                          scaledSize: new window.google.maps.Size(40, 40),
                        }
                      : {
                          url: LocationPinRedSVG,
                          scaledSize: new window.google.maps.Size(40, 40),
                        }
                  }
                />
              ))}

              {selectedEvent && (
                <InfoWindow
                  position={{
                    lat: parseFloat(selectedEvent.coordinates.lat),
                    lng: parseFloat(selectedEvent.coordinates.lng),
                  }}
                  onCloseClick={() => setSelectedEvent(null)}
                >
                  <div style={{ padding: "10px", maxWidth: "300px" }}>
                    <h3 style={{ marginBottom: "8px" }}>
                      {selectedEvent.eventName}
                    </h3>
                    <p style={{ marginBottom: "4px" }}>
                      <strong>Author:</strong> {selectedEvent.authorDisplayName}
                    </p>
                    <p style={{ marginBottom: "4px" }}>
                      <strong>Date and Time:</strong>{" "}
                      {selectedEvent.formattedDateTime}
                    </p>
                    <p style={{ marginBottom: "8px" }}>
                      <strong>Type of Event:</strong>{" "}
                      {selectedEvent.eventType.join(", ")}
                    </p>
                    {userEvents.some(
                      (userEvent) => userEvent.id === selectedEvent.id
                    ) && (
                      <button
                        onClick={() => onCancelEventButtonClick(selectedEvent)}
                        className="cancel-event-btn"
                        style={{
                          padding: "8px 16px",
                          backgroundColor: "#dc3545",
                          color: "#fff",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                          transition: "background-color ease",
                        }}
                      >
                        Cancel Event
                      </button>
                    )}
                    {!userEvents.some(
                      (userEvent) => userEvent.id === selectedEvent.id
                    ) && ( // Only render the button if the event is not authored by the user
                      <button
                        onClick={() => onAttendButtonClick(selectedEvent)}
                        style={{
                          padding: "8px 16px",
                          backgroundColor: attendingEvents.some(
                            (attendingEvent) =>
                              attendingEvent.id === selectedEvent.id
                          )
                            ? "#28a745"
                            : "#007bff",
                          color: "#fff",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                          transition: "background-color ease",
                        }}
                      >
                        {attendingEvents.some(
                          (attendingEvent) =>
                            attendingEvent.id === selectedEvent.id
                        )
                          ? "Attending"
                          : "Attend"}
                      </button>
                    )}
                    <button
                      onClick={() =>
                        onViewAttendeesButtonClick(selectedEvent.id)
                      } // Pass event ID as a parameter
                      className="view-attendees-btn"
                      style={{
                        padding: "8px 16px",
                        backgroundColor: "#007bff",
                        color: "#fff",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        transition: "background-color ease",
                        marginTop: "10px",
                      }}
                    >
                      View Attendees
                    </button>
                    {!getAuth().currentUser && (
                      <p style={{ marginTop: "8px" }}>
                        <em>Login to attend events.</em>
                      </p>
                    )}
                  </div>
                </InfoWindow>
              )}
            </GoogleMap>
          ) : (
            <div>Loading...</div>
          )}
        </div>
      </div>
    </>
  );
};

export default ViewEvents;
