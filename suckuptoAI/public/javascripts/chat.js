var socket = io();

//chatというイベントを受信したらHTML要素に追加する
socket.on('chat',function(chat){
  var messages = document.getElementById('messages');
  //新しいメッセージは既にある要素より上に表示させる
  var newMessage = document.createElement('li');
  newMessage.textContent = chat.name + '「' + chat.message + '」';
  messages.insertBefore(newMessage,messages.firstChild);
});

//送信ボタンにイベントを定義
var sendButton = document.getElementById('send');
sendButton.addEventListener('click',sendMessage);

//メッセージを送信する
function sendMessage(){
  //名前と内容を取得する
  var nameElement = document.getElementById('name');
  var messageElement = document.getElementById('text');
  var name = nameElement.value;
  var message = messageElement.value;

  //chatイベントを送信する
  socket.emit('chat',{
    name:name,
    message:message
  });

  内容をリセットする
  messageElement.value = '';
}
