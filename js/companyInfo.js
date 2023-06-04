const contents = document.getElementsByClassName("content");

searchToName("다원기업");

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