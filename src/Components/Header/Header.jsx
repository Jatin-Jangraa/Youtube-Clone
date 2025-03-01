import React from 'react'
import './Header.css'
import { FaHome } from "react-icons/fa";
import { IoLogoGameControllerB } from "react-icons/io";
import { SiRimacautomobili } from "react-icons/si";
import { MdSportsCricket } from "react-icons/md";
import { IoIosMusicalNotes } from "react-icons/io";
import { MdOutlinePets } from "react-icons/md";




const Header = ({category,setCategory}) => {
  


  return (
    console.log(category),
  
    <div className='side'>
        <div className="ele">
            <div className="logobox">
            <div className={`home box ${category===0? "active":""}`} onClick={()=> setCategory(0)}>
            < FaHome/>
            </div>
            Home
            </div>

            <div className="logobox">
            <div className={`game box ${category===20? "active":""}`} onClick={()=>setCategory(20)}>
            <IoLogoGameControllerB/> 
            </div>
            Games
            </div>

            <div className="logobox">
            <div className={`auto box ${category===2? "active":""}`} onClick={()=>setCategory(2)}>
                <SiRimacautomobili/>
            </div>
              Cars
            </div>

            <div className="logobox">
              <div className={`sports box ${category===17? "active":""}`} onClick={()=>setCategory(17)}>
                <MdSportsCricket/>
            </div>
            Sports
            </div>

            <div className="logobox">
            <div className={`auto box ${category===10? "active":""}`} onClick={()=>setCategory(10)}>
            <IoIosMusicalNotes/>
            </div>
            Music
            </div>

           <div className="logobox">
           <div className={`auto box ${category===15? "active":""}`} onClick={()=>setCategory(15)}>
                <MdOutlinePets/>
            </div>
              Pets
           </div>

            
        </div>
    </div>
  )
  
}

export default Header