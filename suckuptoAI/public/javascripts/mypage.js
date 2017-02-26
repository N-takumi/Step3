function mypage(){

  userName = $('#userName').text();
  function init(){

    //ユーザー情報取得
    $.get('/userInfo/'+userName,function(data){
      resUser = data.resUser[0];
      console.log(resUser.name);
      $('#highScore').text(resUser.highScore);
      $('#highScore_createDate').text(resUser.highScore_createDate);
      $('#sumBattle').text(resUser.sumBattle);
      $('#sumWin').text(resUser.sumWin);
      $('#sumLose').text(resUser.sumLose);
      $('#sumDraw').text(resUser.sumDraw);
      $('#sumScore').text(resUser.sumScore);
    });

    //ゲームを始めるボタンクリック
    $('#gameStartBtn').click(function(){
      console.log(userName);
      $.get('/game',{name:userName},function(res){
      });
    });

  }


  init();
}

$(function(){
  mypage();
});
