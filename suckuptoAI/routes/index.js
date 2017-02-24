var express = require('express');


//ログイン後ページ
exports.mypage = function(req,res){
  res.render('mypage', {user:req.session.user});
  console.log(req.session.user);
};
