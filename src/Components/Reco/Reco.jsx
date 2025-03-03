import React, { useEffect, useState } from 'react'
import './Reco.css'
import { assets } from '../../assets/Img/Assets'
import { SlOptionsVertical } from "react-icons/sl";
import { API_KEY ,value_convertor} from '../Data';
import moment from 'moment';
import { Link, useParams } from 'react-router-dom';





const Reco = (categoryId) => {




const[apidata,setapidata]=useState([]);

// const fetchdata=async ()=>{
//     const relatedurl=`https://youtube.googleapis.com/youtube/v3/videos?part=snippet%2CcontentDetails%2Cstatistics&chart=mostPopular&maxResults=50&regionCode=IN&videoCategoryId=10&key=${API_KEY}`
//     await fetch(relatedurl).then(res=>res.json).then(data=>setapidata(data.items))
// }


const fetchdata =async()=>{
  const vedioList_url= `https://youtube.googleapis.com/youtube/v3/videos?part=snippet%2CcontentDetails%2Cstatistics&chart=mostPopular&maxResults=40&regionCode=IN&videoCategoryId=${categoryId.categoryId}&key=${API_KEY}`
  await fetch (vedioList_url).then(Response=>Response.json()).then(data=>setapidata(data.items))
}

useEffect(()=>{
    fetchdata()
},[])


  return (
    <div className='container'>
        { apidata?apidata.map((item,index)=>{
            return(
            
            <div className="cards">
            <div className="imgg">
            <Link to ={`/vedio/${item.snippet.categoryId}/${item.id}`}>
                <img  className='image' src={item.snippet.thumbnails.medium.url}  alt="" />
                </Link>
            </div>

            <div className="middledata">
                <div><p className='para'>{item.snippet.title.slice(0,58)}</p></div>
                <div className="channel"><p>{item.snippet.channelTitle}</p></div>
                <div className="view">
                    <div><p>{value_convertor(item.statistics.viewCount)}</p></div>
                    <div><p>{moment(item.snippet.publishedAt).fromNow()}</p></div>
                </div>
            </div>

           

        </div>)

        }):"lbihblib;"
    }      

    </div>
  )
}

export default Reco