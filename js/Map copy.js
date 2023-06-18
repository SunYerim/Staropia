// 업종별 산재 빈도, 상병코드 map 객체를 불러온다.
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
// 주소 - 좌표 변환 객체 생성
var geocoder = new kakao.maps.services.Geocoder();

// index.html에서 선택된 값들을 기반으로 검색 함수를 호출
document.querySelector(".search-form").addEventListener("submit", function (e) {
  e.preventDefault();
  search();
});

// 검색 함수
function search() {
  // 마커를 숨기고 markers 배열을 비운다.
  hideMarkers();
  clearMarkers();

  // 선택된 값들을 가져온다.
  var region = document.querySelector("#region").value;
  // var workerCount = doucument.querySelector("#workerCount").value;
  // 검색창에 입력된 키워드를 가져온다.
  var keyword = document.getElementById("keyword").value;

  // 사업장명으로 사업자등록번호를 조회한다.
  var url = "https://bizno.net/api/fapi?key=dmVkZWxsYW4xNTE5QGdtYWlsLmNvbSAg&gb=3&q=" +
    keyword + "&type=json";
  // 지역 필터를 추가했다면 url에 추가한다. (bizno api 입력값 옵션 중 지역이 있음)
  if (region !== "지역") {
    url += "&area=" + region;
  }

  // url로 api를 호출한다.
  fetch(url)
    .then((res) => res.json())
    .then((resJson) => {
      // 검색 성공 시
      if (resJson.resultCode === 0) {
        const xhr1Array = [];
        const xhr2Array = [];
        const sjDatas = [];
        const gyDatas = [];
        // 검색된 모든 사업장의 정보를 받아온다.
        for (let i = 0; i < resJson.totalCount; i++) {
          // 사업자등록번호에서 '-'를 제거한다.
          var saeopjangNo = removeAllLetters(resJson.items[i].bno, "-");
          console.log(saeopjangNo);
          // 사업자등록번호를 사용해 해당 기업 정보를 xml로 받아온다.
          const xhr1 = new XMLHttpRequest();
          const xhr2 = new XMLHttpRequest();
          xhr1Array.push(xhr1);
          xhr2Array.push(xhr2);

          // 요청할 url 작성 부분
          var url2 = "http://apis.data.go.kr/B490001/gySjbPstateInfoService/getGySjBoheomBsshItem";
          var queryParams = "?" + encodeURIComponent("serviceKey") + "=" + "JO7Z2MdHanL%2BIYer3fTrXt8YbY4SCcOgXXDCJI4WU8wn%2BUFo08xrBdI29hH1akZqm6GbXFTH7UAabBwCEQh8ew%3D%3D";
          queryParams += "&" + encodeURIComponent("pageNo") + "=" + encodeURIComponent("1");
          queryParams += "&" + encodeURIComponent("numOfRows") + "=" + encodeURIComponent("10");
          queryParams += "&" + encodeURIComponent("v_saeopjaDrno") + "=" + encodeURIComponent(saeopjangNo);
          // 1: 산재, 2: 고용
          var opa1 = "&" + encodeURIComponent("opaBoheomFg") + "=" + encodeURIComponent("1");
          var opa2 = "&" + encodeURIComponent("opaBoheomFg") + "=" + encodeURIComponent("2");

          // 산재 정보 요청, 비동기
          xhr1.open("GET", url2 + queryParams + opa1);
          xhr1.onreadystatechange = function () {
            if (this.readyState == 4) {
              // 산재 데이터를 sjData에 받아온다.
              const sjData = xhr1.responseXML;
              console.log(sjData);
              sjDatas[i] = sjData;
              if (sjDatas.length === resJson.totalCount) {
                processResponses(sjDatas, gyDatas);
              }
            };
          };
          xhr1.send("");

          // 고용 정보 요청, 비동기
          xhr2.open("GET", url2 + queryParams + opa2);
          xhr2.onreadystatechange = function () {
            if (this.readyState == 4) {
              // 산재 데이터를 sjData에 받아온다.
              const gyData = xhr2.responseXML;
              console.log(gyData);
              gyDatas[i] = gyData;
              if (gyDatas.length === resJson.totalCount) {
                processResponses(sjDatas, gyDatas);
              }
            };
          };
          xhr2.send("");
        }
      }
    });
}

function processResponses(sjDatas, gyDatas) {
  // 지도를 보여줄 범위
  var bounds = new kakao.maps.LatLngBounds();
  for (let i = 0; i < sjDatas.length; i++) {
    if(sjDatas[i].getElementsByTagName('totalCount')[0].textContent === 0) {
      continue;
    }
    // 고용 데이터에서 주소를 받아온다.
    var address = gyDatas[i].getElementsByTagName('addr')[0].textContent;
    // 주소를 좌표로 치환한다.
    geocoder.addressSearch(address, function (result, status) {
      if (status === kakao.maps.services.Status.OK) {
        var pos = new kakao.maps.LatLng(result[0].y, result[0].x);
        // 두 정보가 모두 있는 기업만 마커를 생성한다.
        addMarker(pos, gyDatas[i], sjDatas[i]);
        bounds.extend(pos);
        console.log('마커 생성');
      }
    });
  }
  // map.setBounds(bounds);
}

// 마커를 생성하는 함수
function addMarker(pos, gyData, sjData) {
  const marker = new kakao.maps.Marker({
    map: map,
    position: pos,
  });

  // 미리보기창 열기/닫기, 상세정보창 열기 이벤트를 추가한다.
  kakao.maps.event.addListener(marker, "mouseover", showPreviewWindow(pos, gyData));
  kakao.maps.event.addListener(marker, "mouseout", hidePreviewWindow());
  kakao.maps.event.addListener(marker, "click", showOffcanvas(gyData, sjData));

  // markers 배열에 마커를 추가한다.
  markers.push(marker);
  // 범위를 늘린다.
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
function showPreviewWindow(pos, gyData) {
  return function () {
    console.log(gyData);
    // 사업장명을 받아와, '주식회사'를 제거한다.
    var companyName = gyData.getElementsByTagName("saeopjangNm")[0].textContent;
    companyName = removeAllLetters(companyName, "주식회사");
    // 고용업종명을 받아온다.
    var gyName = gyData.getElementsByTagName('gyEopjongNm')[0].textContent;
    // 변경될 내용
    var content =
      '<div id="previewWindow">' +
      '<div id="previewName">' +
      companyName +
      "</div>" +
      '<div id="previewAddress">' +
      gyName +
      "</div><br>" +
      "</div>";

    // 미리보기창 위치, 내용을 변경한 후 지도 위에 표시한다.
    previewWindow.setPosition(pos);
    previewWindow.setContent(content);
    previewWindow.setMap(map);
  };
}

/** 미리보기창을 숨기는 함수 */
function hidePreviewWindow() {
  return function () {
    previewWindow.setMap(null);
  };
}

// 오프캔버스 내부 html 태그들을 전역변수로 받아둔다.
// 오프캔버스
var offcanvasElement = document.getElementById("offcanvas");
var offcanvas = new bootstrap.Offcanvas(offcanvasElement);
// 사업장명, 주소, 사업자등록번호
var companyNameTag = document.getElementById("name");
var addressTag = document.getElementById("address");
var companyNumTag = document.getElementById("companyNumber");
// 고용업종명 ~ 산재보험 성립일자
var contents = document.getElementsByClassName("content");
// 산재 빈도 리스트 태그, 내용이 들어갈 태그, 해당 업종 산재 데이터를 불러온다.
var injuryTagsList = document.getElementsByClassName('injuryTag');
var injuryTags = document.getElementsByClassName('content-sj');

/** 오프캔버스 내용을 변경하고 표시한다. */
function showOffcanvas(gyData, sjData) {
  return function () {
    // 고용 데이터
    // 사업장명은 불러온 후 '주식회사'를 제거한다.
    var companyName = gyData.getElementsByTagName("saeopjangNm")[0].textContent;
    companyName = removeAllLetters(companyName, "주식회사");
    var address = gyData.getElementsByTagName("addr")[0].textContent;
    var peopleCount = gyData.getElementsByTagName("sangsiInwonCnt")[0].textContent;
    var companyNumber = gyData.getElementsByTagName("saeopjaDrno")[0].textContent;
    var gyEopjongName = gyData.getElementsByTagName("gyEopjongNm")[0].textContent;
    var gyEopjongCode = gyData.getElementsByTagName("gyEopjongCd")[0].textContent;
    var gySeongripDate = gyData.getElementsByTagName("seongripDt")[0].textContent;
    // 산재 데이터
    var sjEopjongName = sjData.getElementsByTagName("sjEopjongNm")[0].textContent;
    var sjEopjongCode = sjData.getElementsByTagName("sjEopjongCd")[0].textContent;
    var sjSeongripDate = sjData.getElementsByTagName("seongripDt")[0].textContent;

    // 오프캔버스 열기
    offcanvas.show();

    // 기본 데이터를 변경한다.
    companyNameTag.innerHTML = companyName;
    addressTag.innerHTML = address;
    companyNumTag.innerHTML = "사업자등록번호: " + companyNumber;
    contents[0].innerHTML = gyEopjongName;
    contents[1].innerHTML = gyEopjongCode;
    contents[2].innerHTML = gySeongripDate.substr(0, 4) + "년 " +
      gySeongripDate.substr(4, 2) + "월 " +
      gySeongripDate.substr(6, 2) + "일";
    contents[3].innerHTML = peopleCount + "명";
    contents[4].innerHTML = sjEopjongName;
    contents[5].innerHTML = sjEopjongCode;
    contents[6].innerHTML = sjSeongripDate.substr(0, 4) + "년 " +
      sjSeongripDate.substr(4, 2) + "월 " +
      sjSeongripDate.substr(6, 2) + "일";

    var injuryData = injuryPerEopjong.get(sjEopjongName);

    // 병명이 없을 때까지 내용을 변경하고 보이게 한다.
    let i = 0;
    // 데이터가 있을 때만 연산
    if (injuryData !== undefined) {
      document.getElementById("injuryList").style.display = '';
      // 모든 키 값을 순서대로 조회
      for (const key of injuryData.keys()) {
        // if (i === injuryData.size) {
        //   break;
        // }
        // 내용을 변경하고 표시
        injuryTags[i].innerHTML = injuryCode.get(key);
        injuryTagsList[i].style.display = '';
        i++;
      }
    }
    // 데이터가 없으면 리스트 전체를 숨김
    else {
      document.getElementById("injuryList").style.display = 'none';
    }
    // 병명이 작성되지 않은 태그들은 숨긴다
    for (; i < 3; i++) {
      injuryTagsList[i].style.display = 'none';
    }
    // 고용코드의 첫 3자리로 매뉴얼 페이지 번호 검색, 없을 시 첫 페이지가 보인다.
    var pageNum = sanjaePageNum.get(Math.floor(gyEopjongCode / 100));
    var sanjaeFrame = document.getElementById("sanjaeManual");
    // 페이지 변환을 위해 링크를 지운 뒤 100ms 후 생성
    sanjaeFrame.src = "";
    setTimeout(function () {
      sanjaeFrame.src = "../notes/산재예방 매뉴얼 [최종].pdf#page=" + pageNum;
    }, 100);
  };
}