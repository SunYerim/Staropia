var mapContainer = document.getElementById("map"), // 지도를 표시할 div
mapOption = {
  center: new kakao.maps.LatLng(35.13417, 129.11397), // 지도의 중심좌표
  level: 6, // 지도의 확대 레벨
  mapTypeId: kakao.maps.MapTypeId.ROADMAP, // 지도종류
};

// 지도를 생성한다
var map = new kakao.maps.Map(mapContainer, mapOption);

// 마커를 담아둘 배열
var markers = [];

// 지도에 마커를 생성하고 표시한다
addMarker(new kakao.maps.LatLng(35.13499, 129.1039));
addMarker(new kakao.maps.LatLng(35.13499, 129.1059));

// 마커를 생성하는 함수
function addMarker(position) {
    var marker = new kakao.maps.Marker({
        position: position,
    });

    marker.setMap(map);

    markers.push(marker);
    
    addInfoWindow(marker, position);
}

// 배열에 추가된 마커들을 지도에 표시하거나 삭제하는 함수
function setMarkers(map) {
    for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(map);
    }            
}

// 배열에 추가된 마커를 지도에 표시하는 함수
function showMarkers() {
    setMarkers(map)    
}

// 배열에 추가된 마커를 지도에서 삭제하는 함수
function hideMarkers() {
    setMarkers(null);    
}

// 마커에 인포윈도우를 추가하는 함수
function addInfoWindow(marker, position) {
    // 마커 위에 표시할 인포윈도우를 생성한다
    var infowindow = new kakao.maps.InfoWindow({
        // 현재는 위도, 경도를 표시하게 설정
        content : '<div style="padding:5px;">위도 : ' + position.getLat() + '<br>경도 : ' + position.getLng() + '</div>' // 인포윈도우에 표시할 내용
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

    // 마커에 클릭 이벤트를 등록한다 (우클릭 : rightclick)
    kakao.maps.event.addListener(marker, 'click', function() {
        // 이후 상세 페이지로 이동하게 작업 예정
        alert('마커를 클릭했습니다!');
    });
}
