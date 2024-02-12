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
    type: "Asian",
    name: "Honda",
    imagePath: require("../images/honda.jpg"),
    link: "https://automobiles.honda.com/",
  },
  {
    type: "Asian",
    name: "Lexus",
    imagePath: require("../images/lexus.jpg"),
    link: "https://lexus.jp/",
  },
  {
    type: "Asian",
    name: "Mitsubishi",
    imagePath: require("../images/mitsubishi.jpg"),
    link: "https://www.mitsubishi-motors.co.jp/",
  },
  {
    type: "Asian",
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
  {
    type: "European",
    name: "Porsche",
    imagePath: require("../images/porscheGallery.png"),
    link: "https://www.porsche.com/germany/",
  },
  {
    type: "European",
    name: "Lamborghini",
    imagePath: require("../images/lamborghiniaventador.jpg"),
    link: "https://www.lamborghini.com/en-en",
  },
  {
    type: "Asian",
    name: "Subaru",
    imagePath: require("../images/subaruGallery.jpg"),
    link: "https://www.subaru.com/index.html",
  },
  {
    type: "Asian",
    name: "Hyundai",
    imagePath: require("../images/hyundaiGallery.jpg"),
    link: "https://www.hyundai.com/eu.html",
  },
  {
    type: "Asian",
    name: "Nissan",
    imagePath: require("../images/nissan350z.jpg"),
    link: "https://www.nissan.co.uk/",
  },
  {
    type: "European",
    name: "Alfa Romeo",
    imagePath: require("../images/alfaromeoGallery.jpg"),
    link: "https://www.alfaromeo.com/",
  },
  {
    type: "European",
    name: "Bugatti",
    imagePath: require("../images/bugattiGallery.png"),
    link: "https://bugatti.com/",
  },
  {
    type: "American",
    name: "Aston Martin",
    imagePath: require("../images/astonmartinGallery.jpg"),
    link: "https://www.astonmartin.com/en/",
  },
  {
    type: "European",
    name: "Mercedes-Benz",
    imagePath: require("../images/mercedesBeznGallery.jpg"),
    link: "https://www.mercedes-benz.com/en/",
  },
  {
    type: "European",
    name: "Volkswagen",
    imagePath: require("../images/volkswagenGallery.jpg"),
    link: "https://www.volkswagen.de/de.html",
  },
  {
    type: "European",
    name: "Volvo",
    imagePath: require("../images/volvoGallery.jpg"),
    link: "https://www.volvo.com/en/",
  },
  {
    type: "European",
    name: "McLaren",
    imagePath: require("../images/mclarenGallery.jpg"),
    link: "https://www.mclaren.com/",
  },
  {
    type: "European",
    name: "Peugeot",
    imagePath: require("../images/peugeotGallery.jpg"),
    link: "https://www.peugeot.com/en/",
  },
  {
    type: "European",
    name: "Opel",
    imagePath: require("../images/opelGallery.jpg"),
    link: "https://www.vauxhall.co.uk/",
  },
  {
    type: "American",
    name: "Tesla",
    imagePath: require("../images/teslaGallery.jpg"),
    link: "https://www.tesla.com/",
  },
  {
    type: "Asian",
    name: "Kia",
    imagePath: require("../images/kiaGallery.jpg"),
    link: "https://worldwide.kia.com/int",
  },
];

const Gallery = () => {
  const imagePaths = {
    European: carData
      .filter((car) => car.type === "European")
      .map((car) => car.imagePath.default),
    Asian: carData
      .filter((car) => car.type === "Asian")
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
              <a href={car.link} target="_blank" rel="noopener noreferrer" className="galleryHref">
                Read the latest news about: {car.name}
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Gallery;
