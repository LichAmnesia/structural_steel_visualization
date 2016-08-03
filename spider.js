var superagent = require('superagent');  
var cheerio = require('cheerio');  
var async = require('async');


//Ditto, path module
var path = require('path');
var fs = require('fs');
var SQL = require('sql.js');
var db;
try {
// Load the db
    var filebuffer = fs.readFileSync('steel.sqlite');
    db = new SQL.Database(filebuffer);
}catch(err) {
    alert(err + "数据库不存在");
}



// console.log('爬虫程序开始运行......');

var datetime = '20160729'
var city = 'nanjing'
var product_model = '10'
var model = 'HRB400'
// 第一步，发起getData请求，获取所有列表


var spider = function(city, datetime, callback){
    superagent  
    .post('http://'+ city + '.96369.net/city/Quotation/quotation/1/' + datetime + '/')
    .send({ 
        // 请求的表单信息Form data
    })
       // Http请求的Header信息
   .set('Accept', 'application/json, text/javascript, */*; q=0.01')
   .set('Content-Type','application/x-www-form-urlencoded; charset=UTF-8')
   .end(function(err, res){          
        // 请求返回后的处理
        // 将response中返回的结果转换成JSON对象
        var reg = new RegExp("<td>[^\d]" + product_model + "</td><td>" + model + "</td><td>[\\d]+</td>","g");
        // var reg = /<td>φ10<\/td><td>HRB400<\/td><td>[\d]+<\/td>/g;
        // alert(reg);
        console.log(reg);
        var price_string = res.text.match(reg)[0];
        console.log(price_string);
        var price_reg = /[\d]+/g;
        var price = price_string.match(price_reg)[2];
        console.log(price);
        callback(datetime, city, price, product_model, model);
    }); 
}

var saveSql = function(datetime, city, price, product_model, model){
    // Execute some sql
    var sqlstr = "SELECT count(*) FROM sqlite_master WHERE type='table' AND name='steel' ";
    var table_exist = db.exec(sqlstr);
    if (table_exist[0]['values'][0][0] > 0){
        console.log("表已经存在");
    }else {
        sqlstr = "CREATE TABLE steel (datetime varchar(50), city varchar(20), price int, product_model varchar(20)," + 
        "model varchar(10), status varchar(10), PRIMARY KEY (datetime, city));";
        db.run(sqlstr); // Run the query without returning anything
        console.log("表已经创建");
    }
    sqlstr = "SELECT count(*) FROM steel WHERE datetime = " + datetime + " AND city = '" + city + "';";
    sqlres = db.exec(sqlstr);
    console.log(sqlres[0]['values']);
    if (sqlres[0]['values'][0][0] > 0){
        sqlstr = "UPDATE steel SET datetime = " + datetime + ", city = '" + city + "', price = " + price + 
                 ", product_model = " + product_model + ", model = '" + model + "'" + 
                 "WHERE datetime = " + datetime + " AND city = '" + city + "';";
    }else {
        console.log("插入数据");
        sqlstr = "INSERT INTO steel VALUES (" + datetime + ", '" + city + "', " + price + ", " + product_model + ", '" + model + "', '');";
    }
    console.log(sqlstr);
    db.run(sqlstr); // Run the query without returning anything


    // sqlstr = "INSERT INTO steel VALUES (" + datetime + ", '" + city + "', " + price + ", " + product_model + ", '" + model + "', '');";
    
    var data = db.export();
    var buffer = new Buffer(data);
    fs.writeFileSync("steel.sqlite", buffer);
}

// spider('shanghai', '20160606', saveSql);

// require('nw.gui').Window.get().showDevTools()

// var echarts = require('echarts');
//         // 基于准备好的dom，初始化echarts实例
//         var myChart = echarts.init(document.getElementById('nanjingchart'));
//         // 绘制图表
//         myChart.setOption({
//             title: { text: 'ECharts 入门示例' },
//             tooltip: {},
//             xAxis: {
//                 data: ["衬衫","羊毛衫","雪纺衫","裤子","高跟鞋","袜子"]
//             },
//             yAxis: {},
//             series: [{
//                 name: '销量',
//                 type: 'bar',
//                 data: [5, 20, 36, 10, 10, 20]
//             }]
//         });       