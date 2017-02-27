function index(){

  function init(){

    //ランキング5位までを取得
    getRankings();

    $('#loginBtn').click(
    function(){
      $('#signUpForm').slideUp();
      $('#loginForm').slideDown();
      $("html,body").animate({scrollTop:$('#loginForm').offset().top});
    });

    $('#signUpBtn').click(
    function(){
      $('#loginForm').slideUp();
      $('#signUpForm').slideDown();
      $("html,body").animate({scrollTop:$('#signUpForm').offset().top});
    });

    $('#signUp_form').submit( function(){
      console.log('sign');
      postSignUp();
      return false;
    });

    $('#login_form').submit( function(){
      console.log('login');
      postLogin();
      return false;
    });

  }


  //サインアップ機能
  function postSignUp(){
  name = $('#sign_name').val();
  password = $('#sign_pass').val();

  if(name.length == 0){
    alert('名前が入力されていません');
    return false;
  }else if(name.length > 10){
    alert('名前は10字以内にしてください');
    return false;
  }else if(name == 'ゲスト'){
    alert('その名前は使えません');
    return false;
  }

  if(password.length == 0){
    alert('パスワードが入力されていません');
    return false;
  }

  var user = {
    name:name,
    password:password
  };

  $.post('/add',user,function(res){
    if(res){
      console.log('新規登録');
      alert('新規登録完了');
      $.get('/top',user,function(res){
        if(res){
          window.location.href = "/";
        }
      });
    }else{
      alert('新規登録エラー:入力されたユーザー名はすでに存在します');
    }
  });

  }

  //ログイン機能
  function postLogin(){

  name = ($('#login_name').val());
  password = $('#login_pass').val();

  if(name.length == 0){
    alert('名前が入力されていません');
    return false;
  }

  if(password.length == 0){
    alert('パスワードが入力されていません');
    return false;
  }

  var user = {
    name:name,
    password:password
  };

  $.get('/top',user,function(res){
    if(res == true){
      window.location.href = "/";
    }else{
      alert('ログインエラー');
  //   window.location.href = "/";
    }
  });
  }

  function getRankings(){
    $.get('/getRankings',function(data){
      var resRank = data.resRank;
      for(var i = 0;i < resRank.length;i++){
        $('#rank_'+i).text(resRank[i].name+'さん Rate'+resRank[i].rate);
      }
    });
  }



  init();

}


$(function(){
  index();
});
