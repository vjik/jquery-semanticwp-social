/*

 asyncSocialWidgets — jQuery plugin for asynchronously loading widgets of social networks
 Version: 0.1
 Author: Sergey Predvoditelev (sergey.predvoditelev@gmail.com)
 Company: Arctic Laboratory (http://arcticlab.ru/)

 Docs & Examples: http://arcticlab.ru/async-social-widgets/

 */
(function($) {


	// Опции
	var options = {

		// VKontakte
		vk_app_id: '',
		vk_like_selector: '.vk-like',
		vk_like_id: 'vk-like',
		vk_group_selector: '.vk-group',
		vk_group_id: 'vk-group'

	};


	// Google+
	var gplus = {


		// +1
		plusone: function(els) {

			// Есть кнопки?
			if (!els.length)
				return;

			if (window.gapi!==undefined) {
				els.each(function() {
					gapi.plusone.render($(this).get(0));
				});
			} else {
				$.getScript('https://apis.google.com/js/plusone.js');
			}

		}


	};


	// Facebook
	var facebook = {


		// Инициализация
		init: function() {
			facebook.load(function() {
				FB.init({
					status: true, // check login status
					cookie: true, // enable cookies to allow the server to access the session
					xfbml: true  // parse XFBML
				});
			});
		},


		// Загрузка
		load: function(callback) {

			// Подключили скрипт?
			var has_script = true;
			if (!$('#fb-root').length) {
				has_script = false;
				$('BODY').prepend('<div id="fb-root" />');
			}
			var root = $('#fb-root');

			// Callback
			if ($.isFunction(callback))
				root.queue('actions', function() {
					callback();
					root.dequeue('actions');
				});

			// Подключать API?
			if (has_script) {
				if (window.FB!==undefined)
					root.dequeue('actions');
				return;
			}

			// Подключаем
			var js, id = 'facebook-jssdk';
			if ($('#' + id).length) return;
			js = document.createElement('script');
			js.id = id;
			js.async = true;
			js.src = "//connect.facebook.net/ru_RU/all.js";
			$('BODY').prepend(js);
			window.fbAsyncInit = function() {
				root.dequeue('actions');
			}

		}


	};


	// ВКонтакте
	var vkontakte = {


		// likes
		likesCounter: 0,
		like: function(els) {
			if (!els.length) return;
			vkontakte.load_sdk(function() {
				els.each(function() {

					// Предотвратить повторную инициализацию
					if ($(this).data('init'))
						return;

					// ID
					vkontakte.likesCounter++;
					var id = options.vk_like_id + vkontakte.likesCounter;
					$(this).attr('id', id);

					// init
					var o = {};
					if ($(this).data('type')!==undefined)
						o.type = $(this).data('type');
					if ($(this).data('width')!==undefined)
						o.width = $(this).data('width');
					if ($(this).data('height')!==undefined)
						o.height = $(this).data('height');
					if ($(this).data('verb')!==undefined)
						o.verb = $(this).data('verb');
					if ($(this).data('pageUrl')!==undefined)
						o.pageUrl = $(this).data('pageUrl');
					VK.Widgets.Like(id, o);
					$(this).data('init', true);

				});
			});
		},


		// groups
		groupsCounter: 0,
		group: function(els) {
			if (!els.length) return;
			vkontakte.load_sdk(function() {
				els.each(function() {

					// Предотвратить повторную инициализацию
					if ($(this).data('init'))
						return;

					// ID
					vkontakte.groupsCounter++;
					var id = options.vk_group_id + vkontakte.groupsCounter;
					$(this).attr('id', id);

					// init
					var o = {};
					if ($(this).data('width')!==undefined)
						o.width = $(this).data('width');
					if ($(this).data('height')!==undefined)
						o.height = $(this).data('height');
					if ($(this).data('mode')!==undefined)
						o.mode = $(this).data('mode');
					if ($(this).data('wide')!==undefined)
						o.wide = $(this).data('wide');
					VK.Widgets.Group(id, o, $(this).data('groupId'));
					$(this).data('init', true);

				});
			});
		},


		// Load the SDK Asynchronously
		load_sdk: function(callback) {

			// API
			var has_script = true;
			if (!$('#vk_api_transport').length) {
				has_script = false;
				$('BODY').prepend('<div id="vk_api_transport" />');
			}
			var api = $('#vk_api_transport');

			// Callback
			if ($.isFunction(callback))
				api.queue('actions', function() {
					callback();
					$(this).dequeue('actions');
				});

			// Подключать API?
			if (has_script)
				return;

			// Подключаем API
			var el = document.createElement("script");
			el.src = "http://vkontakte.ru/js/api/openapi.js";
			el.async = true;
			document.getElementById('vk_api_transport').appendChild(el);

			// Инициализация
			var init = function() {
				VK.init({
					apiId: options.vk_app_id,
					onlyWidgets: true
				});
				api.dequeue('actions');
			};
			if (window.VK!==undefined) {
				init();
			} else {
				window.vkAsyncInit = init;
			}

		}


	};


	// Twitter
	var twitter = {


		// init
		init: function() {
			twitter.load_widgets(function() {
				twttr.widgets.load();
			});
		},


		// Load the Widgets SDK Asynchronously
		load_widgets: function(callback) {

			// API
			var has_script = true;
			if (!$('#twi-widgets').length) {
				has_script = false;
				$('BODY').prepend('<div id="twi-widgets" />');
			}
			var api = $('#twi-widgets');

			// Callback
			if ($.isFunction(callback))
				api.queue('actions', function() {
					callback();
					$(this).dequeue('actions');
				});

			// Подключать API?
			if (has_script) {
				if (window.twttr!==undefined)
					api.dequeue('actions');
				return;
			}

			// Подключаем API
			$.getScript('http://platform.twitter.com/widgets.js', function() {
				api.dequeue('actions');
			});

		}


	};


	// Одноклассники & Мой мир
	var mailru = {


		// Инициализация
		init: function() {
			if (window.mailru!==undefined) {
				mailru.plugin.init();
			} else {
				$.getScript('http://cdn.connect.mail.ru/js/loader.js');
			}
		}


	};


	// Методы
	var methods = {


		// Инициализация
		init: function() {

			// Google +1
			gplus.plusone($('g\\:plusone, .g-plusone'));

			// Facebook
			var els = $('fb\\:like,.fb-like')
					.add('fb\\:send,.fb-send')
					.add('fb\\:subscribe,.fb-subscribe')
					.add('fb\\:comments,.fb-comments')
					.add('fb\\:activity,.fb-activity')
					.add('fb\\:recommendations,.fb-recommendations')
					.add('fb\\:like-box,.fb-like-box')
					.add('fb\\:facepile,.fb-facepile');
			if (els.length)
				facebook.init();

			// ВКонтакте
			vkontakte.like($(options.vk_like_selector));
			vkontakte.group($(options.vk_group_selector));

			// Twitter
			els = $('.twitter-share-button,.twitter-follow-button,.twitter-hashtag-button,.twitter-mention-button,.twitter-timeline');
			if (els.length)
				twitter.init();

			// Одноклассники & Мой мир
			els = $('.mrc__plugin_uber_like_button');
			if (els.length)
				mailru.init();

		},


		// Установить опции
		set: function(o) {
			$.extend(true, options, o);
		}


	};


	// Плагин
	$.asyncSocialWidgets = function(method) {

		if (methods[method]) {
			return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
		} else {
			$.error('jquery.asyncSocialWidgets: Method ' + method + ' does not exist');
		}

	};


})(jQuery);