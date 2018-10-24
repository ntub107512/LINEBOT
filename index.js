//--------------------------------
// 載入必要的模組
//--------------------------------
var linebot = require('linebot');
var express = require('express');
var fs = require('fs'); 
const { Client } = require('pg');

//--------------------------------
// 填入自己在linebot的channel值
//--------------------------------
var bot = linebot({
    channelId: '1609140158',
    channelSecret: 'b7bef109f8630709b6ee0e7b4bb5db8c',
    channelAccessToken: '1DPqg2XQfiXs60wWZqCjHYKWvstKGQ1eWHBxc0yZRqoqpkRD5AF8ALr1XWULO2xfCijLoYK82Uzqd3xQgZvnKaN6Tdao5oWi5wQQcAfoKR1tq1pVX0Okn/g+ynvjyBgpHi6oFQ2tAoh3EEW8DKwcnAdB04t89/1O/w1cDnyilFU='
});


//-----------------------------------------------------
// 自己的URL位址(圖片資料夾)及資料庫連結位址
//-----------------------------------------------------
var webURL = 'https://ntub107512.herokuapp.com/imgs/';
var pgConn = 'postgres://fssnyjsyewcidp:6898ec818a0917bd7cfb219ae9d66ffdfa06b7ccac81d9c14ce84e22341f7097@ec2-54-83-50-145.compute-1.amazonaws.com:5432/d13uo0p9g4s0tt';

//-------------------------------------------------
// 所有認識的userId陴列.
// 如果使用Heroku的免費服務,
// 主機休眠後再啟動時, 原存在記憶體的陣列內容會清空.
// 應保存資料最好寫入DB, 而非記憶體中.
//-------------------------------------------------
allKnownUsers=[]
//--------------------------------
// 加入或封鎖後再加入
//--------------------------------
bot.on('follow', function (event){
    event.source.profile().then(
        function (profile) {
            //加入使用者
            var userExist=false;
			
            for(var i=0; i<allKnownUsers.length; i++){
                if(allKnownUsers[i]==profile.userId){
                    userExist=true;
                    break;
                }
            }
			
            if(!userExist){
                allKnownUsers.push(profile.userId);
                
                /*db add data*/
               
                //取得使用者資料及傳回文字
                var userName = profile.displayName;
                var userId = profile.userId;
            //    var no = event.message.text;		

                //建立資料庫連線           
                var client = new Client({
                    connectionString: pgConn,
                    ssl: true,
                })
                
                client.connect();
                
                //建立一個新資料物件
                var newData={
                    userId:userId,
                    userName:userName,
                }	
                console.log(userName);
                console.log(userId);
                client.query("INSERT INTO members(lineid,name) VALUES ($1, $2)", [userId, userName], (err, results) => {    
                    
                    //回覆查詢結果
                    /*if (err){
                        event.reply('找不到資料');
                    }else{						
                        event.reply('收到');
                    }*/
                })
                // callback
                /*client.query(text, values, (err, res) => {
                    if (err) {
                    console.log(err.stack)
                    } else {
                    console.log(res.rows[0])
                    // { name: 'brianc', email: 'brian.m.carlson@gmail.com' }
                    }
                })*/
            }
			
            //顯示目前使用者
            console.log(allKnownUsers);			
        }
    );
});

//--------------------------------
// 封鎖
//--------------------------------
bot.on('unfollow', function (event) {
    event.source.profile().then(
        function (profile) {
            var userExist=true;
            //取消使用者		
            for(var i=0; i<allKnownUsers.length; i++){
                if(allKnownUsers[i]==profile.userId){
                    userExist.splice(i, 1);
                    break;
                }
            }
			
            //顯示目前使用者
            console.log(allKnownUsers);
        }
    );
});

//--------------------------------
// 機器人接受訊息的處理
//--------------------------------
bot.on('message', function(event) {
    event.source.profile().then(
        function (profile) {		
            
            //將訊息推給所有使用者

            //建立資料庫連線           
            var client = new Client({
                connectionString: pgConn,
                ssl: true,
            })
            
            client.connect();

            /* image */
            //==================================        
            //如果使用者上傳訊息的型態是圖片
            //==================================
            /*
            if(event.message.type=='image'){
                console.log('++++++++++image');
                //取得使用者上傳圖片			
                event.message.content().then(function (content) {
                    //以base64編碼字串取回圖片	
                    var data = content.toString('base64');
						
                    //將字串轉回圖片資料							
                    var buf = Buffer.from(data, 'base64');						
						
                    //以訊息編號作為圖片名稱						
                    var fileName = event.message.id + '.jpg';					  
										
                    //將圖片寫入檔案
                    fs.writeFile('./public/imgs/' + fileName, buf, (err) => {
                        if (err){throw err;}
						
                        //待寫DB資料
                        console.log(profile.userId);
                        console.log(profile.displayName);
                        console.log(fileName);
										
                        //建立資料庫連線           
                        var client = new Client({
                            connectionString: pgConn,
                            ssl: true,
                        })              			
							
                        client.connect();
			
                        //寫出資料(資料庫欄位名稱不使用駝峰命名, 否則可能出錯)
                        client.query("insert into message(uid, name, img) values ($1, $2, $3)", [profile.userId, profile.displayName, fileName], (err, results) => {    	
                            //寫出結果
                            if (err){
                                console.log('DB失敗');
                            }else{						
                                console.log('已存DB');
                            }
 
                            //關閉連線
                            client.end();
							
                            //回覆使用者剛上傳的圖片
                            return event.reply({
                                type: 'image',
                                originalContentUrl: webURL + fileName,
                                previewImageUrl: webURL + fileName
                            });		
                        });									
                    });									
                });	
            }*/ //else{
                if(event.message.text=="開始我的每日測驗"){
                    event.reply({
                        "type": "template",
                        "altText": "每日測驗",
                        "template": {
                            "type": "buttons",
                            "thumbnailImageUrl": "https://sowhc.sow.org.tw/html/observation/plant/a06plant/a060602-dhu-gin/s01.JPG",
                            "imageAspectRatio": "rectangle",
                            "imageSize": "cover",
                            "imageBackgroundColor": "#FFFFFF",
                            "title": "植物猜猜猜！ 你對植物的認知有多少呢？",
                            "text": "照片中的植物是什麼呢？",
                            "defaultAction": {
                                "type": "uri",
                                "label": "View detail",
                                "uri": "https://sowhc.sow.org.tw/html/observation/plant/a06plant/a060602-dhu-gin/s01.JPG"
                            },
                            "actions": [
                                {
                                  "type": "postback",
                                  "label": "紅瓶刷子樹",
                                  "data": "答錯了哦～明天再來試試"
                                },
                                {
                                  "type": "postback",
                                  "label": "南天竹",
                                  "data": "答錯了哦～"
                                },
                                {
                                  "type": "postback",
                                  "label": "朱槿",
                                  "data": "恭喜你！答對了！"
                                },
                                {
                                  "type": "postback",
                                  "label": "小葉厚殼樹",
                                  "data": "答錯了哦～"
                                }
                            ]
                        }
                      });
                     bot.on('postback', function (event) {
                        if(event.postback.data=="恭喜你！答對了！"){
                            event.reply(
                                {
                                    "type": "text",
                                    "text": '恭喜你！答對了！'
                                }
                            );  
                          }else if(event.postback.data=="答錯了哦～明天再來試試"){
                            event.reply(
                                {
                                    "type": "text",
                                    "text": '答錯了哦～明天再來試試'
                                }
                            ); 
                          }else if(event.postback.data=="答錯了哦～"){
                            event.reply(
                                {
                                    "type": "text",
                                    "text": '答錯了哦～'
                                }
                            );  
                          }
                      });
    
                }
                

                if (event.message.text=='abc123'){
                    console.log('++++++++++abc123');
                    //==================================        
                    //如果使用者上傳訊息的型態不是圖片
                    //==================================			
                    return event.reply([
                        {
                            "type": "text",
                            "text": '發送者姓名:' + profile.displayName
                        },
                        {
                            "type": "text",
                            "text": '發送者編號:' + profile.userId
                        },
                        {
                            "type": "text",
                            "text": '發送者訊息:' +  event.message.text
                        }
                    ]);                
                }	

                if (event.message.text=='推播我的圖片'){
                    //----------------------------
                    var allknownusers=[];

                    //建立資料庫連線           
                    var client = new Client({
                        connectionString: pgConn,
                        ssl: true,
                    })
                    event.reply({
                        type: 'template',
                        altText: '推播圖片?',
                        template: {
                          type: 'confirm',
                          text: '推播這些圖片?',
                          actions: [{
                            type: 'message',
                            label: '是的',
                            text: '推播吧!',
                            data: '啟用推播圖片'
                          }, {
                            type: 'message',
                            label: '不了',
                            text: '不推播了',
                            data: '不使用推播圖片'
                          }]
                        }
                      });
                }
                if (event.message.text=='推播吧!'){
                //----------------------------
                 var allknownusers=[];

                 client.query("select lineid from members", (err,results) => {
                 
                     console.log('***********');
                     console.log (results.rows.length);
                     for (var i = 0; i < results.rows.length; i++) {
                         console.log('==================');
                         console.log (results.rows[i].lineid);
                         allknownusers.push(results.rows[i].lineid);
                     }
                     
                     //回覆查詢結果
                     /*if (err){
                         event.reply('找不到資料');
                     }else{						
                         //var userName=results.rows[0].name;
                         event.reply(allKnownUsers());
                     }*/
                     

                     console.log(allknownusers);
                     console.log(profile.userId);

                     
                     client.query("select * from picpush where uid = $1 ",[profile.userId], (err,results) => {
                         
                         console.log('***********');
                         console.log (results.rows.length);
                         var msg=[];
                         for (var i = 0; i < results.rows.length; i++) { //results.rows.length 5
                             console.log('==================');
                             console.log (results.rows[i].img); 
                             
                             msg.push ( 

                                {
                                    "type": "template",
                                    "altText": "接收到圖片",
                                    "template": {
                                        "type": "buttons",
                                        "thumbnailImageUrl": 'https://ntub107512.herokuapp.com/imgs/'+ results.rows[i].img,
                                        "imageAspectRatio": "rectangle",
                                        "imageSize": "cover",
                                        "imageBackgroundColor": "#FFFFFF",
                                        "title": " 圖片敘述: ",
                                        "text": results.rows[i].word,
                                        "defaultAction": {
                                            "type": "uri",
                                            "label": "View detail",
                                            "uri": 'https://ntub107512.herokuapp.com/imgs/'+ results.rows[i].img
                                        },
                                        "actions": [
                                            {
                                              "type": "postback",
                                              "label": "按讚",
                                              "data": "按讚"
                                            }
                                        ]
                                    }
                                  }
                                 /*{
                                 type: 'template',
                                 altText: '已接收到圖片',
                                 template: {
                                 type: 'buttons',
                                 thumbnailImageUrl: 'https://myapp-chris2.herokuapp.com/imgs/'+ results.rows[i].img,
                                 title: '圖片敘述: ',
                                 text:results.rows[i].word,
                                 actions: [{
                                     type: 'postback',
                                     label: '按讚',
                                     data: '按讚'
                                 },{
                                     type: 'uri',
                                     label: 'View detail',
                                     uri: 'http://example.com/page/123'
                                 }]
                                 }
                             }*/
                             );
                         }
                         //關閉連線
                         client.end();

                         console.log (msg);

                         
                         
                         //allknownusers.push(results.rows[i].img);
                         return bot.push(
                             allknownusers, 
                             msg
                         );
                         
                         
                     });
                 
                 })
               }
               var fileName;
                // if(event.message.text=='選擇三張推播圖片'){
                        console.log('=======使用者選擇三張推播圖片=======');
                        if(event.message.type=='image'){
                             //取得使用者上傳圖片			
                            event.message.content().then(function (content) {
                            //以base64編碼字串取回圖片	
                            var data = content.toString('base64');
                                
                            //將字串轉回圖片資料							
                            var buf = Buffer.from(data, 'base64');						
                                
                            //以訊息編號作為圖片名稱						
                            fileName = event.message.id + '.jpg';					  
                                                
                            //將圖片寫入檔案
                            fs.writeFile('./public/imgs/' + fileName, buf, (err) => {
                                if (err){throw err;}
                                
                                //待寫DB資料
                                console.log(profile.userId);
                                console.log(profile.displayName);
                                console.log(fileName);
                                                
                                //建立資料庫連線           
                                var client = new Client({
                                    connectionString: pgConn,
                                    ssl: true,
                                })              			
                                    
                                client.connect();
                    
                                //寫出資料(資料庫欄位名稱不使用駝峰命名, 否則可能出錯)
                                client.query("insert into picpush(uid, img) values ($1, $2)", [profile.userId,fileName], (err, results) => {    	
                                    //寫出結果
                                    if (err){
                                        console.log('DB失敗');
                                    }else{						
                                        console.log('已存DB');
                                    }
        
                                    //關閉連線
                                    client.end();
                                    
                                    //回覆使用者剛上傳的圖片
                                    /*return event.reply({
                                        type: 'image',
                                        originalContentUrl: webURL + fileName,
                                        previewImageUrl: webURL + fileName
                                    });		*/
                                });									
                            });									
                        });	
                        }
                    //儲存使用者要推播的敘述
                    if(event.message.type !='image' && event.message.text !='推播吧!' && event.message.text !='推播我的圖片' &&event.message.text !="開始我的每日測驗" ){
                        client.connect();
                            client.query("UPDATE picpush SET word=$1 where uid=$2 AND word IS NULL", [event.message.text,profile.userId], (err, results) => {
                                //寫出結果
                                if (err){
                                    console.log('DB失敗');
                                }else{						
                                    console.log('敘述新增成功');
                                }
                                client.end();
                            });	 
                    }
                    
                       //---------------------------
                   // } 
                //}
             /*   if (event.message.text=='pushpic'){
                   
                   
                } */
                        
                        
 
                    //----------------------------
                    console.log('++++++++++SendMyPics');
                    //------------------------------
                  
                
               
          
            
                    //回覆查詢結果
                    /*if (err){
                        event.reply('找不到資料');
                    }else{						
                        //var userName=results.rows[0].name;
                        event.reply(allKnownUsers());
                    }*/
    
                    //關閉連線
                    /*
                    client.end();
    
                    return bot.push(
                        allknownusers, 
                        [
                            {
                                "type": "text",
                                "text": '發送者姓名:' + profile.displayName
                            },
                            {
                                "type": "text",
                                "text": '發送者編號:' + profile.userId
                            },
                            {
                                "type": "text",
                                "text": '發送者訊息:' +  event.message.text
                            }
                        ]
                    );	
                })


                   //------------------------------

                }	
                
            }	

            

            /*pull out data, add in array*/
            
/*
            client.query("select lineid from members", (err,results) => {


                var allknownusers=[];
                console.log('***********');
                console.log (results.rows.length);
				for (var i = 0; i < results.rows.length; i++) {
                    console.log('==================');
                    console.log (results.rows[i].lineid);
                    allknownusers.push(results.rows[i].lineid);
                }
                
                //回覆查詢結果
                /*if (err){
                    event.reply('找不到資料');
                }else{						
                    //var userName=results.rows[0].name;
                    event.reply(allKnownUsers());
                }*/

                //關閉連線
                /*
                client.end();

                return bot.push(
                    allknownusers, 
                    [
                        {
                            "type": "text",
                            "text": '發送者姓名:' + profile.displayName
                        },
                        {
                            "type": "text",
                            "text": '發送者編號:' + profile.userId
                        },
                        {
                            "type": "text",
                            "text": '發送者訊息:' +  event.message.text
                        }
                    ]
                );	
            })
            
        }
    );*/
    })

});

bot.on('postback', function (event) {
    event.source.profile().then(
        function (profile) {
    if(event.postback.data=="按讚"){
         //----------------------------
    var allknownusers=[];
    //建立資料庫連線           
    var client = new Client({
        connectionString: pgConn,
        ssl: true,
    })              			
        
    client.connect();
 client.query("select lineid from members", (err,results) => {
 
     console.log('***********');
     console.log (results.rows.length);
     for (var i = 0; i < results.rows.length; i++) {
         console.log('==================');
         console.log (results.rows[i].lineid);
         allknownusers.push(results.rows[i].lineid);
     }
     
     //回覆查詢結果
     /*if (err){
         event.reply('找不到資料');
     }else{						
         //var userName=results.rows[0].name;
         event.reply(allKnownUsers());
     }*/
     

     console.log(allknownusers);
     console.log(profile.userId);
 client.end();
   
        return bot.push(
            allknownusers,[
            {
                type: 'sticker',
                packageId: 1,
                stickerId: 125
            } 
            ]
            ); 
           
        })
      }
    })
  });
//--------------------------------
// 建立一個網站應用程式app
// 如果連接根目錄, 交給機器人處理
//--------------------------------
const app = express();
const linebotParser = bot.parser();
app.post('/', linebotParser);


//--------------------------------
// 可直接取用檔案的資料夾
//--------------------------------
app.use(express.static('public'));


//--------------------------------
// 監聽3000埠號, 
// 或是監聽Heroku設定的埠號
//--------------------------------
var server = app.listen(process.env.PORT || 3000, function() {
    var port = server.address().port;
    console.log("正在監聽埠號:", port);
});