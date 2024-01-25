import React, { useState, useEffect } from 'react';
import './Slideshow.css';
import image1 from '../../images/rimac-nevera.jpg';
import image2 from '../../images/nissan-silvia-s14.jpg';
import image3 from '../../images/lamborghiniaventador.jpg';
import image4 from '../../images/jeepwrangler.jpg';


const Slideshow = () => {

  const [currentSlide, setCurrentSlide] = useState(0);
  const images = [image1, image2, image3, image4];


  const nextSlide = () => {
    setCurrentSlide((prevSlide) => (prevSlide + 1) % images.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prevSlide) => (prevSlide - 1 + images.length) % images.length);
  };

  useEffect(() => {
    const intervalId = setInterval(nextSlide, 3000);

    return () => clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [images]);

  return (
    <div>
      <div className="slideshow-container">
        {images.map((image, index) => (
          <div
            key={index}
            className={`slide ${index === currentSlide ? 'active' : ''}`}
          >
            <img src={image} alt={`Slide ${index + 1}`} />
          </div>
        ))}
        <button className="prev" onClick={prevSlide}>&#10094;</button>
        <button className="next" onClick={nextSlide}>&#10095;</button>
      </div>
    </div>
  );
};

export default Slideshow;