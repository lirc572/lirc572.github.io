const _ = require('lodash')

/**
 * meta信息
 */
module.exports = function() {
  const config = this.config

  let n_id = config.netease_id ? config.netease_id : ''

  let n_auto = config.netease_auto ? config.netease_auto : '0'

  let iframe = n_id
  ? `<iframe frameborder="no" border="0" marginwidth="0" marginheight="0" width=320 height=320 src="//music.163.com/outchain/player?type=0&id=${n_id}&auto=${n_auto}&height=430" style="margin:10px auto; display:block;"></iframe>`
  : ''

  return !_.isEmpty(iframe) ? iframe : ''
}
