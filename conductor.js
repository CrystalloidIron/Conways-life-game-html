//这个文件负责获取HTML DOM,并调用server库中的函数链接实现元素的操控
const View_area = document.getElementById("view_area");
const User_inter = document.getElementById("userInter");
const word_inter = document.getElementById("wordInter");
const SignetSet = document.getElementById("signetSet");
const SignetPreview = document.getElementById("signetPreview");
//现存世界观察器的列表
let wordViews = [];
let focusedOne;
//一些常见的结构,用作印章
let signets = [];
signets.push(new Space(4, 4, true, [[0, 0, 0, 0], [0, 1, 1, 0], [0, 1, 1, 0], [0, 0, 0, 0]]));
signets.push(new Space(3, 3, true, [[1, 1, 1], [1, 0, 0], [0, 1, 0]]));
signets.push(new Space(4, 3, true, [[0, 1, 1, 0], [1, 0, 0, 1], [0, 1, 1, 0]]));
signets.push(new Space(1, 3, true, [[1], [1], [1]]));

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

//印章工具管理类
//负责管理印章的选择，预览和效果预览,以及印章捕获等等
const Draw = new function () {
    let chosen = null;
    let signIndex = 0;
    let prePlace = document.createElement("canvas");
    prePlace.id = "prePlace";
    let prePlaceCRC = prePlace.getContext("2d");
    let signetPrePlace = new Preview(prePlace, signets[signIndex]);
    let signetPreview = new Preview(SignetPreview.firstElementChild, signets[0]);
    signetPreview.show();
    let cropMark = document.createElement("div");
    cropMark.id = "cropMark";

    this.changeTool = function (s = "") {
        if (chosen && s === chosen) {
            s = null;
        }
        if (s !== chosen) {
            switch (chosen) {
                case"pen": {
                    View_area.onmousemove = undefined;
                    View_area.onmousedown = undefined;
                    prePlace.style.top = "";
                    prePlace.style.left = "";
                    break
                }
                case"signet": {
                    prePlace.style.left = "";
                    prePlace.style.top = "";
                    prePlace.width = focusedOne.getDotSize();
                    prePlace.height = focusedOne.getDotSize();
                    View_area.onmousemove = undefined;
                    View_area.onclick = undefined;
                    break
                }
                case "crop": {
                    cropPart = [];
                    prePlace.style.opacity = "";
                    prePlace.style.border = "";
                    prePlace.style.top = "";
                    prePlace.style.left = "";
                    prePlace.width = focusedOne.getDotSize();
                    prePlace.height = focusedOne.getDotSize();
                    focusedOne.getPage().removeChild(cropMark);
                    View_area.onmousedown = undefined;
                    break
                }
                default: {
                    View_area.onclick = null;
                    prePlace.width = focusedOne.getDotSize();
                    prePlace.height = focusedOne.getDotSize();
                    focusedOne.getPage().append(prePlace);
                    View_area.onclick = undefined;
                }
            }
            switch (s) {
                case"pen": {
                    View_area.onmousemove = penHover;
                    View_area.onmousedown = penDown;
                    break
                }
                case"signet": {
                    prePlace.width = signets[signIndex].Max_X * focusedOne.getDotSize();
                    prePlace.height = signets[signIndex].Max_Y * focusedOne.getDotSize();
                    View_area.onmousemove = signetFollow;
                    View_area.onclick = putSignet;
                    break
                }
                case "crop": {
                    focusedOne.word.stop();
                    focusedOne.getPage().replaceChild(cropMark, prePlace);
                    focusedOne.getPage().append(prePlace);
                    prePlace.style.border = Math.floor(focusedOne.getDotSize() / 4) + "px dotted var(--graylight)";
                    prePlace.style.opacity = "100%";
                    View_area.onmousedown = cropBeginPlace;
                    break
                }
                default: {
                    prePlaceCRC.clearRect(0, 0, prePlace.width, prePlace.height);
                    focusedOne.getPage().removeChild(prePlace);
                    View_area.onmousedown = undefined;
                    View_area.onclick = on_off;
                    s = null;
                }
            }
            if (chosen)
                document.getElementById(chosen).classList.remove("lightSign");
            chosen = s;
            if (s)
                document.getElementById(chosen).classList.add("lightSign");
        }
    }
    this.changeSignet = function (n = 0) {
        if (n < signets.length && n >= 0 && n !== signIndex) {
            signIndex = n;
            signetPreview.changeSpace(signets[signIndex]);
            signetPreview.show();
            if (chosen === "signet") {
                prePlace.width = signets[signIndex].Max_X * focusedOne.getDotSize();
                prePlace.height = signets[signIndex].Max_Y * focusedOne.getDotSize();
            }
        }
    }
    //画笔悬浮预览,绑定于mouseMove事件
    const penHover = new function () {
        let t = null;
        const follow = (ev) => {
            prePlace.height = focusedOne.getDotSize();
            prePlace.width = focusedOne.getDotSize();
            let p = focusedOne.getDotStart(ev.clientX - focusedOne.getPage().offsetLeft, ev.clientY - focusedOne.getPage().offsetTop);
            prePlace.style.left = p[0] + "px";
            prePlace.style.top = p[1] + "px";
            if (focusedOne.word.addModle(focusedOne.getDotByPosition(ev.clientX - focusedOne.getPage().offsetLeft, ev.clientY - focusedOne.getPage().offsetTop)))
                prePlaceCRC.fillStyle = focusedOne.colorValue.life;
            else
                prePlaceCRC.fillStyle = getComputedStyle(focusedOne.getPage()).backgroundColor;
            prePlaceCRC.fillRect(0, 0, prePlace.width, prePlace.height);
        }
        return (ev) => {
            if (ev.target.parentNode === focusedOne.getPage() && ev.target.nodeName === "CANVAS") {
                if (ev.target.id !== "prePlace") {
                    clearTimeout(t);
                    t = setTimeout(follow, 50, ev);
                } else
                    clearTimeout(t);
            } else {
                prePlace.style.left = "";
                prePlace.style.top = "";
            }
        }
    };
    //画笔落下
    const penDown = (ev) => {
        if (ev.target.parentNode === focusedOne.getPage() && ev.target.nodeName === "CANVAS") {
            let i = focusedOne.getDotIndexByPosition(ev.clientX - focusedOne.getPage().offsetLeft, ev.clientY - focusedOne.getPage().offsetTop);
            if (i) {
                focusedOne.word.add(i[0], i[1]);
                focusedOne.show();
            }
            View_area.onmousemove = penDraw;
            prePlace.style.top = "";
            prePlace.style.left = "";
            View_area.onmouseup = () => {
                View_area.onmousemove = penHover;
                View_area.onmouseup = undefined;
            }
        }
    }
    //画笔落下连续移动
    const penDraw = new function () {
        let p = [null, null];
        return (ev) => {
            if (ev.target.parentNode === focusedOne.getPage() && ev.target.nodeName === "CANVAS") {
                let pp = focusedOne.getDotIndexByPosition(ev.clientX - focusedOne.getPage().offsetLeft, ev.clientY - focusedOne.getPage().offsetTop);
                if (pp && (p[0] !== pp[0] || p[1] !== pp[1])) {
                    focusedOne.word.add(pp[0], pp[1]);
                    if (!focusedOne.getFollow())
                        focusedOne.show();
                    p = pp;
                }
            }
        }
    }
    //让印章预览位置跟随鼠标的函数
    const signetFollow = new function () {
        let lp = [null, null];
        let t = undefined;
        const follow = (p) => {
            prePlace.style.left = p[0] + "px";
            prePlace.style.top = p[1] + "px";
            let part = focusedOne.getDotIndexByPosition(p[0], p[1]);
            part.push(signets[signIndex].Max_X, signets[signIndex].Max_Y);
            let x = focusedOne.word.cut(part);
            x.addModle = focusedOne.word.addModle;
            x.add(0, 0, signets[signIndex]);
            signetPrePlace.changeSpace(x);
            signetPrePlace.show();
            lp = p;
        }
        return (ev) => {
            if (ev.target.parentNode === focusedOne.getPage()) {
                let p = focusedOne.getDotStart(ev.x - focusedOne.getPage().offsetLeft - prePlace.width / 2, ev.y - focusedOne.getPage().offsetTop - prePlace.height / 2);
                if (p[0] !== lp[0] || p[1] !== lp[1]) {
                    if (t)
                        clearTimeout(t);
                    t = setTimeout(follow, 50, p);
                }
            } else {
                prePlace.style.left = "";
                prePlace.style.top = "";
                clearTimeout(t);
                t = undefined;
            }
        }
    };
    //放置印章
    const putSignet = (ev) => {
        let s = focusedOne.getDotIndexByPosition(ev.x - focusedOne.getPage().offsetLeft - prePlace.width / 2, ev.y - focusedOne.getPage().offsetTop - prePlace.height / 2);
        ;
        focusedOne.word.add(s[0], s[1], signets[signIndex])
        if (!focusedOne.getFollow())
            focusedOne.show();
    }

    let cropPart = [];
    //确定起始位置并跟随显示结束位置
    const cropBeginPlace = new function () {
        let s = [null, null];
        const cropBegin = (ev) => {
            if (ev.target.parentNode === focusedOne.getPage()) {
                let p = focusedOne.getDotStart(ev.clientX - focusedOne.getPage().offsetLeft, ev.clientY - focusedOne.getPage().offsetTop);
                if (p) {
                    let border = Math.floor(focusedOne.getDotSize() / 4);
                    prePlace.style.left = p[0] - border + "px";
                    prePlace.style.top = p[1] - border + "px";
                    prePlaceCRC.putImageData(focusedOne.getImage((p[0] - 23), (p[1] - 3), prePlace.width, prePlace.height), 0, 0)
                    s = p;
                    View_area.onmousedown = cropEnd;
                    View_area.onmousemove = cropFollow;
                    View_area.onmouseup = () => {
                        View_area.onmousemove = undefined;
                        View_area.onmouseup = undefined;
                    }
                }
            }
        }
        const setCropEnd = (pp = [0, 0]) => {
            let border = Math.floor(focusedOne.getDotSize() / 4), p = [s[0], s[1]];
            if (pp[0] < s[0])
                p[0] = pp[0];
            if (pp[1] < s[1])
                p[1] = pp[1];
            prePlace.width = Math.abs(pp[0] - s[0]) + focusedOne.getDotSize();
            prePlace.height = Math.abs(pp[1] - s[1]) + focusedOne.getDotSize();
            prePlace.style.left = p[0] - border + "px";
            prePlace.style.top = p[1] - border + "px";
            if (prePlace.width && prePlace.height) {
                prePlaceCRC.putImageData(focusedOne.getImage(p[0] - 23, p[1] - 3, prePlace.width, prePlace.height), 0, 0)
                let i = focusedOne.getDotIndexByPosition(p[0], p[1])
                cropPart = [i[0], i[1], prePlace.width / focusedOne.getDotSize(), prePlace.height / focusedOne.getDotSize()]
            }
            View_area.onmousedown = cropDelete;
        }
        const cropFollow = (ev) => {
            let pp = focusedOne.getDotStart(ev.clientX - focusedOne.getPage().offsetLeft, ev.clientY - focusedOne.getPage().offsetTop);
            if (pp && (pp[0] !== s[0] || pp[1] !== s[1])) {
                setCropEnd(pp);
            }
        }
        //确定结束位置
        const cropEnd = (ev) => {
            if (ev.target.parentNode === focusedOne.getPage()) {
                let p = focusedOne.getDotStart(ev.clientX - focusedOne.getPage().offsetLeft, ev.clientY - focusedOne.getPage().offsetTop);
                if (p) {
                    setCropEnd(p);
                }
            }
        }
        //取消框选
        const cropDelete = () => {
            s = [null, null];
            cropPart = [];
            prePlaceCRC.clearRect(0, 0, prePlace.width, prePlace.height);
            prePlace.style.top = "";
            prePlace.style.left = "";
            prePlace.width = focusedOne.getDotSize();
            prePlace.height = prePlace.width;
            View_area.onmousedown = cropBegin;
        }

        return cropBegin;
    }
    //保存世界片段
    this.saveCrop = function () {
        if (cropPart.length) {
            let x = focusedOne.word.cut(cropPart);
            if (x) {
                signets.push(x);
                this.changeSignet(signets.length - 1);
                return true;
            }
        }
        return false;
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
            if ([].indexOf.call(focusedOne.getPage().childNodes, ev.target) === 1) {
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
//ctrl+鼠标左键实现拖动画面,仍可优化
View_area.addEventListener("mousedown", function (ev) {
    if (ev.ctrlKey)
        if (ev.target.parentNode === focusedOne.getPage() && ev.target.nodeName === "CANVAS") {
            let sx = ev.clientX, sy = ev.clientY, click;
            const restore = () => {
                View_area.onmousemove = null;
                View_area.onclick = click;
            }
            click = View_area.onclick;
            View_area.onclick = restore;
            View_area.onmousemove = (ev) => {
                if (ev.ctrlKey) {
                    focusedOne.move(sx - ev.clientX, sy - ev.clientY);
                    sx = ev.clientX;
                    sy = ev.clientY;
                }
            }
        }
})
//实现印章列表拖动显示
SignetSet.onmousedown = (ev) => {
    let sx = ev.clientX, click = SignetSet.onclick;
    const scroll = (ev) => {
        SignetSet.scrollBy(-(ev.clientX - sx), 0);
        sx = ev.clientX;
    }
    const activeScroll = (ev) => {
        if (Math.abs(ev.x - sx) > 2) {
            scroll(ev);
            SignetSet.onclick = () => {
                SignetSet.onclick = click;
            };
            SignetSet.onmousemove = scroll;
        }
    }
    const end = () => {
        SignetSet.onmousemove = undefined;
        SignetSet.onmouseup = undefined;
        SignetSet.onmouseleave = undefined;
    };
    SignetSet.onmousemove = activeScroll;
    SignetSet.onmouseup = end;
    SignetSet.onmouseleave = (ev) => {
        if (ev.target === ev.currentTarget)
            end();
    }
}
//一些按钮的功能
document.getElementById("controlBoard").onclick = function (ev) {
    switch (ev.target.id) {
        case"downLoadWord": {
            focusedOne.word.save("word");
            break
        }
        case "printScreen": {
            focusedOne.printScreen();
            break
        }
        case "printWord": {
            focusedOne.printWord();
            break
        }
        case "displayModelSwitch": {
            displayModeSwitch();
            break
        }
        case"fitScreen": {
            focusedOne.fitScreen();
            break
        }
        case"gridLine": {
            focusedOne.gridLineChange();
            break
        }
    }
}
document.getElementById("runningBroad").onclick = function () {
    Draw.changeTool();
}
document.getElementById("on-off").onclick = on_off;
document.getElementById("step").onclick = function () {
    if (!focusedOne.word.active) {
        focusedOne.word.step();
        focusedOne.show();
    }
}
document.getElementById("backgrounder").onclick = new function () {
    let running = false;
    return function (ev) {
        if (running || focusedOne.word.active) {
            alert("正在演化运行中！请暂停后再操作");
        } else {
            let remainSteps = Number(/[0-9]+/.exec(document.getElementById("remainStep").innerHTML)[0]);
            if (remainSteps) {
                if (remainSteps > 10000) {
                    alert("步数过多！请重设")
                    document.getElementById("remainStep").innerHTML = "0";
                } else {
                    ev.target.classList.add("lightSign");
                    running = true;
                    const waite = () => {
                        focusedOne.word.backgrounder(remainSteps);
                        focusedOne.show();
                        ev.target.classList.remove("lightSign");
                        running = false;
                    }
                    setTimeout(waite, 5);
                }
            } else {
                if (remainSteps !== 0)
                    alert("请正确输入快进步数！");
            }
        }
    }
}

document.getElementById("pantingTool").onclick = function (ev) {
    Draw.changeTool(ev.target.id);
}
document.getElementById("pantingModel").onclick = new function () {
    let selectedElement = document.getElementById("union");
    selectedElement.classList.add("lightSign");
    return function (ev) {
        let e = ev.target;
        if (e.id !== selectedElement.id) {
            //更改复合方式和 预览方式
            switch (e.id) {
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
SignetSet.onclick = function (ev) {
    if (ev.target.parentNode === SignetSet) {
        let x = [].indexOf.call(SignetSet.children, ev.target);
        if (x < signets.length)
            Draw.changeSignet(x);
        else {
            if (Draw.saveCrop(Boolean(x - signets.length))) {
                let ele = document.createElement("button");
                ele.classList.add("logo2", "selfDefine");
                SignetSet.children[signets.length - 1].insertAdjacentElement("beforebegin", ele);
            }
        }
    }
}

