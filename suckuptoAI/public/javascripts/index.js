function index(){

  function init(){

    $('#loginBtn').click(
    function(){
      $('#signUpForm').slideUp();
      $('#loginForm').slideDown();
    });

    $('#signUpBtn').click(
    function(){
      $('#loginForm').slideUp();
      $('#signUpForm').slideDown();
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
  }else if(name.length >= 31){
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

  name = $('#login_name').val();
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
      alert('入力されたユーザーが存在しません');
      window.location.href = "/";
    }
  });
  }



  init();

}


$(function(){
  index();
});
