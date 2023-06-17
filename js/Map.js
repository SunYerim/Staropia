// 업종별 산재 빈도, 상병코드 map 객체를 불러옴
import injuryPerEopjong from './injuryPerEopjong.js';
import injuryCode from './injuryCode.js';
import sanjaePageNum from './sanjaePageNum.js';

var mapContainer = document.getElementById("map"), // 지도를 표시할 div
  mapOption = {
    center: new kakao.maps.LatLng(35.13417, 129.11397), // 지도의 중심좌표
    level: 5, // 지도의 확대 레벨
    mapTypeId: kakao.maps.MapTypeId.ROADMAP, // 지도종류
  };

// 지도를 생성
var map = new kakao.maps.Map(mapContainer, mapOption);
map.setMinLevel(1);
map.setMaxLevel(13);

// 검색된 마커들의 배열
var markers = [];
// 장소 검색 객체를 생성
var ps = new kakao.maps.services.Places();
// 주소 - 좌표 변환 객체 생성
var geocoder = new kakao.maps.services.Geocoder();

// index.html에서 선택된 값들을 기반으로 검색 함수를 호출
document.querySelector(".search-form").addEventListener("submit", function (e) {
  e.preventDefault();
  search();
});

// 검색 함수
function search() {
  // 선택된 값들을 가져온다.
  var region = document.querySelector("#region").value;
  // var workerCount = doucument.querySelector("#workerCount").value;

  // 검색창에 입력된 키워드를 가져온다.
  var keyword = document.getElementById("keyword").value;
  ps.keywordSearch(keyword, placesSearchCB);

  // 키워드 검색 완료 시 호출되는 함수
  function placesSearchCB(data, status, pagination) {
    if (status === kakao.maps.services.Status.OK) {
      displayPlaces(data);
    } else if (status === kakao.maps.services.Status.ZERO_RESULT) {
      alert("검색 결과가 없습니다.");
      return;
    } else {
      alert("검색 도중 오류가 발생했습니다.");
    }
  }

  function displayPlaces(places) {
    hideMarkers();
    clearMarkers();
    var bounds = new kakao.maps.LatLngBounds();

    for (var i = 0; i < places.length; i++) {
      addMarker(places[i], region);
      bounds.extend(new kakao.maps.LatLng(places[i].y, places[i].x));
    }

    map.setBounds(bounds);
  }
}

// 마커를 생성하는 함수
function addMarker(place, area) {
  // 사업장명으로 사업자등록번호를 조회한다.
  var url =
    "https://bizno.net/api/fapi?key=dmVkZWxsYW4xNTE5QGdtYWlsLmNvbSAg&gb=3&q=" +
    place.place_name +
    "&type=json";
  if (area !== "지역") {
    url += "&area=" + area;
  }

  fetch(url)
    .then((res) => res.json())
    .then((resJson) => {
      // 사업자등록번호에서 '-'를 제거한다.
      var saeopjangNo = removeAllLetters(resJson.items[0].bno, "-");

      // 사업자등록번호를 사용해 해당 기업 정보를 xml로 받아온다.
      var xhr = new XMLHttpRequest();
      var xhr2 = new XMLHttpRequest();
      var url =
        "http://apis.data.go.kr/B490001/gySjbPstateInfoService/getGySjBoheomBsshItem"; /*URL*/
      var queryParams =
        "?" +
        encodeURIComponent("serviceKey") +
        "=" +
        "JO7Z2MdHanL%2BIYer3fTrXt8YbY4SCcOgXXDCJI4WU8wn%2BUFo08xrBdI29hH1akZqm6GbXFTH7UAabBwCEQh8ew%3D%3D"; /*Service Key*/
      queryParams +=
        "&" + encodeURIComponent("pageNo") + "=" + encodeURIComponent("1"); /**/
      queryParams +=
        "&" +
        encodeURIComponent("numOfRows") +
        "=" +
        encodeURIComponent("10"); /**/
      queryParams +=
        "&" +
        encodeURIComponent("v_saeopjaDrno") +
        "=" +
        encodeURIComponent(saeopjangNo); /**/
      var opa1 =
        "&" +
        encodeURIComponent("opaBoheomFg") +
        "=" +
        encodeURIComponent("1"); /**/
      var opa2 =
        "&" +
        encodeURIComponent("opaBoheomFg") +
        "=" +
        encodeURIComponent("2"); /**/
      xhr.open("GET", url + queryParams + opa1);
      xhr.onreadystatechange = function () {
        if (this.readyState == 4) {
          console.log(
            "Status: " +
            this.status +
            "nHeaders: " +
            JSON.stringify(this.getAllResponseHeaders()) +
            "nBody: " +
            this.responseText
          );
          // 산재 데이터를 받아온다.
          var sjData = xhr.responseXML;

          // 산재 데이터가 존재한다면 고용 데이터도 받아온다.
          xhr2.open("GET", url + queryParams + opa2);
          xhr2.onreadystatechange = function () {
            if (this.readyState == 4) {
              // console.log('Status: '+this.status+'nHeaders: '+JSON.stringify(this.getAllResponseHeaders())+'nBody: '+this.responseText);
              var gyData = xhr2.responseXML;

              // 정보가 있는 기업만 마커를 생성한다.
              const marker = new kakao.maps.Marker({
                map: map,
                position: new kakao.maps.LatLng(place.y, place.x),
              });

              kakao.maps.event.addListener(
                marker,
                "mouseover",
                showPreviewWindow(place, gyData)
              );
              kakao.maps.event.addListener(
                marker,
                "mouseout",
                hidePreviewWindow()
              );
              kakao.maps.event.addListener(
                marker,
                "click",
                showOffcanvas(gyData, sjData)
              );

              markers.push(marker);
            }
          };

          xhr2.send("");
        }
      };

      xhr.send("");
    });
}

// str에서 모든 char를 제거한 문자열을 반환한다.
function removeAllLetters(str, char) {
  return str.replace(new RegExp(char, "g"), "");
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

// Markers 배열을 초기화하는 함수
function clearMarkers() {
  markers.splice(0, markers.length);
}

// 마커 위에 표시할 미리보기창, 유일 객체
var previewWindow = new kakao.maps.CustomOverlay({
  position: new kakao.maps.LatLng(35.13499, 129.1039),
  clickable: true,
  // x, y 위치, 기본 : 0.5
  xAnchor: 0.5,
  yAnchor: 1.3,
});

/** 미리보기창을 표시하는 함수 */
function showPreviewWindow(place, data) {
  return function () {
    // 미리보기창 위치를 변경한다
    previewWindow.setPosition(new kakao.maps.LatLng(place.y, place.x));
    // 사업장명을 받아와, '주식회사'나 '(주)'를 제거한다.
    var companyName =
      data.getElementsByTagName("saeopjangNm")[0].childNodes[0].textContent;
    // companyName = removeAllLetters(companyName, '(주)');
    companyName = removeAllLetters(companyName, "주식회사");
    // 고용업종명을 받아온다.
    var eopjongName =
      data.getElementsByTagName("gyEopjongNm")[0].childNodes[0].textContent;

    // 변경될 내용
    var content =
      '<div id="previewWindow">' +
      '<div id="previewName">' +
      companyName +
      "</div>" +
      '<div id="previewAddress">' +
      eopjongName +
      "</div><br>" +
      "</div>";

    // 미리보기창 내용을 변경한다.
    previewWindow.setContent(content);
    // 미리보기창을 맵 위에 표시한다.
    previewWindow.setMap(map);
  };
}

function hidePreviewWindow() {
  return function () {
    previewWindow.setMap(null);
  };
}

// 고용업종명 ~ 상시인원 태그를 배열로 캐싱
var contents = document.getElementsByClassName("content");

// 상세 정보를 오프캔버스로 띄움
function showOffcanvas(gyData, sjData) {
  return function () {
    // 회사 정보들을 분리한다.
    // 고용 데이터
    var companyName =
      gyData.getElementsByTagName("saeopjangNm")[0].childNodes[0].textContent;
    companyName = removeAllLetters(companyName, "주식회사");
    var address =
      gyData.getElementsByTagName("addr")[0].childNodes[0].textContent;
    var peopleCount =
      gyData.getElementsByTagName("sangsiInwonCnt")[0].childNodes[0]
        .textContent;
    var companyNumber =
      gyData.getElementsByTagName("saeopjaDrno")[0].childNodes[0].textContent;
    var gyEopjongName =
      gyData.getElementsByTagName("gyEopjongNm")[0].childNodes[0].textContent;
    var gyEopjongCode =
      gyData.getElementsByTagName("gyEopjongCd")[0].childNodes[0].textContent;
    var gySeongripDate =
      gyData.getElementsByTagName("seongripDt")[0].childNodes[0].textContent;
    // 산재 데이터
    var sjEopjongName =
      sjData.getElementsByTagName("sjEopjongNm")[0].childNodes[0].textContent;
    var sjEopjongCode =
      sjData.getElementsByTagName("sjEopjongCd")[0].childNodes[0].textContent;
    var sjSeongripDate =
      sjData.getElementsByTagName("seongripDt")[0].childNodes[0].textContent;

    //좌측 오프캔버스
    var offcanvasElement = document.getElementById("offcanvas");
    var offcanvas = new bootstrap.Offcanvas(offcanvasElement);
    // 우측 오프캔버스
    offcanvasElement = document.getElementById("offcanvas-right");
    var offcanvas_right = new bootstrap.Offcanvas(offcanvasElement);
    // 열기
    offcanvas.show();
    offcanvas_right.show();
    // 좌측 캔버스 데이터 변경
    document.getElementById("name").innerHTML = companyName;
    document.getElementById("address").innerHTML = address;
    document.getElementById("companyNumber").innerHTML =
      "사업자등록번호: " + companyNumber;
    contents[0].innerHTML = gyEopjongName;
    contents[1].innerHTML = gyEopjongCode;
    contents[2].innerHTML =
      gySeongripDate.substr(0, 4) +
      "년 " +
      gySeongripDate.substr(4, 2) +
      "월 " +
      gySeongripDate.substr(6, 2) +
      "일";
    contents[3].innerHTML = peopleCount + "명";
    contents[4].innerHTML = sjEopjongName;
    contents[5].innerHTML = sjEopjongCode;
    contents[6].innerHTML =
      sjSeongripDate.substr(0, 4) +
      "년 " +
      sjSeongripDate.substr(4, 2) +
      "월 " +
      sjSeongripDate.substr(6, 2) +
      "일";
    // 산재 빈도 리스트 태그, 내용이 들어갈 태그, 해당 업종 데이터를 불러온다.
    var injuryTagsList = document.getElementsByClassName('injuryTag');
    var injuryTags = document.getElementsByClassName('content-sj');
    var injuryData = injuryPerEopjong.get(sjEopjongName);

    // 병명이 없을 때까지 내용을 변경하고 보이게 한다.
    let i = 0;
    // 데이터가 있을 때만 연산
    if(injuryData !== undefined) {
      document.getElementById("injuryHeader").style.visibility = 'visible';
      // 모든 키 값을 순서대로 조회
      for(const key of injuryData.keys()) {
        if(i === injuryData.size) {
          break;
        }
        injuryTags[i].innerHTML = injuryCode.get(key);
        injuryTagsList[i].style.visibility = 'visible';
        i++;
      }
    }
    // 데이터가 없으면 헤더를 숨김
    else{
      document.getElementById("injuryHeader").style.visibility = 'hidden';
    }
    // 병명이 작성되지 않은 태그들은 숨긴다
    for(; i < 3; i++) {
      injuryTagsList[i].style.visibility = 'hidden';
    }
    // 고용코드의 첫 3자리로 페이지 번호 검색, 없을 시 첫 페이지가 보인다.
    var pageNum = sanjaePageNum.get(Math.floor(gyEopjongCode / 100));
    var sanjaeFrame = document.getElementById("sanjaeManual");
    // 페이지 변환을 위해 링크를 지운 뒤 10ms 후 생성
    sanjaeFrame.src = "";
    setTimeout(function () {
      sanjaeFrame.src = "../notes/산재예방 매뉴얼 [최종].pdf#page=" + pageNum;
    }, 10);
  };
}