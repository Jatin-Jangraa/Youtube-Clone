import React, { useState } from "react";
import "./Navbar.css";
import { TiThMenu } from "react-icons/ti";
import { IoSearch } from "react-icons/io5";
import { assets } from "../../assets/Img/Assets";
import { FaMicrophone } from "react-icons/fa";
import { IoIosAdd } from "react-icons/io";
import { FaRegBell } from "react-icons/fa6";
import { FaRegCircleUser } from "react-icons/fa6";
import { Link } from "react-router-dom";



const Navbar = ({setinput,fetchData}) => {






  return (
    <div className="flex-div">
      <div className="left">

        <div  className="nav-left" >
          <TiThMenu />
        </div>
        
        <Link to="/"  className="img">
          <img className=" img-you" src={assets.You} alt="" />

        </Link>

      </div>

      <div className="middle">
        <input type="text" placeholder="Search" onChange={(e)=>
          setinput(e.target.value)}    />
         
          
        <div className="search" onClick={fetchData}>
          <IoSearch />
        </div>
      </div>

      <div className="right">
        <div className="create">
          <div className="plus">
            <IoIosAdd />
          </div>
          <p>Create</p>
        </div>

        <div className="bell" >
          <FaRegBell />
        </div>
        <div className="user">
          <FaRegCircleUser />
        </div>
      </div>
    </div>
  );
};

export default Navbar;
