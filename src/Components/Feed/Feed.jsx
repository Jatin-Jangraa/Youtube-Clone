import React, { useEffect, useState } from 'react'
import './Feed.css'
import { assets } from '../../assets/Img/Assets'
import { Link } from 'react-router-dom'
import { API_KEY, value_convertor } from '../Data'
import moment from 'moment'



const Feed = ({category,dataa}) => {
  console.log(category)
  
  
const[data,setdata]=useState([]);


const fetchData =async()=>{
  const vedioList_url= `https://youtube.googleapis.com/youtube/v3/videos?part=snippet%2CcontentDetails%2Cstatistics&chart=mostPopular&maxResults=50&regionCode=IN&videoCategoryId=${category}&key=${API_KEY}`
  await fetch (vedioList_url).then(Response=>Response.json()).then(data=>setdata(data.items))
}


useEffect(()=>{
  fetchData();
},[category])

  return (
    <>

    <div className='bo'>
    {dataa?<div className='main'>
      {dataa.map((item,index)=>{
        return(
          <div className="card">
            <div className="vedioimage"></div>
          <Link to ={`vedio/${category}/${item.id.videoId}`}
           className="imgg  pl"> <img src={item.snippet.thumbnails.medium.url} alt="" /></Link>
           <p className='main'>{item.snippet.title.slice(0,100)}</p>
           <p className='font'>{item.snippet.channelTitle}</p>
          
         </div>
        )
      })}
     


    </div>:null}
    
    
    {data?<div className='main  hlo'>
      {data.map((item,index)=>{
        return(
          <div className="card">
            <div className="vedioimage"></div>
          <Link to ={`vedio/${item.snippet.categoryId}/${item.id}`} className="imgg">
           <img src={item.snippet.thumbnails.medium.url} alt="" /></Link>
           <p className='main'>{item.snippet.title.slice(0,100)}</p>
           <p className='font'>{item.snippet.channelTitle}</p>
           <div className="p">
           <p  className='font bottom'>{value_convertor(item.statistics.viewCount)}views </p>  <p className='font bottom'> {moment(item.snippet.publishedAt).fromNow()} </p>
           </div>
         </div>
        )
      })}
     


    </div>:null}
    </div>
    </>
  )
}

export default Feed