import React, { useEffect, useState } from "react";
import "./Gallery.css";
import Navbar from "../components/navbar/Navbar";

const carData = [
  {
    type: "European",
    name: "Audi",
    imagePath: require("../images/audi.jpg"),
    link: "https://www.audi.de/de/brand/de.html",
  },
  {
    type: "European",
    name: "BMW",
    imagePath: require("../images/bmw.jpg"),
    link: "https://www.bmw.de/de/index.html",
  },
  {
    type: "European",
    name: "Jaguar",
    imagePath: require("../images/jaguar.jpg"),
    link: "https://www.jaguar.co.uk/index.html",
  },
  {
    type: "European",
    name: "Maserati",
    imagePath: require("../images/maserati.jpg"),
    link: "https://www.maserati.com/it/it",
  },
  {
    type: "JDM",
    name: "Honda",
    imagePath: require("../images/honda.jpg"),
    link: "https://www.honda.co.jp/",
  },
  {
    type: "JDM",
    name: "Lexus",
    imagePath: require("../images/lexus.jpg"),
    link: "https://lexus.jp/",
  },
  {
    type: "JDM",
    name: "Mitsubishi",
    imagePath: require("../images/mitsubishi.jpg"),
    link: "https://www.mitsubishi-motors.co.jp/",
  },
  {
    type: "JDM",
    name: "Mazda",
    imagePath: require("../images/mazda.jpg"),
    link: "https://www.mazda.co.jp/",
  },
  {
    type: "American",
    name: "Mustang",
    imagePath: require("../images/mustang.jpg"),
    link: "https://www.ford.com/cars/mustang/",
  },
  {
    type: "American",
    name: "Dodge",
    imagePath: require("../images/dodgedemon.jpg"),
    link: "https://www.dodge.com/",
  },
  {
    type: "American",
    name: "Chevrolet",
    imagePath: require("../images/camaro.jpg"),
    link: "https://www.chevrolet.com/",
  },
  {
    type: "American",
    name: "Jeep",
    imagePath: require("../images/jeepwrangler.jpg"),
    link: "https://www.jeep.com/",
  },
];

const Gallery = () => {
  const imagePaths = {
    European: carData
      .filter((car) => car.type === "European")
      .map((car) => car.imagePath.default),
    JDM: carData
      .filter((car) => car.type === "JDM")
      .map((car) => car.imagePath.default),
    American: carData
      .filter((car) => car.type === "American")
      .map((car) => car.imagePath.default),
    all: carData.map((car) => car.imagePath.default),
  };

  const [currentColumn, setCurrentColumn] = useState("all");

  useEffect(() => {
    filterSelection(currentColumn);
  }, [currentColumn]);

  const filterSelection = (columnType) => {
    const x = document.getElementsByClassName("column");
    for (let i = 0; i < x.length; i++) {
      RemoveClass(x[i], "show");
      if (columnType === "all" || x[i].classList.contains(columnType)) {
        AddClass(x[i], "show");
      }
    }
  };

  const AddClass = (element, name) => {
    const arr1 = element.className.split(" ");
    const arr2 = name.split(" ");
    arr2.forEach((item) => {
      if (arr1.indexOf(item) === -1) {
        element.className += ` ${item}`;
      }
    });
  };

  const RemoveClass = (element, name) => {
    const arr1 = element.className.split(" ");
    const arr2 = name.split(" ");
    arr2.forEach((item) => {
      while (arr1.indexOf(item) > -1) {
        arr1.splice(arr1.indexOf(item), 1);
      }
    });
    element.className = arr1.join(" ");
  };

  const handleButtonClick = (columnType) => {
    setCurrentColumn(columnType);
    const current = document.getElementsByClassName("active");
    if (current.length > 0) {
      current[0].className = current[0].className.replace(" active", "");
    }
    document.getElementById(columnType).className += " active";
  };

  const uniqueCarTypes = Array.from(new Set(carData.map((car) => car.type)));

  return (
    <div className="container">
      <Navbar />
      <h2 style={{ textAlign: "center" }}>Welcome to news and gallery!</h2>
      <div id="myBtnContainer" className="btn-container">
        <button
          id="all"
          className={`btn ${currentColumn === "all" ? "active" : ""}`}
          onClick={() => handleButtonClick("all")}
        >
          Show all
        </button>
        {uniqueCarTypes.map((carType) => (
          <button
            key={carType}
            id={carType}
            className={`btn ${currentColumn === carType ? "active" : ""}`}
            onClick={() => handleButtonClick(carType)}
          >
            {carType}
          </button>
        ))}
      </div>

      <div className="row">
        {carData.map((car, index) => (
          <div
            key={index}
            className={`column ${car.type} ${
              currentColumn === "all" || currentColumn === car.type
                ? "show"
                : ""
            }`}
          >
            <div className="content">
              <img
                src={car.imagePath}
                alt={car.name}
                style={{
                  width: "100%",
                  height: "400px",
                  backgroundSize: "cover",
                  borderRadius: "4%",
                }}
              />
              <h4>{car.name}</h4>
              <a href={car.link}>Read the latest news about: {car.name}</a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Gallery;
