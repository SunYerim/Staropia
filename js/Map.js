var mapContainer = document.getElementById("map"), // 지도를 표시할 div
  mapOption = {
    center: new kakao.maps.LatLng(35.13417, 129.11397), // 지도의 중심좌표
    level: 6, // 지도의 확대 레벨
    mapTypeId: kakao.maps.MapTypeId.ROADMAP, // 지도종류
  };

// 지도를 생성한다
var map = new kakao.maps.Map(mapContainer, mapOption);
var markers = [];
function keywordSearch() {
  var keyword = $("#keyword").val();

  // 장소 검색 객체 생성
  var ps = new kakao.maps.services.Places();

  searchPlaces();

  // 키워드 검색을 요청
  function searchPlaces() {
    var keyword = document.getElementById("keyword").value;
    ps.keywordSearch(keyword, placesSearchCB);
  }

  // 키워드 검색 완료 시 호출되는 함수
  function placesSearchCB(data, status, pagination) {
    if (status === kakao.maps.services.Status.OK) {
      displayPlaces(data);
    } else if (status === kakao.maps.services.Status.ZERO_RESULT) {
      alert("No Result");
      return;
    }
  }

  function displayPlaces(places) {
    hideMarkers();
    for (var i = 0; i < places.length; i++) {
      var placePosition = new kakao.maps.LatLng(places[i].y, places[i].x),
        marker = addMarker(placePosition, i);

      bounds.extend(placePosition);
    }
    map.setBounds(bounds);
  }
}

// 마커를 담아둘 배열
// var markers = [];

// 위도, 경도
var lat = 0,
  lng = 0;
// 마커 위에 표시할 미리보기창, 유일 객체
var previewWindow = new kakao.maps.CustomOverlay({
  position: new kakao.maps.LatLng(35.13499, 129.1039),
  // 현재는 위도, 경도를 표시하게 설정, 변경 가능함을 보인다
  content:
    '<div id="previewWindow">' +
    "위도: " +
    lat +
    "<br>경도: " +
    lng +
    "<br><br>" +
    '<a href="CompanyInfo.html">' +
    "상세보기" +
    "</a>" +
    "</div>",
  clickable: true,
  // x, y 위치, 기본 : 0.5
  xAnchor: 0.5,
  yAnchor: 1.4,
});

// 지도 클릭 시 미리보기창을 숨긴다
kakao.maps.event.addListener(map, "click", function () {
  previewWindow.setMap(null);
});

// 지도에 마커를 생성하고 표시한다
addMarker(new kakao.maps.LatLng(35.13499, 129.1039));
addMarker(new kakao.maps.LatLng(35.13499, 129.1059));

// 마커를 생성하는 함수
function addMarker(position) {
  var marker = new kakao.maps.Marker({
    position: position,
  });

  // 마커를 지도에 표시한다
  marker.setMap(map);

  markers.push(marker);

  // 마커에 click 이벤트를 등록한다
  kakao.maps.event.addListener(marker, "click", showPreviewWindow(position));
}

// 배열에 추가된 마커들을 지도에 표시하거나 삭제하는 함수
function setMarkers(map) {
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(map);
  }
}

// 배열에 추가된 마커를 지도에 표시하는 함수
function showMarkers() {
  setMarkers(map);
}

// 배열에 추가된 마커를 지도에서 삭제하는 함수
function hideMarkers() {
  setMarkers(null);
}

// 미리보기창을 표시하는 함수
function showPreviewWindow(position) {
  return function () {
    // 새 데이터의 위도, 경도
    lat = position.getLat();
    lng = position.getLng();

    // 미리보기창 위치를 변경한다
    previewWindow.setPosition(position);

    // 변경될 내용
    var content =
      '<div id="previewWindow">' +
      "위도: " +
      lat +
      "<br>경도: " +
      lng +
      "<br><br>" +
      '<a href="CompanyInfo.html">' +
      "상세보기" +
      "</a>" +
      "</div>";

    // 미리보기창 내용을 변경한다.
    previewWindow.setContent(content);
    // 지도 이벤트를 막는다.
    kakao.maps.event.preventMap(map);
    // 미리보기창을 맵 위에 표시한다.
    previewWindow.setMap(map);
  };
}

// 주소-좌표 변환 객체를 생성합니다
var geocoder = new kakao.maps.services.Geocoder();

// 주소로 좌표를 검색합니다
geocoder.addressSearch('경기 고양시 일산동구 고봉로 26-32 (장항동, 양우로데오랜드) C동202호', function(result, status) {
    console.log(status);
    // 정상적으로 검색이 완료됐으면 
     if (status === kakao.maps.services.Status.OK) {

        var coords = new kakao.maps.LatLng(result[0].y, result[0].x);

        // 결과값으로 받은 위치를 마커로 표시합니다
        addMarker(coords);

        // 인포윈도우로 장소에 대한 설명을 표시합니다
        showPreviewWindow(coords);

        // 지도의 중심을 결과값으로 받은 위치로 이동시킵니다
        map.setCenter(coords);
    } 
});    