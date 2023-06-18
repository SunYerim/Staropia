// 업종별 산재 빈도, 상병코드 map 객체를 불러옴
import injuryPerEopjong from './injuryPerEopjong.js';
import injuryCode from './injuryCode.js';
import sanjaePageNum from './sanjaePageNum.js';

var pukyongLatLng = new kakao.maps.LatLng(35.134832, 129.103106);
var koreaBounds = new kakao.maps.LatLngBounds(
  new kakao.maps.LatLng(37.833245, 126.111684),
  new kakao.maps.LatLng(33.562060, 130.088381)
)

var mapContainer = document.getElementById("map"), // 지도를 표시할 div
  mapOption = {
    center: pukyongLatLng, // 지도의 중심좌표
    level: 5, // 지도의 기본 확대 레벨
    mapTypeId: kakao.maps.MapTypeId.ROADMAP, // 지도종류
  };

// 지도를 생성
const map = new kakao.maps.Map(mapContainer, mapOption);
map.setMinLevel(2);
map.setMaxLevel(13);

// 검색된 마커들의 배열
var markers = [];
// 장소 검색 객체
var ps = new kakao.maps.services.Places();
// 지도 범위 객체
var bounds = new kakao.maps.LatLngBounds();

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
      return;
    }
  }

  // 검색 성공 시 호출되는 함수
  function displayPlaces(places) {
    // 마커 배열을 비운다.
    hideMarkers();
    clearMarkers();

    // bounds를 비운다.
    bounds = new kakao.maps.LatLngBounds();
    // 마커 생성 개수 카운트
    var addCount = 0;
    // 검색된 모든 장소에 대해 지역을 검사하고, 마커를 추가한다.
    for (var i = 0; i < places.length; i++) {
      console.log(places[i].address_name.substr(0, 2));
      // 지역이 일치하거나, 전역 검색이라면
      if(places[i].address_name.substr(0, 2) === region || region === '지역') {
        // 해당 위치로 마커를 생성하고 카운트를 증가시킨다.
        addMarker(places[i], region, i);
        addCount++;
      }
    }

    // 검색할 결과가 전혀 없다면
    if(addCount === 0 && bounds.isEmpty()) {
      // 지도 범위를 한국 전체로 변경하고 알림을 띄운다.
      map.setBounds(koreaBounds);
      alert("결과 없음");
    }

    /* addMarker 내부에서 비동기로 처리되기 때문에, for문 직후에 isEmpty()를 실행하면
    결과가 있어도 비이있음으로 나온다. 따라서 카운트를 따로 추가하였다. */
  }
}


// 마커를 생성하는 함수
function addMarker(place, area, i) {
  // 사업장명으로 사업자등록번호를 조회한다.
  var url = "https://bizno.net/api/fapi?key=dmVkZWxsYW4xNTE5QGdtYWlsLmNvbSAg&gb=3";
  
  if (area !== "지역") {
    url += "&area=" + area;
  }
  url += "&q=" + place.place_name + "&type=json";

  console.log(url);

  // 정보가 있는 기업만 마커를 생성한다.
  const marker = new kakao.maps.Marker({
    map: map,
    position: new kakao.maps.LatLng(place.y, place.x),
  });

  markers[i] = marker;

  fetch(url)
    .then((res) => res.json())
    .then((resJson) => {
      console.log(resJson);
      if (resJson.totalCount === 0) {
        console.log("검색 결과가 없습니다.");
        markers[i].setMap(null);
        return;
      }
      else {
        bounds.extend(new kakao.maps.LatLng(place.y, place.x));
        console.log("검색 결과 찾음");
      }
      // 사업자등록번호에서 '-'를 제거한다.
      var saeopjangNo = removeAllLetters(resJson.items[0].bno, "-");
      console.log(saeopjangNo);

      // 사업자등록번호를 사용해 해당 기업 정보를 xml로 받아온다.
      var xhr = new XMLHttpRequest();
      var xhr2 = new XMLHttpRequest();
      var url = "http://apis.data.go.kr/B490001/gySjbPstateInfoService/getGySjBoheomBsshItem"; /*URL*/
      var queryParams = "?" + encodeURIComponent("serviceKey") + "=" + "JO7Z2MdHanL%2BIYer3fTrXt8YbY4SCcOgXXDCJI4WU8wn%2BUFo08xrBdI29hH1akZqm6GbXFTH7UAabBwCEQh8ew%3D%3D"; /*Service Key*/
      queryParams += "&" + encodeURIComponent("pageNo") + "=" + encodeURIComponent("1"); /**/
      queryParams += "&" + encodeURIComponent("numOfRows") + "=" + encodeURIComponent("10"); /**/
      queryParams += "&" + encodeURIComponent("v_saeopjaDrno") + "=" + encodeURIComponent(saeopjangNo); /**/
      var opa1 = "&" + encodeURIComponent("opaBoheomFg") + "=" + encodeURIComponent("1"); /**/
      var opa2 = "&" + encodeURIComponent("opaBoheomFg") + "=" + encodeURIComponent("2"); /**/
      xhr.open("GET", url + queryParams + opa1);
      xhr.onreadystatechange = function () {
        if (this.readyState == 4) {
          console.log(this.responseText);
          console.log(this.readyState);
          // 산재 데이터를 받아온다.
          var sjData = xhr.responseXML;

          // 산재 데이터가 존재한다면 고용 데이터도 받아온다.
          xhr2.open("GET", url + queryParams + opa2);
          xhr2.onreadystatechange = function () {
            if (this.readyState == 4) {
              // console.log('Status: '+this.status+'nHeaders: '+JSON.stringify(this.getAllResponseHeaders())+'nBody: '+this.responseText);
              var gyData = xhr2.responseXML;

              kakao.maps.event.addListener(marker, "mouseover", showPreviewWindow(place, gyData));
              kakao.maps.event.addListener(marker, "mouseout", hidePreviewWindow());
              kakao.maps.event.addListener(marker, "click", showOffcanvas(gyData, sjData));

              marker.setMap(map);
              markers.push(marker);
              // 마커가 추가될 때마다 보이는 범위를 갱신한다.
              map.setBounds(bounds);
            }
          };

          xhr2.send("");
        }

        else if(this.readyState === 3) {
          console.log("bizno API 일일 한도 초과");
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

// 오프캔버스
var offcanvasElement = document.getElementById("offcanvas");
var offcanvas = new bootstrap.Offcanvas(offcanvasElement);
var companyNameTag = document.getElementById("name")
var addressTag = document.getElementById("address");
var companyNumTag = document.getElementById("companyNumber");
// 산재 정보 표시 태그
var injuryList = document.getElementById("injuryList")
var injuryTags = document.getElementsByClassName('injuryTag');
var injuryContentTags = document.getElementsByClassName('content-sj');
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

    // 열기
    offcanvas.show();
    // 오프캔버스 데이터 변경
    // 기본 데이터
    companyNameTag.innerHTML = companyName;
    addressTag.innerHTML = address;
    companyNumTag.innerHTML = "사업자등록번호: " + companyNumber;
    contents[0].innerHTML = gyEopjongName;
    contents[1].innerHTML = gyEopjongCode;
    contents[2].innerHTML =
      gySeongripDate.substr(0, 4) + "년 " +
      gySeongripDate.substr(4, 2) + "월 " +
      gySeongripDate.substr(6, 2) + "일";
    contents[3].innerHTML = peopleCount + "명";
    contents[4].innerHTML = sjEopjongName;
    contents[5].innerHTML = sjEopjongCode;
    contents[6].innerHTML =
      sjSeongripDate.substr(0, 4) + "년 " +
      sjSeongripDate.substr(4, 2) + "월 " +
      sjSeongripDate.substr(6, 2) + "일";

    // 산재 정보를 받아온다.
    var injuryData = injuryPerEopjong.get(sjEopjongName);
    // 병명이 없을 때까지 내용을 변경하고 보이게 한다.
    let i = 0;
    // 데이터가 있을 때만 연산
    if (injuryData !== undefined) {
      injuryList.style.display = '';
      // 모든 키 값을 순서대로 조회
      for (const key of injuryData.keys()) {
        if (i === injuryData.size) {
          break;
        }
        // 내용을 변경하고 표시
        injuryContentTags[i].innerHTML = injuryCode.get(key);
        injuryTags[i].style.display = '';
        i++;
      }
    }
    // 데이터가 없으면 리스트 전체를 숨김
    else {
      injuryList.style.display = 'none';
    }
    // 병명이 작성되지 않은 태그들은 숨긴다
    for (; i < 3; i++) {
      injuryTags[i].style.display = 'none';
    }
    // 고용코드의 첫 3자리로 매뉴얼 페이지 번호 검색, 없을 시 첫 페이지가 보인다.
    var pageNum = sanjaePageNum.get(Math.floor(gyEopjongCode / 100));
    var sanjaeFrame = document.getElementById("sanjaeManual");
    // 페이지 변환을 위해 링크를 지운 뒤 10ms 후 생성
    sanjaeFrame.src = "";
    setTimeout(function () {
      sanjaeFrame.src = "../notes/산재예방 매뉴얼 [최종].pdf#page=" + pageNum;
    }, 10);
  };
}