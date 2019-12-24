const _ = require('lodash')

/**
 * meta信息
 */
module.exports = function(music_id, auto_play) {
  const config = this.config

  let music_server = config.music_server
    ? config.music_server
    : 'https://music.163.com/song/media/outer/url?id='

  let n_id = music_id ? music_id : ''

  let n_auto = auto_play ? 'autoplay' : ''

  let iframe = n_id
    ? `<audio id="music" controls ${n_auto} loop preload="auto" style="width:300px; margin: 10px auto;"><source src="${music_server}${n_id}.mp3" type="audio/mpeg">Your browser does not support the audio element.</audio>${n_auto ? "<script>document.onload=function(){var tmp=0;var music=document.getElementById('music');while(tmp<1000&&music.paused){music.play();tmp++;}}</script>" : ""}`
    : ''

  return !_.isEmpty(iframe) ? iframe : ''
}
