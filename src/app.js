var UI = require('ui');
var ajax = require('ajax');
var Vector2 = require('vector2');
var Settings = require('settings');

var parseFeed = function(data, quantity) {
  var items = [];
  var array_length = data.response.length;
  
  if(array_length < 10){
    quantity = array_length;
  }
    
  for(var i = 0; i < quantity; i++) {
    var title = data.response[i].title;
    var description = data.response[i].description;

    title = title.charAt(0).toUpperCase() + title.substring(1);

    items.push({
      title:title,
      subtitle:description
    });
  }
  
  return items;
};

var title_text = "Surge";
var font_text = "BITHAM_42_LIGHT";

var token = Settings.option('token');
var user_id = Settings.option('user_id');

if(typeof token === 'undefined'){
   var title_text = "Login on your phone";
   var font_text = "GOTHIC_14";
}

var splashWindow = new UI.Window();

var text = new UI.Text({
  position: new Vector2(0, 15),
  size: new Vector2(144, 26),
  text: title_text,
  font: font_text,
  color:'white',
  textOverflow:'wrap',
  textAlign:'center',
	backgroundColor:'cobaltBlue'
});

var image = new UI.Image({
  position: new Vector2(0, 15),
  size: new Vector2(144, 168),
  image: 'images/surge_pebble_logo_color.png'
});

splashWindow.bgRect = new UI.Rect({
  position: new Vector2(0, 0),
  size: new Vector2(144, 168),
  backgroundColor: 'cobaltBlue'
});

splashWindow.add(splashWindow.bgRect);
splashWindow.add(image);
splashWindow.add(text);
splashWindow.show();

ajax(
  {
    url:'https://www.surge.life/api/1/tasks',
    headers: { Authorization: 'Token token="' + token + '", user_id="' + user_id + '"' },
    type:'json'
  },
  function(data) {
    var menuItems = parseFeed(data, 10);

    var resultsMenu = new UI.Menu({
      sections: [{
        title: 'Current Feed',
        items: menuItems,
        backgroundColor: 'cobaltBlue',
        textColor: 'white',
        highlightBackgroundColor: 'celeste',
        highlightTextColor: 'white'
      }]
    });

    resultsMenu.on('select', function(e) {
      
      var title = data.response[e.itemIndex].title;
      title = title.charAt(0).toUpperCase() + title.substring(1);
      
      var percentage = data.response[e.itemIndex].progress + "%";
      var description = data.response[e.itemIndex].description;

      var detailCard = new UI.Card({
        title:title,
        subtitle:percentage,
        body: description,
        backgroundColor: 'cobaltBlue',
        titleColor: 'white',
        subtitleColor: 'electricBlue',
        bodyColor: 'celeste',
        scrollable: true
      });
      detailCard.show();
    });

    resultsMenu.show();
    splashWindow.hide();
    
  },
  function(error) {
    console.log('Download failed: ' + error);
  }
);

Settings.config(
  { url: 'https://www.surge.life/token_auth/pebble/' },
  function(e) {
    console.log('opening configurable');
  },
  function(e) {
    console.log('closed configurable'); 
        
    Settings.option('token', e.options.response.token);
    Settings.option('user_id', e.options.response.user_id);

  }
);
