var locationOptions = {
  enableHighAccuracy: true, 
  maximumAge: 10000, 
  timeout: 10000
};

function locationSuccess(pos) {
  console.log('lat= ' + pos.coords.latitude + ' lon= ' + pos.coords.longitude);
}

function locationError(err) {
  console.log('location error (' + err.code + '): ' + err.message);
}

var UI = require('ui');
var Vector2 = require('vector2');

var main = new UI.Card({
  title: 'Ghost Pacer',
  icon: 'images/menu_icon.png',
  body: 'Friendly pacing ghosts ahead, just select to run away',
});
main.show();

main.on('click', 'select', function(e) {
  var menu = new UI.Menu({
    sections: [{
      title: 'Select a Ghost Pacer',
      items: [{
        title: '9 min/km',
        subtitle: 'Can do, Ghost!'
      }, {
        title: '6 min/km',
        subtitle: 'Not so fast, Ghost!'
      }, {
        title: '5 min/km',
        subtitle: 'WTH, Ghost!'
      }]
    }]
  });
  menu.show();
  
  menu.on('select', function(e) {
    var start_time = Date.now();
    var start_you_pos = navigator.geolocation.getCurrentPosition(locationSuccess, locationError, locationOptions);
    var ghost_pace = parseInt(e.item.title.substring(0, 1));
    var window = new UI.Window({
      fullscreen: true,
    });
    var ghost_circle = new UI.Circle({
      position: new Vector2(0, 10),
      radius: 10,
      backgroundColor: 'white',
    });
    var you_circle  = new UI.Circle({
      position: new Vector2(145, 10),
      radius: 10,
      backgroundColor: 'white',
    });
    window.add(ghost_circle);
    window.add(you_circle);
    window.show(ghost_circle);
    window.show(you_circle);
  
  
    window.on('select', function(e) {
      
      /**
       * Adapted from a script provided by Moveable Type under a Creative Commons license
       **/

      function you_distance(lat1, lon1, lat2, lon2) {
        var R = 6371; // km
        var dLat = (lat2 - lat1).toRad();
        var dLon = (lon2 - lon1).toRad(); 
        var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(lat1.toRad()) * Math.cos(lat2.toRad()) * 
                Math.sin(dLon / 2) * Math.sin(dLon / 2); 
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
        var d = R * c;
        return d;
      }
      Number.prototype.toRad = function() {
        return this * Math.PI / 180;
      };

      function ghost_distance(pace, start_time) {
        var seconds_elapsed = Date.now() - start_time;
        var distance_travelled = seconds_elapsed / (pace * 60);
        return distance_travelled;
      }
      
      var ghost_circle_pos = ghost_circle.position();
      var you_circle_pos = you_circle.position();
      /*ghost_circle_pos.y = 10; you_circle_pos.y = 10;*/
      var now_you_pos = navigator.geolocation.getCurrentPosition(locationSuccess, locationError, locationOptions);
      var ghost_distance_literal = ghost_distance(ghost_pace, start_time);
      var you_distance_literal = you_distance(start_you_pos.coords.latitude, start_you_pos.coords.longitude, now_you_pos.coords.latitude, now_you_pos.coords.longitude);
      /*start_time = Date.now();
      start_you_pos = navigator.geolocation.getCurrentPosition(locationSuccess, locationError, locationOptions);*/
      /* For every 100m, 10 pixels of difference... */
      if (you_distance_literal > ghost_distance_literal) {
        you_circle_pos.y += (you_distance_literal - ghost_distance_literal) * 1000;
        you_circle.animate('position', you_circle_pos, 1000);
      }
      else {
        ghost_circle_pos.y += (ghost_distance_literal - you_distance_literal);
        ghost_circle.animate('position', ghost_circle_pos, 1000);
      }
    
      });
  });
});
