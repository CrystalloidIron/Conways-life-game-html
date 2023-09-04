//这个文件负责获取HTML DOM,并调用server库中的函数链接实现元素的操控
const View_area = document.getElementById("view_area");
const User_inter = document.getElementById("userInter");
const word_inter = document.getElementById("wordInter");
const SignetPreview = document.getElementById("signetPreview");
//现存世界观察器的列表
let wordViews = [];
let focusedOne;
//一些常见的结构,用作印章
let signetSet = [];
signetSet.push(new Space(4, 4, true, [[0, 0, 0, 0], [0, 1, 1, 0], [0, 1, 1, 0], [0, 0, 0, 0]]));
signetSet.push(new Space(3, 3, true, [[1, 1, 1], [1, 0, 0], [0, 1, 0]]));
signetSet.push(new Space(4, 3, true, [[0, 1, 1, 0], [1, 0, 0, 1], [0, 1, 1, 0]]));
signetSet.push(new Space(1, 3, true, [[1], [1], [1]]));

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
//画笔工具管理类
function pen(ev) {

}

//印章工具管理类
//负责管理印章的选择，预览和效果预览,以及印章捕获等等
const Signet = new function () {
    let signIndex = 0;
    let prePlace = document.createElement("canvas");
    prePlace.id = "prePlace";
    let signetPrePlace = new Preview(prePlace, signetSet[signIndex]);
    let signetPreview = new Preview(SignetPreview.firstElementChild, signetSet[0]);
    let cropMark = document.createElement("div");
    cropMark.id = "cropMark";
    let cropPart = document.createElement("div");
    cropPart.id = "cropPart";
    this.changeSignet = function (n = 0) {
        if (n < signetSet.length && n >= 0 && n !== signIndex) {
            signIndex = n;
            signetPreview.changeSpace(signetSet[0])
            signetPrePlace.changeSpace(signetSet[signIndex]);
        }
    }
    //让印章预览位置跟随鼠标的函数
    const prePlaceFollowMouse = () => {
    };
    //开启印章预放置功能
    this.activeSignetPrePlace = function (ev) {
        focusedOne.getPage().append(prePlace);
        prePlace.style.display = "none";
        View_area.addEventListener("mouseover", prePlaceFollowMouse);
    }
    //停止预放置功能
    this.stopSignetPrePlace = function (ev) {
        View_area.removeEventListener("mouseover", prePlaceFollowMouse)
        focusedOne.getPage().removeChild(prePlace);
    }
    //放置印章
    this.putSignet = function (ev) {

    }
    //确定起始位置并跟随显示结束位置
    const cropBeginPlace = () => {
    }
    //确定结束位置
    const cropEndPlace = () => {
    }
    //开始捕获准备工作
    this.activeCrop = function (ev) {
        focusedOne.getPage().append(cropMark, cropPart);


    }
    //停止捕获结束工作
    this.stopCrop = function (ev) {

        focusedOne.getPage().remove(cropMark, cropPart);
        cropPart.style.background = "none";
    }
    //保存世界片段
    this.saveCrop = function () {

    }
}

//用于转换显示模式，与css和HTML配合转换界面样式，待定义
function displayModeSwitch() {

}

//开关工具
function on_off() {
    if (focusedOne.getFollow()) {
        focusedOne.stopFollow();
        focusedOne.word.stop();
        document.getElementById("on-off").classList.remove("lightSign");
    } else {
        document.getElementById("on-off").classList.add("lightSign");
        focusedOne.word.stepOn(1000);
        focusedOne.display(1000);
    }
}

//启动函数，在页面打开时使用
function begin() {
    //用户信息初始化
    User_inter.firstElementChild.innerHTML = "游客玩家";
    User_inter.lastElementChild.innerHTML =
        new Intl.DateTimeFormat("zn-ch", {year: "numeric", month: "2-digit", day: "2-digit"}).format()
            .replace('/', '-').replace('/', '');
    //世界信息初始化
    word_inter.firstElementChild.innerHTML = "世界1";
    word_inter.lastElementChild.innerHTML = User_inter.lastElementChild.innerHTML + "-1";
    //显示内容初始化
    View_area.append(document.createElement('div'));
    wordViews.push(new WordView(View_area.lastElementChild,
        new ActiveSpace(Math.ceil((View_area.clientWidth - 26) / 8),
            Math.ceil((View_area.clientHeight - 26) / 8),
            true, 'r3')));
    focusedOne = wordViews[0];
}

//启动代码
testTime(begin);

//事件绑定
//键鼠操作修改
//Ctrl+鼠标滚轮实现画面以鼠标为中心缩放
document.addEventListener("wheel", function (ev) {
        if (ev.ctrlKey) {
            ev.preventDefault();
            if (ev.target.parentNode === focusedOne.getPage() && ev.target.nodeName === "CANVAS") {
                if (ev.detail) {
                    if (ev.detail > 0) {
                        focusedOne.scale(1.2, ev.offsetX, ev.offsetY);
                    } else {
                        focusedOne.scale(0.8, ev.offsetX, ev.offsetY);
                    }
                } else if (ev["wheelDelta"]) {
                    if (ev["wheelDelta"] > 0) {
                        focusedOne.scale(1.2, ev.offsetX, ev.offsetY);
                    } else {
                        focusedOne.scale(0.8, ev.offsetX, ev.offsetY);
                    }
                }
            }
        }
}, {passive: false})
//ctrl+鼠标左键实现拖动画面
View_area.addEventListener("mousedown", function (ev) {
    if (ev.ctrlKey)
        if (ev.target.parentNode === focusedOne.getPage() && ev.target.nodeName === "CANVAS") {
            let sx = ev.clientX, sy = ev.clientY, click;
            click = View_area.onclick;
            View_area.onclick = () => {
                restore();
            }
            const restore = () => {
                View_area.onmousemove = null;
                View_area.onclick = click;
            }
            View_area.onmousemove = (ev) => {
                if (ev.ctrlKey) {
                    focusedOne.move(sx - ev.clientX, sy - ev.clientY);
                    sx = ev.clientX;
                    sy = ev.clientY;
                }
            }
        }
})

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
document.getElementById("runningBroad").onclick = function () {
    View_area.onclick = on_off;
}
document.getElementById("on-off").onclick = on_off;
document.getElementById("step").onclick = function () {
    if (!focusedOne.word.active) {
        focusedOne.word.step();
        focusedOne.show();
    }
}
document.getElementById("backgrounder").onclick = function (ev) {
    if (focusedOne.word.active) {
        alert("正在演化运行中！请暂停后再操作");
    } else {
        let remainSteps = Number(/[0-9]+/.exec(document.getElementById("remainStep").innerHTML)[0]);
        if (remainSteps) {
            if (remainSteps > 10000) {
                alert("步数过多！请重设")
                document.getElementById("remainStep").innerHTML = "0";
            } else {
                ev.target.classList.add("lightSign");
                const waite = () => {
                    focusedOne.word.backgrounder(remainSteps);
                    focusedOne.show();
                    ev.target.classList.remove("lightSign");
                }
                let t = setTimeout(waite, 5);
            }
        } else {
            if (remainSteps !== 0)
                alert("请正确输入快进步数！");
        }
    }
}

document.getElementById("pen").onclick = function () {

}
document.getElementById("signet").onclick = function () {

}
document.getElementById("cropping").onclick = function () {

}
document.getElementById("pantingModel").onclick = new function () {
    let selectedElement = document.getElementById("union");
    selectedElement.classList.add("lightSign");
    return function (ev) {
        let e = ev.target;
        if (e.id !== selectedElement.id) {
            //更改复合方式和 预览方式
            switch (ev.id) {
                case "union": {
                    focusedOne.word.addModle = union;
                    break
                }
                case"intersection": {
                    focusedOne.word.addModle = intersection;
                    break
                }
                case"erase": {
                    focusedOne.word.addModle = erase;
                    break
                }
                case"reverse": {
                    focusedOne.word.addModle = reverse;
                    break
                }
            }
            //更改亮灯提示
            selectedElement.classList.remove("lightSign");
            selectedElement = e;
            selectedElement.classList.add("lightSign");
        }
    }
}


