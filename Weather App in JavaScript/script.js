const wrapper = document.querySelector(".wrapper"),
inputPart = document.querySelector(".input-part"),
infoTxt = inputPart.querySelector(".info-txt"),
inputField = inputPart.querySelector("input"),
locationBtn = inputPart.querySelector("button"),
weatherPart = wrapper.querySelector(".weather-part"),
wIcon = weatherPart.querySelector("img"),
arrowBack = wrapper.querySelector("header i");

let api;

// Đặt giá trị mặc định cho trường input khi trang được tải
window.addEventListener('DOMContentLoaded', () => {
    const inputField = document.querySelector('input[type="text"]');
    inputField.value = "Ho Chi Minh";

    setTimeout(() => {
        if (inputField.value !== "") {
            requestApi(inputField.value);
        }
    }, 1000);
});

locationBtn.addEventListener("click", () => {
    if (navigator.geolocation) { // if browser supports geolocation api
        navigator.geolocation.getCurrentPosition(onSuccess, onError);
    } else {
        alert("Your browser does not support geolocation API");
    }
});






function requestApi(city){
    api = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=da0b15d01c9d6d81077dee87d0bee31a`;
    fetchData();
}



function onSuccess(position){
    const {latitude, longitude} = position.coords; // getting lat and lon of the user device from coords obj
    api = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=da0b15d01c9d6d81077dee87d0bee31a`;
    fetchData();
}

function onError(error){
    // if any error occur while getting user location then we'll show it in infoText
    infoTxt.innerText = error.message;
    infoTxt.classList.add("error");
}

function fetchData(){
    infoTxt.innerText = "Getting weather details...";
    infoTxt.classList.add("pending");
    // getting api response and returning it with parsing into js obj and in another 
    // then function calling weatherDetails function with passing api result as an argument
    fetch(api).then(res => res.json()).then(result => weatherDetails(result)).catch(() =>{
        infoTxt.innerText = "Something went wrong";
        infoTxt.classList.replace("pending", "error");
    });
}
function chuyenTrang() {
    // Đóng tab hiện tại
    window.close();
}

function delayChuyenTrang() {
    setTimeout(() => {
        chuyenTrang();
    }, 5000); // Thời gian đợi 18 giây trước khi thực hiện hàm chuyenTrang
}

async function translateToVietnamese(text) {
    const response = await fetch('https://api.mymemory.translated.net/get?q=' + text + '&langpair=en|vi');
    const data = await response.json();
    return data.responseData.translatedText;
  }
  
  // Sử dụng hàm dịch để chuyển đổi thông tin thời tiết sang tiếng Việt
  async function getWeatherInfoInVietnamese(city, country, temp, description, feels_like, humidity) {
    let englishWeatherInfo = `${city}, ${country}. Temperature is ${Math.floor(temp)} degrees Celsius. ${description}. Feels like ${Math.floor(feels_like)} degrees Celsius. Humidity ${humidity}%.`;
  
    let vietnameseWeatherInfo = await translateToVietnamese(englishWeatherInfo);
    
    // Sau khi dịch sang tiếng Việt, sử dụng ResponsiveVoice để đọc thông tin
    responsiveVoice.speak(vietnameseWeatherInfo, "Vietnamese Female");
  }



  
function weatherDetails(info){
    if(info.cod == "404"){ // if user entered city name isn't valid
        infoTxt.classList.replace("pending", "error");
        infoTxt.innerText = `${inputField.value} isn't a valid city name`;
    } else {
        const city = info.name;
        const country = info.sys.country;
        const { description, id } = info.weather[0];
        const { temp, feels_like, humidity } = info.main;

        function showAdvice(advice) {
            infoTxt.innerText = advice;
        
            setTimeout(() => {
                responsiveVoice.speak(advice, "Vietnamese Female");
                delayChuyenTrang();
            }, 12000); // Đợi 3 giây trước khi thực hiện lệnh
        }
        

        if (id == 800) {
            wIcon.src = "icons/clear.svg";
            showAdvice("Trời hôm nay nắng, hãy chuẩn bị một ngày tốt lành!");
        } else if (id >= 200 && id <= 232) {
            wIcon.src = "icons/storm.svg";
            showAdvice("Trời có thể có bão, hãy chuẩn bị và hạn chế ra ngoài!");
        } else if (id >= 600 && id <= 622) {
            wIcon.src = "icons/snow.svg";
            showAdvice("Trời có tuyết, hãy chuẩn bị cho điều kiện thời tiết lạnh!");
        } else if (id >= 701 && id <= 781) {
            wIcon.src = "icons/haze.svg";
            showAdvice("Trời có sương mù, hãy lái xe cẩn thận!");
        } else if (id >= 801 && id <= 804) {
            wIcon.src = "icons/cloud.svg";
            showAdvice("Trời có mây đen, nhớ mang theo ô nhé!");
        } else if ((id >= 500 && id <= 531) || (id >= 300 && id <= 321)) {
            wIcon.src = "icons/rain.svg";
            showAdvice("Trời hôm nay có mưa, bạn nên mang theo ô!");
        }

        // Update thông tin thời tiết
        weatherPart.querySelector(".temp .numb").innerText = Math.floor(temp);
        weatherPart.querySelector(".weather").innerText = description;
        weatherPart.querySelector(".location span").innerText = `${city}, ${country}`;
        weatherPart.querySelector(".temp .numb-2").innerText = Math.floor(feels_like);
        weatherPart.querySelector(".humidity span").innerText = `${humidity}%`;
        weatherPart.querySelector(".temp .numb").innerText = Math.floor(temp);

        // Get thông tin thời tiết dịch sang tiếng Việt và đọc lên
        getWeatherInfoInVietnamese(city, country, temp, description, feels_like, humidity);

        // Xử lý giao diện
        infoTxt.classList.remove("pending", "error");
        infoTxt.innerText = "";
        inputField.value = "";
        wrapper.classList.add("active");
    }
}


arrowBack.addEventListener("click", ()=>{
    wrapper.classList.remove("active");
});
