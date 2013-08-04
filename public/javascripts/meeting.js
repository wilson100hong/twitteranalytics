var videos = [];
var PeerConnection = window.PeerConnection || window.webkitPeerConnection00 || window.webkitRTCPeerConnection || window.mozRTCPeerConnection || window.RTCPeerConnection;


// Global chat channel
var chat;

// Global speech recognition chaneel
var recognition;
// global variables used in speech recognition
var final_transcript = '';
var recognizing = false;
var ignore_onend;
var start_timestamp;
var user;

var currentTime = function() {
        var d = new Date(); // for now
        var time = d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();
        return time;
};

//var color = "";
var color = "#" + ((1 << 24) * Math.random() | 0).toString(16);

function showInfo(s) {
  console.log(s);
}

var two_line = /\n\n/g;
var one_line = /\n/g;
function linebreak(s) {
  return s.replace(two_line, '<p></p>').replace(one_line, '<br>');
}

var first_char = /\S/;
function capitalize(s) {
  return s.replace(first_char, function(m) { return m.toUpperCase(); });
}

function initSpeech() {
  if (!('webkitSpeechRecognition' in window)) {
    console.log('Your browser does not support speech recognition');    
  } 

  recognition = new webkitSpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;

  recognition.onstart = function() {
    recognizing = true;
    showInfo('info_speak_now');
    // start_img.src = 'mic-animate.gif';
  };

  recognition.onerror = function(event) {
    if (event.error == 'no-speech') {
      // start_img.src = 'mic.gif';
      showInfo('info_no_speech');
      ignore_onend = true;
    }
    if (event.error == 'audio-capture') {
      // start_img.src = 'mic.gif';
      showInfo('info_no_microphone');
      ignore_onend = true;
    }
    if (event.error == 'not-allowed') {
      if (event.timeStamp - start_timestamp < 100) {
        showInfo('info_blocked');
      } else {
        showInfo('info_denied');
      }
      ignore_onend = true;
    }
  };

  recognition.onend = function() {
    recognizing = false;
    if (ignore_onend) {
      return;
    }
    //start_img.src = 'mic.gif';
    if (!final_transcript) {
      showInfo('info_start');
      return;
    }
  };

  recognition.onresult = function(event) {
    var interim_transcript = '';
    
    var input = document.getElementById("chatinput");
    var room = window.location.hash.slice(1);
    // TODO(seed): better color
//    var color = "#" + ((1 << 24) * Math.random() | 0).toString(16);

    for (var i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        var msg = linebreak(capitalize(event.results[i][0].transcript));
        input.value = msg;

        var time = currentTime();
        console.log(time);

        chat.send(JSON.stringify({
        "eventName": "chat_msg",
        "data": {
          "name": user,
          "messages": msg,
          "room": room,
          "lang" : recognition.lang,
          "color": color,
          "time" : time
        }
        }));
        // Also send message to server for history record
        console.log(user);  // TEST: user name passed
        $.post('/record', 
          { "name": user,
            "msg" : msg,
            "lang": recognition.lang,
            "color": color, 
            "time" : time},
          function(data) {
            console.log(data);
        });

        addToChat(user, input.value, color, time);
        input.value = "";
      } else {
        interim_transcript += event.results[i][0].transcript;
        input.value = linebreak(interim_transcript);
        
        var msg = $('.user').filter(function(index){
          
          return ($(this).attr("user") == user);
        }).find(".msg");

        msg.html(linebreak(interim_transcript));    
      }
    }
    /*
    if (final_transcript || interim_transcript) {
      showButtons('inline-block');
    }
    */
  };
}

function getNumPerRow() {
  var len = videos.length;
  var biggest;

  // Ensure length is even for better division.
  if(len % 2 === 1) {
    len++;
  }

  biggest = Math.ceil(Math.sqrt(len));
  while(len % biggest !== 0) {
    biggest++;
  }
  return biggest;
}

function subdivideVideos() {
  var perRow = getNumPerRow();
  var numInRow = 0;
  for(var i = 0, len = videos.length; i < len; i++) {
    var video = videos[i];
    setWH(video, i);
    numInRow = (numInRow + 1) % perRow;
  }
}

function setWH(video, i) {
  video.width = 263;
  video.height = 200;
}

/*
function setWH(video, i) {
  var perRow = getNumPerRow();
  var perColumn = Math.ceil(videos.length / perRow);
  var width = Math.floor((window.innerWidth) / perRow);
  var height = Math.floor((window.innerHeight - 190) / perColumn);
  video.width = width;
  video.height = height;
  //video.style.position = "absolute";
  video.style.left = (i % perRow) * width + "px";
  video.style.top = Math.floor(i / perRow) * height + "px";
}
*/

function cloneVideo(domId, socketId) {
  var video = document.getElementById(domId);
  var clone = video.cloneNode(false);
  clone.id = "remote" + socketId;
  clone.muted = false;
  document.getElementById('videos').appendChild(clone);
 
  videos.push(clone);
  return clone;
}

function removeVideo(socketId) {
  var video = document.getElementById('remote' + socketId);
  if(video) {
    videos.splice(videos.indexOf(video), 1);
    video.parentNode.removeChild(video);
  }
}

function addToChat(name, msg, color, time) {
  if (msg === undefined)
    return;

  var messages = document.getElementById('history_msg');
  msg = sanitize(msg);
  msg = '<span style="color: ' + color + '; padding-left: 15px">' + name + ":" + msg + " -- " + time + '</span>';
    /*
  if(color) {
    msg = '<span style="color: ' + color + '; padding-left: 15px">' name + ":" + msg + " -- " + time'</span>';
  } else {
    msg = '<strong style="padding-left: 15px">' + msg + '</strong>';
  }
  */
  messages.innerHTML = messages.innerHTML + msg + '<br>';
  messages.scrollTop = 10000;
}

function sanitize(msg) {
  return msg.replace(/</g, '&lt;');
}

function initFullScreen() {
  var button = document.getElementById("fullscreen");
  button.addEventListener('click', function(event) {
    var elem = document.getElementById("videos");
    //show full screen
    elem.webkitRequestFullScreen();
  });
}

function initNewRoom() {
  var button = document.getElementById("newRoom");

  button.addEventListener('click', function(event) {

    var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
    var string_length = 8;
    var randomstring = '';
    for(var i = 0; i < string_length; i++) {
      var rnum = Math.floor(Math.random() * chars.length);
      randomstring += chars.substring(rnum, rnum + 1);
    }

    window.location.hash = randomstring;
    location.reload();
  })
}


var websocketChat = {
  send: function(message) {
    rtc._socket.send(message);
  },
  recv: function(message) {
    return message;
  },
  event: 'receive_chat_msg'
};

var dataChannelChat = {
  send: function(message) {
    for(var connection in rtc.dataChannels) {
      var channel = rtc.dataChannels[connection];
      channel.send(message);
    }
  },
  recv: function(channel, message) {
    return JSON.parse(message).data;
  },
  event: 'data stream data'
};



function initChat() {
  if(rtc.dataChannelSupport) {
    console.log('initializing data channel chat');
    chat = dataChannelChat;
  } else {
    console.log('initializing websocket chat');
    chat = websocketChat;
  }

  var input = document.getElementById("chatinput");
  var toggleHideShow = document.getElementById("hideShowMessages");
  var room = window.location.hash.slice(1);
//  var color = "#" + ((1 << 24) * Math.random() | 0).toString(16);

  toggleHideShow.addEventListener('click', function() {
    var element = document.getElementById("history_msg");

    if(element.style.display === "block") {
      element.style.display = "none";
    }
    else {
      element.style.display = "block";
    }

  });

  input.addEventListener('keydown', function(event) {
    console.log("chat input keydown");
    var key = event.which || event.keyCode;
    if(key === 13) {
      chat.send(JSON.stringify({
        "eventName": "chat_msg",
        "data": {
          "name": user,
          "messages": input.value,
          "room": room,
          "color": color
        }
      }));
      var time = currentTime();
      $.post('/record', 
          { "name": user,
            "msg" : input.value,
            "lang": recognition.lang,
            "color": color, 
            "time" : time},
          function(data) {
            console.log(data);
        });
        
      addToChat(user, input.value, color, currentTime()); 
      input.value = "";
    }
  }, false);
  rtc.on(chat.event, function() {
    var data = chat.recv.apply(this, arguments);
    console.log(data.color);
    console.log(data.lang);
    addToChat(data.name, data.messages, data.color.toString(16), data.time);
  });
}


function init(lang, username) {
  user = username;
  if(PeerConnection) {
    rtc.createStream({
      "video": {"mandatory": {}, "optional": []},
      "audio": true
    }, function(stream) {
      document.getElementById('you').src = URL.createObjectURL(stream);
      document.getElementById('you').play();
      document.getElementById('you').muted = true;
    });
  } else {
    alert('Your browser is not supported or you have to turn on flags. In chrome you go to chrome://flags and turn on Enable PeerConnection remember to restart chrome');
  }


  var room = window.location.hash.slice(1);
  console.log(room);
  console.log("ws:" + window.location.href.substring(window.location.protocol.length).split('#')[0]);
  rtc.connect("ws:" + window.location.href.substring(window.location.protocol.length).split('#')[0], room);

  rtc.on('add remote stream', function(stream, socketId) {
    console.log("ADDING REMOTE STREAM...");
    var clone = cloneVideo('you', socketId);
    document.getElementById(clone.id).setAttribute("class", "");
    rtc.attachStream(stream, clone.id);
    subdivideVideos();
  });
  rtc.on('disconnect stream', function(data) {
    console.log('remove ' + data);
    removeVideo(data);
  });
  initFullScreen();
  initNewRoom();
  initChat();
  initSpeech();
  // Start speech recognition
  recognition.lang = lang;
  recognition.start();
  ignore_onend = false;

  initHistory();
}

function initHistory() {
   $.get('/recall', function(data_) {
      console.log(data_);
      var data = JSON.parse(data_);
      // TODO(seed): put data into message log
      for(var i = 0; i<data.length; i++)  {
        var item = data[i];
        console.log(item);
        addToChat(item.name, item.msg, item.color, item.time);
      }
    });
}

$("#report").on('click', function(e){
  console.log("report clicked");
  $.get("/dump");
  //setTimeout(1, function(e){
    window.open('/history.html');
//  });
});

window.onresize = function(event) {
  subdivideVideos();
};
