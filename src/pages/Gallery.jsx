import React, { useEffect, useState } from "react";
import "./Gallery.css";
import Navbar from "../components/navbar/Navbar";

const carData = [
  {
    type: "European",
    name: "Audi",
    imagePath: require("../images/audi.jpg"),
    link: "https://www.audi.de/de/brand/de.html",
    visualisation: "Paint job",
  },
  {
    type: "European",
    name: "BMW",
    imagePath: require("../images/bmw.jpg"),
    link: "https://www.bmw.de/de/index.html",
    visualisation: "Cockpit",
  },
  {
    type: "European",
    name: "Jaguar",
    imagePath: require("../images/jaguar.jpg"),
    link: "https://www.jaguar.co.uk/index.html",
    visualisation: "Cockpit",
  },
  {
    type: "European",
    name: "Maserati",
    imagePath: require("../images/maserati.jpg"),
    link: "https://www.maserati.com/it/it",
    visualisation: "Paint job",
  },
  {
    type: "Asian",
    name: "Honda",
    imagePath: require("../images/honda.jpg"),
    link: "https://automobiles.honda.com/",
    visualisation: "Paint job",
  },
  {
    type: "Asian",
    name: "Lexus",
    imagePath: require("../images/lexus.jpg"),
    link: "https://lexus.jp/",
    visualisation: "Engine bay",
  },
  {
    type: "Asian",
    name: "Mitsubishi",
    imagePath: require("../images/mitsubishi.jpg"),
    link: "https://www.mitsubishi-motors.co.jp/",
    visualisation: "Paint job",
  },
  {
    type: "Asian",
    name: "Mazda",
    imagePath: require("../images/mazda.jpg"),
    link: "https://www.mazda.co.jp/",
    visualisation: "Paint job",
  },
  {
    type: "American",
    name: "Mustang",
    imagePath: require("../images/mustang.jpg"),
    link: "https://www.ford.com/cars/mustang/",
    visualisation: "Cockpit",
  },
  {
    type: "American",
    name: "Dodge",
    imagePath: require("../images/dodgedemon.jpg"),
    link: "https://www.dodge.com/",
    visualisation: "Paint job",
  },
  {
    type: "American",
    name: "Chevrolet",
    imagePath: require("../images/camaro.jpg"),
    link: "https://www.chevrolet.com/",
    visualisation: "Engine bay",
  },
  {
    type: "American",
    name: "Jeep",
    imagePath: require("../images/jeepwrangler.jpg"),
    link: "https://www.jeep.com/",
    visualisation: "Paint job",
  },
  {
    type: "European",
    name: "Porsche",
    imagePath: require("../images/porscheGallery.png"),
    link: "https://www.porsche.com/germany/",
    visualisation: "Paint job",
  },
  {
    type: "European",
    name: "Lamborghini",
    imagePath: require("../images/lamborghiniaventador.jpg"),
    link: "https://www.lamborghini.com/en-en",
    visualisation: "Engine bay",
  },
  {
    type: "Asian",
    name: "Subaru",
    imagePath: require("../images/subaruGallery.jpg"),
    link: "https://www.subaru.com/index.html",
    visualisation: "Paint job",
  },
  {
    type: "Asian",
    name: "Hyundai",
    imagePath: require("../images/hyundaiGallery.jpg"),
    link: "https://www.hyundai.com/eu.html",
    visualisation: "Paint job",
  },
  {
    type: "Asian",
    name: "Nissan",
    imagePath: require("../images/nissan350z.jpg"),
    link: "https://www.nissan.co.uk/",
    visualisation: "Cockpit",
  },
  {
    type: "European",
    name: "Alfa Romeo",
    imagePath: require("../images/alfaromeoGallery.jpg"),
    link: "https://www.alfaromeo.com/",
    visualisation: "Paint job",
  },
  {
    type: "European",
    name: "Bugatti",
    imagePath: require("../images/bugattiGallery.png"),
    link: "https://bugatti.com/",
    visualisation: "Paint job",
  },
  {
    type: "American",
    name: "Aston Martin",
    imagePath: require("../images/astonmartinGallery.jpg"),
    link: "https://www.astonmartin.com/en/",
    visualisation: "Paint job",
  },
  {
    type: "European",
    name: "Mercedes-Benz",
    imagePath: require("../images/mercedesBeznGallery.jpg"),
    link: "https://www.mercedes-benz.com/en/",
    visualisation: "Engine bay",
  },
  {
    type: "European",
    name: "Volkswagen",
    imagePath: require("../images/volkswagenGallery.jpg"),
    link: "https://www.volkswagen.de/de.html",
    visualisation: "Paint job",
  },
  {
    type: "European",
    name: "Volvo",
    imagePath: require("../images/volvoGallery.jpg"),
    link: "https://www.volvo.com/en/",
    visualisation: "Paint job",
  },
  {
    type: "European",
    name: "McLaren",
    imagePath: require("../images/mclarenGallery.jpg"),
    link: "https://www.mclaren.com/",
    visualisation: "Paint job",
  },
  {
    type: "European",
    name: "Peugeot",
    imagePath: require("../images/peugeotGallery.jpg"),
    link: "https://www.peugeot.com/en/",
    visualisation: "Paint job",
  },
  {
    type: "European",
    name: "Opel",
    imagePath: require("../images/opelGallery.jpg"),
    link: "https://www.vauxhall.co.uk/",
    visualisation: "Paint job",
  },
  {
    type: "American",
    name: "Tesla",
    imagePath: require("../images/teslaGallery.jpg"),
    link: "https://www.tesla.com/",
    visualisation: "Paint job",
  },
  {
    type: "Asian",
    name: "Kia",
    imagePath: require("../images/kiaGallery.jpg"),
    link: "https://worldwide.kia.com/int",
    visualisation: "Paint job",
  },
];

const Gallery = () => {
  const [currentColumn, setCurrentColumn] = useState("all");
  const [currentColumnVisualisation, setCurrentColumnVisualisation] =
    useState("all");

  useEffect(() => {
    filterSelection(currentColumn, currentColumnVisualisation);
  }, [currentColumn, currentColumnVisualisation]);

  const filterSelection = (columnType, visualisation) => {
    const x = document.getElementsByClassName("column");
    for (let i = 0; i < x.length; i++) {
      RemoveClass(x[i], "show");
      const car = carData[i];
      if (
        (columnType === "all" || car.type === columnType) &&
        (visualisation === "all" || car.visualisation === visualisation)
      ) {
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

  const handleButtonClickType = (columnType) => {
    setCurrentColumn(columnType);
    setCurrentColumnVisualisation("all"); // Reset visualisation filter
  };

  const handleButtonClickVisualisation = (visualisation) => {
    setCurrentColumnVisualisation(visualisation);
    setCurrentColumn("all"); // Reset type filter
  };

  const uniqueCarTypes = Array.from(new Set(carData.map((car) => car.type)));
  const uniqueCarVisualisation = Array.from(
    new Set(carData.map((car) => car.visualisation))
  );

  return (
    <div className="container">
      <Navbar />
      <h2 style={{ textAlign: "center" }}>Welcome to news and gallery!</h2>
      <div id="myBtnContainer" className="btn-container">
        <button
          className={`btn ${currentColumn === "all" ? "active" : ""}`}
          onClick={() => {
            handleButtonClickType("all");
            handleButtonClickVisualisation("all");
          }}
        >
          Show all
        </button>
        {uniqueCarTypes.map((carType) => (
          <button
            key={carType}
            className={`btn ${currentColumn === carType ? "active" : ""}`}
            onClick={() => handleButtonClickType(carType)}
          >
            {carType}
          </button>
        ))}
        {uniqueCarVisualisation.map((carVisualisation) => (
          <button
            key={carVisualisation}
            className={`btn ${
              currentColumnVisualisation === carVisualisation ? "active" : ""
            }`}
            onClick={() => handleButtonClickVisualisation(carVisualisation)}
          >
            {carVisualisation}
          </button>
        ))}
      </div>

      <div className="row">
        {carData.map((car, index) => (
          <div
            key={index}
            className={`column ${car.type} ${
              (currentColumn === "all" || currentColumn === car.type) &&
              (currentColumnVisualisation === "all" ||
                currentColumnVisualisation === car.visualisation)
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
              <a
                href={car.link}
                target="_blank"
                rel="noopener noreferrer"
                className="galleryHref"
              >
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
