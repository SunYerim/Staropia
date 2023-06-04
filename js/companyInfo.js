// 고용업종명 ~ 상시인원 주소 배열
const contents = document.getElementsByClassName("content");

// 상세페이지 진입 시, 로컬 저장소에서 가장 마지막에 저장된 값을 가져온다.
if(localStorage.getItem('name')) {
    var lastName = localStorage.getItem('name');
    console.log(lastName);
}

// 가져온 값으로 json 탐색
searchToName(lastName);

// 이름으로 json 데이터를 읽어오는 함ㅅ
function searchToName(companyName) {
    fetch("../json/parsing2.json")
        .then((res) => {
            return res.json();
        })
        .then((obj) => {
            List(obj, companyName);
        })

    function List(obj, companyName) {
        const saeopjangNm = obj.map(v => v.saeopjangNm);
        const name = new Array(saeopjangNm);

        // 인덱스 검색
        var i;
        for (i = 0; i < obj.length; i++) {
            if (name[0][i] == companyName) {
                break;
            }
        }

        const nameZero = name[0][i];
        document.getElementById("name").innerHTML = nameZero;

        const addr = obj.map(v => v.addr);
        const address = new Array(addr);
        const addressZero = address[0][i];
        document.getElementById("address").innerHTML = addressZero;

        const saeopjaDrno = obj.map(v => v.saeopjaDrno);
        const num = new Array(saeopjaDrno);
        const numZero = num[0][i];
        document.getElementById("companyNumber").innerHTML = "사업자등록번호: " + numZero;

        const gyEopjongNm = obj.map(v => v.gyEopjongNm);
        const goyongName = new Array(gyEopjongNm);
        const goyongNameZero = goyongName[0][i];
        contents[0].innerHTML = goyongNameZero;

        const gyEopjongCd = obj.map(v => v.gyEopjongCd);
        const goyongCode = new Array(gyEopjongCd);
        const goyongCodeZero = goyongCode[0][i];
        contents[1].innerHTML = goyongCodeZero;

        const seongripDt = obj.map(v => v.seongripDt);
        const seongripDate = new Array(seongripDt);
        const seongripDateZero = seongripDate[0][i];
        contents[2].innerHTML = seongripDateZero;
    }
}