export const API_KEY = "AIzaSyBjC1bReemhbxNNp_0Jn5TdlMFPFuxd2z0";


 export const value_convertor =(value)=>{
    if(value>=1000000){
        return Math.floor(value/1000000)+"M"
    }
    else if(value>=1000){
        return Math.floor(value/1000)+"k"
    }
    else {
        return value;
    }
}

// https://youtube.googleapis.com/youtube/v3/search?part=snippet&maxResults=25&q=surfing&key=AIzaSyALhEdVWl3W36mZDroLfwKEgrt2G2qUJw4


