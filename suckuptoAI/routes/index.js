var express = require('express');


//ログイン後ページ
exports.mypage = function(req,res){
  res.render('mypage', {userName:req.session.userName});
  console.log(req.session.userName);
};
