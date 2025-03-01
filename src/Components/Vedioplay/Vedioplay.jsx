import React, { useEffect, useState } from 'react'
import './Vedioplay.css'
import { API_KEY, value_convertor } from '../Data';
import { BiSolidLike } from "react-icons/bi";
import { BiSolidDislike } from "react-icons/bi";
import { IoIosShareAlt } from "react-icons/io";
import { SlOptions } from "react-icons/sl";
import moment from 'moment';
import { data, useParams } from 'react-router-dom';




const Vedioplay = () => {

const {vedioId}=useParams();

const [apiData,setapiData]=useState(null);
const [channeldata,setchanneldata]=useState(null);

const fetchVedioData=async()=>{
    
    const vedioDetailsURL=`https://youtube.googleapis.com/youtube/v3/videos?part=snippet%2CcontentDetails%2Cstatistics&id=${vedioId}&key=${API_KEY}`
await fetch(vedioDetailsURL).then(res=>res.json()).then(data=>setapiData(data.items[0]))
// const vedioDetailsURL=`https://youtube.googleapis.com/youtube/v3/videos?part=snippet%2CcontentDetails%2Cstatistics&id=0nAvxmluHIM&key=AIzaSyBk_YhtgSGwFGM0P74E5PChlToncyea0Zo`

}


const  fetchdetails=async()=>{
    const channelURL=`https://youtube.googleapis.com/youtube/v3/channels?part=snippet%2CcontentDetails%2Cstatistics&id=${apiData.snippet.channelId}&key=${API_KEY} `
    await fetch(channelURL).then(res=>res.json().then(data=>setchanneldata(data.items[0])))
}

useEffect(()=>{
    fetchVedioData();
},[vedioId])

useEffect(()=>{
    fetchdetails();
},[apiData])

  return (
    <div className="play">
             <div> <iframe src={`https://www.youtube.com/embed/${vedioId}?autoplay=1`}  frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe></div>
            <div className="heading">
                <p>{apiData? apiData.snippet.title:"Title"}</p>
            </div>
            <div className='time'>
            <p className='count'>{apiData?value_convertor(apiData.statistics.viewCount):"16K"}Views  </p>
            <p className='count'> {apiData?moment(apiData.snippet.publishedAt).fromNow():"time"}</p>
            </div>
            <div className="data">

            <div className="leftdata">
            <div className="photo">
                <img className='img' src= {channeldata?channeldata.snippet.thumbnails.default.url:""}alt="" />
                 </div>
            <p>{apiData?apiData.snippet.channelTitle:"Channel"}</p>
            <button className='button'>Subscribe</button>
            </div>


            <div className="right-data">
                <div className="likke">
                <div className="like"><BiSolidLike/> {apiData?value_convertor(apiData.statistics.likeCount):"16K"}</div>
                <div className="unlike"> <BiSolidDislike/></div>
                </div>
                <div >
                    <button className="sharebutton"><IoIosShareAlt/> Share</button>
                </div>
                <div>
                    <button className='option'><SlOptions/></button>
                </div>
            </div>
            </div>
    </div>
  )
}

export default Vedioplay