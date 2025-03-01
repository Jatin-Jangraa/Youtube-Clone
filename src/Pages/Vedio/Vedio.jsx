import React from 'react'
import './Vedio.css'
import { assets } from '../../assets/Img/Assets'
import { useParams } from 'react-router-dom'
import Vedioplay from '../../Components/Vedioplay/Vedioplay'
import Reco from '../../Components/Reco/Reco'
import Navbar from '../../Components/Navbar/Navbar'


const vedio = () => {

  const{vedioId,categoryId}=useParams();
  return (
    <><Navbar/>
    <div className='vedio-box'>
<Vedioplay vedioId={vedioId}/>
<Reco   categoryId={categoryId}/>
    </div>
    </>
  )
}

export default vedio

