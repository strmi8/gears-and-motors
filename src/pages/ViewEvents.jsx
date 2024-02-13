import React, { useState, useEffect } from "react";
import {
  GoogleMap,
  Marker,
  InfoWindow,
  useJsApiLoader,
} from "@react-google-maps/api";
import Navbar from "../components/navbar/Navbar";
import { collection, getDocs, db, doc, setDoc, getDoc } from "../firebase";
import LocationPinBlueSVG from "../images/location_pin_blue.svg";
import LocationPinRedSVG from "../images/location_pin_red.svg";
import { getAuth } from "firebase/auth";

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
          const eventDateTime = new Date(eventData.eventDateTime); // Convert to Date

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

        // Wait for all user promises to resolve before updating state
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
            // If already attending, remove the event ID
            updatedEvents = updatedEvents.filter(
              (eventId) => eventId !== event.id
            );

            // Update the user's attending events in the database
            await setDoc(attendingRef, { events: updatedEvents });

            // Update the state to reflect the user's attending events
            setAttendingEvents((prevAttendingEvents) =>
              prevAttendingEvents.filter(
                (attendingEvent) => attendingEvent.id !== event.id
              )
            );
          } else {
            // If not attending, add the event ID
            updatedEvents.push(event.id);

            // Update the user's attending events in the database
            await setDoc(attendingRef, { events: updatedEvents });

            // Update the state to reflect the user's attending events
            setAttendingEvents((prevAttendingEvents) => [
              ...prevAttendingEvents,
              event,
            ]);
          }
        } else {
          // If the user document doesn't exist, create a new one with the event
          await setDoc(attendingRef, { events: [event.id] });

          // Update the state to reflect the user's attending events
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
                {attendingEvents.length > 0 ? (
                  attendingEvents.map((event) => (
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
                      <button
                        onClick={() => onAttendButtonClick(event)}
                        className="remove-attendee-btn"
                        style={{
                          padding: "8px 16px",
                          backgroundColor: "#dc3545", // Bootstrap's danger color
                          color: "#fff",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                          transition: "background-color ease",
                        }}
                      >
                        I won't attend
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
                    {getAuth().currentUser && (
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
