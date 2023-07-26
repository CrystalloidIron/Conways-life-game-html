//这个文件负责获取HTML DOM,并调用server库中的函数链接实现元素的操控

const view_area = document.getElementById("view_area");
let focused_page;

function begin() {
    focused_page = new WordView(view_area.lastElementChild);
    view_area.onclick = function () {
        focused_page.word.stepOn(1000);
        focused_page.display(1000);
    }
}

function testTime(handle) {
    let start = new Date().getMilliseconds();
    {
        handle();
    }
    let end = new Date().getMilliseconds();
    console.log('单步用时：' + (end - start).toString() + 'ms');
}
window.setTimeout(function () {
    //时间测试代码
    let start = new Date().getMilliseconds();
    {
        begin();
    }
    let end = new Date().getMilliseconds();
    console.log('启动用时：' + (end - start).toString() + 'ms');
}, 0);
//console.log(focused_page.start);

