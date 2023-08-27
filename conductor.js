//这个文件负责获取HTML DOM,并调用server库中的函数链接实现元素的操控
const View_area = document.getElementById("view_area");
const User_inter = document.getElementById("userInter");
const word_inter = document.getElementById("wordInter");
//现存世界观察器的列表
let wordViews = [];
let focusedOne;

//一些常用的函数
//测试某个函数用时
function testTime(handle, log = true) {
    let start = new Date();
    {
        handle();
    }
    let end = new Date();
    if (log)
        console.log('执行函数' + handle.name + '()用时：' + (end - start) + 'ms');
    else
        return (end - start);
}

//用于画笔工具，裁剪工具和运行工具的转换
//画笔工具
function pen(ev) {

}

//印章工具
function signet(ev) {

}

//捕获工具
function crop(ev) {

}

//用于转换显示模式，与css和HTML配合转换界面样式，待定义
function displayModeSwitch() {

}

//开关工具
function on_off() {
    if (focusedOne.getFollow()) {
        focusedOne.stopFollow();
        focusedOne.word.stop();
    } else {
        focusedOne.word.stepOn(1000);
        focusedOne.display(1000);
    }
}

//启动函数，在页面打开时使用
function begin() {
    User_inter.firstElementChild.innerHTML = "游客玩家";
    User_inter.lastElementChild.innerHTML =
        new Intl.DateTimeFormat("zn-ch", {year: "numeric", month: "2-digit", day: "2-digit"}).format()
            .replace('/', '-').replace('/', '');

    word_inter.firstElementChild.innerHTML = "世界1";
    word_inter.lastElementChild.innerHTML = User_inter.lastElementChild.innerHTML + "-01";

    View_area.append(document.createElement('div'));
    wordViews.push(new WordView(View_area.lastElementChild, new ActiveSpace(64, 64, true, 'r3')));
    focusedOne = wordViews[0];

}

//启动代码
testTime(begin);

//事件绑定
//键鼠操作修改
document.addEventListener("wheel", function (ev) {
        if (ev.ctrlKey) {
            ev.preventDefault();
            if (ev.detail) {
                if (ev.detail > 0) {
                    focusedOne.scale(0.2);
                } else {
                    focusedOne.scale(-0.2);
                }
            } else if (ev["wheelDelta"]) {
                if (ev["wheelDelta"] > 0)
                    focusedOne.scale(0.2);
                else
                    focusedOne.scale(-0.2);
            }
        }
    }, {passive: false}
)
//一些按钮的功能
document.getElementById("downLoadWord").onclick = function () {
    focusedOne.word.save("word");
}
document.getElementById("printScreen").onclick = function () {
    focusedOne.printScreen();
}
document.getElementById("printWord").onclick = function () {
    focusedOne.printWord();
}
document.getElementById("displayModelSwitch").onclick = function () {
    displayModeSwitch();
}
document.getElementById("fitScreen").onclick = function () {
    focusedOne.fitScreen();
}
document.getElementById("gridLine").onclick = function () {
    focusedOne.gridLineChange();
}
document.getElementById("on-off").onclick = function () {
    if (focusedOne.getFollow()) {
        focusedOne.stopFollow();
        focusedOne.word.stop();
    } else {
        focusedOne.word.stepOn(1000);
        focusedOne.display(1000);
    }
}
document.getElementById("step").onclick = function () {
    if (focusedOne.word.active) {
    } else {
        focusedOne.word.step();
        focusedOne.show();
    }
}
document.getElementById("backgrounder").onclick = function () {
    if (focusedOne.word.active) {
        alert("正在演化运行中！请暂停后再操作");
    } else {
        let remainSteps = Number(/[0-9]+/.exec(document.getElementById("remainStep").innerHTML)[0]);
        if (remainSteps) {
            if (remainSteps > 1000) {
                alert("步数过多！请重设")
                document.getElementById("remainStep").innerHTML = "0";
            } else {
                for (let i = remainSteps; i > 0; i--) {
                    focusedOne.word.step();
                }
                focusedOne.show();
            }
        } else {
            if (remainSteps !== 0)
                alert("请正确输入快进步数！");
        }
    }
}


View_area.onclick = on_off;
document.getElementById("pen").onclick = function () {

}
document.getElementById("signet").onclick = function () {

}
document.getElementById("cropping").onclick = function () {

}
document.getElementById("pantingModel").onclick = function (ev) {
    let e = ev.target;
    if (e.id === "") {

    }

    e.classList.remove("lightUnSign")
}
