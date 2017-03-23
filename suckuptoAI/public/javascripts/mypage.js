function mypage(){

  userName = $('#userName').text();
  function init(){

    //ランキング
    getRankings();

    $('.info').fadeIn(2000);

    //ユーザー情報取得
    $.get('/userInfo/'+encodeURIComponent(userName),function(data){
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

  //ランキング情報取得
  function getRankings(){
    $.get('/getRankings',function(data){
      var resRank = data.resRank;
      for(var i = 0;i < resRank.length;i++){
      //  $('#rank_'+i).append(resRank[i].name+'さん Rate <span id="rate_num">'+resRank[i].rate+'</span>');
        $('#rank_'+i).append('<td>'+(i+1)+'位'+resRank[i].name+'さん  </td><td> Rate <span id="rate_num">'+(resRank[i].rate.toFixed(2))+'</span></td>');
      }
    });
  }


  init();
}

$(function(){
  mypage();
});
