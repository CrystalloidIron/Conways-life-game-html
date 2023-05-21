//这个文件负责获取HTML DOM,并调用server库中的函数链接实现元素的操控

let view_area = document.getElementById("view_area")
let focused_page = new WordView(view_area.lastElementChild)
//console.log(focused_page.start);