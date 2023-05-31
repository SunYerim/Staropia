var mapContainer = document.getElementById("map"), // 지도를 표시할 div
  mapOption = {
    center: new kakao.maps.LatLng(35.13417, 129.11397), // 지도의 중심좌표
    level: 6, // 지도의 확대 레벨
    mapTypeId: kakao.maps.MapTypeId.ROADMAP, // 지도종류
  };

// 지도를 생성한다
var map = new kakao.maps.Map(mapContainer, mapOption);

// 장소 검색 객체 생성
var ps = new kakao.maps.services.Places();

searchPlaces();

// 키워드 검색을 요청
function searchPlaces() {
  var keyword = document.getElementById("keyword").value;
  ps.keywordSearch(keyword, placesSearchCB);
}

// 마커를 담아둘 배열
var markers = [];

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
  kakao.maps.event.addListener(
    marker,
    "click",
    (function (position) {
      return function () {
        showPreviewWindow(position);
      };
    })(position)
  );
  // kakao.maps.event.addListener(marker, 'click', showPreviewWindow(position));
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
