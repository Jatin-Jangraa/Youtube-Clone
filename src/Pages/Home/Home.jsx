import React, { useEffect, useState } from 'react'
import './Home.css'
import Header from '../../Components/Header/Header'
import Feed from '../../Components/Feed/Feed'
import Navbar from '../../Components/Navbar/Navbar'
import { API_KEY, value_convertor } from '../../Components/Data'
import { Link } from 'react-router-dom'






const Home = () => {

  const [category, setCategory] = useState(0)
  console.log(category);

  const [input, setinput] = useState(null);
  console.log(input);

  const [dataa, setdata] = useState([])
  console.log(dataa);

  const fetchData = async () => {
    const vedioList_url = `https://youtube.googleapis.com/youtube/v3/search?part=snippet&maxResults=50&q=${input}&key=${API_KEY}`
    await fetch(vedioList_url).then(Response => Response.json()).then(data => setdata(data.items))
  }





  return (
    <>




      <Navbar setinput={setinput} fetchData={fetchData} />
      <div className="data">
        <Header category={category} setCategory={setCategory} />
        <Feed category={category} dataa={dataa} />
      </div>

    </>
  )
}

export default Home


