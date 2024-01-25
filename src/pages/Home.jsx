import React from 'react';
import Navbar from '../components/navbar/Navbar';
import Slideshow from '../components/slideshow/Slideshow';
import './Home.css'

const Home = () => {
  return (
    <div>
      <Navbar />
      <Slideshow />
      <div className='TextWrapper'>
        <div className="Text">
            <h2>Whats wrong with non car people ?</h2>
            <p>
              It’s what non-car people don’t get.<br/>
              They see all cars as just a ton and a half, two tons of wires, glass, metal, and rubber, and that’s all they see.<br/>
              People like you or I know we have an unshakable belief that cars are living entities… You can develop a relationship with a car and that’s what non-car people don’t get…<br/> 
              When something has foibles and won’t handle properly, that gives it a particularly human quality because it makes mistakes, and that’s how you can build a relationship with a car that other people won’t get."<br/>
              -Jeremy Clarkson-
            </p>
        </div>
        <div className="Text">
          <h2>What can you find on this page?</h2>
            <p>
              As you can see you will find a lot of stuff about cars... One thing in particular is that you will see cars as We see them...<br/>
              Who is We you might ask ? Well We call ourselver "car guys" and the quote you read earlyer is our mindset,its how we see and how we do things.<br/>
              So forget about boring classic cars and prepeare yourself to see cars like you never saw them before! If you have a car of your own that you would like to share with us make sure to register and do so!<br/>
              -Admin-    
            </p>
        </div>
    </div>
    </div>
  )
}

export default Home;