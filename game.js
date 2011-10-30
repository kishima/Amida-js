enchant();

//あみだくじ選考対象者名のリスト
target_list=
[
 "user1",
 "user2",
 "user3",
 "user4",
 "user5",
 "user6",
 "user7",
 "user8",
 "user9",
 "user10",
 ];

line_height = 20;//あみだの長さ
atari_number = 1;//あたりの数
amidaspeed = 4;//スピード


total_number = target_list.length;
tilesize = 32;
margine_top = 2;//上部マージン
presenters = [];
comment_width=200;

window.onload = function()
{
    // ゲームクラスを生成
    var game = new Game(tilesize*(total_number+2), tilesize*(line_height+1+margine_top));
    //あみだMAPを生成
    game.preload('tile.gif');
    game.fps = 30;
    
    game.onload = function(){
		var amidamap = new AmidaMaps(total_number,line_height);
        amidamap.randomize();
        amidamap.setAtari(atari_number);
        
        var map = new Map(tilesize, tilesize); // マップの一マスを32×32に設定
        map.image = game.assets['tile.gif']; // 画像の読み込み
        game.amida = amidamap;
        
        map.loadData(amidamap.getArray());
        
        var messagebox = new Label();
        game.message="";
        messagebox.text = "";
        messagebox._element.style.zIndex = 128;
        messagebox.font = "20px 'Arial Black'";
        messagebox.width = 500;
        messagebox.addEventListener(enchant.Event.ENTER_FRAME, function(){
            this.text = "ただいま" + game.message + "さん抽選中！";
        });
        game.rootScene.addChild(messagebox);

        for(var x=0; x<total_number; x++){
            var namebox = new Label();
            namebox.text = ""+x;
            namebox.font = "bold";
            namebox.x = (x+1)*tilesize+8;
            namebox.y = 32*margine_top - 16;
            game.rootScene.addChild(namebox);
        }
        for(var x=0; x<total_number; x++){
            var cell = amidamap.getCell(x+1,line_height+1);
            var namebox = new Label();
            namebox.text = cell.result;
            namebox.font = "24px 'Arial Black'";
            namebox.x = (x+1)*tilesize+10;
            namebox.y = 32*margine_top+(line_height)*tilesize -5;
            game.rootScene.addChild(namebox);
        }
        
        var cursorObj = new CursorSprite();
        cursorObj.x = 32+8;
        cursorObj.y = margine_top*32+8;
        game.currentLine=1;

		var stage = new Group();
		stage.addChild(map);
		stage.addChild(cursorObj);

		game.rootScene.addChild(stage);
    }
    game.start();
}


var ArcSprite = Class.create(Sprite, {
    initialize : function(radius){
        // 親のコンストラクタを呼び出す
        Sprite.call(this, 32, 32);
        var game = Game.instance;
        // サーフィスを生成
        var surface = new Surface(radius*2, radius*2);
        var c = surface.context
        var grad = c.createRadialGradient(radius, radius, 0, radius, radius, radius); 
        c.beginPath();
        c.arc(radius, radius, radius, 0, Math.PI*2, true);
        c.fill();
        this.image = surface;    
    }
});

//カーソルスプライト
var CursorSprite = Class.create(ArcSprite, {
    initialize : function(){
        // 親のコンストラクタを呼び出す
        ArcSprite.call(this, CursorSprite.RADIUS);
        
        // フレームイベントを登録
        this.addEventListener(Event.ENTER_FRAME, this.onEnterFrame);
        
        this.currentCell=null;
        
        this._element.style.zIndex = 4;
        
        this.state=0;
        this.count=0;
        
    },

    
    onEnterFrame : function(){
        var game = Game.instance;
        var scene = game.rootScene;
        var amida = game.amida;
        if(amida==null){
            document.write("amida null"+"<br>");
        }

        game.message = target_list[game.currentLine-1];
        
        var cell = this.currentCell;
        if(cell==null || cell.attr=="end"){
            cell = amida.getCell(game.currentLine,1);

        }
        if(this.state!=0){//過渡状態
            if(this.state==1){
                this.count += CursorSprite.SPEED;
                this.y += CursorSprite.SPEED;
            }
            if(this.state==2){
                this.count += CursorSprite.SPEED;
                this.x += CursorSprite.SPEED;
            }
            if(this.state==3){
                this.count += CursorSprite.SPEED;
                this.x -= CursorSprite.SPEED;
            }
            if(this.count>32){
                if(this.state==1){
                    this.state=0;
                }else{
                    this.state=1;
                    this.count=0;
                }
            }
        } 
        if(this.state==0){//次のステップへ
            cell=amida.getNextStep(cell);
            this.x = (cell.x) * tilesize + 0;
            this.y = (cell.y) * tilesize + 32*margine_top -32;
            this.currentCell = cell;
            if(cell.attr=="down"){
                this.state=1;
                this.count=0;
            }
            if(cell.attr=="right"){
                this.state=2;
                this.count=0;
            }
            if(cell.attr=="left"){
                this.state=3;
                this.count=0;
            }

        }
        if(cell.attr=="end"){//終了
            changeNext(cell);
        }

    }
    
});
// static 
CursorSprite.RADIUS = 16;
CursorSprite.SPEED = amidaspeed;

var changeNext = function(cell){
    var game = Game.instance;
    
    // シーン入れ替え
    var scene = new Scene();
    scene.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    game.replaceScene(scene);
    
    var gameover_label = new Label();
    gameover_label.color='#FF0000';
    gameover_label.width=comment_width;    
    gameover_label.y = game.height/2  -50;
    gameover_label.font = "24px 'Arial Black'";
    if(cell.result=="x"){
        gameover_label.x = game.width/2  -(comment_width/2);
        gameover_label.text = target_list[game.currentLine-1]+"さんはハズレでした。";
    }else{
        gameover_label.x = game.width/2  -(comment_width/2);
        var r=eval(cell.result);
        gameover_label.text = target_list[game.currentLine-1]+"さんは"+r+"番目の発表者です!!";
        presenters[r-1]=target_list[game.currentLine-1];
    }
    
    gameover_label.addEventListener(enchant.Event.TOUCH_START, function(){        
        if(game.currentLine==total_number){
            for(var i=0;i<atari_number;i++){
                document.write(presenters[i]+"さんは"+(i+1)+"番目の発表です<br>");
            }
        }
        game.currentLine++;
        game.replaceScene(game.rootScene);
    });
    
    scene.addChild(gameover_label);

}

//ランダムソート
function shuffle(list) {
  var i = list.length;

  while (--i) {
    var j = Math.floor(Math.random() * (i + 1));
    if (i == j) continue;
    var k = list[i];
    list[i] = list[j];
    list[j] = k;
  }

  return list;
}

//１マスの要素
var AmidaCell = function(a,x,y){
    this.attr = a;
    this.x = x;
    this.y = y;
    this.mark = 0;
    this.result = "";
    
    this.getSign = function(){
        switch(this.attr){
        case "down":
            return 1;
        case "left":
            return 0;
        case "right":
            return 2;
        case "end":
            return 3;
        }
    }
}
//あみだくじ全体
var AmidaMaps = function(w,h){
    this.height=h;
    this.width=w;
    this.map = new Array();
    
    for(var x=1;x<=this.width;x++){
        for(var y=1;y<=this.height;y++){
            this.map.push(new AmidaCell("down",x,y));
        }
    }

    this.setAtari = function(num){
        var line = new Array();//対象者列
        for(var n=1;n<=num;n++){
            line.push(""+n);//あたり
        }
        for(var n=0;n<this.width-num;n++){
            line.push("x");//はずれ
        }
        shuffle(line);//sort
        for(var x=1;x<=this.width;x++){
            var cell = new  AmidaCell("end",x,this.height+1);
            cell.result = line[x-1];
            this.map.push(cell);
        }
    }
    
    
    this.getCell = function(x,y){
        for(var i=0; i<this.map.length;i++){
            var cell = this.map[i];
            if(cell.x==x && cell.y==y){
                return cell;
            }
        }
        return null;
    }
    
    
    this.randomize = function(){//盤面に枝をランダムに配置
        for(var x=1;x<=this.width;x++){
            var num = Math.floor(Math.random()*10)+18;//生成する枝の数
            for(var n=1;n<=num;n++){
                var y = Math.floor(Math.random()*(this.height-3))+3;
                var direction = Math.floor(Math.random()*2);//枝の向き
                var cell = this.getCell(x,y);
                var left_cell = this.getCell(x-1,y);
                var right_cell = this.getCell(x+1,y);

                if(x==1){
                    direction = 1;
                }
                if(direction==0){
                    if(left_cell!=null && cell.attr=="down" && left_cell.attr=="down"){
                        cell.attr="left";
                        left_cell.attr="right";
                    }
                }else{
                    if(right_cell!=null && cell.attr=="down" && right_cell.attr=="down"){
                        cell.attr="right";
                        right_cell.attr="left";
                    }else{
                        if(right_cell!=null && cell.attr=="left"){
                            cell.attr="right";
                            right_cell.attr="left";
                            left_cell.attr="down";
                        }
                    }
                }
            }
        }
    }
    
    //次の位置は？
    this.getNextStep = function(cell){
        var x;
        var y;
        switch(cell.attr){
        case "down":
            x=cell.x;
            y=cell.y+1;
            break;
        case "right":
            x=cell.x+1;
            y=cell.y+1;
            break;
        case "left":
            x=cell.x-1;
            y=cell.y+1;
            break;
        }
        cell.mark=0;
        retcell=this.getCell(x,y);
        if(retcell){
            retcell.mark=1;
            return retcell;
        }else{
            return new AmidaCell("end",x,y);
        }
    }
    
    //二次元配列を得る
    this.getArray =　function(){
        var resultmap=[];
        for(var n=0;n<this.height+1+margine_top;n++){
            resultmap[n]=new Array(this.width+2);
        }
        for(var n=0;n<this.map.length;n++){
            var cell = this.map[n];
            resultmap[margine_top+cell.y-1][1+cell.x-1] = cell.getSign();
        }

        return resultmap;
    }
}














