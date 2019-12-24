const _ = require('lodash')

/**
 * meta信息
 */
module.exports = function(music_id, auto_play) {
  let n_id = music_id ? music_id : ''

  let n_auto = auto_play ? 'autoplay' : ''

  let iframe = n_id
  ? `<audio id="music" controls ${n_auto} loop preload="auto" style="width:300px; margin: 10px auto;"><source src="https://music.163.com/song/media/outer/url?id=${n_id}.mp3" type="audio/mpeg">Your browser does not support the audio element.</audio>${n_auto ? "<script>var music=document.getElementById('music');while(music.paused){music.play();}</script>" : ""}`
  : ''

  return !_.isEmpty(iframe) ? iframe : ''
}
