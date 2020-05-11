/**
 * 工具模块
 */
define('util', [], function() {
  'use strict'

  var STORAGE_INSTANCE = undefined
  var DEFAULT_EXPIRE = 3 * 60 * 60 * 1000 // 默认过期时间3小时

  /**
   * 缓存模块
   */
  var STORAGE = (function() {
    function getInstance(type) {
      if (type === 'session' && STORAGE_INSTANCE !== window.sessionStorage) {
        STORAGE_INSTANCE = window.sessionStorage
      } else if (STORAGE_INSTANCE !== window.localStorage) {
        STORAGE_INSTANCE = window.localStorage
      }

      return this
    }

    function getNow() {
      return new Date().getTime()
    }

    function get(key) {
      var value
      try {
        value = JSON.parse(STORAGE_INSTANCE.getItem(key))

        if (value) {
          var now = getNow()
          if (value.expireTime < now) {
            value = null
          }
        }
      } catch (e) {
        console.warn('key', e)
        value = null
      }

      return value
    }

    function set(key, value, expire) {
      value = value || {}
      key = key && key.toLocaleUpperCase()

      if (value) {
        var now = getNow()
        value.setTime = now
        value.expireTime = now + (expire || DEFAULT_EXPIRE)

        try {
          value = JSON.stringify(value)
        } catch (e) {
          console.warn('key', e)
          value = ''
        }

        STORAGE_INSTANCE.setItem(key, value)
      } else {
        return false
      }
    }

    function remove() {}

    return {
      get: get,
      set: set,
      remove: remove,
      getInstance: getInstance
    }
  })()

  /**
   * 消抖
   * 当调用函数n秒后，才会执行该动作，若在这n秒内又调用该函数则将取消前一次并重新计算执行时间
   * @param {*} fn
   * @param {*} delay
   */
  function debounce(fn, delay) {
    let _this = this,
      timer = null

    return function(e) {
      if (timer) {
        clearTimeout(timer)
        timer = setTimeout(function() {
          fn.call(_this, e.target.value)
        }, delay)
      } else {
        timer = setTimeout(function() {
          fn.call(_this, e.target.value)
        }, delay)
      }
    }
  }

  return {
    STORAGE: STORAGE,
    debounce: debounce
  }
})
;
/**
 * ServiceWorker模块
 */
define('registerSW', ['jquery'], function($) {
  function register() {
    navigator.serviceWorker
      .register('/sw.js', { scope: `/` })
      .then(function(registration) {
        console.info('sw register success---', registration.scope)
        var activeWorker = registration.active
        registration.onupdatefound = () => {
          var installingWorker = registration.installing
          if (installingWorker) {
            installingWorker.onstatechange = () => {
              console.info('sw installing state---', installingWorker.state)
            }
          }
          if (activeWorker) {
            activeWorker.onstatechange = () => {
              console.info('sw active state---', activeWorker.state)
              activeWorker.state == 'redundant' && window.location.reload()
            }
          }
        }

        // 发送消息，sw监听事件message接收
        registration.active && registration.active.postMessage('success')
      })
      .catch(function(e) {
        console.warn('register sw failed---', e)
      })

    // 监听安装
    window.addEventListener('beforeinstallprompt', e => {
      window.dfdPrompt = e
      // 阻止默认事件
      e.preventDefault()
      return false
    })
  }

  // 监听注册sw事件
  document.addEventListener(
    'registerSwEvent',
    function(e) {
      register()
    },
    false
  )

  if (
    HUHU_CONFIG &&
    HUHU_CONFIG.service_worker &&
    HUHU_CONFIG.service_worker.open &&
    'serviceWorker' in navigator &&
    window.caches &&
    navigator.serviceWorker.getRegistration
  ) {
    navigator.serviceWorker
      .getRegistration(`/`)
      .then(function(registration) {
        if (
          !HUHU_CONFIG.service_worker ||
          (HUHU_CONFIG.service_worker && !HUHU_CONFIG.service_worker.open)
        ) {
          registration &&
            registration.scope &&
            registration
              .unregister()
              .then(() => console.log('unregister older sw success!'))
              .catch(e => console.error(`unregister older sw failed!---`, e))
          return
        }

        // 注册事件
        var event = new Event('registerSwEvent')

        // 不存在SW or 新的SW已存在
        if (!registration || registration.scope === window.location.origin + '/') {
          document.dispatchEvent(event) // 注册新sw
          return
        }

        // scope不为'/'，就注销旧的服务
        if (registration.scope) {
          registration
            .unregister()
            .then(flag => {
              if (flag) {
                console.log('unregister older sw success!')
                document.dispatchEvent(event) // 注册新sw
              }
            })
            .catch(e => {
              console.error('unregister older sw failed!---', e)
            })
        }
      })
      .catch(e => {
        console.error('get older sw failed!---', e)
      })
  }
})
;
/**
 * 分享模块
 */
define('share',['jquery', 'confirm'], function($) {
  'use strict'

  var DEFAULT_SITES = ['weibo', 'qq', 'wechat', 'douban', 'qzone', 'facebook', 'twitter', 'google']

  var TEMP = {
    qqkongjian:
      'http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?url={{URL}}&title={{TITLE}}&desc={{DESCRIPTION}}&summary={{SUMMARY}}&site={{SOURCE}}&pics={{IMAGE}}',
    QQ:
      'http://connect.qq.com/widget/shareqq/index.html?url={{URL}}&title={{TITLE}}&source={{SOURCE}}&desc={{DESCRIPTION}}&pics={{IMAGE}}',
    weibo: 'https://service.weibo.com/share/share.php?url={{URL}}&title={{TITLE}}&pic={{IMAGE}}&appkey={{WEIBOKEY}}',
    weixin: 'javascript:;',
    douban:
      'http://shuo.douban.com/!service/share?href={{URL}}&name={{TITLE}}&text={{DESCRIPTION}}&image={{IMAGE}}&starid=0&aid=0&style=11',
    facebook:
      'https://www.facebook.com/sharer/sharer.php?u={{URL}}&title={{TITLE}}&description={{DESCRIPTION}}&caption={{SUBHEAD}}&link={{URL}}&picture={{IMAGE}}',
    twitter: 'https://twitter.com/intent/tweet?text={{TITLE}}&url={{URL}}&via={{SITE_URL}}',
    google: 'https://plus.google.com/share?url={{URL}}'
  }

  function handleHref(type, data) {
    var href = TEMP[type] || ''
    data.summary = data.description
    Object.keys(data).map(function(key) {
      let reg = key.toUpperCase() || ''
      href = href.replace(new RegExp('{{' + reg + '}}', 'g'), data[key])
    })

    return href
  }

  $.fn.share = function(options) {
    var defaultOptions = {
      url: location.href,
      sites: DEFAULT_SITES,
      site_url: location.origin,
      source:
        $(document.head)
          .find('[name=site]')
          .attr('content') || document.title,
      title:
        $(document.head)
          .find('[name=title]')
          .attr('content') || document.title,
      description:
        $(document.head)
          .find('[name=description]')
          .attr('content') || '',
      image: $('img:first').prop('src') || '',
      weiboKey: ''
    }

    options = $.extend({}, defaultOptions, options)

    var site_temp = ''
    options.sites.map(function(v) {
      site_temp += `<a href="${handleHref(v, options)}" target="_blank">
                      <span class="iconfont icon-${v}"></span> 
                    </a>`
    })

    var content = `<div id="share">
                        ${site_temp}
                  </div>`

    $.confirm({
      title: 'Share',
      useBootstrap: false,
      boxWidth: '15rem',
      escapeKey: 'true',
      animation: 'rotateYR',
      content: content,
      buttons: {
        close: {
          text: 'Close'
        }
      }
    })
  }
})
;
/**
 * 站内搜索
 */
define('search',['jquery', 'util'], function($, util) {
  'use strict'

  var SEARCH_KEY = 'SEARCH'
  var SEARCH_EXPIRE = 30 * 24 * 60 * 60 * 1000 // 默认过期时间30天
  var resultBoxDom = $('#result-box')
  var resultConutBoxDom = $('#result-count')
  var _img_temp = `<div class="left" style="background-image: url('{IMG}')"></div>`
  var _temp = `<li>
                <a href="{PERMALINK}" target="_blank">
                  {IMG_TEMP}
                  <div class="right">
                    <div class="title">{TITLE}</div>
                    <div class="time">{TIME}</div>
                    <div class="intro">{INTRO}</div>
                  </div>
                </a>
              </li>`

  function getStatic() {
    return util.STORAGE.getInstance().get(SEARCH_KEY)
  }

  function setStatic(value) {
    return util.STORAGE.getInstance().set(SEARCH_KEY, value, SEARCH_EXPIRE)
  }

  function getSeatchData() {
    let content = getStatic()
    if (!content) {
      return fetch('/content.json', { method: 'GET' })
        .then(resp => resp.json())
        .then(json => {
          json && setStatic(json)
          return json
        })
        .catch(error => console.log('fetch failed', error))
    } else {
      return Promise.resolve(content)
    }
  }

  /**
   * 匹配
   */
  function matcher(post, key) {
    // 关键字 => 正则，空格隔开的看作多个关键字
    // a b c => /a|b|c/gmi
    // g 全局匹配，m 多行匹配，i 不区分大小写
    var regExp = new RegExp(key.replace(/[ ]/g, '|'), 'gmi')

    // 匹配优先级：title > tags > text
    return (
      regExp.test(post.title) ||
      post.tags.some(function(tag) {
        return regExp.test(tag.name)
      }) ||
      regExp.test(post.text)
    )
  }

  function inputSearch(key) {
    if (key) {
      // 尝试获取数据
      getSeatchData().then(data => {
        let posts = data.posts

        if (posts.length) {
          let result
          result = posts.filter(post => matcher(post, key))
          resultConutBoxDom.html(result.length)

          if (result.length) {
            let _li = ''
            for (let i = 0; i < result.length; i++) {
              let _img = ''
              if (result[i].photos.length > 0) {
                _img = _img_temp.replace('{IMG}', result[i].photos[0])
              }

              _li += _temp
                .replace('{PERMALINK}', result[i].permalink)
                .replace('{TITLE}', result[i].title)
                .replace('{IMG_TEMP}', _img)
                .replace('{TIME}', result[i].date)
                .replace('{INTRO}', result[i].text.substring(0, 100) + '...')
            }
            resultBoxDom.html(_li)
          } else {
            resultBoxDom.html(`<li><a href="#">无结果</a></li>`)
          }
        }
      })
    } else {
      resultBoxDom.html('')
      resultConutBoxDom.html(0)
    }
  }

  $(document).on('input', '.input-wrap > input', util.debounce(inputSearch, 300))
})
;
require(['jquery', 'util', 'valine', 'chart', 'registerSW', 'fancybox', 'confirm', 'share', 'search'], function(
  $,
  util,
  valine,
  chart
) {
  'use strict'

  // valine评论
  var API_ID = (HUHU_CONFIG.valine && HUHU_CONFIG.valine.API_ID) || ''
  var API_KEY = (HUHU_CONFIG.valine && HUHU_CONFIG.valine.API_KEY) || ''
  if (API_ID && API_KEY) {
    new valine({
      el: '#comment',
      appId: HUHU_CONFIG.valine.API_ID,
      appKey: HUHU_CONFIG.valine.API_KEY,
      notify: HUHU_CONFIG.valine.notify || false,
      visitor: HUHU_CONFIG.valine.visitor || true,
      recordIP: HUHU_CONFIG.valine.recordIP || true,
      verify: HUHU_CONFIG.valine.verify || false,
      avatar: HUHU_CONFIG.valine.avatar || 'retro',
      placeholder: '~~~',
      lang: HUHU_CONFIG.valine.lang || 'en'
    })
  }

  // 阻止冒泡
  function stopPropagation(e) {
    e.stopPropagation ? e.stopPropagation() : (e.cancelBubble = true)
  }

  // bind events
  $(document).ready(function() {
    // 图片预览
    $('[data-fancybox="images"]').fancybox({ loop: true })

    // 侧边菜单
    $(document).on('click', '.toggle-icon', function() {
      $('#side').hasClass('active') ? $('#side').removeClass('active') : $('#side').addClass('active')
    })

    // phone menu
    $(document).on('click', '.menu-icon', function() {
      $('#menu-mask')
        .removeClass('hide')
        .toggleClass('showMenuMask')
        .toggleClass('hideMenuMask')
      $('body').toggleClass('overflow')
    })

    $(document).on('click', '#menu-mask .icon-close', function() {
      $('#menu-mask')
        .removeClass('hide')
        .toggleClass('showMenuMask')
        .toggleClass('hideMenuMask')
      $('body').toggleClass('overflow')
    })

    // fixed-menu
    $(document).on('click', '#fixed-menu', function() {
      $('#fixed-menu-wrap > span').toggleClass('menu-reset')
    })

    $('h1,h2,h3,h4,h5,h6').hover(
      function() {
        $(this)
          .find('.post-anchor')
          .text('#')
      },
      function() {
        $(this)
          .find('.post-anchor')
          .text('')
      }
    )

    // post-toc
    $(document).on('click', '.icon-toc', function() {
      $('#post-toc')
        .removeClass('hide')
        .toggleClass('showToc')
        .toggleClass('hiddenToc')
    })

    // search
    $(document).on('click', '.search-box', function() {
      $('#search-shade')
        .removeClass('hide')
        .toggleClass('showSearch')
        .toggleClass('hiddenSearch')
      $('body').toggleClass('overflow')
      $('#fixed-menu-wrap > span').addClass('menu-reset')
    })

    $(document).on('click', '#search-shade .icon-close', function() {
      $('#search-shade')
        .toggleClass('showSearch')
        .toggleClass('hiddenSearch')
      $('body').toggleClass('overflow')
    })

    // 分享
    $(document).on('click', '.share', function(e) {
      var that = $(this)
      $().share({
        url: `${location.origin}${that.data('url')}` || location.href,
        sites: HUHU_CONFIG.share
      })
      stopPropagation(e)
    })

    // 咖啡
    $(document).on('click', '#reward-button', function() {
      $('#qr').toggle('1000')
    })

    // 顶部滚动进度条
    $(window).scroll(function() {
      var pageHeight = document.documentElement.scrollHeight || document.body.scrollHeight // 页面总高度
      var windowHeight = document.documentElement.clientHeight || document.body.clientHeight // 浏览器视口高度
      var scrollAvail = pageHeight - windowHeight // 可滚动的高度
      var scrollTop = document.documentElement.scrollTop || document.body.scrollTop // 获取滚动条的高度
      var ratio = (scrollTop / scrollAvail) * 100 + '%'
      $('#progress > .line').css('width', ratio)
    })

    var mousewheel = function(e) {
      e = e || window.event

      // 判断浏览器IE，谷歌滑轮事件
      if (e.wheelDelta) {
        // 当滑轮向上滚动时
        if (e.wheelDelta > 0) {
          $('#side').removeClass('active')
        }

        // 当滑轮向下滚动时
        if (e.wheelDelta < 0) {
          $('#side').addClass('active')
        }
      }
      // Firefox滑轮事件
      else if (e.detail) {
        // 当滑轮向上滚动时
        if (e.detail > 0) {
          $('#side').removeClass('active')
        }

        // 当滑轮向下滚动时
        if (e.detail < 0) {
          $('#side').addClass('active')
        }
      }
    }

    document.addEventListener && document.addEventListener('DOMMouseScroll', mousewheel, false) // firefox
    window.onmousewheel = document.onmousewheel = mousewheel // 滚动滑轮触发scrollFunc方法 ie 谷歌

    // fiexed menu
    $(document).on('click', '.icon-arrowup', function() {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      })
      $('#fixed-menu-wrap > span').addClass('menu-reset')
    })

    function handleDisplay() {
      $(this)
        .addClass('active')
        .siblings()
        .removeClass('active')
      var cate = $(this)
        .attr('class')
        .split(' ')[0]
      $('.post-wrap > .post').each(function() {
        if ($(this).hasClass(cate)) {
          $(this).addClass('active')
        } else {
          $(this).removeClass('active')
        }
      })
    }

    // 分类、标签页
    $(document).on('click', '#categories > .list > li', handleDisplay)
    $(document).on('click', '#tags > .list > li', handleDisplay)

    // pjax
    if ($.support.pjax) {
      $(document).on('click', 'a[data-pjax]', function(event) {
        var container = $(this).closest('[data-pjax-container]')
        var containerSelector = '#' + container.id
        $.pjax.click(event, { container: containerSelector })
      })
    }

    // pv表格
    if (
      HUHU_CONFIG.baidu_tongji &&
      HUHU_CONFIG.baidu_tongji.site_id &&
      HUHU_CONFIG.baidu_tongji.access_token &&
      chart
    ) {
      function prefix(date) {
        date = date + ''
        return date.length === 1 ? '0' + date : date
      }

      function setStatic(key, data) {
        // 过期时间为当天的24点
        var zero = new Date(new Date().toLocaleDateString()).getTime() + 24 * 60 * 60 * 1000 // new Date().toLocaleDateString() "2019/11/18"
        var now = new Date().getTime()
        var SEARCH_EXPIRE = zero - now
        util.STORAGE.getInstance().set(key, data, SEARCH_EXPIRE)
      }

      // 近日七天访问PV、UV
      var BAIDU_CHART = 'BAIDU_CHART'
      var date = new Date()
      var start = new Date(date.getTime() - 60 * 60 * 1000 * 24 * 6)
      var start_date = `${start.getFullYear()}${start.getMonth() + 1}${prefix(start.getDate())}`
      var end_date = `${date.getFullYear()}${prefix(date.getMonth() + 1)}${prefix(date.getDate())}`
      var url = `https://openapi.baidu.com/rest/2.0/tongji/report/getData?access_token=${HUHU_CONFIG.baidu_tongji.access_token}&site_id=${HUHU_CONFIG.baidu_tongji.site_id}&method=overview/getTimeTrendRpt&start_date=${start_date}&end_date=${end_date}&metrics=pv_count,visitor_count`

      function getChartData() {
        var data = util.STORAGE.getInstance().get(BAIDU_CHART)
        if (data) {
          return Promise.resolve(data)
        } else {
          return $.ajax({
            url: url,
            dataType: 'jsonp',
            jsonp: 'callback'
          })
        }
      }

      getChartData().then(data => {
        if (data && data.result && data.result.items) {
          setStatic(BAIDU_CHART, data)
          var pv = []
          var uv = []

          data.result.items[1] &&
            data.result.items[1].map(value => {
              pv.push(value[0])
              uv.push(value[1])
            })

          var dom = document.getElementById('line-chart')
          var ctx = dom ? dom.getContext('2d') : null
          ctx &&
            new chart(ctx, {
              type: 'line',
              data: {
                labels: data.result.items[0],
                datasets: [
                  {
                    label: 'PV',
                    data: pv,
                    backgroundColor: ['rgba(54, 162, 235, 0.2)'],
                    borderColor: ['rgba(54, 162, 235, 1)'],
                    borderWidth: 2
                  },
                  {
                    label: 'UV',
                    data: uv,
                    backgroundColor: ['rgba(255, 99, 132, 0.2)'],
                    borderColor: ['rgba(255, 99, 132, 1)'],
                    borderWidth: 2
                  }
                ]
              },
              options: {
                title: {
                  display: true,
                  text: '近七天访问'
                }
              }
            })
        }
      })

      // 统计整站PV、UV
      var SITE_PV_UV = 'SITE_PV_UV'
      var all_start_date = new Date(HUHU_CONFIG.baidu_tongji.site_from || new Date())
      var format_start_date = `${all_start_date.getFullYear()}${prefix(all_start_date.getMonth() + 1)}${prefix(
        all_start_date.getDate()
      )}`

      var site_date = parseInt(Math.abs(date.getTime() - all_start_date.getTime()) / 1000 / 60 / 60 / 24)
      $('.site_from').html(HUHU_CONFIG.baidu_tongji.site_from || '')
      $('.site_date').html(site_date || '')
      var all_url = `https://openapi.baidu.com/rest/2.0/tongji/report/getData?access_token=${HUHU_CONFIG.baidu_tongji.access_token}&site_id=${HUHU_CONFIG.baidu_tongji.site_id}&method=source/all/a&start_date=${format_start_date}&end_date=${end_date}&metrics=pv_count,visitor_count`
      function getAllData() {
        var data = util.STORAGE.getInstance().get(SITE_PV_UV)
        if (data) {
          return Promise.resolve(data)
        } else {
          return $.ajax({
            url: all_url,
            dataType: 'jsonp',
            jsonp: 'callback'
          })
        }
      }

      getAllData().then(data => {
        setStatic(SITE_PV_UV, data)
        if (data && data.result && data.result.pageSum && data.result.items) {
          $('.site_pv').html(data.result.pageSum[0][0] || '')
          $('.site_uv').html(data.result.pageSum[0][1] || '')
          var labels = []
          var datasets = []
          data.result.items[0].map(item => labels.push(item[0].name))
          data.result.items[1].map(item => datasets.push(item[0]))
          var dom = document.getElementById('doughnut-chart')
          var ctx = dom ? dom.getContext('2d') : null
          ctx &&
            new chart(ctx, {
              type: 'doughnut',
              data: {
                labels: labels,
                datasets: [
                  {
                    data: datasets,
                    backgroundColor: ['#d7ecfb', '#ffd8e1', '#e6d9ff']
                  }
                ]
              }
            })
        }
      })
    }
  })
})
;
define("app", function(){});

