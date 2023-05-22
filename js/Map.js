var mapContainer = document.getElementById("map"), // 지도를 표시할 div
mapOption = {
  center: new kakao.maps.LatLng(35.13417, 129.11397), // 지도의 중심좌표
  level: 6, // 지도의 확대 레벨
  mapTypeId: kakao.maps.MapTypeId.ROADMAP, // 지도종류
};

// 지도를 생성한다
var map = new kakao.maps.Map(mapContainer, mapOption);

// 지도에 마커를 생성하고 표시한다
var marker = new kakao.maps.Marker({
position: new kakao.maps.LatLng(35.13499, 129.1039), // 마커의 좌표
map: map, // 마커를 표시할 지도 객체
});

// 마커 위에 표시할 인포윈도우를 생성한다
var infowindow = new kakao.maps.InfoWindow({
    content : '<div style="padding:5px;">인포윈도우 :D</div>' // 인포윈도우에 표시할 내용
});

// 마커에 mouseover 이벤트를 등록한다
kakao.maps.event.addListener(marker, 'mouseover', function() {
    // 인포윈도우를 지도에 표시한다
    infowindow.open(map, marker);
    // console.log('마커에 mouseover 이벤트가 발생했습니다!');
});

// 마커에 mouseout 이벤트 등록
kakao.maps.event.addListener(marker, 'mouseout', function() {
    infowindow.close();
    // console.log('마커에 mouseout 이벤트가 발생했습니다!');
});