//这个文件负责获取HTML DOM,并调用server库中的函数链接实现元素的操控
const View_area = document.getElementById("view_area");
const User_inter = document.getElementById("userInter");
const word_inter = document.getElementById("wordInter");
//现存世界观察器的列表
let wordViews = [];
let focusedOne;

//一些常用的函数
//测试某个函数用时
function testTime(handle) {
    let start = new Date().getMilliseconds();
    {
        handle();
    }
    let end = new Date().getMilliseconds();
    console.log('执行函数' + handle.name + '()用时：' + (end - start).toString() + 'ms');
}


//启动函数，建议在页面打开时使用
function begin() {
    User_inter.firstElementChild.innerHTML = "游客玩家";
    User_inter.lastElementChild.innerHTML =
        new Intl.DateTimeFormat("zn-ch", {year: "numeric", month: "2-digit", day: "2-digit"}).format()
            .replace('/', '-').replace('/', '');

    word_inter.firstElementChild.innerHTML = "世界1";
    word_inter.lastElementChild.innerHTML = User_inter.lastElementChild.innerHTML + "-01";

    View_area.append(document.createElement('div'));
    wordViews.push(new WordView(View_area.lastElementChild, new Space(64, 64, true, 'r3')));
    focusedOne = wordViews[0];

}


//事件绑定
View_area.onclick = function () {
    if (focusedOne.getFollow()) {
        focusedOne.stopFollow();
        focusedOne.word.stop();
    } else {
        focusedOne.word.stepOn(1000);
        focusedOne.display(1000);
    }
}
document.getElementById("downLoadWord").onclick = function () {
    focusedOne.word.Save();
}
document.getElementById("printScreen").onclick = function () {
    focusedOne.printScreen();
}
document.getElementById("printWord").onclick = function () {
    focusedOne.printWord();
}


//启动代码
testTime(begin);