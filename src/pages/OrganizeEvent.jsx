import React, { useState } from "react";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import Navbar from "../components/navbar/Navbar";
import {
  db,
  collection,
  addDoc,
  doc,
  getDoc,
  getFirestore,
  setDoc,
} from "../firebase";
import { getAuth } from "firebase/auth";
import "./OrganizeEvent.css";
import { Link } from "react-router-dom";

const center = {
  lat: 45.55664942442688,
  lng: 18.712179284866384,
};

const OrganizeEvent = () => {
  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
  });

  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [currentCoordinates, setCurrentCoordinates] = useState(null);
  const [eventName, setEventName] = useState("");
  const [eventType, setEventType] = useState([]);
  const [eventDateTime, setEventDateTime] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [descriptionError, setDescriptionError] = useState("");

  const onMapClick = (event) => {
    if (!isLoaded || loadError) {
      return;
    }

    if (markers.length > 0) {
      setMarkers([]);
    }

    const newMarker = {
      lat: event.latLng.lat(),
      lng: event.latLng.lng(),
    };
    setMarkers([newMarker]);
    setCurrentCoordinates(newMarker);
  };

  const onMarkerClick = (clickedMarkerIndex) => {
    setMarkers((prevMarkers) =>
      prevMarkers.filter((_, index) => index !== clickedMarkerIndex)
    );
    setCurrentCoordinates(null);
  };

  const setMarkerByCoordinates = (coordinates) => {
    setMarkers([coordinates]);
    setCurrentCoordinates(coordinates);
  };

  const onLoad = (map) => {
    const bounds = new window.google.maps.LatLngBounds(center);
    map.fitBounds(bounds);
    setMap(map);
  };

  const onUnmount = () => {
    setMap(null);
  };

  const validateDescription = () => {
    if (!eventDescription.trim()) {
      setDescriptionError("Description is required");
      return false;
    }
    setDescriptionError("");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !eventName ||
      eventType.length === 0 ||
      !eventDateTime ||
      !currentCoordinates ||
      !validateDescription()
    ) {
      alert(
        "Please fill in all required fields, including current coordinates and description."
      );
      return;
    }

    try {
      const user = getAuth().currentUser;

      if (user) {
        const eventRef = await addDoc(collection(db, "events"), {
          eventName,
          eventType,
          eventDateTime,
          eventDescription,
          coordinates: currentCoordinates,
          authorId: user.uid,
        });

        const eventDoc = await getDoc(eventRef);

        if (eventDoc.exists()) {
          // Successfully added to Firestore
          console.log("Event added to Firestore:", eventDoc.data());
          setSubmissionSuccess(true);
        } else {
          console.error("Error adding event to Firestore.");
        }
      } else {
        console.error("No user is currently logged in.");
      }
    } catch (error) {
      console.error("Error submitting event:", error);
    }

    setEventName("");
    setEventType([]);
    setEventDateTime("");
    setEventDescription("");
    setMarkers([]);
    setCurrentCoordinates(null);
  };

  return (
    <>
      <Navbar />
      {!submissionSuccess ? (
        <div className="organize-event-container">
          <div className="form-container">
            <h2 className="form-heading">Event Form</h2>
            <form onSubmit={handleSubmit}>
              <label className="form-label">
                <span className="required-asterisk">* </span>
                Event Name:
                <input
                  type="text"
                  placeholder="Enter event name"
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  className="form-input"
                  required
                />
              </label>
              <label className="form-label">
                <span className="required-asterisk">* </span>
                Type of Event:
                <br />
                <div className="checkbox-container">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      value="Race"
                      checked={eventType.includes("Race")}
                      onChange={() =>
                        setEventType((prevType) =>
                          prevType.includes("Race")
                            ? prevType.filter((type) => type !== "Race")
                            : [...prevType, "Race"]
                        )
                      }
                    />
                    Race
                  </label>
                  <br />
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      value="Style"
                      checked={eventType.includes("Style")}
                      onChange={() =>
                        setEventType((prevType) =>
                          prevType.includes("Style")
                            ? prevType.filter((type) => type !== "Style")
                            : [...prevType, "Style"]
                        )
                      }
                    />
                    Style
                  </label>
                  <br />
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      value="Test"
                      checked={eventType.includes("Test")}
                      onChange={() =>
                        setEventType((prevType) =>
                          prevType.includes("Test")
                            ? prevType.filter((type) => type !== "Test")
                            : [...prevType, "Test"]
                        )
                      }
                    />
                    Test
                  </label>
                </div>
              </label>
              <label className="form-label">
                <span className="required-asterisk">* </span>
                Date and Time:
                <input
                  type="datetime-local"
                  value={eventDateTime}
                  onChange={(e) => setEventDateTime(e.target.value)}
                  className="form-input"
                  required
                />
              </label>
              <label className="form-label">
                <span className="required-asterisk">* </span>
                Description:
                <textarea
                  rows="4"
                  placeholder="Enter event description"
                  value={eventDescription}
                  onChange={(e) => setEventDescription(e.target.value)}
                  className="form-input"
                  required
                />
                <p className="form-error">{descriptionError}</p>
              </label>
              <button
                type="submit"
                className="form-button"
                onMouseOver={(e) =>
                  (e.target.style.backgroundColor = "#007bff")
                }
                onMouseOut={(e) => (e.target.style.backgroundColor = "#172554")}
              >
                Submit Event
              </button>
            </form>

            {currentCoordinates && (
              <div className="coordinates-container">
                <h3 className="coordinates-heading">Current Coordinates:</h3>
                <p>Latitude: {currentCoordinates.lat}</p>
                <p>Longitude: {currentCoordinates.lng}</p>
              </div>
            )}
          </div>

          <div className="map-container">
            {isLoaded ? (
              <GoogleMap
                mapContainerStyle={{
                  flex: "1",
                  height: "80vh",
                }}
                center={center}
                zoom={17}
                onClick={onMapClick}
                onLoad={onLoad}
                onUnmount={onUnmount}
              >
                {markers.map((marker, index) => (
                  <Marker
                    key={index}
                    position={{ lat: marker.lat, lng: marker.lng }}
                    onClick={() => onMarkerClick(index)}
                  />
                ))}
              </GoogleMap>
            ) : (
              <div>Loading...</div>
            )}
          </div>
        </div>
      ) : (
        <div className="submission-success-container">
          <div className="submission-success-message">
            <h2>Event Submitted Successfully!</h2>
            <p>Your event has been successfully submitted. Thank you!</p>
            <Link to="/view-events" className="view-events-link">
              View events
            </Link>
          </div>
        </div>
      )}
    </>
  );
};

export default OrganizeEvent;