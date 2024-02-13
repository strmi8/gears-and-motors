import React, { useState, useEffect } from "react";
import {
  GoogleMap,
  Marker,
  InfoWindow,
  useJsApiLoader,
} from "@react-google-maps/api";
import Navbar from "../components/navbar/Navbar";
import { collection, getDocs, db, doc, getDoc } from "../firebase";

const containerStyle = {
  flex: "1",
  height: "80vh",
  border: "2px solid #ddd",
  borderRadius: "8px",
  marginRight: "20px",
};

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

  return (
    <>
      <Navbar />
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "91vh",
          margin: "0 20px",
        }}
      >
        <div
          style={{
            flex: "1",
            padding: "20px",
            backgroundColor: "#f0f0f0",
            borderRadius: "8px",
          }}
        >
          {isLoaded ? (
            <GoogleMap
              mapContainerStyle={containerStyle}
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
                  <div style={{ padding: "10px" }}>
                    <h3>{selectedEvent.eventName}</h3>
                    <p>Author: {selectedEvent.authorDisplayName}</p>
                    <p>Date and Time: {selectedEvent.formattedDateTime}</p>
                    <p>Type of Event: {selectedEvent.eventType.join(", ")}</p>
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
